package com.sportbooking.backend_sportcourtbooking.controller;

import com.sportbooking.backend_sportcourtbooking.DTOs.ChangePasswordRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.UserRoleUpdateRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.UserResponse;
import com.sportbooking.backend_sportcourtbooking.DTOs.UserUpdateRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import com.sportbooking.backend_sportcourtbooking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", userService.getMyProfile()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(@Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", userService.updateMyProfile(request)));
    }

    @PutMapping("/me/password")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<ApiResponse<String>> changeMyPassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changeMyPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đổi mật khẩu thành công!", null));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", userService.getAllUsers()));
    }

    @GetMapping("/owner/search")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(@RequestParam String name) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", userService.searchUsers(name)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", userService.getUserProfile(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", userService.updateProfile(id, request)));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(@PathVariable Long id, @Valid @RequestBody UserRoleUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", userService.updateUserRole(id, request)));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<UserResponse> getMyProfileOld() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<UserResponse> updateMyProfileOld(@Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(request));
    }

    @PutMapping("/me/password")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','STAFF')")
    public ResponseEntity<String> changeMyPasswordOld(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changeMyPassword(request);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<UserResponse>> getAllUsersOld() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/owner/search")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<UserResponse>> searchUsersOld(@RequestParam String name) {
        return ResponseEntity.ok(userService.searchUsers(name));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserResponse> getUserProfileOld(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserResponse> updateProfileOld(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserResponse> updateRoleOld(@PathVariable Long id, @Valid @RequestBody UserRoleUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request));
    }
    */
}
