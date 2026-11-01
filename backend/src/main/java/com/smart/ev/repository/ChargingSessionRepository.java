package com.smart.ev.repository;

import com.smart.ev.domain.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, String> {
    Optional<ChargingSession> findBySessionCode(String sessionCode);
    List<ChargingSession> findByUserIdOrderByStartTimeDesc(String userId);
    List<ChargingSession> findByChargerIdOrderByStartTimeDesc(String chargerId);
    Optional<ChargingSession> findFirstByChargerIdAndStatusIn(String chargerId, List<ChargingSession.SessionStatus> statuses);
    Optional<ChargingSession> findFirstByUserIdAndStatusIn(String userId, List<ChargingSession.SessionStatus> statuses);
    List<ChargingSession> findByStatusIn(List<ChargingSession.SessionStatus> statuses);
}
