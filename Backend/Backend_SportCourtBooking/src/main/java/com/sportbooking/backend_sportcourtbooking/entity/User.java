package com.sportbooking.backend_sportcourtbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import com.sportbooking.backend_sportcourtbooking.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor
@AllArgsConstructor @Builder
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role; // ADMIN, CUSTOMER

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Booking> bookings;

    @JsonIgnore
    @OneToMany(mappedBy = "recipient")
    private List<Notification> receivedNotifications;

    @JsonIgnore
    @OneToMany(mappedBy = "sender")
    private List<Notification> sentNotifications;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email; // Dùng email làm username để đăng nhập
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
