package com.sportbooking.backend_sportcourtbooking.repository;

import com.sportbooking.backend_sportcourtbooking.entity.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    // Lấy tất cả sân của môn Cầu Lông (sportId = 1) chẳng hạn
    List<Court> findBySportId(Long sportId);

    // Đếm xem môn này có bao nhiêu sân
    int countBySportId(Long sportId);

    boolean existsByNameIgnoreCaseAndSportId(String name, Long sportId);

    List<Court> findByIsActiveTrue();

    List<Court> findByNameContainingIgnoreCase(String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Court c WHERE c.id = :id")
    Optional<Court> findByIdForUpdate(@Param("id") Long id);
}
