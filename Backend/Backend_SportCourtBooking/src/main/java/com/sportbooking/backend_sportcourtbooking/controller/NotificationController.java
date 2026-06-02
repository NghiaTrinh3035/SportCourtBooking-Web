package com.sportbooking.backend_sportcourtbooking.controller;

import com.sportbooking.backend_sportcourtbooking.DTOs.NotificationResponse;
import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import com.sportbooking.backend_sportcourtbooking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", notificationService.getMyNotifications()));
    }

    @GetMapping("/me/unread-count")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", notificationService.countUnreadMyNotifications()));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotificationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", notificationService.getNotificationsByUserId(userId)));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<String>> readNotification(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Marked as read", null));
    }

    @PutMapping("/me/read-all")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<String>> readAll() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(new ApiResponse<>(true, "Marked all as read", null));
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<String>> deleteMine() {
        notificationService.deleteMyNotifications();
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<List<NotificationResponse>> getMyNotificationsOld() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }

    @GetMapping("/me/unread-count")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<Long> getUnreadCountOld() {
        return ResponseEntity.ok(notificationService.countUnreadMyNotifications());
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByUserOld(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<String> readNotificationOld(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Marked as read");
    }

    @PutMapping("/me/read-all")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<String> readAllOld() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok("Marked all as read");
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<String> deleteMineOld() {
        notificationService.deleteMyNotifications();
        return ResponseEntity.ok("Deleted");
    }
    */
}
