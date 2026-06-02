package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.ChangePasswordRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.UserResponse;
import com.sportbooking.backend_sportcourtbooking.DTOs.UserRoleUpdateRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.UserUpdateRequest;
import com.sportbooking.backend_sportcourtbooking.entity.User;
import com.sportbooking.backend_sportcourtbooking.enums.UserRole;
import com.sportbooking.backend_sportcourtbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return mapToResponse(user);
    }

    public UserResponse getMyProfile() {
        return mapToResponse(currentUserService.getCurrentUser());
    }

    public UserResponse updateProfile(Long userId, UserUpdateRequest request) {
        ensureCanEditUser(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);

        notificationService.createNotification(
                updatedUser.getId(),
                "Thông tin cá nhân của bạn đã được cập nhật.",
                "/profile"
        );

        return mapToResponse(updatedUser);
    }

    public UserResponse updateMyProfile(UserUpdateRequest request) {
        return updateProfile(currentUserService.getCurrentUserId(), request);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        ensureCanEditUser(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
            "Mật khẩu của bạn vừa được thay đổi. Nếu không phải bạn, hãy liên hệ OWNER ngay!",
                "/profile"
        );
    }

    public void changeMyPassword(ChangePasswordRequest request) {
        changePassword(currentUserService.getCurrentUserId(), request);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<UserResponse> searchUsers(String name) {
        return userRepository.findByFullNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUserRole(Long userId, UserRoleUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        user.setRole(request.getRole());
        User updatedUser = userRepository.save(user);

        notificationService.createNotification(
            updatedUser.getId(),
            "Vai trò tài khoản của bạn đã được cập nhật thành " + updatedUser.getRole() + ".",
            "/profile"
        );

        return mapToResponse(updatedUser);
    }

    public UserResponse setCustomerRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        user.setRole(UserRole.CUSTOMER);
        User updatedUser = userRepository.save(user);

        notificationService.createNotification(
            updatedUser.getId(),
            "Vai trò tài khoản của bạn đã được chuyển về CUSTOMER.",
            "/profile"
        );

        return mapToResponse(updatedUser);
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

    private void ensureCanEditUser(Long userId) {
        if (!currentUserService.isCurrentUserOwner() && !currentUserService.getCurrentUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền thao tác với người dùng này");
        }
    }
}
