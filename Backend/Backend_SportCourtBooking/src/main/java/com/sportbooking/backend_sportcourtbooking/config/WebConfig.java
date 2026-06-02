package com.sportbooking.backend_sportcourtbooking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Cho phép tất cả các đường dẫn
                        .allowedOrigins("http://localhost:3000", "http://localhost:5173") // Cho phép Frontend (React/Vite) gọi vào
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các method này
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}