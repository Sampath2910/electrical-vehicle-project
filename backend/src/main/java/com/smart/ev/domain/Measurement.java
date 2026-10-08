package com.smart.ev.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "measurements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Measurement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "charger_id", nullable = false)
    private String chargerId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private Double voltageV;
    private Double currentA;
    private Double powerW;
    private Double energyKwh;
    private Double frequencyHz;
    private Double powerFactor;
}
