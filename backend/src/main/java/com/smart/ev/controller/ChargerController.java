package com.smart.ev.controller;

import com.smart.ev.dto.ChargerDto;
import com.smart.ev.service.ChargerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chargers")
@RequiredArgsConstructor
public class ChargerController {

    private final ChargerService chargerService;

    @GetMapping
    public ResponseEntity<List<ChargerDto.ChargerResponse>> getAllChargers() {
        return ResponseEntity.ok(chargerService.getAllChargers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getChargerById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(chargerService.getChargerById(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody ChargerDto.StatusUpdateRequest request) {
        try {
            return ResponseEntity.ok(chargerService.updateStatus(id, request.getStatus()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/rating")
    public ResponseEntity<?> updateRating(
            @PathVariable String id,
            @RequestBody ChargerDto.RatingUpdateRequest request) {
        try {
            return ResponseEntity.ok(chargerService.updateRating(id, request.getPowerRating()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/operator")
    public ResponseEntity<?> assignOperator(
            @PathVariable String id,
            @RequestBody ChargerDto.AssignOperatorRequest request) {
        try {
            return ResponseEntity.ok(chargerService.assignOperator(id, request.getOperatorId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
        }
    }

    public record ErrorResponse(String error) {}
}
