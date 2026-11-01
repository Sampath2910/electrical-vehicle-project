package com.smart.ev.service;

import com.smart.ev.domain.Charger;
import com.smart.ev.domain.Tariff;
import com.smart.ev.domain.User;
import com.smart.ev.domain.Wallet;
import com.smart.ev.repository.ChargerRepository;
import com.smart.ev.repository.TariffRepository;
import com.smart.ev.repository.UserRepository;
import com.smart.ev.repository.WalletRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializerService {

    private final UserRepository userRepository;
    private final ChargerRepository chargerRepository;
    private final TariffRepository tariffRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void seedInitialData() {
        if (userRepository.count() > 0) {
            log.info("Database already contains users. Skipping initial seed.");
            return;
        }

        log.info("Seeding initial production-ready database fixtures with secure BCrypt hashes...");

        // 1. Seed Users
        User admin = User.builder()
                .name("Fleet System Admin")
                .email("admin@smartev.com")
                .phone("+91 90000 00000")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .status("ACTIVE")
                .build();
        userRepository.save(admin);

        User op1 = User.builder()
                .name("Ramesh Kumar")
                .email("operator1@kletech.ac.in")
                .phone("+91 98765 11111")
                .passwordHash(passwordEncoder.encode("operator123"))
                .role(User.Role.OPERATOR)
                .operatorBadgeId("KLE-OP-101")
                .status("ACTIVE")
                .build();
        op1 = userRepository.save(op1);

        User op2 = User.builder()
                .name("Pooja Patil")
                .email("operator2@kletech.ac.in")
                .phone("+91 98765 22222")
                .passwordHash(passwordEncoder.encode("operator123"))
                .role(User.Role.OPERATOR)
                .operatorBadgeId("KLE-OP-102")
                .status("ACTIVE")
                .build();
        op2 = userRepository.save(op2);

        User rider = User.builder()
                .name("Alex Rivera")
                .email("alex.rivera@example.com")
                .phone("+91 98765 43210")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(User.Role.USER)
                .vehicleModel("Ather 450X (3.7 kWh)")
                .status("ACTIVE")
                .build();
        rider = userRepository.save(rider);

        // Initial wallet for Alex Rivera
        walletRepository.save(Wallet.builder()
                .userId(rider.getId())
                .balance(new BigDecimal("350.00"))
                .currency("INR")
                .build());

        // 2. Seed Chargers
        Charger ch1 = Charger.builder()
                .chargerCode("KLETECH-STATION-1")
                .name("KLETECH EV Station 1 (3.3 kW 2W AC Bench)")
                .location("KLETECH Campus Engineering Zone, Bay #01")
                .latitude(12.8452)
                .longitude(77.6602)
                .powerRating(3.3)
                .connectorType("IEC 60309 (Industrial 3-pin)")
                .status(Charger.Status.AVAILABLE)
                .pricePerKwh(new BigDecimal("10.50"))
                .lastSeenAt(LocalDateTime.now())
                .assignedOperatorId(op1.getId())
                .totalEarnedRevenue(new BigDecimal("3450.00"))
                .totalEnergyConsumedKwh(328.5)
                .build();
        ch1 = chargerRepository.save(ch1);
        op1.setAssignedStationId(ch1.getId());
        userRepository.save(op1);

        Charger ch2 = Charger.builder()
                .chargerCode("KLETECH-STATION-2")
                .name("KLETECH EV Station 2 (Priority Emergency Bay)")
                .location("KLETECH Campus Emergency EV Zone, Bay #02")
                .latitude(12.8455)
                .longitude(77.6605)
                .powerRating(3.3)
                .connectorType("Standard 16A Socket")
                .status(Charger.Status.AVAILABLE)
                .pricePerKwh(new BigDecimal("18.50"))
                .lastSeenAt(LocalDateTime.now())
                .assignedOperatorId(op2.getId())
                .totalEarnedRevenue(new BigDecimal("4920.00"))
                .totalEnergyConsumedKwh(266.0)
                .build();
        ch2 = chargerRepository.save(ch2);
        op2.setAssignedStationId(ch2.getId());
        userRepository.save(op2);

        Charger ch3 = Charger.builder()
                .chargerCode("BSS-METRO-003")
                .name("Metro Station Battery Swapping Hub (BSS)")
                .location("Indiranagar Metro 2-Wheeler Parking, Bengaluru")
                .latitude(12.9784)
                .longitude(77.6408)
                .powerRating(3.3)
                .connectorType("BSS Swappable Dock")
                .status(Charger.Status.AVAILABLE)
                .pricePerKwh(new BigDecimal("10.50"))
                .lastSeenAt(LocalDateTime.now())
                .totalEarnedRevenue(new BigDecimal("1890.00"))
                .totalEnergyConsumedKwh(180.0)
                .build();
        chargerRepository.save(ch3);

        Charger ch4 = Charger.builder()
                .chargerCode("CH-2W-004")
                .name("TechPark 2-Wheeler Smart Socket Point")
                .location("Building 4, Electronic City Phase 1, Bengaluru")
                .latitude(12.8460)
                .longitude(77.6610)
                .powerRating(3.3)
                .connectorType("Standard 16A Socket")
                .status(Charger.Status.AVAILABLE)
                .pricePerKwh(new BigDecimal("10.50"))
                .lastSeenAt(LocalDateTime.now())
                .totalEarnedRevenue(new BigDecimal("1250.00"))
                .totalEnergyConsumedKwh(119.0)
                .build();
        chargerRepository.save(ch4);

        // 3. Seed Default LT-6 Tariff
        Tariff tariff = Tariff.builder()
                .tariffCode("LT-6-EV")
                .name("Commercial LT-6 (EV Charging Station Category)")
                .category("COMMERCIAL_LT6")
                .offPeakRate(new BigDecimal("8.00"))
                .standardRate(new BigDecimal("10.50"))
                .peakRate(new BigDecimal("14.00"))
                .serviceFee(new BigDecimal("5.00"))
                .gstPercent(new BigDecimal("18.00"))
                .emergencyPenalty(new BigDecimal("500.00"))
                .isActive(true)
                .build();
        tariffRepository.save(tariff);

        log.info("Database seeding completed successfully! Test users ready (admin123, operator123, password123).");
    }
}
