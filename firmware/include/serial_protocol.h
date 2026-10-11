#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "config.h"

class SerialProtocol {
public:
    static void init() {
        Serial.begin(SERIAL_BAUD_RATE);
        Serial.setRxBufferSize(1024);
    }

    static void update(SystemTelemetry& data) {
        // Read incoming serial lines
        while (Serial.available() > 0) {
            char c = (char)Serial.read();

            if (c == '\n' || c == '\r') {
                if (rx_index > 0) {
                    rx_buffer[rx_index] = '\0';
                    processCommand(rx_buffer, data);
                    rx_index = 0;
                }
            } else if (rx_index < sizeof(rx_buffer) - 1) {
                rx_buffer[rx_index++] = c;
            }
        }

        // Check for connection timeout
        uint32_t now = millis();
        if (data.is_connected && (now - data.last_update > DATA_TIMEOUT_MS)) {
            data.is_connected = false;
        }

        // If disconnected, generate procedural sci-fi demo telemetry
        if (!data.is_connected) {
            updateDemoTelemetry(data, now);
        }
    }

private:
    static inline char rx_buffer[512];
    static inline size_t rx_index = 0;

    static void processCommand(const char* line, SystemTelemetry& data) {
        // 1. Handshake ping check
        if (strncmp(line, "PING", 4) == 0) {
            Serial.println("ACK:CYBER_HUD_ESP32");
            return;
        }

        // 2. Parse telemetry JSON
        if (line[0] == '{') {
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, line);
            if (!error) {
                if (doc.containsKey("cpu"))     data.cpu_percent   = doc["cpu"].as<float>();
                if (doc.containsKey("cpu_t"))   data.cpu_temp      = doc["cpu_t"].as<float>();
                if (doc.containsKey("gpu"))     data.gpu_percent   = doc["gpu"].as<float>();
                if (doc.containsKey("gpu_t"))   data.gpu_temp      = doc["gpu_t"].as<float>();
                if (doc.containsKey("vram"))    data.vram_percent  = doc["vram"].as<float>();
                if (doc.containsKey("ram"))     data.ram_percent   = doc["ram"].as<float>();
                if (doc.containsKey("ram_u"))   data.ram_used_gb   = doc["ram_u"].as<float>();
                if (doc.containsKey("ram_t"))   data.ram_total_gb  = doc["ram_t"].as<float>();
                if (doc.containsKey("net_d"))   data.net_down_mbps = doc["net_d"].as<float>();
                if (doc.containsKey("net_u"))   data.net_up_mbps   = doc["net_u"].as<float>();
                if (doc.containsKey("time")) {
                    const char* t = doc["time"];
                    strncpy(data.time_str, t, sizeof(data.time_str) - 1);
                }

                data.is_connected = true;
                data.last_update = millis();
            }
        }
    }

    static void updateDemoTelemetry(SystemTelemetry& data, uint32_t now) {
        float t = now * 0.001f;
        // Animated fluctuating metrics
        data.cpu_percent  = 40.0f + 35.0f * sinf(t * 0.8f) + 15.0f * cosf(t * 2.3f);
        data.cpu_percent  = constrain(data.cpu_percent, 5.0f, 98.0f);
        data.cpu_temp     = 48.0f + (data.cpu_percent * 0.28f);

        data.gpu_percent  = 50.0f + 40.0f * sinf(t * 1.1f + 1.5f);
        data.gpu_percent  = constrain(data.gpu_percent, 0.0f, 99.0f);
        data.gpu_temp     = 45.0f + (data.gpu_percent * 0.32f);
        data.vram_percent = 55.0f + 20.0f * sinf(t * 0.4f);

        data.ram_percent  = 62.0f + 8.0f * sinf(t * 0.2f);
        data.ram_total_gb = 32.0f;
        data.ram_used_gb  = data.ram_total_gb * (data.ram_percent / 100.0f);

        data.net_down_mbps = fabsf(18.5f * sinf(t * 1.7f) + 5.0f * cosf(t * 3.1f));
        data.net_up_mbps   = fabsf(4.2f * cosf(t * 1.2f));

        // Format simulated time string
        int sec = (now / 1000) % 60;
        int min = (now / 60000) % 60;
        int hrs = (now / 3600000) % 24;
        snprintf(data.time_str, sizeof(data.time_str), "%02d:%02d:%02d", hrs, min, sec);
    }
};
