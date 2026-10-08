package com.smart.ev.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "payment_reference", nullable = false, unique = true)
    private String paymentReference;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "bill_id")
    private String billId;

    @Column(nullable = false)
    private String method; // QR_UPI

    @Column(nullable = false)
    private String provider; // MOCK_UPI, RAZORPAY, STRIPE

    @Column(name = "provider_reference")
    private String providerReference;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.currency == null) this.currency = "INR";
        if (this.status == null) this.status = PaymentStatus.PENDING;
    }

    public enum PaymentStatus {
        PENDING, AUTHORIZED, SUCCESS, FAILED, REFUNDED, CANCELLED
    }
}
