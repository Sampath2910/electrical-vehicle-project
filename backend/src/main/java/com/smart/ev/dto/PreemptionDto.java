package com.smart.ev.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PreemptionDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TriggerPreemptionRequest {
        private String chargerId;
        private String reason; // e.g. "Emergency Priority Vehicle (Ambulance / Fire)"
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PreemptionStatusResponse {
        private boolean isWarningActive;
        private int remainingSeconds; // 120s countdown
        private boolean penaltyApplied;
        private BigDecimal penaltyAmount; // ₹500.00
        private String targetChargerId;
        private String activeSessionId;
        private LocalDateTime triggeredAt;
        private String message;
    }
}
