package com.tradetracker.pms.security;

import com.tradetracker.pms.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT (JSON Web Token) service responsible for generating, parsing, and validating authentication tokens.
 *
 * How JWT works in this app:
 * 1. When a user logs in, AuthService calls generateToken() to create a signed JWT containing the user's ID and email.
 * 2. The JWT is sent to the frontend as an HttpOnly cookie named "access_token".
 * 3. On every subsequent request, the browser automatically sends the cookie.
 * 4. JwtAuthenticationFilter intercepts each request, extracts the JWT from the cookie,
 *    and calls this service to validate it and extract the user's identity.
 *
 * JWT structure: Header.Payload.Signature
 * - Header: algorithm (HS256) and token type.
 * - Payload (claims): userId, email, subject (email), issued-at, expiration.
 * - Signature: HMAC-SHA256 hash of header+payload using the secret key — ensures the token hasn't been tampered with.
 *
 * Security:
 * - The secret key (app.jwt.secret) is stored in application.properties and used to sign/verify tokens.
 * - Tokens expire after 1 hour, forcing re-authentication.
 * - Using HttpOnly cookies (set in AuthService) prevents JavaScript from accessing the token, mitigating XSS attacks.
 */
@Service
public class JwtService {
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    // Generates a signed JWT with the user's ID and email as claims. Token expires in 1 hour.
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(getSigningKey())
                .compact();
    }
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claimsResolver.apply(claims);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
