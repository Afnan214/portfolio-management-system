package com.tradetracker.pms.config;

import com.tradetracker.pms.security.CustomUserDetailsService;
import com.tradetracker.pms.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration — defines how the application handles authentication and authorization.
 *
 * Key concepts:
 *
 * 1. Stateless session (no server-side session):
 *    - SessionCreationPolicy.STATELESS means Spring won't create HTTP sessions.
 *    - Authentication state is carried entirely by the JWT cookie on each request.
 *    - This makes the API scalable (no session storage) and suitable for a SPA (Angular) frontend.
 *
 * 2. CSRF disabled:
 *    - CSRF protection is disabled because the app uses JWT in HttpOnly cookies with SameSite policy,
 *      and the API is stateless. CSRF is mainly a concern for session-based auth with form submissions.
 *
 * 3. Filter chain:
 *    - JwtAuthenticationFilter runs BEFORE UsernamePasswordAuthenticationFilter.
 *    - It extracts and validates the JWT cookie, then sets the authenticated user in SecurityContext.
 *
 * 4. Public vs protected endpoints:
 *    - Public (no auth required): /api/auth/**, /api/stocks/**, /api/market-news/**, /ws/**
 *    - Protected (JWT required): all other endpoints (portfolios, transactions, watchlists, etc.)
 *
 * 5. Authentication provider:
 *    - DaoAuthenticationProvider uses CustomUserDetailsService to load users from the database
 *      and BCryptPasswordEncoder to verify passwords during login.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CustomUserDetailsService customUserDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors->{})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint(
                                (request, response, authException) ->
                                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED)
                        )
                )
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/api/stocks/**").permitAll()
                                .requestMatchers("/api/market-news/**").permitAll()
                                .requestMatchers("/ws/**").permitAll()
                                .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
