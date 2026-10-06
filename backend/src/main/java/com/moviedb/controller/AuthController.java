package com.moviedb.controller;

import com.moviedb.dto.AuthRequest;
import com.moviedb.dto.AuthResponse;
import com.moviedb.dto.RegisterRequest;
import com.moviedb.dto.UserProfileDto;
import com.moviedb.entity.User;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.repository.UserRepository;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return ResponseEntity.ok(authService.buildUserProfileDto(user, false));
    }
}
