package com.tradetracker.pms.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter — intercepts every HTTP request to check for a valid JWT token.
 *
 * This is a Spring Security filter that runs once per request (OncePerRequestFilter).
 * It sits in the filter chain BEFORE Spring's default UsernamePasswordAuthenticationFilter.
 *
 * Authentication flow:
 * 1. Extract the JWT from the "access_token" HttpOnly cookie (not from the Authorization header).
 * 2. If no cookie is found, skip authentication and let the request continue (it may hit a public endpoint).
 * 3. If a cookie is found, decode the JWT using JwtService to extract the user's email.
 * 4. Load the user from the database via CustomUserDetailsService.
 * 5. Validate the token (signature + expiration + username match).
 * 6. If valid, set the user as authenticated in Spring's SecurityContextHolder — all downstream
 *    code (controllers, @AuthenticationPrincipal, etc.) can now access the authenticated user.
 *
 * Error handling:
 * - Expired, malformed, or invalid tokens → clear the SecurityContext and delete the cookie,
 *   effectively logging the user out.
 * - User not found in DB (e.g., account deleted) → same behavior, clear context and cookie.
 */
@Component
public class JwtAuthenticationFilter  extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService customUserDetailsService
    ) {
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String jwt = extractJwtFromCookies(request);

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractUsername(jwt);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (ExpiredJwtException e) {
            SecurityContextHolder.clearContext();
            clearAuthCookie(request, response);
        } catch (JwtException | IllegalArgumentException e) {
            SecurityContextHolder.clearContext();
            clearAuthCookie(request, response);
        } catch (UsernameNotFoundException e) {
            SecurityContextHolder.clearContext();
            clearAuthCookie(request, response);
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if ("access_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
    private void clearAuthCookie(HttpServletRequest request, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .sameSite(request.isSecure() ? "None" : "Lax")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
