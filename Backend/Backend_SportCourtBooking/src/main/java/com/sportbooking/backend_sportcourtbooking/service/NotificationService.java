package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.NotificationResponse;
import com.sportbooking.backend_sportcourtbooking.entity.Notification;
import com.sportbooking.backend_sportcourtbooking.entity.User;
import com.sportbooking.backend_sportcourtbooking.enums.UserRole;
import com.sportbooking.backend_sportcourtbooking.repository.NotificationRepository;
import com.sportbooking.backend_sportcourtbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final NotificationRealtimePublisher notificationRealtimePublisher;

    // Hàm dùng nội bộ (Các Service khác sẽ gọi hàm này để bắn thông báo)
    public void createNotification(Long recipientId, String message, String url) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setRedirectUrl(url);
        notification.setRead(false); // Mặc định là chưa đọc
        // Sender để null mặc định là Hệ thống (System)

        Notification savedNotification = notificationRepository.save(notification);
        long unreadCount = notificationRepository.countByRecipientIdAndReadFalse(recipientId);
        notificationRealtimePublisher.publishCreated(savedNotification, unreadCount);
    }

    public void notifyStaffAndOwners(String message, String url) {
        notifyStaffAndOwners(message, url, url);
        }

        public void notifyStaffAndOwners(String message, String ownerUrl, String staffUrl) {
        userRepository.findByRole(UserRole.OWNER)
            .forEach(owner -> createNotification(owner.getId(), message, ownerUrl));
        userRepository.findByRole(UserRole.STAFF)
            .forEach(staff -> createNotification(staff.getId(), message, staffUrl));
    }

    // Lấy danh sách thông báo của user đang đăng nhập
    public List<NotificationResponse> getMyNotifications() {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(currentUserService.getCurrentUserId())
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public long countUnreadMyNotifications() {
        return notificationRepository.countByRecipientIdAndReadFalse(currentUserService.getCurrentUserId());
    }

    // Đánh dấu đã đọc
    public void markAsRead(Long notificationId) {
        Notification noti = notificationRepository.findById(notificationId).orElse(null);
        if (noti == null) {
            throw new RuntimeException("Notification not found");
        }

        if (!noti.getRecipient().getId().equals(currentUserService.getCurrentUserId())) {
            throw new RuntimeException("Không có quyền cập nhật thông báo này");
        }

        noti.setRead(true);
        noti.setReadAt(java.time.LocalDateTime.now());
        notificationRepository.save(noti);

        long unreadCount = notificationRepository.countByRecipientIdAndReadFalse(noti.getRecipient().getId());
        notificationRealtimePublisher.publishUnreadCount(noti.getRecipient(), unreadCount);
    }

    public void markAllAsRead() {
        User currentUser = currentUserService.getCurrentUser();
        // Dùng repository trực tiếp để lấy entity (không phải DTO)
        List<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(currentUser.getId());
        notifications.stream()
                .filter(notification -> !notification.isRead())
                .forEach(notification -> notification.setRead(true));
        notifications.stream()
                .filter(notification -> notification.getReadAt() == null)
                .forEach(notification -> notification.setReadAt(java.time.LocalDateTime.now()));
        notificationRepository.saveAll(notifications);

        long unreadCount = notificationRepository.countByRecipientIdAndReadFalse(currentUser.getId());
        notificationRealtimePublisher.publishUnreadCount(currentUser, unreadCount);
    }

    public void deleteMyNotifications() {
        User currentUser = currentUserService.getCurrentUser();
        notificationRepository.deleteByRecipientId(currentUser.getId());
        notificationRealtimePublisher.publishUnreadCount(currentUser, 0);
    }
}
