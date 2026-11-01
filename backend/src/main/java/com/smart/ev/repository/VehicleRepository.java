package com.smart.ev.repository;

import com.smart.ev.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    List<Vehicle> findByUserId(String userId);
    Optional<Vehicle> findByRegistration(String registration);
}
