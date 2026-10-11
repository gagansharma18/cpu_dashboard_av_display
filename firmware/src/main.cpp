#include <Arduino.h>
#include "config.h"
#include "serial_protocol.h"
#include "hud_renderer.h"

// Shared telemetry instance and FreeRTOS Mutex
SystemTelemetry telemetry;
portMUX_TYPE telemetryMux = portMUX_INITIALIZER_UNLOCKED;

// HUD Renderer instance
HudRenderer hud;

// Task handles
TaskHandle_t serialTaskHandle = NULL;

// Serial Communication Task pinned to Core 0
void serialTask(void* pvParameters) {
    for (;;) {
        taskENTER_CRITICAL(&telemetryMux);
        SerialProtocol::update(telemetry);
        taskEXIT_CRITICAL(&telemetryMux);

        vTaskDelay(pdMS_TO_TICKS(10)); // 100Hz serial polling rate
    }
}

void setup() {
    // 1. Initialize Serial Communication
    SerialProtocol::init();
    Serial.println("\n[SYSTEM] ESP32 Cyberpunk AV Dashboard Initializing...");

    // 2. Initialize LovyanGFX Composite Video Engine
    hud.init();
    Serial.println("[SYSTEM] CVBS Composite Video Initialized on GPIO 25 (DAC1).");

    // 3. Launch Serial Task on Core 0
    xTaskCreatePinnedToCore(
        serialTask,         // Task function
        "SerialTask",       // Task name
        4096,               // Stack size
        NULL,               // Parameter
        2,                  // Priority
        &serialTaskHandle,  // Handle
        0                   // Core 0 (leave Core 1 dedicated to video generation)
    );

    Serial.println("[SYSTEM] Ready. Outputting video signal to AV display.");
}

void loop() {
    static uint32_t last_frame_time = 0;
    uint32_t now = millis();

    // Limit to ~30-40 FPS for smooth, jitter-free composite video rendering
    if (now - last_frame_time >= 33) {
        last_frame_time = now;

        // Copy telemetry safely
        SystemTelemetry current_data;
        taskENTER_CRITICAL(&telemetryMux);
        current_data = telemetry;
        taskEXIT_CRITICAL(&telemetryMux);

        // Render frame to composite output
        hud.render(current_data);
    }

    // Small yield for background OS tasks
    vTaskDelay(pdMS_TO_TICKS(1));
}
