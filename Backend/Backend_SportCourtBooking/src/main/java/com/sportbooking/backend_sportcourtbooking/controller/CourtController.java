package com.sportbooking.backend_sportcourtbooking.controller;

import com.sportbooking.backend_sportcourtbooking.DTOs.*;
import com.sportbooking.backend_sportcourtbooking.entity.Court;
import com.sportbooking.backend_sportcourtbooking.entity.CourtBlock;
import com.sportbooking.backend_sportcourtbooking.entity.CourtPriceRule;
import com.sportbooking.backend_sportcourtbooking.service.CourtPriceRuleService;
import com.sportbooking.backend_sportcourtbooking.service.CourtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor
public class CourtController {
    private final CourtService courtService;
    private final CourtPriceRuleService courtPriceRuleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Court>>> getAllCourts() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtService.getAllCourts()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Court>>> getAvailableCourts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(required = false) Long sportId
    ) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtService.getAvailableCourts(startTime, endTime, sportId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Court>> getCourtById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtService.getCourtById(id)));
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<CourtScheduleResponse>> getCourtSchedule(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtService.getCourtSchedule(id, queryDate)));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Court>> createNewCourt(@Valid @RequestBody CourtRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtService.createCourt(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Court>> updateCourt(@PathVariable Long id, @Valid @RequestBody CourtRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtService.updateCourt(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteCourt(@PathVariable Long id) {
        courtService.deleteCourt(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted successfully", null));
    }

    @GetMapping("/{id}/prices")
    public ResponseEntity<ApiResponse<List<CourtPriceRule>>> getCourtPrices(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtPriceRuleService.getPriceRulesByCourtId(id)));
    }

    @PostMapping("/prices")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<CourtPriceRule>> addPriceRule(@Valid @RequestBody CourtPriceRuleRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtPriceRuleService.setCourtPrice(request)));
    }

    @PutMapping("/prices/{ruleId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<CourtPriceRule>> updatePriceRule(@PathVariable Long ruleId, @Valid @RequestBody CourtPriceRuleRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtPriceRuleService.updatePriceRule(ruleId, request)));
    }

    @DeleteMapping("/prices/{ruleId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> deletePriceRule(@PathVariable Long ruleId) {
        courtPriceRuleService.deletePriceRule(ruleId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted successfully", null));
    }

    @GetMapping("/{id}/blocks")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<CourtBlock>>> getCourtBlocks(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtService.getBlocksByCourtId(id)));
    }

    @PostMapping("/blocks")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<CourtBlock>> addBlock(@Valid @RequestBody CourtBlockRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", courtService.addBlock(request)));
    }

    @DeleteMapping("/blocks/{blockId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteBlock(@PathVariable Long blockId) {
        courtService.deleteBlock(blockId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted successfully", null));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @GetMapping
    public ResponseEntity<List<Court>> getAllCourtsOld() {
        return ResponseEntity.ok(courtService.getAllCourts());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Court>> getAvailableCourtsOld(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(required = false) Long sportId
    ) {
        return ResponseEntity.ok(courtService.getAvailableCourts(startTime, endTime, sportId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Court> getCourtByIdOld(@PathVariable Long id) {
        return ResponseEntity.ok(courtService.getCourtById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Court> createNewCourtOld(@Valid @RequestBody CourtRequest request) {
        return ResponseEntity.ok(courtService.createCourt(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Court> updateCourtOld(@PathVariable Long id, @Valid @RequestBody CourtRequest request) {
        return ResponseEntity.ok(courtService.updateCourt(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteCourtOld(@PathVariable Long id) {
        courtService.deleteCourt(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/prices")
    public ResponseEntity<List<CourtPriceRule>> getCourtPricesOld(@PathVariable Long id) {
        return ResponseEntity.ok(courtPriceRuleService.getPriceRulesByCourtId(id));
    }

    @PostMapping("/prices")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CourtPriceRule> addPriceRuleOld(@Valid @RequestBody CourtPriceRuleRequest request) {
        return ResponseEntity.ok(courtPriceRuleService.setCourtPrice(request));
    }

    @PutMapping("/prices/{ruleId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CourtPriceRule> updatePriceRuleOld(@PathVariable Long ruleId, @Valid @RequestBody CourtPriceRuleRequest request) {
        return ResponseEntity.ok(courtPriceRuleService.updatePriceRule(ruleId, request));
    }

    @DeleteMapping("/prices/{ruleId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deletePriceRuleOld(@PathVariable Long ruleId) {
        courtPriceRuleService.deletePriceRule(ruleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/blocks")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<CourtBlock>> getCourtBlocksOld(@PathVariable Long id) {
        return ResponseEntity.ok(courtService.getBlocksByCourtId(id));
    }

    @PostMapping("/blocks")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CourtBlock> addBlockOld(@Valid @RequestBody CourtBlockRequest request) {
        return ResponseEntity.ok(courtService.addBlock(request));
    }

    @DeleteMapping("/blocks/{blockId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteBlockOld(@PathVariable Long blockId) {
        courtService.deleteBlock(blockId);
        return ResponseEntity.noContent().build();
    }
    */
}
