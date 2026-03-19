package com.tradetracker.pms.controller;

import com.tradetracker.pms.dto.request.auth.LoginRequest;
import com.tradetracker.pms.dto.request.auth.CreateUserRequest;
import com.tradetracker.pms.dto.response.auth.AuthResponse;
import com.tradetracker.pms.entity.User;
import com.tradetracker.pms.repository.UserRepository;
import com.tradetracker.pms.service.AuthService;
import jakarta.validation.Valid;
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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody CreateUserRequest request) {
        AuthService.AuthResult result = authService.register(request);

        ResponseCookie cookie = ResponseCookie.from("access_token", result.token())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ofHours(24))
                .build();

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
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthService.AuthResult result = authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("access_token", result.token())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ofHours(24))
                .build();

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
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new AuthResponse(
                user.getId(),
                user.getEmail(),
                "Current user"
        ));
    }
}