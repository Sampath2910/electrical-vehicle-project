package com.smart.ev.controller;

import com.smart.ev.dto.AuthDto;
import com.smart.ev.dto.PreemptionDto;
import com.smart.ev.service.AuthService;
import com.smart.ev.service.PriorityPreemptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/preemption")
@RequiredArgsConstructor
public class PreemptionController {

    private final PriorityPreemptionService preemptionService;
    private final AuthService authService;

    @PostMapping("/trigger")
    public ResponseEntity<PreemptionDto.PreemptionStatusResponse> triggerEmergency(
            @RequestBody PreemptionDto.TriggerPreemptionRequest request) {
        return ResponseEntity.ok(preemptionService.triggerEmergencyOverride(request.getChargerId(), request.getReason()));
    }

    @PostMapping("/yield")
    public ResponseEntity<PreemptionDto.PreemptionStatusResponse> yieldBay() {
        AuthDto.UserDto currentUser = authService.getCurrentUser();
        String userId = currentUser != null ? currentUser.getId() : "user-drv-001";
        return ResponseEntity.ok(preemptionService.yieldEmergencyBay(userId));
    }

    @GetMapping("/status")
    public ResponseEntity<PreemptionDto.PreemptionStatusResponse> getStatus() {
        return ResponseEntity.ok(preemptionService.getStatus());
    }
}
