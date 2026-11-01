package com.smart.ev.controller;

import com.smart.ev.dto.AuthDto;
import com.smart.ev.dto.SessionDto;
import com.smart.ev.service.AuthService;
import com.smart.ev.service.ChargingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class ChargingSessionController {

    private final ChargingSessionService sessionService;
    private final AuthService authService;

    @PostMapping("/start")
    public ResponseEntity<?> startSession(@RequestBody SessionDto.StartSessionRequest request) {
        try {
            AuthDto.UserDto currentUser = authService.getCurrentUser();
            String userId = currentUser != null ? currentUser.getId() : "user-drv-001";
            SessionDto.SessionResponse response = sessionService.startSession(userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<?> stopSession(
            @PathVariable String id,
            @RequestBody(required = false) SessionDto.StopSessionRequest request) {
        try {
            boolean penalty = request != null && Boolean.TRUE.equals(request.getPenaltyApplies());
            SessionDto.SessionResponse response = sessionService.stopSession(id, penalty);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveSession() {
        AuthDto.UserDto currentUser = authService.getCurrentUser();
        String userId = currentUser != null ? currentUser.getId() : "user-drv-001";
        SessionDto.SessionResponse active = sessionService.getActiveSessionForUser(userId);
        return ResponseEntity.ok(active);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SessionDto.SessionResponse>> getSessionHistory() {
        AuthDto.UserDto currentUser = authService.getCurrentUser();
        String userId = currentUser != null ? currentUser.getId() : "user-drv-001";
        return ResponseEntity.ok(sessionService.getHistoryForUser(userId));
    }

    public record ErrorResponse(String error) {}
}
