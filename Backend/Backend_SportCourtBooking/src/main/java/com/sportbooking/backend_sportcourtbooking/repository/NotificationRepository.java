package com.sportbooking.backend_sportcourtbooking.repository;

import com.sportbooking.backend_sportcourtbooking.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Tìm thông báo theo ID người nhận, sắp xếp mới nhất lên đầu
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    // Đếm số thông báo chưa đọc — dùng "read" (tên field thực) thay vì "isRead"
    long countByRecipientIdAndReadFalse(Long recipientId);

    void deleteByRecipientId(Long recipientId);
}
