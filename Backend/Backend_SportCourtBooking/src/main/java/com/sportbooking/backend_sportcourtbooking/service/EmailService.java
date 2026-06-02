package com.sportbooking.backend_sportcourtbooking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendRegistrationOtp(String toEmail, String otp, int expirationMinutes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Ma OTP xac thuc dang ky tai khoan");
        message.setText("Ma OTP cua ban la: " + otp + "\n"
                + "Ma co hieu luc trong " + expirationMinutes + " phut.\n"
                + "Khong chia se ma nay cho bat ky ai.");

        mailSender.send(message);
    }
}
