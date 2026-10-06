package com.moviedb.service;

import com.moviedb.dto.AuthRequest;
import com.moviedb.dto.AuthResponse;
import com.moviedb.dto.RegisterRequest;
import com.moviedb.dto.UserProfileDto;
import com.moviedb.entity.User;
import com.moviedb.exception.BadRequestException;
import com.moviedb.mapper.DtoMapper;
import com.moviedb.repository.*;
import com.moviedb.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final WatchedRepository watchedRepository;
    private final WatchlistRepository watchlistRepository;
    private final ReviewRepository reviewRepository;
    private final RatingRepository ratingRepository;
    private final MovieListRepository movieListRepository;
    private final FollowRepository followRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       WatchedRepository watchedRepository,
                       WatchlistRepository watchlistRepository,
                       ReviewRepository reviewRepository,
                       RatingRepository ratingRepository,
                       MovieListRepository movieListRepository,
                       FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.watchedRepository = watchedRepository;
        this.watchlistRepository = watchlistRepository;
        this.reviewRepository = reviewRepository;
        this.ratingRepository = ratingRepository;
        this.movieListRepository = movieListRepository;
        this.followRepository = followRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName() != null ? request.getDisplayName().trim() : request.getUsername().trim());
        user.setBio("Film lover on Cine-Log.");
        user.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80");

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserProfileDto profile = buildUserProfileDto(savedUser, false);
        return new AuthResponse(jwt, profile);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        UserProfileDto profile = buildUserProfileDto(user, false);
        return new AuthResponse(jwt, profile);
    }

    public UserProfileDto buildUserProfileDto(User user, boolean isFollowing) {
        long watched = watchedRepository.countByUserId(user.getId());
        long watchlist = watchlistRepository.countByUserId(user.getId());
        long reviews = reviewRepository.countByUserId(user.getId());
        long ratings = ratingRepository.countByUserId(user.getId());
        long lists = movieListRepository.countByUserId(user.getId());
        long followers = followRepository.countByFollowingId(user.getId());
        long following = followRepository.countByFollowerId(user.getId());

        return DtoMapper.toUserProfileDto(user, watched, watchlist, reviews, ratings, lists, followers, following, isFollowing);
    }
}
