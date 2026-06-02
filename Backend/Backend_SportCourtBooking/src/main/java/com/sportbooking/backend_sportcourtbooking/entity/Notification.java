package com.sportbooking.backend_sportcourtbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    @Column(nullable = false)
    private String message; 

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient; 

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender; // Người gửi (Có thể null nếu là Hệ thống tự gửi)

    private String redirectUrl; 

    
    @Column(name = "is_read", nullable = false)
    private boolean read = false; 

    private LocalDateTime readAt;

    private LocalDateTime createdAt = LocalDateTime.now(); // Thời gian tạo
}
