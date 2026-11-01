package com.smart.ev.repository;

import com.smart.ev.domain.Fault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaultRepository extends JpaRepository<Fault, String> {
    List<Fault> findByChargerId(String chargerId);
    List<Fault> findByStatus(Fault.FaultStatus status);
}
