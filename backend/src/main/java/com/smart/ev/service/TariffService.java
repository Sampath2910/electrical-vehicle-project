package com.smart.ev.service;

import com.smart.ev.domain.Tariff;
import com.smart.ev.dto.TariffDto;
import com.smart.ev.repository.TariffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TariffService {

    private final TariffRepository tariffRepository;

    public TariffDto.CurrentSlotResponse getCurrentToDSlot(Integer hourOverride) {
        int hour = (hourOverride != null) ? hourOverride : LocalTime.now().getHour();

        Tariff activeTariff = tariffRepository.findFirstByIsActiveTrue().orElse(null);
        BigDecimal offPeak = activeTariff != null ? activeTariff.getOffPeakRate() : new BigDecimal("8.00");
        BigDecimal standard = activeTariff != null ? activeTariff.getStandardRate() : new BigDecimal("10.50");
        BigDecimal peak = activeTariff != null ? activeTariff.getPeakRate() : new BigDecimal("14.00");

        // Normal / Off-Peak (10:00 PM - 06:00 AM)
        if (hour >= 22 || hour < 6) {
            return TariffDto.CurrentSlotResponse.builder()
                    .slotCode("S_1")
                    .slotName("Normal / Off-Peak")
                    .timeWindow("10:00 PM to 06:00 AM")
                    .baseRate(offPeak)
                    .multiplier("0.76x")
                    .logic("Cheapest rate encouraging overnight electric 2-wheeler charging when grid demand is lowest.")
                    .currentHour(hour)
                    .build();
        }

        // Peak (06:00 PM - 10:00 PM)
        if (hour >= 18 && hour < 22) {
            return TariffDto.CurrentSlotResponse.builder()
                    .slotCode("S_3")
                    .slotName("Peak")
                    .timeWindow("06:00 PM to 10:00 PM")
                    .baseRate(peak)
                    .multiplier("1.33x")
                    .logic("Evening peak demand surcharge applied when domestic grid load is at its daily maximum.")
                    .currentHour(hour)
                    .build();
        }

        // Mid / Standard (06:00 AM - 06:00 PM)
        return TariffDto.CurrentSlotResponse.builder()
                .slotCode("S_2")
                .slotName("Mid / Standard")
                .timeWindow("06:00 AM to 06:00 PM")
                .baseRate(standard)
                .multiplier("1.00x")
                .logic("Standard daytime commercial LT-6 charging rate covering solar-generation hours.")
                .currentHour(hour)
                .build();
    }

    public List<Tariff> getAllTariffs() {
        return tariffRepository.findAll();
    }

    @Transactional
    public Tariff updateTariff(String id, TariffDto.TariffUpdateRequest request) {
        Tariff tariff = tariffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff not found with id: " + id));

        if (request.getOffPeakRate() != null) tariff.setOffPeakRate(request.getOffPeakRate());
        if (request.getStandardRate() != null) tariff.setStandardRate(request.getStandardRate());
        if (request.getPeakRate() != null) tariff.setPeakRate(request.getPeakRate());
        if (request.getServiceFee() != null) tariff.setServiceFee(request.getServiceFee());
        if (request.getGstPercent() != null) tariff.setGstPercent(request.getGstPercent());
        if (request.getEmergencyPenalty() != null) tariff.setEmergencyPenalty(request.getEmergencyPenalty());

        return tariffRepository.save(tariff);
    }

    public BigDecimal calculateTotalBilledAmount(double energyKwh, BigDecimal rate, boolean penaltyApplies) {
        Tariff activeTariff = tariffRepository.findFirstByIsActiveTrue().orElse(null);
        BigDecimal serviceFee = activeTariff != null ? activeTariff.getServiceFee() : new BigDecimal("5.00");
        BigDecimal gstRate = activeTariff != null ? activeTariff.getGstPercent() : new BigDecimal("18.00");
        BigDecimal penalty = (penaltyApplies && activeTariff != null) ? activeTariff.getEmergencyPenalty() : (penaltyApplies ? new BigDecimal("500.00") : BigDecimal.ZERO);

        BigDecimal energyCost = BigDecimal.valueOf(energyKwh).multiply(rate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotal = energyCost.add(serviceFee);
        BigDecimal gst = subtotal.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        return subtotal.add(gst).add(penalty).setScale(2, RoundingMode.HALF_UP);
    }
}
