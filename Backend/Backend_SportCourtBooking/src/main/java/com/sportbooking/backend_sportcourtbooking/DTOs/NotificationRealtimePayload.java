package com.sportbooking.backend_sportcourtbooking.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRealtimePayload {

    private String type;
    private NotificationView notification;
    private long unreadCount;
    private LocalDateTime serverTime;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationView {
        private Long id;
        private String message;
        private String redirectUrl;
        private boolean read; // Lombok tạo isRead()/setRead() → Jackson serialize thành "read"
        private LocalDateTime createdAt;
        private LocalDateTime readAt;
    }
}
