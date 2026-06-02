package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.entity.User;
import com.sportbooking.backend_sportcourtbooking.enums.UserRole;
import com.sportbooking.backend_sportcourtbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new AuthenticationCredentialsNotFoundException("Chưa xác thực người dùng");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Không tìm thấy người dùng hiện tại"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public boolean isCurrentUserOwner() {
        return getCurrentUser().getRole() == UserRole.OWNER;
    }

    public boolean isCurrentUserStaffOrOwner() {
        UserRole role = getCurrentUser().getRole();
        return role == UserRole.OWNER || role == UserRole.STAFF;
    }
}
