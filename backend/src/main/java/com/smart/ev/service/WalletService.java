package com.smart.ev.service;

import com.smart.ev.domain.Wallet;
import com.smart.ev.domain.WalletTransaction;
import com.smart.ev.dto.WalletDto;
import com.smart.ev.repository.WalletRepository;
import com.smart.ev.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    public WalletDto.WalletResponse getWallet(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId).orElseGet(() -> {
            Wallet newWallet = Wallet.builder()
                    .userId(userId)
                    .balance(new BigDecimal("250.00"))
                    .currency("INR")
                    .build();
            return walletRepository.save(newWallet);
        });

        List<WalletTransaction> transactions = transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());

        return WalletDto.WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .updatedAt(wallet.getUpdatedAt())
                .recentTransactions(transactions.stream().map(this::toDto).collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public WalletDto.WalletResponse topUp(String userId, BigDecimal amount, String ref) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Top-up amount must be strictly positive.");
        }

        Wallet wallet = walletRepository.findByUserId(userId).orElseGet(() -> {
            Wallet newWallet = Wallet.builder()
                    .userId(userId)
                    .balance(BigDecimal.ZERO)
                    .currency("INR")
                    .build();
            return walletRepository.save(newWallet);
        });

        wallet.setBalance(wallet.getBalance().add(amount));
        wallet = walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .walletId(wallet.getId())
                .type(WalletTransaction.TransactionType.CREDIT)
                .amount(amount)
                .reference(ref != null ? ref : "TOPUP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .description("Instant Wallet Top-up via Dynamic UPI / Bharat-QR")
                .build();
        transactionRepository.save(tx);

        log.info("Wallet credited: User {} +₹{}", userId, amount);
        return getWallet(userId);
    }

    @Transactional
    public void deduct(String userId, BigDecimal amount, String ref, String description, String sessionId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient wallet balance. Please top up your wallet.");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .walletId(wallet.getId())
                .type(WalletTransaction.TransactionType.DEBIT)
                .amount(amount)
                .reference(ref != null ? ref : "CHARGE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .description(description)
                .sessionId(sessionId)
                .build();
        transactionRepository.save(tx);
    }

    public WalletDto.TransactionDto toDto(WalletTransaction tx) {
        return WalletDto.TransactionDto.builder()
                .id(tx.getId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .reference(tx.getReference())
                .description(tx.getDescription())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
