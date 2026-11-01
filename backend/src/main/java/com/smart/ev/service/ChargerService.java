package com.smart.ev.service;

import com.smart.ev.domain.Charger;
import com.smart.ev.domain.User;
import com.smart.ev.dto.ChargerDto;
import com.smart.ev.repository.ChargerRepository;
import com.smart.ev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChargerService {

    private final ChargerRepository chargerRepository;
    private final UserRepository userRepository;

    public List<ChargerDto.ChargerResponse> getAllChargers() {
        return chargerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ChargerDto.ChargerResponse getChargerById(String id) {
        Charger charger = chargerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Charger not found with id: " + id));
        return toResponse(charger);
    }

    @Transactional
    public ChargerDto.ChargerResponse updateStatus(String id, Charger.Status status) {
        Charger charger = chargerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Charger not found with id: " + id));
        charger.setStatus(status);
        charger.setLastSeenAt(LocalDateTime.now());
        return toResponse(chargerRepository.save(charger));
    }

    @Transactional
    public ChargerDto.ChargerResponse updateRating(String id, Double powerRating) {
        Charger charger = chargerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Charger not found with id: " + id));
        charger.setPowerRating(powerRating);
        charger.setLastSeenAt(LocalDateTime.now());
        return toResponse(chargerRepository.save(charger));
    }

    @Transactional
    public ChargerDto.ChargerResponse assignOperator(String stationId, String operatorId) {
        Charger charger = chargerRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Charger not found with id: " + stationId));
        User operator = userRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found with id: " + operatorId));

        charger.setAssignedOperatorId(operator.getId());
        charger.setLastSeenAt(LocalDateTime.now());
        operator.setAssignedStationId(stationId);
        userRepository.save(operator);

        return toResponse(chargerRepository.save(charger));
    }

    public ChargerDto.ChargerResponse toResponse(Charger c) {
        String operatorName = "Unassigned";
        if (c.getAssignedOperatorId() != null) {
            User op = userRepository.findById(c.getAssignedOperatorId()).orElse(null);
            if (op != null) {
                operatorName = String.format("%s (%s)", op.getName(), op.getOperatorBadgeId() != null ? op.getOperatorBadgeId() : "OP");
            }
        }

        boolean isPriority = "KLETECH-STATION-2".equals(c.getChargerCode()) || (c.getName() != null && c.getName().toLowerCase().contains("emergency"));

        return ChargerDto.ChargerResponse.builder()
                .id(c.getId())
                .chargerCode(c.getChargerCode())
                .name(c.getName())
                .location(c.getLocation())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .powerRating(c.getPowerRating())
                .connectorType(c.getConnectorType())
                .status(c.getStatus())
                .pricePerKwh(c.getPricePerKwh())
                .lastSeenAt(c.getLastSeenAt())
                .assignedOperatorId(c.getAssignedOperatorId())
                .assignedOperatorName(operatorName)
                .totalEarnedRevenue(c.getTotalEarnedRevenue() != null ? c.getTotalEarnedRevenue() : BigDecimal.ZERO)
                .totalEnergyConsumedKwh(c.getTotalEnergyConsumedKwh() != null ? c.getTotalEnergyConsumedKwh() : 0.0)
                .isPriorityBay(isPriority)
                .maxCurrentA(14.3)
                .voltageV(230.0)
                .build();
    }
}
