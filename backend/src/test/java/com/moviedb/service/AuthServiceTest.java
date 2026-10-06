package com.moviedb.service;

import com.moviedb.dto.AuthRequest;
import com.moviedb.dto.AuthResponse;
import com.moviedb.dto.RegisterRequest;
import com.moviedb.entity.User;
import com.moviedb.exception.BadRequestException;
import com.moviedb.repository.*;
import com.moviedb.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private WatchedRepository watchedRepository;
    @Mock
    private WatchlistRepository watchlistRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private MovieListRepository movieListRepository;
    @Mock
    private FollowRepository followRepository;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("filmbuff", "filmbuff@example.com", "encodedPass", "Film Buff");
        sampleUser.setId(1L);
    }

    @Test
    void register_Success() {
        RegisterRequest req = new RegisterRequest("filmbuff", "filmbuff@example.com", "secret123", "Film Buff");

        when(userRepository.existsByUsername("filmbuff")).thenReturn(false);
        when(userRepository.existsByEmail("filmbuff@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock.jwt.token");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("mock.jwt.token", resp.getToken());
        assertEquals("filmbuff", resp.getUser().getUsername());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_UsernameTaken_ThrowsException() {
        RegisterRequest req = new RegisterRequest("filmbuff", "filmbuff@example.com", "secret123", "Film Buff");
        when(userRepository.existsByUsername("filmbuff")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        AuthRequest req = new AuthRequest("filmbuff", "secret123");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock.jwt.token");
        when(userRepository.findByUsername("filmbuff")).thenReturn(Optional.of(sampleUser));

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mock.jwt.token", resp.getToken());
        assertEquals("filmbuff", resp.getUser().getUsername());
    }
}
