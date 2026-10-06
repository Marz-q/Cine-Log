package com.moviedb.controller;

import com.moviedb.dto.ActivityDto;
import com.moviedb.dto.UserProfileDto;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.SocialService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social")
public class SocialController {

    private final SocialService socialService;

    public SocialController(SocialService socialService) {
        this.socialService = socialService;
    }

    @PostMapping("/follow/{username}")
    public ResponseEntity<Map<String, Boolean>> toggleFollow(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        boolean isFollowing = socialService.toggleFollow(principal.getId(), username);
        return ResponseEntity.ok(Collections.singletonMap("following", isFollowing));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<ActivityDto>> getFeed(@AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(socialService.getActivityFeed(currentUserId));
    }

    @GetMapping("/followers/{username}")
    public ResponseEntity<List<UserProfileDto>> getFollowers(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(socialService.getFollowers(username, currentUserId));
    }

    @GetMapping("/following/{username}")
    public ResponseEntity<List<UserProfileDto>> getFollowing(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(socialService.getFollowing(username, currentUserId));
    }
}
