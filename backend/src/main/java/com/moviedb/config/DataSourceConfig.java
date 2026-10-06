package com.moviedb.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String pgUrl;

    @Value("${spring.datasource.username}")
    private String pgUsername;

    @Value("${spring.datasource.password}")
    private String pgPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        DataSource pgDataSource = DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(pgUrl)
                .username(pgUsername)
                .password(pgPassword)
                .build();

        try (Connection conn = pgDataSource.getConnection()) {
            log.info("Successfully connected to PostgreSQL at: {}", pgUrl);
            return pgDataSource;
        } catch (Exception e) {
            log.warn("PostgreSQL connection to '{}' was not successful ({}).", pgUrl, e.getMessage());
            log.info("Falling back to embedded in-memory database with PostgreSQL compatibility for seamless local development.");
            
            return DataSourceBuilder.create()
                    .driverClassName("org.h2.Driver")
                    .url("jdbc:h2:mem:cinelog;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
                    .username("sa")
                    .password("")
                    .build();
        }
    }
}
