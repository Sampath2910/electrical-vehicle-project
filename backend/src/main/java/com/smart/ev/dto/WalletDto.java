package com.smart.ev.dto;

import com.smart.ev.domain.WalletTransaction;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class WalletDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopUpRequest {
        private BigDecimal amount;
        private String paymentReference;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WalletResponse {
        private String id;
        private String userId;
        private BigDecimal balance;
        private String currency;
        private LocalDateTime updatedAt;
        private List<TransactionDto> recentTransactions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionDto {
        private String id;
        private WalletTransaction.TransactionType type;
        private BigDecimal amount;
        private String reference;
        private String description;
        private LocalDateTime createdAt;
    }
}
