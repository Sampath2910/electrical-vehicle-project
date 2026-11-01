package com.smart.ev.controller;

import com.smart.ev.domain.Charger;
import com.smart.ev.domain.ChargingSession;
import com.smart.ev.domain.User;
import com.smart.ev.dto.ChargerDto;
import com.smart.ev.dto.SessionDto;
import com.smart.ev.dto.StatsDto;
import com.smart.ev.repository.ChargerRepository;
import com.smart.ev.repository.ChargingSessionRepository;
import com.smart.ev.repository.UserRepository;
import com.smart.ev.service.ChargerService;
import com.smart.ev.service.ChargingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/operator")
@RequiredArgsConstructor
public class OperatorController {

    private final ChargerRepository chargerRepository;
    private final ChargingSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final ChargerService chargerService;
    private final ChargingSessionService sessionService;

    @GetMapping("/stats")
    public ResponseEntity<?> getOperatorStats(
            @RequestParam(required = false) String stationId,
            @RequestParam(required = false) String operatorId) {

        String identifier = stationId != null ? stationId : operatorId;
        if (identifier == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("stationId or operatorId parameter is required."));
        }

        Charger charger = chargerRepository.findById(identifier).orElse(null);
        if (charger == null && operatorId != null) {
            charger = chargerRepository.findByAssignedOperatorId(operatorId).orElse(null);
        }

        if (charger == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("No station assigned or found."));
        }

        User operator = charger.getAssignedOperatorId() != null
                ? userRepository.findById(charger.getAssignedOperatorId()).orElse(null)
                : null;

        ChargerDto.ChargerResponse stationResponse = chargerService.toResponse(charger);

        List<ChargingSession> sessions = sessionRepository.findByChargerIdOrderByStartTimeDesc(charger.getId());
        long completedCount = sessions.stream().filter(s -> s.getStatus() == ChargingSession.SessionStatus.COMPLETED).count();

        ChargingSession activeSession = sessionRepository.findFirstByChargerIdAndStatusIn(
                charger.getId(), Arrays.asList(ChargingSession.SessionStatus.CHARGING, ChargingSession.SessionStatus.STARTED)
        ).orElse(null);

        final String currentStationName = charger.getName();
        SessionDto.SessionResponse activeResponse = activeSession != null
                ? sessionService.toResponse(activeSession, currentStationName, null)
                : null;

        List<SessionDto.SessionResponse> recentSessions = sessions.stream()
                .limit(10)
                .map(s -> sessionService.toResponse(s, currentStationName, null))
                .collect(Collectors.toList());

        StatsDto.OperatorStatsDetail detail = StatsDto.OperatorStatsDetail.builder()
                .stationId(charger.getId())
                .stationName(charger.getName())
                .stationCode(charger.getChargerCode())
                .status(charger.getStatus().name())
                .powerRating(charger.getPowerRating())
                .pricePerKwh(charger.getPricePerKwh())
                .totalEarnedRevenue(charger.getTotalEarnedRevenue() != null ? charger.getTotalEarnedRevenue() : BigDecimal.ZERO)
                .totalEnergyConsumedKwh(charger.getTotalEnergyConsumedKwh() != null ? charger.getTotalEnergyConsumedKwh() : 0.0)
                .completedSessionsCount(completedCount)
                .assignedOperatorName(stationResponse.getAssignedOperatorName())
                .assignedOperatorId(charger.getAssignedOperatorId())
                .build();

        return ResponseEntity.ok(StatsDto.OperatorStatsResponse.builder()
                .success(true)
                .station(stationResponse)
                .stats(detail)
                .recentSessions(recentSessions)
                .operatorId(operator != null ? operator.getId() : "unassigned")
                .operatorName(stationResponse.getAssignedOperatorName())
                .stationId(charger.getId())
                .stationName(charger.getName())
                .stationStatus(charger.getStatus().name())
                .powerRating(charger.getPowerRating())
                .stationRevenue(charger.getTotalEarnedRevenue() != null ? charger.getTotalEarnedRevenue() : BigDecimal.ZERO)
                .stationEnergyKwh(charger.getTotalEnergyConsumedKwh() != null ? charger.getTotalEnergyConsumedKwh() : 0.0)
                .totalCompletedSessions(completedCount)
                .activeSession(activeResponse)
                .build());
    }

    public record ErrorResponse(String error) {}
}
