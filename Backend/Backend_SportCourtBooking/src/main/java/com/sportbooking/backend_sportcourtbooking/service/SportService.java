package com.sportbooking.backend_sportcourtbooking.service;

import com.sportbooking.backend_sportcourtbooking.DTOs.SportRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.SportResponse;
import com.sportbooking.backend_sportcourtbooking.entity.Sport;
import com.sportbooking.backend_sportcourtbooking.repository.CourtRepository;
import com.sportbooking.backend_sportcourtbooking.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SportService {

    private final SportRepository sportRepository;
    private final CourtRepository courtRepository;
    private final NotificationService notificationService; // Inject thêm

    // 1. Lấy danh sách môn
    public List<SportResponse> getAllSports() {
        List<Sport> sports = sportRepository.findAll();

        return sports.stream().map(sport -> {
            SportResponse response = new SportResponse();
            response.setId(sport.getId());
            response.setName(sport.getName());
            response.setIconUrl(sport.getIconUrl());
            response.setTotalCourts(courtRepository.countBySportId(sport.getId()));
            return response;
        }).collect(Collectors.toList());
    }

    // 2. Tạo môn mới
    public Sport createSport(SportRequest request) {
        if (sportRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Môn này đã tồn tại!");
        }
        Sport sport = new Sport();
        sport.setName(request.getName());
        sport.setIconUrl(request.getIconUrl());

        Sport savedSport = sportRepository.save(sport);

        // Thông báo cho OWNER khi tạo môn mới
        notificationService.notifyStaffAndOwners(
            "Bạn đã thêm môn thể thao mới: " + savedSport.getName(),
            "/owner/sports",
            "/staff/operations"
        );

        return savedSport;
    }

    public Sport updateSport(Long sportId, SportRequest request) {
        Sport sport = sportRepository.findById(sportId)
                .orElseThrow(() -> new RuntimeException("Môn thể thao không tồn tại!"));

        if (!sport.getName().equalsIgnoreCase(request.getName())
                && sportRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Môn này đã tồn tại!");
        }

        sport.setName(request.getName());
        sport.setIconUrl(request.getIconUrl());
    Sport updatedSport = sportRepository.save(sport);

    notificationService.notifyStaffAndOwners(
        "🏅 Môn thể thao '" + updatedSport.getName() + "' đã được cập nhật.",
        "/owner/sports",
        "/staff/operations"
    );

    return updatedSport;
    }

    public void deleteSport(Long sportId) {
        Sport sport = sportRepository.findById(sportId)
                .orElseThrow(() -> new RuntimeException("Môn thể thao không tồn tại!"));
        if (courtRepository.countBySportId(sportId) > 0) {
            throw new RuntimeException("Không thể xóa môn thể thao đang có sân");
        }
        sportRepository.delete(sport);

        notificationService.notifyStaffAndOwners(
                "🏅 Môn thể thao '" + sport.getName() + "' đã được xóa khỏi hệ thống.",
            "/owner/sports",
            "/staff/operations"
        );
    }
}
