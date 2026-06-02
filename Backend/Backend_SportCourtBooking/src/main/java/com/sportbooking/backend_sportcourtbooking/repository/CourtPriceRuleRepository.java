package com.sportbooking.backend_sportcourtbooking.repository;

import com.sportbooking.backend_sportcourtbooking.entity.CourtPriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourtPriceRuleRepository extends JpaRepository<CourtPriceRule, Long> {
    // Lấy tất cả luật giá của 1 sân để tính toán
    List<CourtPriceRule> findByCourtIdOrderByStartTimeAsc(Long courtId);

    void deleteByCourtId(Long courtId);
}
