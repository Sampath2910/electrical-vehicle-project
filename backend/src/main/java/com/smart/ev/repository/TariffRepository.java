package com.smart.ev.repository;

import com.smart.ev.domain.Tariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, String> {
    Optional<Tariff> findByTariffCode(String tariffCode);
    Optional<Tariff> findFirstByIsActiveTrue();
}
