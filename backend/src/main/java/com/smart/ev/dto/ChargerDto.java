package com.smart.ev.dto;

import com.smart.ev.domain.Charger;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ChargerDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChargerResponse {
        private String id;
        private String chargerCode;
        private String name;
        private String location;
        private Double latitude;
        private Double longitude;
        private Double powerRating;
        private String connectorType;
        private Charger.Status status;
        private BigDecimal pricePerKwh;
        private LocalDateTime lastSeenAt;
        private String assignedOperatorId;
        private String assignedOperatorName;
        private BigDecimal totalEarnedRevenue;
        private Double totalEnergyConsumedKwh;
        private Boolean isPriorityBay;
        private Double maxCurrentA;
        private Double voltageV;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private Charger.Status status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingUpdateRequest {
        private Double powerRating;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignOperatorRequest {
        private String operatorId;
    }
}
