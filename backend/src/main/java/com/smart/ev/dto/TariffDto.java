package com.smart.ev.dto;

import lombok.*;
import java.math.BigDecimal;

public class TariffDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CurrentSlotResponse {
        private String slotCode; // S_1, S_2, S_3
        private String slotName; // "Normal / Off-Peak", "Mid / Standard", "Peak"
        private String timeWindow; // "10:00 PM to 06:00 AM", etc.
        private BigDecimal baseRate; // 8.00, 10.50, 14.00
        private String multiplier;
        private String logic;
        private int currentHour;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TariffUpdateRequest {
        private BigDecimal offPeakRate;
        private BigDecimal standardRate;
        private BigDecimal peakRate;
        private BigDecimal serviceFee;
        private BigDecimal gstPercent;
        private BigDecimal emergencyPenalty;
    }
}
