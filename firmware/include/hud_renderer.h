#pragma once
#include <Arduino.h>
#define LGFX_USE_V1
#include <LovyanGFX.hpp>
#include "config.h"

// Custom LGFX Display Driver for Composite Video
class LGFX_Composite : public lgfx::LGFX_Device {
    lgfx::Panel_CVBS _panel_instance;
public:
    LGFX_Composite() {
        {
            auto cfg = _panel_instance.config();
            cfg.memory_width  = SCREEN_WIDTH;
            cfg.memory_height = SCREEN_HEIGHT;
            cfg.panel_width   = SCREEN_WIDTH;
            cfg.panel_height  = SCREEN_HEIGHT;
            cfg.offset_x      = 0;
            cfg.offset_y      = 0;
            _panel_instance.config(cfg);
        }
        {
            auto cfg = _panel_instance.config_detail();
            cfg.pin_dac = CVBS_DAC_PIN;
#if USE_NTSC
            cfg.signal_type = lgfx::Panel_CVBS::config_detail_t::signal_type_t::NTSC;
#else
            cfg.signal_type = lgfx::Panel_CVBS::config_detail_t::signal_type_t::PAL;
#endif
            _panel_instance.config_detail(cfg);
        }
        setPanel(&_panel_instance);
    }
};

class HudRenderer {
public:
    HudRenderer();
    void init();
    void render(const SystemTelemetry& data);

private:
    LGFX_Composite lcd;
    LGFX_Sprite canvas;

    // Animation state variables
    float smoothed_cpu = 0.0f;
    float smoothed_gpu = 0.0f;
    float smoothed_ram = 0.0f;
    float smoothed_vram = 0.0f;
    float radar_angle = 0.0f;
    float pulse_phase = 0.0f;
    uint32_t frame_count = 0;

    // Helper drawing routines
    void drawBackgroundGrid();
    void drawCornerBrackets();
    void drawHeader(const SystemTelemetry& data);
    void drawArcGauge(int cx, int cy, int r, float start_deg, float end_deg, 
                      float current_val, float max_val, 
                      const char* title, const char* unit, float temp);
    void drawCenterRadar(int cx, int cy, int r, float cpu_load);
    void drawBottomStats(const SystemTelemetry& data);
    void drawSegmentedBar(int x, int y, int w, int h, float percent, uint32_t color);
};
