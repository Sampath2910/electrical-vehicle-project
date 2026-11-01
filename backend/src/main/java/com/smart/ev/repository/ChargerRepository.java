package com.smart.ev.repository;

import com.smart.ev.domain.Charger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, String> {
    Optional<Charger> findByChargerCode(String chargerCode);
    List<Charger> findByStatus(Charger.Status status);
    Optional<Charger> findByAssignedOperatorId(String assignedOperatorId);
}
