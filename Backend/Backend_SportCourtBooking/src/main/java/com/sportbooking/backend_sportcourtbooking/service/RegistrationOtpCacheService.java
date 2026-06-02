package com.sportbooking.backend_sportcourtbooking.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class RegistrationOtpCacheService {

    private final Map<String, PendingRegistration> pendingRegistrationMap = new ConcurrentHashMap<>();
    private final int otpExpirationMinutes;

    public RegistrationOtpCacheService(@Value("${application.security.otp.expiration-minutes:5}") int otpExpirationMinutes) {
        this.otpExpirationMinutes = otpExpirationMinutes;
    }

    public PendingRegistration createPendingRegistration(
            String fullName,
            String email,
            String phone,
            String encodedPassword
    ) {
        String normalizedEmail = normalizeEmail(email);
        String otp = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));

        PendingRegistration pending = PendingRegistration.builder()
                .fullName(fullName)
                .email(normalizedEmail)
                .phone(phone)
                .encodedPassword(encodedPassword)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .build();

        pendingRegistrationMap.put(normalizedEmail, pending);
        return pending;
    }

    public PendingRegistration getPendingRegistration(String email) {
        return pendingRegistrationMap.get(normalizeEmail(email));
    }

    public void removePendingRegistration(String email) {
        pendingRegistrationMap.remove(normalizeEmail(email));
    }

    public boolean isExpired(PendingRegistration pendingRegistration) {
        return pendingRegistration.getExpiresAt().isBefore(LocalDateTime.now());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class PendingRegistration {
        private String fullName;
        private String email;
        private String phone;
        private String encodedPassword;
        private String otp;
        private LocalDateTime expiresAt;
    }
}
