package com.sportbooking.backend_sportcourtbooking.controller;

import com.sportbooking.backend_sportcourtbooking.DTOs.SportRequest;
import com.sportbooking.backend_sportcourtbooking.DTOs.SportResponse;
import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import com.sportbooking.backend_sportcourtbooking.entity.Sport;
import com.sportbooking.backend_sportcourtbooking.service.SportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
public class SportController {

    private final SportService sportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SportResponse>>> getAllSports() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", sportService.getAllSports()));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Sport>> createSport(@Valid @RequestBody SportRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", sportService.createSport(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Sport>> updateSport(@PathVariable Long id, @Valid @RequestBody SportRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", sportService.updateSport(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteSport(@PathVariable Long id) {
        sportService.deleteSport(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted successfully", null));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @GetMapping
    public ResponseEntity<List<SportResponse>> getAllSportsOld() {
        return ResponseEntity.ok(sportService.getAllSports());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Sport> createSportOld(@Valid @RequestBody SportRequest request) {
        return ResponseEntity.ok(sportService.createSport(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Sport> updateSportOld(@PathVariable Long id, @Valid @RequestBody SportRequest request) {
        return ResponseEntity.ok(sportService.updateSport(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteSportOld(@PathVariable Long id) {
        sportService.deleteSport(id);
        return ResponseEntity.noContent().build();
    }
    */
}
