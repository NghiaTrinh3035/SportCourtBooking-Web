package com.sportbooking.backend_sportcourtbooking.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sportbooking.backend_sportcourtbooking.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private String message;
    private String redirectUrl;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .redirectUrl(notification.getRedirectUrl())
                .read(notification.isRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
