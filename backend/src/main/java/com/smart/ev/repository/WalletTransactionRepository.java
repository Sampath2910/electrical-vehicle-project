package com.smart.ev.repository;

import com.smart.ev.domain.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, String> {
    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(String walletId);
}
