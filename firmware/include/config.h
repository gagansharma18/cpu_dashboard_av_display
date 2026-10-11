#pragma once
#include <Arduino.h>

// ==============================================================================
// HARDWARE & DISPLAY CONFIGURATION
// ==============================================================================

// Output Video Standard:
// Set to 1 for NTSC (60 Hz, North America/Asia/Universal car screens)
// Set to 0 for PAL (50 Hz, Europe/Australia)
#define USE_NTSC 1

// DAC Output Pin (Must be GPIO 25 for DAC1)
#define CVBS_DAC_PIN 25

// ==============================================================================
// HARDWARE RESOLUTION PROFILES (Supports 480p and 240p Displays)
// ==============================================================================
// Profile 1: 320x240 (240p QVGA - Recommended default, lowest SRAM, 60 FPS)
// Profile 2: 640x480 (480p Standard VGA / 480i NTSC)
// Profile 3: 720x480 (480p NTSC D1 Broadcast AV)
// Profile 4: 480x272 (4.3" TFT LCD Widescreen)
#define RESOLUTION_PROFILE 1

#if RESOLUTION_PROFILE == 2
  #define SCREEN_WIDTH  640
  #define SCREEN_HEIGHT 480
#elif RESOLUTION_PROFILE == 3
  #define SCREEN_WIDTH  720
  #define SCREEN_HEIGHT 480
#elif RESOLUTION_PROFILE == 4
  #define SCREEN_WIDTH  480
  #define SCREEN_HEIGHT 272
#else
  #define SCREEN_WIDTH  320
  #define SCREEN_HEIGHT 240
#endif

// Serial Baud Rate
#define SERIAL_BAUD_RATE 115200

// Timeout in milliseconds to switch to Standby / Demo Animation
#define DATA_TIMEOUT_MS 3500

// ==============================================================================
// CYBERPUNK COLOR PALETTE
// Note: LovyanGFX Panel_CVBS generates luminance (monochrome/grayscale).
// These standard RGB definitions map directly to analog video luminance levels.
// ==============================================================================
#define COLOR_BG          0x000000  // Deep Black
#define COLOR_GRID        0x181818  // Faint background grid lines
#define COLOR_FRAME_DARK  0x353535  // Inactive segments, dark bezels
#define COLOR_FRAME_MID   0x707070  // HUD borders, brackets, labels
#define COLOR_ACTIVE      0xC0C0C0  // Active gauge fills, metrics
#define COLOR_BRIGHT      0xE0E0E0  // High-priority text, gauge values
#define COLOR_NEON_GLOW   0xFFFFFF  // High-intensity radar beam, peak ticks, alerts

// Thresholds for warnings
#define CPU_TEMP_WARN_THRESHOLD 80.0f
#define GPU_TEMP_WARN_THRESHOLD 82.0f
#define HIGH_LOAD_THRESHOLD     85

// ==============================================================================
// TELEMETRY DATA STRUCTURE
// ==============================================================================
struct SystemTelemetry {
    // CPU
    float cpu_percent    = 0.0f;
    float cpu_temp       = 0.0f;

    // GPU
    float gpu_percent    = 0.0f;
    float gpu_temp       = 0.0f;
    float vram_percent   = 0.0f;

    // RAM
    float ram_percent    = 0.0f;
    float ram_used_gb    = 0.0f;
    float ram_total_gb   = 0.0f;

    // Network (MB/s)
    float net_down_mbps  = 0.0f;
    float net_up_mbps    = 0.0f;

    // Time & Status
    char  time_str[16]   = "--:--:--";
    bool  is_connected   = false;
    uint32_t last_update = 0;
};
