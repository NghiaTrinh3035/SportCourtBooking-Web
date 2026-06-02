package com.sportbooking.backend_sportcourtbooking.repository;

import com.sportbooking.backend_sportcourtbooking.entity.User;
import com.sportbooking.backend_sportcourtbooking.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // MỚI: Tìm user theo số điện thoại (để Staff tìm nhanh khách cũ)
    Optional<User> findByPhone(String phone);

    // Tìm kiếm khách hàng theo tên (Search box user)
    List<User> findByFullNameContainingIgnoreCase(String name);

    List<User> findByRole(UserRole role);

    boolean existsByPhone(String phone);
}
