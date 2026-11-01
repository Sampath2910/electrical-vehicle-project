package com.smart.ev.service;

import com.smart.ev.domain.Charger;
import com.smart.ev.domain.ChargingSession;
import com.smart.ev.dto.PreemptionDto;
import com.smart.ev.repository.ChargerRepository;
import com.smart.ev.repository.ChargingSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class PriorityPreemptionService {

    private final ChargerRepository chargerRepository;
    private final ChargingSessionRepository sessionRepository;
    private final ChargingSessionService sessionService;

    private final AtomicBoolean isWarningActive = new AtomicBoolean(false);
    private final AtomicInteger remainingSeconds = new AtomicInteger(120);
    private final AtomicBoolean penaltyApplied = new AtomicBoolean(false);
    private volatile String targetChargerId;
    private volatile String targetSessionId;
    private volatile LocalDateTime triggeredAt;
    private volatile String reason;

    public PriorityPreemptionService(
            ChargerRepository chargerRepository,
            ChargingSessionRepository sessionRepository,
            @Lazy ChargingSessionService sessionService) {
        this.chargerRepository = chargerRepository;
        this.sessionRepository = sessionRepository;
        this.sessionService = sessionService;
    }

    public synchronized PreemptionDto.PreemptionStatusResponse triggerEmergencyOverride(String chargerId, String reason) {
        this.targetChargerId = chargerId;
        this.reason = reason != null ? reason : "Emergency Priority Preemption Sequence Triggered";
        this.triggeredAt = LocalDateTime.now();
        this.remainingSeconds.set(120);
        this.penaltyApplied.set(false);
        this.isWarningActive.set(true);

        // Find active session on target charger
        ChargingSession activeSession = sessionRepository.findFirstByChargerIdAndStatusIn(
                chargerId, Arrays.asList(ChargingSession.SessionStatus.CHARGING, ChargingSession.SessionStatus.STARTED)
        ).orElse(null);

        if (activeSession != null) {
            this.targetSessionId = activeSession.getId();
        } else {
            this.targetSessionId = null;
        }

        log.warn("EMERGENCY PREEMPTION TRIGGERED on Charger {}! 120-second eviction countdown running.", chargerId);
        return getStatus();
    }

    public synchronized PreemptionDto.PreemptionStatusResponse yieldEmergencyBay(String userId) {
        if (!isWarningActive.get()) {
            return getStatus();
        }

        log.info("Bay voluntarily yielded in response to Emergency Preemption. No penalty applied.");
        if (targetSessionId != null) {
            try {
                sessionService.stopSession(targetSessionId, false);
            } catch (Exception e) {
                log.error("Error stopping session upon voluntary yield: {}", e.getMessage());
            }
        }

        isWarningActive.set(false);
        remainingSeconds.set(120);
        return getStatus();
    }

    @Scheduled(fixedRate = 1000)
    public void countdownTick() {
        if (isWarningActive.get()) {
            int current = remainingSeconds.decrementAndGet();
            if (current <= 0) {
                // Countdown expired: Hardware relay cutoff and penalty enforcement
                isWarningActive.set(false);
                penaltyApplied.set(true);
                log.error("120-SECOND EVICTION EXPIRED! Hardware Relay Tripped. ₹500.00 penalty applied to session {}", targetSessionId);

                if (targetSessionId != null) {
                    try {
                        sessionService.stopSession(targetSessionId, true);
                    } catch (Exception e) {
                        log.error("Error applying preemption penalty stop: {}", e.getMessage());
                    }
                }
            }
        }
    }

    public PreemptionDto.PreemptionStatusResponse getStatus() {
        return PreemptionDto.PreemptionStatusResponse.builder()
                .isWarningActive(isWarningActive.get())
                .remainingSeconds(Math.max(0, remainingSeconds.get()))
                .penaltyApplied(penaltyApplied.get())
                .penaltyAmount(new BigDecimal("500.00"))
                .targetChargerId(targetChargerId)
                .activeSessionId(targetSessionId)
                .triggeredAt(triggeredAt)
                .message(isWarningActive.get()
                        ? String.format("EMERGENCY VEHICLE INCOMING: %d seconds remaining to vacate bay!", remainingSeconds.get())
                        : (penaltyApplied.get() ? "Eviction expired: ₹500.00 penalty charged and relay tripped." : "Normal operations."))
                .build();
    }
}
