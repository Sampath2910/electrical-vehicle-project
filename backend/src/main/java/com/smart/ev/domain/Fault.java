package com.smart.ev.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faults")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fault {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "charger_id", nullable = false)
    private String chargerId;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "fault_code", nullable = false)
    private String faultCode;

    @Column(name = "fault_type", nullable = false)
    private String faultType;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "cleared_at")
    private LocalDateTime clearedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FaultStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.occurredAt == null) this.occurredAt = LocalDateTime.now();
        if (this.status == null) this.status = FaultStatus.ACTIVE;
    }

    public enum FaultStatus {
        ACTIVE, RESOLVED, ACKNOWLEDGED
    }
}
