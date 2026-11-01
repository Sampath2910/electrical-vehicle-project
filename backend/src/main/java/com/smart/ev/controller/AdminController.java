package com.smart.ev.controller;

import com.smart.ev.domain.Charger;
import com.smart.ev.domain.ChargingSession;
import com.smart.ev.domain.Fault;
import com.smart.ev.domain.User;
import com.smart.ev.dto.AuthDto;
import com.smart.ev.dto.ChargerDto;
import com.smart.ev.dto.StatsDto;
import com.smart.ev.repository.ChargerRepository;
import com.smart.ev.repository.ChargingSessionRepository;
import com.smart.ev.repository.FaultRepository;
import com.smart.ev.repository.UserRepository;
import com.smart.ev.service.AuthService;
import com.smart.ev.service.ChargerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ChargerRepository chargerRepository;
    private final ChargingSessionRepository sessionRepository;
    private final FaultRepository faultRepository;
    private final ChargerService chargerService;
    private final AuthService authService;

    @GetMapping("/stats")
    public ResponseEntity<StatsDto.AdminStatsResponse> getAdminStats() {
        long totalUsers = userRepository.count();
        List<Charger> chargers = chargerRepository.findAll();
        long totalStations = chargers.size();

        long availableStations = chargers.stream()
                .filter(c -> c.getStatus() == Charger.Status.AVAILABLE)
                .count();

        long chargingStations = chargers.stream()
                .filter(c -> c.getStatus() == Charger.Status.CHARGING)
                .count();

        long faultStations = chargers.stream()
                .filter(c -> c.getStatus() == Charger.Status.FAULT || c.getStatus() == Charger.Status.OFFLINE)
                .count();

        List<ChargingSession> activeSessions = sessionRepository.findByStatusIn(
                Arrays.asList(ChargingSession.SessionStatus.CHARGING, ChargingSession.SessionStatus.STARTED)
        );

        BigDecimal totalRevenue = chargers.stream()
                .map(c -> c.getTotalEarnedRevenue() != null ? c.getTotalEarnedRevenue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double totalKwh = chargers.stream()
                .mapToDouble(c -> c.getTotalEnergyConsumedKwh() != null ? c.getTotalEnergyConsumedKwh() : 0.0)
                .sum();

        int activeFaults = faultRepository.findByStatus(Fault.FaultStatus.ACTIVE).size();

        List<ChargerDto.ChargerResponse> chargerResponses = chargerService.getAllChargers();

        List<User> operatorUsers = userRepository.findByRole(User.Role.OPERATOR);
        List<AuthDto.UserDto> operatorDtos = operatorUsers.stream()
                .map(authService::toUserDto)
                .collect(Collectors.toList());

        List<StatsDto.StationSummaryDto> stationSummaries = chargerResponses.stream()
                .map(c -> StatsDto.StationSummaryDto.builder()
                        .id(c.getId())
                        .code(c.getChargerCode())
                        .name(c.getName())
                        .location(c.getLocation())
                        .status(c.getStatus().name())
                        .powerRating(c.getPowerRating())
                        .pricePerKwh(c.getPricePerKwh())
                        .assignedOperatorName(c.getAssignedOperatorName())
                        .assignedOperatorId(c.getAssignedOperatorId())
                        .stationRevenue(c.getTotalEarnedRevenue())
                        .stationEnergyKwh(c.getTotalEnergyConsumedKwh())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(StatsDto.AdminStatsResponse.builder()
                .success(true)
                .totalUsers(totalUsers)
                .totalChargers(totalStations)
                .totalStations(totalStations)
                .availableStations(availableStations)
                .chargingStations(chargingStations)
                .faultStations(faultStations)
                .totalOperators(operatorUsers.size())
                .activeSessionsCount(activeSessions.size())
                .totalRevenue(totalRevenue)
                .totalFleetRevenue(totalRevenue)
                .totalEnergyDeliveredKwh(totalKwh)
                .totalFleetEnergyKwh(totalKwh)
                .activeFaultsCount(activeFaults)
                .chargers(chargerResponses)
                .stations(stationSummaries)
                .operators(operatorDtos)
                .build());
    }
}
