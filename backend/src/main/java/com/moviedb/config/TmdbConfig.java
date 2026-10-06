package com.moviedb.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TmdbConfig {

    private static final String DEFAULT_API_KEY = "4e44d9029b1270a757cddc766a1bcb63";

    @Value("${tmdb.api.key:}")
    private String apiKey;

    @Value("${tmdb.api.base-url:https://api.themoviedb.org/3}")
    private String baseUrl;

    public String getApiKey() {
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.contains("your_tmdb_api_key")) {
            return apiKey.trim();
        }
        return DEFAULT_API_KEY;
    }

    public String getBaseUrl() {
        return (baseUrl != null && !baseUrl.trim().isEmpty()) ? baseUrl.trim() : "https://api.themoviedb.org/3";
    }

    public boolean hasApiKey() {
        String key = getApiKey();
        return key != null && !key.trim().isEmpty();
    }
}
