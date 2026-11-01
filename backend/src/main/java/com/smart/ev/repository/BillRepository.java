package com.smart.ev.repository;

import com.smart.ev.domain.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {
    Optional<Bill> findByBillNumber(String billNumber);
    Optional<Bill> findBySessionId(String sessionId);
    List<Bill> findByUserIdOrderByIssuedAtDesc(String userId);
}
