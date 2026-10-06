package com.moviedb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MovieListRequest {

    @NotBlank(message = "List title is required")
    @Size(max = 150, message = "List title cannot exceed 150 characters")
    private String title;

    private String description;
    private Boolean isPublic = true;

    public MovieListRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
}
