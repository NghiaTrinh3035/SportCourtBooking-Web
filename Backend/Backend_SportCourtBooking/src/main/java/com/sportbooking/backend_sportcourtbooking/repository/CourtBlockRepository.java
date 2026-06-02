package com.sportbooking.backend_sportcourtbooking.repository;

import com.sportbooking.backend_sportcourtbooking.entity.CourtBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourtBlockRepository extends JpaRepository<CourtBlock, Long> {
    List<CourtBlock> findByCourtIdOrderByStartTimeAsc(Long courtId);

    boolean existsByCourtIdAndStartTimeLessThanAndEndTimeGreaterThan(Long courtId,
                                                                     LocalDateTime endTime,
                                                                     LocalDateTime startTime);

    boolean existsByBookingId(Long bookingId);

    Optional<CourtBlock> findByBookingId(Long bookingId);

    void deleteByBookingId(Long bookingId);

    List<CourtBlock> findByBookingIdIsNotNullAndEndTimeLessThanEqual(LocalDateTime cutoff);

    void deleteByCourtId(Long courtId);
}
