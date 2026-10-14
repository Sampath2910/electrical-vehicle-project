% =========================================================================
% Smart EV Platform - Continuous ThingSpeak Telemetry Stream (MATLAB)
% Channel ID: 3533059 ("EV power monitering")
% Fields:
%   - Field 1: Voltage (V)
%   - Field 2: Current (A)
%   - Field 3: Active Power (W)
% =========================================================================

channelID = 3533059;
writeAPIKey = '7DMQVJF8118QV1QM';
readAPIKey = 'MPG3G79CSBI1S6U';

fprintf('=========================================================\n');
fprintf('⚡ Smart EV Platform - Continuous ThingSpeak Live Stream ⚡\n');
fprintf('=========================================================\n');
fprintf('📡 Connected Channel ID : %d\n', channelID);
fprintf('⏱️  Update Interval     : 16 seconds (ThingSpeak Rate Limit)\n');
fprintf('🚀 Press Ctrl+C in MATLAB Command Window to stop stream.\n');
fprintf('=========================================================\n\n');

tick = 1;

while true
    % 1. Simulate realistic 2-Wheeler charging electrical variations (Ather / Ola)
    voltage = 229.0 + (rand() * 2.0 - 1.0);  % ~228.0V - 231.0V AC
    current = 13.80 + (rand() * 0.40 - 0.20); % ~13.60A - 14.00A
    power = round(voltage * current * 0.98);   % Active Power (~3050 - 3180 W)
    
    timestampStr = datestr(now, 'HH:MM:SS');
    
    try
        % 2. Push to ThingSpeak Channel 3533059
        thingSpeakWrite(channelID, [voltage, current, power], 'WriteKey', writeAPIKey);
        fprintf('[Tick #%03d] [%s] SUCCESS -> Pushed: V = %.1f V | I = %.2f A | P = %d W\n', ...
            tick, timestampStr, voltage, current, power);
        tick = tick + 1;
    catch ME
        fprintf('[Tick #%03d] [%s] NOTICE -> %s\n', tick, timestampStr, ME.message);
    end
    
    % 3. Pause for 16 seconds (ThingSpeak free tier rate limit is >= 15 seconds)
    fprintf('   Waiting 16 seconds for next continuous reading...\n');
    pause(16);
end
