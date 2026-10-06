package com.moviedb.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentRequest {

    @NotBlank(message = "Comment text is required")
    private String commentText;

    public CommentRequest() {
    }

    public CommentRequest(String commentText) {
        this.commentText = commentText;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }
}
