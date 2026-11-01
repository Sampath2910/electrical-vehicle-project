package com.smart.ev.service;

import com.smart.ev.domain.Bill;
import com.smart.ev.domain.Charger;
import com.smart.ev.domain.ChargingSession;
import com.smart.ev.dto.SessionDto;
import com.smart.ev.dto.TariffDto;
import com.smart.ev.repository.BillRepository;
import com.smart.ev.repository.ChargerRepository;
import com.smart.ev.repository.ChargingSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChargingSessionService {

    private final ChargingSessionRepository sessionRepository;
    private final ChargerRepository chargerRepository;
    private final BillRepository billRepository;
    private final TariffService tariffService;

    @Transactional
    public SessionDto.SessionResponse startSession(String userId, SessionDto.StartSessionRequest request) {
        Charger charger = chargerRepository.findById(request.getChargerId())
                .orElseThrow(() -> new IllegalArgumentException("Charger not found with id: " + request.getChargerId()));

        if (charger.getStatus() == Charger.Status.CHARGING) {
            throw new IllegalStateException("Charger is currently occupied by an ongoing charging session.");
        }

        TariffDto.CurrentSlotResponse currentSlot = tariffService.getCurrentToDSlot(null);

        ChargingSession session = ChargingSession.builder()
                .sessionCode("SES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .userId(userId)
                .chargerId(charger.getId())
                .vehicleId(request.getVehicleId())
                .startTime(LocalDateTime.now())
                .status(ChargingSession.SessionStatus.CHARGING)
                .energyKwh(0.0)
                .durationSeconds(0L)
                .tariffSnapshot(currentSlot.getBaseRate())
                .estimatedCost(BigDecimal.ZERO)
                .build();

        session = sessionRepository.save(session);

        // Update charger status to CHARGING
        charger.setStatus(Charger.Status.CHARGING);
        charger.setLastSeenAt(LocalDateTime.now());
        chargerRepository.save(charger);

        log.info("Charging session {} started on Charger {}", session.getSessionCode(), charger.getChargerCode());
        return toResponse(session, charger.getName(), null);
    }

    @Transactional
    public SessionDto.SessionResponse stopSession(String sessionId, Boolean penaltyApplies) {
        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with id: " + sessionId));

        if (session.getStatus() == ChargingSession.SessionStatus.COMPLETED) {
            return toResponse(session, null, null);
        }

        Charger charger = chargerRepository.findById(session.getChargerId()).orElse(null);

        LocalDateTime endTime = LocalDateTime.now();
        session.setEndTime(endTime);
        session.setStatus(ChargingSession.SessionStatus.COMPLETED);

        long durationSec = Duration.between(session.getStartTime(), endTime).getSeconds();
        session.setDurationSeconds(Math.max(60L, durationSec));

        // Metrology energy calculation: standard 3.2 kW 2W charging
        double hours = (double) session.getDurationSeconds() / 3600.0;
        double deliveredKwh = Math.max(0.5, Double.parseDouble(String.format("%.3f", hours * 3.2)));
        session.setEnergyKwh(deliveredKwh);

        boolean penalty = Boolean.TRUE.equals(penaltyApplies);
        BigDecimal finalCost = tariffService.calculateTotalBilledAmount(deliveredKwh, session.getTariffSnapshot(), penalty);
        session.setFinalCost(finalCost);
        session = sessionRepository.save(session);

        // Generate Bill
        String billNo = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal subtotal = session.getTariffSnapshot().multiply(BigDecimal.valueOf(deliveredKwh)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);

        Bill bill = Bill.builder()
                .billNumber(billNo)
                .sessionId(session.getId())
                .userId(session.getUserId())
                .energyKwh(deliveredKwh)
                .tariffRate(session.getTariffSnapshot())
                .subtotal(subtotal)
                .tax(tax)
                .totalAmount(finalCost)
                .status(Bill.BillStatus.UNPAID)
                .issuedAt(endTime)
                .build();
        billRepository.save(bill);

        // Update Charger
        if (charger != null) {
            charger.setStatus(Charger.Status.AVAILABLE);
            charger.setLastSeenAt(endTime);
            BigDecimal earned = charger.getTotalEarnedRevenue() != null ? charger.getTotalEarnedRevenue() : BigDecimal.ZERO;
            charger.setTotalEarnedRevenue(earned.add(finalCost));
            double totalKwh = charger.getTotalEnergyConsumedKwh() != null ? charger.getTotalEnergyConsumedKwh() : 0.0;
            charger.setTotalEnergyConsumedKwh(totalKwh + deliveredKwh);
            chargerRepository.save(charger);
        }

        // Generate Dynamic Bharat-QR UPI URI
        String upiUri = String.format(
                "upi://pay?pa=smartev@okaxis&pn=SmartEV%%20Platform&am=%.2f&cu=INR&tn=%s",
                finalCost.doubleValue(), billNo
        );

        log.info("Charging session {} completed. Total billed: ₹{}", session.getSessionCode(), finalCost);
        return toResponse(session, charger != null ? charger.getName() : null, upiUri);
    }

    public SessionDto.SessionResponse getActiveSessionForUser(String userId) {
        ChargingSession session = sessionRepository.findFirstByUserIdAndStatusIn(
                userId, Arrays.asList(ChargingSession.SessionStatus.CHARGING, ChargingSession.SessionStatus.STARTED)
        ).orElse(null);

        if (session == null) return null;
        Charger c = chargerRepository.findById(session.getChargerId()).orElse(null);
        return toResponse(session, c != null ? c.getName() : null, null);
    }

    public List<SessionDto.SessionResponse> getHistoryForUser(String userId) {
        return sessionRepository.findByUserIdOrderByStartTimeDesc(userId).stream()
                .map(s -> {
                    Charger c = chargerRepository.findById(s.getChargerId()).orElse(null);
                    return toResponse(s, c != null ? c.getName() : null, null);
                })
                .collect(Collectors.toList());
    }

    public SessionDto.SessionResponse toResponse(ChargingSession s, String chargerName, String upiUri) {
        return SessionDto.SessionResponse.builder()
                .id(s.getId())
                .sessionCode(s.getSessionCode())
                .userId(s.getUserId())
                .chargerId(s.getChargerId())
                .chargerName(chargerName != null ? chargerName : "Smart EV 2W Station")
                .vehicleId(s.getVehicleId())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus())
                .energyKwh(s.getEnergyKwh() != null ? s.getEnergyKwh() : 0.0)
                .durationSeconds(s.getDurationSeconds() != null ? s.getDurationSeconds() : 0L)
                .tariffSnapshot(s.getTariffSnapshot())
                .estimatedCost(s.getEstimatedCost())
                .finalCost(s.getFinalCost())
                .paymentStatus(s.getStatus() == ChargingSession.SessionStatus.COMPLETED ? "PENDING" : "IN_PROGRESS")
                .upiQrUri(upiUri)
                .build();
    }
}
