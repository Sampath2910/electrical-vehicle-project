package com.smart.ev.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "charging_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "session_code", nullable = false, unique = true)
    private String sessionCode;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "charger_id", nullable = false)
    private String chargerId;

    @Column(name = "vehicle_id")
    private String vehicleId;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Column(name = "energy_kwh", nullable = false)
    private Double energyKwh;

    @Column(name = "duration_seconds", nullable = false)
    private Long durationSeconds;

    @Column(name = "tariff_snapshot", nullable = false)
    private BigDecimal tariffSnapshot;

    @Column(name = "estimated_cost", nullable = false)
    private BigDecimal estimatedCost;

    @Column(name = "final_cost")
    private BigDecimal finalCost;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = SessionStatus.CREATED;
    }

    public enum SessionStatus {
        CREATED, AUTHORIZED, STARTED, CHARGING, STOPPING, COMPLETED, FAILED, CANCELLED
    }
}
