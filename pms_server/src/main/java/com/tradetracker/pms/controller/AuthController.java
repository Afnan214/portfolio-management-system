package com.tradetracker.pms.controller;

import com.tradetracker.pms.dto.request.auth.LoginRequest;
import com.tradetracker.pms.dto.request.auth.CreateUserRequest;
import com.tradetracker.pms.dto.response.auth.AuthResponse;
import com.tradetracker.pms.entity.User;
import com.tradetracker.pms.repository.UserRepository;
import com.tradetracker.pms.service.AuthService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }
    @GetMapping("/heath")
    public String healthCheck(@RequestParam String param) {
        return new String("Is healthy");
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody CreateUserRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthService.AuthResult result = authService.register(request);

        ResponseCookie cookie = buildAuthCookie(
                result.token(),
                Duration.ofHours(24),
                httpRequest.isSecure()
        );

        AuthResponse response = new AuthResponse(
                result.user().getId(),
                result.user().getEmail(),
                "Registration successful"
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthService.AuthResult result = authService.login(request);

        ResponseCookie cookie = buildAuthCookie(
                result.token(),
                Duration.ofHours(24),
                httpRequest.isSecure()
        );

        AuthResponse response = new AuthResponse(
                result.user().getId(),
                result.user().getEmail(),
                "Login successful"
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        return ResponseEntity.ok(new AuthResponse(
                user.getId(),
                user.getEmail(),
                "Current user"
        ));
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        ResponseCookie cookie = buildAuthCookie("", Duration.ZERO, httpRequest.isSecure());

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    private ResponseCookie buildAuthCookie(String token, Duration maxAge, boolean secure) {
        return ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite(secure ? "None" : "Lax")
                .maxAge(maxAge)
                .build();
    }
}
