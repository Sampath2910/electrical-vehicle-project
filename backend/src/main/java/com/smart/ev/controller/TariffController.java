package com.smart.ev.controller;

import com.smart.ev.domain.Tariff;
import com.smart.ev.dto.TariffDto;
import com.smart.ev.service.TariffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tariffs")
@RequiredArgsConstructor
public class TariffController {

    private final TariffService tariffService;

    @GetMapping("/current-slot")
    public ResponseEntity<TariffDto.CurrentSlotResponse> getCurrentSlot(
            @RequestParam(required = false) Integer hour) {
        return ResponseEntity.ok(tariffService.getCurrentToDSlot(hour));
    }

    @GetMapping
    public ResponseEntity<List<Tariff>> getAllTariffs() {
        return ResponseEntity.ok(tariffService.getAllTariffs());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTariff(
            @PathVariable String id,
            @RequestBody TariffDto.TariffUpdateRequest request) {
        try {
            return ResponseEntity.ok(tariffService.updateTariff(id, request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
        }
    }

    public record ErrorResponse(String error) {}
}
