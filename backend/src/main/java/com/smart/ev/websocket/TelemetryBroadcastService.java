package com.smart.ev.websocket;

import com.smart.ev.dto.TariffDto;
import com.smart.ev.service.TariffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetryBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;
    private final TariffService tariffService;
    private final Random random = new Random();

    private double accumulatedKwhStation1 = 3.250;
    private double accumulatedKwhStation2 = 1.820;

    @Scheduled(fixedRate = 1000)
    public void broadcastTelemetry() {
        accumulatedKwhStation1 += 0.00088; // 3.2 kW delivery
        accumulatedKwhStation2 += 0.00088;

        TariffDto.CurrentSlotResponse currentSlot = tariffService.getCurrentToDSlot(null);

        // Station 1: 3.3 kW 2W AC Metrology
        double v1 = 230.0 + (random.nextDouble() * 2.0 - 1.0);
        double i1 = Math.min(14.3, 13.9 + (random.nextDouble() * 0.4 - 0.2));
        double p1 = Math.round(v1 * i1 * 0.98);

        Map<String, Object> payload1 = new HashMap<>();
        payload1.put("chargerId", "ch-101");
        payload1.put("timestamp", LocalDateTime.now().toString());
        payload1.put("voltageV", Double.parseDouble(String.format("%.1f", v1)));
        payload1.put("currentA", Double.parseDouble(String.format("%.2f", i1)));
        payload1.put("powerW", (int) p1);
        payload1.put("energyKwh", Double.parseDouble(String.format("%.3f", accumulatedKwhStation1)));
        payload1.put("powerFactor", 0.98);
        payload1.put("frequencyHz", 50.0);
        payload1.put("thdPercent", 2.1);
        payload1.put("todSlot", currentSlot.getSlotCode() + ": " + currentSlot.getSlotName());
        payload1.put("todRate", currentSlot.getBaseRate());

        messagingTemplate.convertAndSend("/topic/chargers/ch-101/telemetry", payload1);
        messagingTemplate.convertAndSend("/topic/telemetry", payload1);
    }
}
