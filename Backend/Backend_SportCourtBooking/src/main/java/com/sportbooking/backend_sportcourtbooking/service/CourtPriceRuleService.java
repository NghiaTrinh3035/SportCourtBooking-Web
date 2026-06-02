package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.CourtPriceRuleRequest;
import com.sportbooking.backend_sportcourtbooking.entity.Court;
import com.sportbooking.backend_sportcourtbooking.entity.CourtPriceRule;
import com.sportbooking.backend_sportcourtbooking.repository.CourtPriceRuleRepository;
import com.sportbooking.backend_sportcourtbooking.repository.CourtRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CourtPriceRuleService {

    private final CourtRepository courtRepository;
    private final CourtPriceRuleRepository courtPriceRuleRepository;
    private final NotificationService notificationService;

    public List<CourtPriceRule> getPriceRulesByCourtId(Long courtId) {
        return courtPriceRuleRepository.findByCourtIdOrderByStartTimeAsc(courtId);
    }

    public CourtPriceRule setCourtPrice(CourtPriceRuleRequest request) {
        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new RuntimeException("Sân không tồn tại"));

        validateTimeRange(request.getStartTime(), request.getEndTime());

        List<CourtPriceRule> rules = courtPriceRuleRepository.findByCourtIdOrderByStartTimeAsc(request.getCourtId());
        CourtPriceRule existingExact = rules.stream()
                .filter(rule -> rule.getStartTime().equals(request.getStartTime())
                        && rule.getEndTime().equals(request.getEndTime()))
                .findFirst()
                .orElse(null);

        ensureNoPriceRuleOverlap(court.getId(), request.getStartTime(), request.getEndTime(),
                existingExact != null ? existingExact.getId() : null);

        CourtPriceRule rule = existingExact != null ? existingExact : new CourtPriceRule();
        rule.setCourt(court);
        rule.setStartTime(request.getStartTime());
        rule.setEndTime(request.getEndTime());
        rule.setPrice(request.getPrice());
        CourtPriceRule savedRule = courtPriceRuleRepository.save(rule);

        notificationService.notifyStaffAndOwners(
            "💰 Giá sân '" + court.getName() + "' đã được " + (existingExact != null ? "cập nhật" : "thiết lập")
                + " cho khung " + request.getStartTime() + " - " + request.getEndTime() + ".",
            "/owner/courts",
            "/staff/operations"
        );

        return savedRule;
    }

    public CourtPriceRule updatePriceRule(Long ruleId, CourtPriceRuleRequest request) {
        CourtPriceRule rule = courtPriceRuleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Quy tắc giá không tồn tại"));

        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new RuntimeException("Sân không tồn tại"));

        validateTimeRange(request.getStartTime(), request.getEndTime());
        ensureNoPriceRuleOverlap(court.getId(), request.getStartTime(), request.getEndTime(), ruleId);

        rule.setCourt(court);
        rule.setStartTime(request.getStartTime());
        rule.setEndTime(request.getEndTime());
        rule.setPrice(request.getPrice());
        CourtPriceRule savedRule = courtPriceRuleRepository.save(rule);

        notificationService.notifyStaffAndOwners(
            "💰 Quy tắc giá sân '" + court.getName() + "' đã được cập nhật cho khung "
                + request.getStartTime() + " - " + request.getEndTime() + ".",
            "/owner/courts",
            "/staff/operations"
        );

        return savedRule;
    }

    public void deletePriceRule(Long ruleId) {
        CourtPriceRule rule = courtPriceRuleRepository.findById(ruleId)
            .orElseThrow(() -> new RuntimeException("Quy tắc giá không tồn tại"));
        courtPriceRuleRepository.delete(rule);

        notificationService.notifyStaffAndOwners(
            "💰 Quy tắc giá sân '" + rule.getCourt().getName() + "' cho khung "
                + rule.getStartTime() + " - " + rule.getEndTime() + " đã bị xóa.",
            "/owner/courts",
            "/staff/operations"
        );
    }

    public BigDecimal calculateBookingPrice(Long courtId, LocalDateTime start, LocalDateTime end) {
        if (!start.isBefore(end)) {
            throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc");
        }

        List<CourtPriceRule> rules = courtPriceRuleRepository.findByCourtIdOrderByStartTimeAsc(courtId);
        LocalTime timeStart = start.toLocalTime();

        CourtPriceRule matchedRule = rules.stream()
                .filter(rule -> !timeStart.isBefore(rule.getStartTime()) && timeStart.isBefore(rule.getEndTime()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Chưa thiết lập giá cho khung giờ này"));

        long minutes = Duration.between(start, end).toMinutes();
        BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);

        return matchedRule.getPrice()
                .multiply(hours)
                .setScale(0, RoundingMode.HALF_UP);
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc");
        }
    }

    private void ensureNoPriceRuleOverlap(Long courtId, LocalTime startTime, LocalTime endTime, Long excludeRuleId) {
        List<CourtPriceRule> rules = new ArrayList<>(courtPriceRuleRepository.findByCourtIdOrderByStartTimeAsc(courtId));
        for (CourtPriceRule rule : rules) {
            if (excludeRuleId != null && Objects.equals(rule.getId(), excludeRuleId)) {
                continue;
            }
            boolean overlap = rule.getStartTime().isBefore(endTime) && rule.getEndTime().isAfter(startTime);
            if (overlap) {
                throw new RuntimeException("Khung giờ giá đã bị trùng");
            }
        }
    }
}