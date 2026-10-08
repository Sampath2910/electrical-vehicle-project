package com.smart.ev.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "chargers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Charger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "charger_code", nullable = false, unique = true)
    private String chargerCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    private Double latitude;
    private Double longitude;

    @Column(name = "power_rating", nullable = false)
    private Double powerRating; // in kW

    @Column(name = "connector_type", nullable = false)
    private String connectorType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "price_per_kwh", nullable = false)
    private BigDecimal pricePerKwh;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = Status.AVAILABLE;
    }

    public enum Status {
        AVAILABLE, PREPARING, CONNECTED, CHARGING, PAUSED, COMPLETED, FAULT, OFFLINE, MAINTENANCE
    }
}
