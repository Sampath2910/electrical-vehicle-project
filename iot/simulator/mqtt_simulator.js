/**
 * Smart EV Charging Station - ESP32 IoT MQTT Telemetry Simulator
 * Emits 1Hz electrical power metrics on topic: ev/chargers/{chargerId}/telemetry
 */

const mqtt = require('mqtt');

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const CHARGER_ID = process.env.CHARGER_ID || 'CH-IND-001';

console.log(`[ESP32 SIMULATOR] Connecting to MQTT broker: ${BROKER_URL} for Charger ${CHARGER_ID}...`);

const client = mqtt.connect(BROKER_URL, {
  clientId: `esp32_sim_${CHARGER_ID}_${Math.floor(Math.random() * 1000)}`,
  clean: true,
  reconnectPeriod: 2000,
});

let energyKwh = 12.450;
let isCharging = true;

client.on('connect', () => {
  console.log(`[ESP32 SIMULATOR] Connected to MQTT Broker! Subscribing to command topics...`);
  client.subscribe(`ev/chargers/${CHARGER_ID}/commands`);

  // Publish Status AVAILABLE -> CHARGING
  client.publish(`ev/chargers/${CHARGER_ID}/status`, JSON.stringify({
    chargerId: CHARGER_ID,
    status: 'CHARGING',
    firmwareVersion: 'v2.4.1-esp32',
    timestamp: new Date().toISOString(),
  }));

  // Start 1Hz Telemetry Loop
  setInterval(() => {
    if (!isCharging) return;

    energyKwh += 0.0020;
    const voltage = +(230.5 + (Math.random() * 2.0 - 1.0)).toFixed(1);
    const current = +(31.2 + (Math.random() * 1.0 - 0.5)).toFixed(1);
    const powerW = Math.round(voltage * current * 0.98);

    const payload = {
      chargerId: CHARGER_ID,
      timestamp: new Date().toISOString(),
      voltageV: voltage,
      currentA: current,
      powerW: powerW,
      energyKwh: +energyKwh.toFixed(3),
      frequencyHz: +(50.0 + (Math.random() * 0.08 - 0.04)).toFixed(2),
      powerFactor: 0.98,
      safetyStatus: 'OK_NORMAL',
    };

    client.publish(`ev/chargers/${CHARGER_ID}/telemetry`, JSON.stringify(payload));
    console.log(`[TELEMETRY TICK] ${CHARGER_ID} -> Voltage: ${voltage}V | Current: ${current}A | Power: ${powerW}W | Energy: ${energyKwh.toFixed(3)} kWh`);
  }, 1000);
});

client.on('message', (topic, message) => {
  try {
    const cmd = JSON.parse(message.toString());
    console.log(`[COMMAND RECEIVED] ${topic} ->`, cmd);
    if (cmd.action === 'STOP') {
      isCharging = false;
      console.log(`[HARDWARE LATCH] Contactor OPENED safely by command.`);
    }
  } catch (e) {
    console.error('Invalid command payload:', e);
  }
});
