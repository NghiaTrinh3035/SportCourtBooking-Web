package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.CourtBlockRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.CourtRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.CourtScheduleResponse;
import com.sportbooking.backend_sportcourtbooking.DTOs.OccupiedSlot;
import com.sportbooking.backend_sportcourtbooking.entity.*;
import com.sportbooking.backend_sportcourtbooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourtService {

    private final CourtRepository courtRepository;
    private final CourtPriceRuleRepository courtPriceRuleRepository;
    private final CourtBlockRepository courtBlockRepository;
    private final BookingRepository bookingRepository;
    private final SportRepository sportRepository;
    private final NotificationService notificationService;

    public List<Court> getAllCourts() {
        return courtRepository.findAll();
    }

    public Court getCourtById(Long id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sân không tồn tại!"));
    }

    public List<Court> getAvailableCourts(LocalDateTime startTime, LocalDateTime endTime, Long sportId) {
        List<Court> courts = sportId == null ? courtRepository.findByIsActiveTrue() : courtRepository.findBySportId(sportId);
        return courts.stream()
                .filter(Court::isActive)
                .filter(court -> isWithinOpenHours(court, startTime, endTime))
                .filter(court -> !bookingRepository.existsByCourtIdAndTimeRange(court.getId(), startTime, endTime))
                .filter(court -> !courtBlockRepository.existsByCourtIdAndStartTimeLessThanAndEndTimeGreaterThan(court.getId(), endTime, startTime))
                .collect(Collectors.toList());
    }

    public Court createCourt(CourtRequest request) {
        validateCourtRequest(request);
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new RuntimeException("Môn thể thao không tồn tại!"));
        if (courtRepository.existsByNameIgnoreCaseAndSportId(request.getName(), request.getSportId())) {
            throw new RuntimeException("Sân này đã tồn tại trong môn thể thao đã chọn!");
        }

        Court court = new Court();
        court.setName(request.getName());
        court.setSport(sport);
        court.setDescription(request.getDescription());
        court.setOpenTime(request.getOpenTime());
        court.setCloseTime(request.getCloseTime());
        court.setActive(request.getActive() == null || request.getActive());

        Court savedCourt = courtRepository.save(court);
        notificationService.notifyStaffAndOwners(
            "🏟️ Sân mới '" + savedCourt.getName() + "' đã được thêm vào hệ thống.",
            "/owner/courts",
            "/staff/operations"
        );
        return savedCourt;
    }

    public Court updateCourt(Long courtId, CourtRequest request) {
        validateCourtRequest(request);
        Court court = getCourtById(courtId);
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new RuntimeException("Môn thể thao không tồn tại!"));

        if (!court.getName().equalsIgnoreCase(request.getName())
                && courtRepository.existsByNameIgnoreCaseAndSportId(request.getName(), request.getSportId())) {
            throw new RuntimeException("Tên sân đã tồn tại trong môn thể thao đã chọn!");
        }

        court.setName(request.getName());
        court.setSport(sport);
        court.setDescription(request.getDescription());
        court.setOpenTime(request.getOpenTime());
        court.setCloseTime(request.getCloseTime());
        if (request.getActive() != null) {
            court.setActive(request.getActive());
        }
        Court updatedCourt = courtRepository.save(court);

        notificationService.notifyStaffAndOwners(
                "🏟️ Sân '" + updatedCourt.getName() + "' đã được cập nhật.",
            "/owner/courts",
            "/staff/operations"
        );

        return updatedCourt;
    }

    public void deleteCourt(Long courtId) {
        Court court = getCourtById(courtId);
        if (!bookingRepository.findByCourtIdOrderByStartTimeAsc(courtId).isEmpty()) {
            throw new RuntimeException("Không thể xóa sân đã có lịch đặt");
        }
        courtPriceRuleRepository.deleteByCourtId(courtId);
        courtBlockRepository.deleteByCourtId(courtId);
        courtRepository.delete(court);

        notificationService.notifyStaffAndOwners(
                "🏟️ Sân '" + court.getName() + "' đã được xóa khỏi hệ thống.",
            "/owner/courts",
            "/staff/operations"
        );
    }

    public List<CourtBlock> getBlocksByCourtId(Long courtId) {
        return courtBlockRepository.findByCourtIdOrderByStartTimeAsc(courtId);
    }

    public CourtBlock addBlock(CourtBlockRequest request) {
        Court court = getCourtById(request.getCourtId());
        validateTimeRange(request.getStartTime().toLocalTime(), request.getEndTime().toLocalTime());
        if (courtBlockRepository.existsByCourtIdAndStartTimeLessThanAndEndTimeGreaterThan(
                request.getCourtId(), request.getEndTime(), request.getStartTime())) {
            throw new RuntimeException("Khung chặn đã trùng với lịch chặn khác");
        }

        CourtBlock block = new CourtBlock();
        block.setCourt(court);
        block.setStartTime(request.getStartTime());
        block.setEndTime(request.getEndTime());
        block.setReason(request.getReason());
        CourtBlock savedBlock = courtBlockRepository.save(block);

        notificationService.notifyStaffAndOwners(
            "⛔ Sân '" + court.getName() + "' vừa được chặn từ " + request.getStartTime() + " đến " + request.getEndTime() + ".",
            "/owner/courts",
            "/staff/operations"
        );

        return savedBlock;
    }

    public void deleteBlock(Long blockId) {
        CourtBlock block = courtBlockRepository.findById(blockId)
            .orElseThrow(() -> new RuntimeException("Khung chặn không tồn tại"));
        courtBlockRepository.delete(block);

        notificationService.notifyStaffAndOwners(
            "✅ Đã gỡ chặn sân '" + block.getCourt().getName() + "' từ " + block.getStartTime() + " đến " + block.getEndTime() + ".",
            "/owner/courts",
            "/staff/operations"
        );
    }

    public CourtScheduleResponse getCourtSchedule(Long courtId, LocalDate date) {
        Court court = getCourtById(courtId);
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<Booking> bookings = bookingRepository.findOccupiedBookingsByCourtAndDate(courtId, startOfDay, endOfDay);
        List<CourtBlock> blocks = courtBlockRepository.findBlocksByCourtAndDate(courtId, startOfDay, endOfDay);

        List<OccupiedSlot> occupiedSlots = new ArrayList<>();
        for (Booking b : bookings) {
            occupiedSlots.add(OccupiedSlot.builder()
                    .startTime(b.getStartTime())
                    .endTime(b.getEndTime())
                    .type("BOOKED")
                    .build());
        }
        for (CourtBlock cb : blocks) {
            occupiedSlots.add(OccupiedSlot.builder()
                    .startTime(cb.getStartTime())
                    .endTime(cb.getEndTime())
                    .type("BLOCKED")
                    .build());
        }

        occupiedSlots.sort(Comparator.comparing(OccupiedSlot::getStartTime));

        return CourtScheduleResponse.builder()
                .courtId(court.getId())
                .date(date.toString())
                .openTime(court.getOpenTime())
                .closeTime(court.getCloseTime())
                .occupiedSlots(occupiedSlots)
                .build();
    }

    private void validateCourtRequest(CourtRequest request) {
        validateTimeRange(request.getOpenTime(), request.getCloseTime());
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("Giờ bắt đầu phải trước giờ kết thúc");
        }
    }

    private boolean isWithinOpenHours(Court court, LocalDateTime startTime, LocalDateTime endTime) {
        LocalTime openTime = court.getOpenTime();
        LocalTime closeTime = court.getCloseTime();
        LocalTime start = startTime.toLocalTime();
        LocalTime end = endTime.toLocalTime();
        return !start.isBefore(openTime) && !end.isAfter(closeTime);
    }
}
