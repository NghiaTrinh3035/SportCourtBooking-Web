package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.config.JwtService;
import com.sportbooking.backend_sportcourtbooking.entity.User;
import com.sportbooking.backend_sportcourtbooking.enums.UserRole;
import com.sportbooking.backend_sportcourtbooking.repository.UserRepository;
import com.sportbooking.backend_sportcourtbooking.DTOs.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final RegistrationOtpCacheService registrationOtpCacheService;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    @Value("${application.security.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${google.client-id:YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER}")
    private String googleClientId;

    public void requestRegistrationOtp(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Xác nhận mật khẩu không khớp!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        RegistrationOtpCacheService.PendingRegistration pendingRegistration =
                registrationOtpCacheService.createPendingRegistration(
                        request.getFullName(),
                        request.getEmail(),
                        request.getPhone(),
                        passwordEncoder.encode(request.getPassword())
                );

        emailService.sendRegistrationOtp(
                pendingRegistration.getEmail(),
                pendingRegistration.getOtp(),
                otpExpirationMinutes
        );
    }

    public UserResponse verifyRegistrationOtp(VerifyOtpRequest request) {
        RegistrationOtpCacheService.PendingRegistration pendingRegistration =
                registrationOtpCacheService.getPendingRegistration(request.getEmail());

        if (pendingRegistration == null) {
            throw new RuntimeException("Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại!");
        }

        if (registrationOtpCacheService.isExpired(pendingRegistration)) {
            registrationOtpCacheService.removePendingRegistration(request.getEmail());
            throw new RuntimeException("OTP đã hết hạn. Vui lòng yêu cầu OTP mới!");
        }

        if (!pendingRegistration.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("OTP không chính xác!");
        }

        if (userRepository.existsByEmail(pendingRegistration.getEmail())) {
            registrationOtpCacheService.removePendingRegistration(request.getEmail());
            throw new RuntimeException("Email đã tồn tại!");
        }

        if (userRepository.existsByPhone(pendingRegistration.getPhone())) {
            registrationOtpCacheService.removePendingRegistration(request.getEmail());
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        User newUser = User.builder()
                .fullName(pendingRegistration.getFullName())
                .email(pendingRegistration.getEmail())
                .phone(pendingRegistration.getPhone())
                .password(pendingRegistration.getEncodedPassword())
                .role(UserRole.CUSTOMER)
                .build();

        User savedUser = userRepository.save(newUser);
        registrationOtpCacheService.removePendingRegistration(pendingRegistration.getEmail());

        notificationService.createNotification(
                savedUser.getId(),
                "🎉 Chào mừng " + savedUser.getFullName() + " đến với hệ thống đặt sân!",
                "/"
        );

        notificationService.notifyStaffAndOwners(
                "👤 Người dùng mới đăng ký: " + savedUser.getFullName(),
                "/owner/users",
                "/staff/operations"
        );

        return mapToResponse(savedUser);
    }

    // Đăng nhập
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng!");
        }

        String jwtTorken = jwtService.generateToken(user);

        UserResponse response = mapToResponse(user);

        response.setToken(jwtTorken);

        return response;

    }

    // Đăng nhập bằng Google OAuth2
    public UserResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken == null) {
                throw new RuntimeException("Token Google không hợp lệ hoặc đã hết hạn!");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            if (name == null || name.trim().isEmpty()) {
                name = email.substring(0, email.indexOf('@'));
            }

            // Kiểm tra user trong DB theo email
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Lần đầu đăng nhập bằng Google -> Tạo tài khoản mới với mật khẩu ngẫu nhiên (Dummy UUID Password)
                String dummyPassword = UUID.randomUUID().toString();
                user = User.builder()
                        .fullName(name)
                        .email(email)
                        .password(passwordEncoder.encode(dummyPassword))
                        .role(UserRole.CUSTOMER)
                        .build();

                user = userRepository.save(user);

                notificationService.createNotification(
                        user.getId(),
                        "🎉 Chào mừng " + user.getFullName() + " đến với hệ thống đặt sân qua Google!",
                        "/"
                );

                notificationService.notifyStaffAndOwners(
                        "👤 Người dùng mới đăng ký qua Google: " + user.getFullName(),
                        "/owner/users",
                        "/staff/operations"
                );
            }
            // Nếu user đã tồn tại -> Bỏ qua kiểm tra mật khẩu, lấy thông tin user để tạo Token

            String jwtToken = jwtService.generateToken(user);
            UserResponse response = mapToResponse(user);
            response.setToken(jwtToken);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Đăng nhập Google thất bại: " + e.getMessage(), e);
        }
    }



    // Tạo khách vãng lai
    public UserResponse createWalkInGuest(String fullName, String phone) {
        Optional<User> existingUser = userRepository.findByPhone(phone);
        if (existingUser.isPresent()) {
            return mapToResponse(existingUser.get());
        }

        User newGuest = User.builder()
                .fullName(fullName)
                .phone(phone)
                .email(phone + "@guest.local")
                .password(passwordEncoder.encode("123456"))
                .role(UserRole.CUSTOMER)
                .build();

        User savedGuest = userRepository.save(newGuest);

        notificationService.notifyStaffAndOwners(
                "Đã tạo tài khoản khách vãng lai: " + fullName,
                "/owner/users",
                "/staff/operations"
        );

        return mapToResponse(savedGuest);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        return response;
    }
}
