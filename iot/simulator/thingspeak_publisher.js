/**
 * Smart EV Charging Station - ThingSpeak IoT Telemetry Publisher
 * 
 * Sends 15-second metrology telemetry updates to ThingSpeak REST API:
 * - Field 1: Voltage (V)
 * - Field 2: Current (A)
 * - Field 3: Active Power (W)
 * - Field 4: Accumulated Energy (kWh)
 * - Field 5: Power Factor (0.98)
 * - Field 6: Relay Contactor (1=ON, 0=OFF)
 * 
 * Usage:
 *   THINGSPEAK_WRITE_API_KEY="YOUR_WRITE_KEY" node thingspeak_publisher.js
 */

const https = require('https');

const WRITE_API_KEY = process.env.THINGSPEAK_WRITE_API_KEY || process.argv[2] || '';
const UPDATE_INTERVAL_MS = 16000; // ThingSpeak free tier requires >= 15 seconds

if (!WRITE_API_KEY) {
  console.log('\n======================================================');
  console.log('⚡ Smart EV Station - ThingSpeak Telemetry Publisher ⚡');
  console.log('======================================================');
  console.log('⚠️  WARNING: No Write API Key provided!');
  console.log('Usage:');
  console.log('  node thingspeak_publisher.js <YOUR_WRITE_API_KEY>');
  console.log('  OR setting environment variable:');
  console.log('  THINGSPEAK_WRITE_API_KEY="YOUR_WRITE_KEY" node thingspeak_publisher.js\n');
}

let energyKwh = 3.250;
let updateCounter = 0;

function sendThingSpeakUpdate() {
  if (!WRITE_API_KEY) return;

  updateCounter++;
  energyKwh += 0.015; // Simulate charging progression

  const voltage = (230.0 + (Math.random() * 2.0 - 1.0)).toFixed(1);
  const current = (14.2 + (Math.random() * 0.4 - 0.2)).toFixed(2);
  const power = Math.round(parseFloat(voltage) * parseFloat(current) * 0.98);
  const pf = '0.98';
  const relay = '1';

  const queryParams = new URLSearchParams({
    api_key: WRITE_API_KEY,
    field1: voltage,
    field2: current,
    field3: power.toString(),
    field4: energyKwh.toFixed(3),
    field5: pf,
    field6: relay
  });

  const url = `https://api.thingspeak.com/update?${queryParams.toString()}`;

  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (data !== '0') {
        console.log(`[THINGSPEAK TICK #${updateCounter}] Success! Feed Entry ID: ${data} | V=${voltage}V | I=${current}A | P=${power}W | Energy=${energyKwh.toFixed(3)} kWh`);
      } else {
        console.log(`[THINGSPEAK TICK #${updateCounter}] Rate limit warning or invalid API key (Response: 0). Waiting for next tick...`);
      }
    });
  }).on('error', (err) => {
    console.error(`[THINGSPEAK ERROR] ${err.message}`);
  });
}

console.log(`[THINGSPEAK SIMULATOR] Starting telemetry publisher...`);
if (WRITE_API_KEY) {
  console.log(`[THINGSPEAK SIMULATOR] Using Write API Key: ${WRITE_API_KEY.slice(0, 4)}****`);
  console.log(`[THINGSPEAK SIMULATOR] Polling interval: ${UPDATE_INTERVAL_MS / 1000}s`);
  sendThingSpeakUpdate();
  setInterval(sendThingSpeakUpdate, UPDATE_INTERVAL_MS);
}
