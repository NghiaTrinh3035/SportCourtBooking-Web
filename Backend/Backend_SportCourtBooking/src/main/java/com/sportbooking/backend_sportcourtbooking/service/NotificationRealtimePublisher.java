package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.NotificationRealtimePayload;
import com.sportbooking.backend_sportcourtbooking.entity.Notification;
import com.sportbooking.backend_sportcourtbooking.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationRealtimePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishCreated(Notification notification, long unreadCount) {
        NotificationRealtimePayload payload = NotificationRealtimePayload.builder()
                .type("NEW_NOTIFICATION")
                .notification(toView(notification))
                .unreadCount(unreadCount)
                .serverTime(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSendToUser(
                notification.getRecipient().getEmail(),
                "/queue/notifications",
                payload
        );
    }

    public void publishUnreadCount(User recipient, long unreadCount) {
        NotificationRealtimePayload payload = NotificationRealtimePayload.builder()
                .type("UNREAD_COUNT_UPDATED")
                .notification(null)
                .unreadCount(unreadCount)
                .serverTime(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/notifications",
                payload
        );
    }

    private NotificationRealtimePayload.NotificationView toView(Notification notification) {
        return NotificationRealtimePayload.NotificationView.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .redirectUrl(notification.getRedirectUrl())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
