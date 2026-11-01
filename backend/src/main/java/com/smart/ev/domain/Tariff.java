package com.smart.ev.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tariffs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tariff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "tariff_code", nullable = false, unique = true)
    private String tariffCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // e.g. "Commercial LT-6 (EV Charging Station)"

    @Column(name = "off_peak_rate", nullable = false)
    private BigDecimal offPeakRate; // S1: ₹8.00 / kWh (10:00 PM - 06:00 AM)

    @Column(name = "standard_rate", nullable = false)
    private BigDecimal standardRate; // S2: ₹10.50 / kWh (06:00 AM - 06:00 PM)

    @Column(name = "peak_rate", nullable = false)
    private BigDecimal peakRate; // S3: ₹14.00 / kWh (06:00 PM - 10:00 PM)

    @Column(name = "service_fee", nullable = false)
    private BigDecimal serviceFee; // ₹5.00

    @Column(name = "gst_percent", nullable = false)
    private BigDecimal gstPercent; // 18.0%

    @Column(name = "emergency_penalty", nullable = false)
    private BigDecimal emergencyPenalty; // ₹500.00

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isActive == null) this.isActive = true;
        if (this.serviceFee == null) this.serviceFee = new BigDecimal("5.00");
        if (this.gstPercent == null) this.gstPercent = new BigDecimal("18.00");
        if (this.emergencyPenalty == null) this.emergencyPenalty = new BigDecimal("500.00");
    }
}
