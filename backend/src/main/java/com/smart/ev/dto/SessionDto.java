package com.smart.ev.dto;

import com.smart.ev.domain.ChargingSession;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SessionDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StartSessionRequest {
        private String chargerId;
        private String vehicleId;
        private String paymentMethod; // "QR_UPI" or "RFID_WALLET"
        private Boolean isPriorityBayConsentGiven;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StopSessionRequest {
        private String sessionId;
        private Boolean penaltyApplies;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SessionResponse {
        private String id;
        private String sessionCode;
        private String userId;
        private String chargerId;
        private String chargerName;
        private String vehicleId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private ChargingSession.SessionStatus status;
        private Double energyKwh;
        private Long durationSeconds;
        private BigDecimal tariffSnapshot;
        private BigDecimal estimatedCost;
        private BigDecimal finalCost;
        private String paymentStatus;
        private String upiQrUri;
    }
}
