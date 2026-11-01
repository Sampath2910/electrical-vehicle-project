package com.smart.ev.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class StatsDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminStatsResponse {
        private boolean success;
        private long totalUsers;
        private long totalChargers;
        private long totalStations;
        private long availableStations;
        private long chargingStations;
        private long faultStations;
        private long totalOperators;
        private long activeSessionsCount;
        private BigDecimal totalRevenue;
        private BigDecimal totalFleetRevenue;
        private Double totalEnergyDeliveredKwh;
        private Double totalFleetEnergyKwh;
        private int activeFaultsCount;
        private List<ChargerDto.ChargerResponse> chargers;
        private List<StationSummaryDto> stations;
        private List<AuthDto.UserDto> operators;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationSummaryDto {
        private String id;
        private String code;
        private String name;
        private String location;
        private String status;
        private Double powerRating;
        private BigDecimal pricePerKwh;
        private String assignedOperatorName;
        private String assignedOperatorId;
        private BigDecimal stationRevenue;
        private Double stationEnergyKwh;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OperatorStatsResponse {
        private boolean success;
        private ChargerDto.ChargerResponse station;
        private OperatorStatsDetail stats;
        private List<SessionDto.SessionResponse> recentSessions;
        
        // Flat backwards-compatibility properties
        private String operatorId;
        private String operatorName;
        private String stationId;
        private String stationName;
        private String stationStatus;
        private Double powerRating;
        private BigDecimal stationRevenue;
        private Double stationEnergyKwh;
        private long totalCompletedSessions;
        private SessionDto.SessionResponse activeSession;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OperatorStatsDetail {
        private String stationId;
        private String stationName;
        private String stationCode;
        private String status;
        private Double powerRating;
        private BigDecimal pricePerKwh;
        private BigDecimal totalEarnedRevenue;
        private Double totalEnergyConsumedKwh;
        private long completedSessionsCount;
        private String assignedOperatorName;
        private String assignedOperatorId;
    }
}
