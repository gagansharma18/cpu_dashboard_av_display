#include "hud_renderer.h"
#include <cmath>

#ifndef DEG_TO_RAD
#define DEG_TO_RAD 0.017453292519943295769236907684886f
#endif

HudRenderer::HudRenderer() : canvas(&lcd) {}

void HudRenderer::init() {
    lcd.init();
    canvas.setColorDepth(8); // 8-bit depth (256 levels) fits comfortably in ESP32 internal RAM
    canvas.createSprite(SCREEN_WIDTH, SCREEN_HEIGHT);
    canvas.setTextWrap(false);
}

void HudRenderer::render(const SystemTelemetry& data) {
    frame_count++;

    // Smooth value interpolation (exponential moving average for fluid needle/gauge response)
    smoothed_cpu += (data.cpu_percent - smoothed_cpu) * 0.15f;
    smoothed_gpu += (data.gpu_percent - smoothed_gpu) * 0.15f;
    smoothed_ram += (data.ram_percent - smoothed_ram) * 0.15f;
    smoothed_vram += (data.vram_percent - smoothed_vram) * 0.15f;

    // Advance animation phases
    radar_angle += 3.5f + (smoothed_cpu * 0.05f); // Spends slightly faster under load
    if (radar_angle >= 360.0f) radar_angle -= 360.0f;

    pulse_phase += 0.08f + (smoothed_cpu * 0.002f);
    if (pulse_phase >= 6.28318f) pulse_phase -= 6.28318f;

    // Clear canvas
    canvas.fillScreen(COLOR_BG);

    // 1. Cyberpunk background grid
    drawBackgroundGrid();

    // 2. Corner tech brackets and borders
    drawCornerBrackets();

    // 3. Top Header Bar
    drawHeader(data);

    // 4. Left Gauge - CPU Core
    // Center at (52, 98), radius 38, sweep from 135 deg to 405 deg (270 deg span)
    drawArcGauge(52, 98, 38, 135.0f, 405.0f, smoothed_cpu, 100.0f, "CPU CORE", "%", data.cpu_temp);

    // 5. Center Radar & Core Matrix
    // Center at (160, 98), radius 44
    drawCenterRadar(160, 98, 44, smoothed_cpu);

    // 6. Right Gauge - GPU Core
    // Center at (268, 98), radius 38
    drawArcGauge(268, 98, 38, 135.0f, 405.0f, smoothed_gpu, 100.0f, "GPU CORE", "%", data.gpu_temp);

    // 7. Bottom System Tray (RAM & Network)
    drawBottomStats(data);

    // Push frame to composite video output without tearing
    canvas.pushSprite(0, 0);
}

void HudRenderer::drawBackgroundGrid() {
    // Faint horizontal & vertical radar grid lines
    for (int y = 28; y < 180; y += 24) {
        canvas.drawFastHLine(8, y, SCREEN_WIDTH - 16, COLOR_GRID);
    }
    for (int x = 16; x < SCREEN_WIDTH - 8; x += 32) {
        canvas.drawFastVLine(x, 28, 152, COLOR_GRID);
    }
}

void HudRenderer::drawCornerBrackets() {
    int b_len = 10; // Bracket arm length
    // Top-Left
    canvas.drawFastHLine(3, 3, b_len, COLOR_FRAME_MID);
    canvas.drawFastVLine(3, 3, b_len, COLOR_FRAME_MID);
    // Top-Right
    canvas.drawFastHLine(SCREEN_WIDTH - 3 - b_len, 3, b_len, COLOR_FRAME_MID);
    canvas.drawFastVLine(SCREEN_WIDTH - 4, 3, b_len, COLOR_FRAME_MID);
    // Bottom-Left
    canvas.drawFastHLine(3, SCREEN_HEIGHT - 4, b_len, COLOR_FRAME_MID);
    canvas.drawFastVLine(3, SCREEN_HEIGHT - 4 - b_len, b_len, COLOR_FRAME_MID);
    // Bottom-Right
    canvas.drawFastHLine(SCREEN_WIDTH - 3 - b_len, SCREEN_HEIGHT - 4, b_len, COLOR_FRAME_MID);
    canvas.drawFastVLine(SCREEN_WIDTH - 4, SCREEN_HEIGHT - 4 - b_len, b_len, COLOR_FRAME_MID);
}

void HudRenderer::drawHeader(const SystemTelemetry& data) {
    // Header background separator
    canvas.drawFastHLine(6, 22, SCREEN_WIDTH - 12, COLOR_FRAME_MID);
    canvas.drawPixel(6, 21, COLOR_NEON_GLOW);
    canvas.drawPixel(SCREEN_WIDTH - 7, 21, COLOR_NEON_GLOW);

    // Title / System ID
    canvas.setTextSize(1);
    canvas.setTextColor(COLOR_BRIGHT);
    canvas.setCursor(8, 8);
    canvas.print("// CYBER_HUD_AV");

    // Status Badge
    int status_x = 118;
    if (data.is_connected) {
        // Blinking indicator dot
        bool blink = (frame_count % 30) < 22;
        if (blink) {
            canvas.fillCircle(status_x, 11, 3, COLOR_NEON_GLOW);
        } else {
            canvas.drawCircle(status_x, 11, 3, COLOR_FRAME_MID);
        }
        canvas.setTextColor(COLOR_ACTIVE);
        canvas.setCursor(status_x + 8, 8);
        canvas.print("LINK_ONLINE");
    } else {
        bool blink = (frame_count % 20) < 10;
        canvas.setTextColor(blink ? COLOR_NEON_GLOW : COLOR_FRAME_DARK);
        canvas.setCursor(status_x, 8);
        canvas.print("! STANDBY_DEMO !");
    }

    // System Clock
    canvas.setTextColor(COLOR_NEON_GLOW);
    canvas.setCursor(SCREEN_WIDTH - 64, 8);
    canvas.print(data.time_str);
}

void HudRenderer::drawArcGauge(int cx, int cy, int r, float start_deg, float end_deg, 
                               float current_val, float max_val, 
                               const char* title, const char* unit, float temp) {
    float sweep = end_deg - start_deg;
    float pct = constrain(current_val / max_val, 0.0f, 1.0f);
    int total_segments = 24;
    int active_segments = (int)roundf(pct * total_segments);

    // Outer bezel and segmented track
    for (int i = 0; i < total_segments; i++) {
        float angle = (start_deg + (i * (sweep / (float)total_segments))) * DEG_TO_RAD;
        float cos_a = cosf(angle);
        float sin_a = sinf(angle);

        int x1 = cx + (int)roundf((r - 5) * cos_a);
        int y1 = cy + (int)roundf((r - 5) * sin_a);
        int x2 = cx + (int)roundf(r * cos_a);
        int y2 = cy + (int)roundf(r * sin_a);

        uint32_t seg_color = (i < active_segments) ? COLOR_ACTIVE : COLOR_FRAME_DARK;
        if (i == active_segments - 1 && i > 0) {
            seg_color = COLOR_NEON_GLOW; // Highlight leading segment
        }
        canvas.drawLine(x1, y1, x2, y2, seg_color);
    }

    // Gauge Title
    canvas.setTextSize(1);
    canvas.setTextColor(COLOR_FRAME_MID);
    canvas.setTextDatum(top_center);
    canvas.drawString(title, cx, cy - r - 9);

    // Center Big Value Readout
    canvas.setTextSize(2);
    canvas.setTextColor(COLOR_NEON_GLOW);
    canvas.setTextDatum(middle_center);
    char val_buf[16];
    snprintf(val_buf, sizeof(val_buf), "%d%s", (int)roundf(current_val), unit);
    canvas.drawString(val_buf, cx, cy - 2);

    // Temperature & status at bottom of gauge
    canvas.setTextSize(1);
    if (temp > 80.0f && ((frame_count % 16) < 8)) {
        canvas.setTextColor(COLOR_NEON_GLOW);
        canvas.drawString("! HOT !", cx, cy + 18);
    } else {
        canvas.setTextColor(COLOR_ACTIVE);
        char temp_buf[16];
        snprintf(temp_buf, sizeof(temp_buf), "%d C", (int)roundf(temp));
        canvas.drawString(temp_buf, cx, cy + 18);
    }
    canvas.setTextDatum(top_left); // Reset datum
}

void HudRenderer::drawCenterRadar(int cx, int cy, int r, float cpu_load) {
    // 1. Outer Reticle Rings
    canvas.drawCircle(cx, cy, r, COLOR_FRAME_MID);
    canvas.drawCircle(cx, cy, r - 8, COLOR_FRAME_DARK);
    canvas.drawCircle(cx, cy, r / 2, COLOR_FRAME_DARK);

    // 2. Cardinal Crosshairs
    canvas.drawFastHLine(cx - r - 4, cy, 8, COLOR_FRAME_MID);
    canvas.drawFastHLine(cx + r - 4, cy, 8, COLOR_FRAME_MID);
    canvas.drawFastVLine(cx, cy - r - 4, 8, COLOR_FRAME_MID);
    canvas.drawFastVLine(cx, cy + r - 4, 8, COLOR_FRAME_MID);

    // 3. Rotating Radar Sweep Beam
    float r_rad = radar_angle * DEG_TO_RAD;
    int beam_x = cx + (int)roundf((r - 1) * cosf(r_rad));
    int beam_y = cy + (int)roundf((r - 1) * sinf(r_rad));
    canvas.drawLine(cx, cy, beam_x, beam_y, COLOR_NEON_GLOW);

    // Secondary faint trail line
    float trail_rad = (radar_angle - 12.0f) * DEG_TO_RAD;
    int trail_x = cx + (int)roundf((r - 4) * cosf(trail_rad));
    int trail_y = cy + (int)roundf((r - 4) * sinf(trail_rad));
    canvas.drawLine(cx, cy, trail_x, trail_y, COLOR_FRAME_MID);

    // 4. Center Pulsing Hexagonal Reactor Core
    float pulse = 0.5f + 0.5f * sinf(pulse_phase);
    int core_r = 7 + (int)(pulse * (4.0f + (cpu_load * 0.05f)));

    // Hexagon points
    int hx[6], hy[6];
    for (int i = 0; i < 6; i++) {
        float h_angle = (i * 60.0f) * DEG_TO_RAD;
        hx[i] = cx + (int)roundf(core_r * cosf(h_angle));
        hy[i] = cy + (int)roundf(core_r * sinf(h_angle));
    }
    for (int i = 0; i < 6; i++) {
        canvas.drawLine(hx[i], hy[i], hx[(i + 1) % 6], hy[(i + 1) % 6], COLOR_NEON_GLOW);
    }
    canvas.fillCircle(cx, cy, 2, COLOR_NEON_GLOW);

    // Status Label below Radar
    canvas.setTextSize(1);
    canvas.setTextColor(COLOR_ACTIVE);
    canvas.setTextDatum(top_center);
    if (cpu_load > HIGH_LOAD_THRESHOLD) {
        bool warn_blink = (frame_count % 16) < 8;
        canvas.setTextColor(warn_blink ? COLOR_NEON_GLOW : COLOR_FRAME_DARK);
        canvas.drawString("CORE STRESS", cx, cy + r + 5);
    } else {
        canvas.drawString("SYS NOMINAL", cx, cy + r + 5);
    }
    canvas.setTextDatum(top_left);
}

void HudRenderer::drawBottomStats(const SystemTelemetry& data) {
    // Separator line above bottom tray
    canvas.drawFastHLine(6, 178, SCREEN_WIDTH - 12, COLOR_FRAME_MID);

    // 1. RAM Usage Bar (Left half)
    canvas.setTextSize(1);
    canvas.setTextColor(COLOR_BRIGHT);
    canvas.setCursor(8, 185);
    canvas.print("RAM");

    char ram_str[24];
    if (data.ram_total_gb > 0.0f) {
        snprintf(ram_str, sizeof(ram_str), "%.1f/%.1fGB (%d%%)", 
                 data.ram_used_gb, data.ram_total_gb, (int)roundf(smoothed_ram));
    } else {
        snprintf(ram_str, sizeof(ram_str), "%d%%", (int)roundf(smoothed_ram));
    }
    canvas.setTextColor(COLOR_ACTIVE);
    canvas.setCursor(34, 185);
    canvas.print(ram_str);

    // RAM Segmented Bar (x: 8, y: 197, w: 140, h: 8)
    drawSegmentedBar(8, 197, 140, 8, smoothed_ram, COLOR_ACTIVE);

    // 2. VRAM Bar (Middle section)
    canvas.setTextColor(COLOR_BRIGHT);
    canvas.setCursor(8, 212);
    canvas.print("VRAM");
    char vram_str[16];
    snprintf(vram_str, sizeof(vram_str), "%d%%", (int)roundf(smoothed_vram));
    canvas.setTextColor(COLOR_ACTIVE);
    canvas.setCursor(38, 212);
    canvas.print(vram_str);
    drawSegmentedBar(8, 222, 140, 8, smoothed_vram, COLOR_ACTIVE);

    // 3. Network Throughput (Right half)
    int net_x = 168;

    // Download
    canvas.setTextColor(COLOR_BRIGHT);
    canvas.setCursor(net_x, 187);
    canvas.print("NET DL");
    canvas.fillTriangle(net_x + 44, 194, net_x + 48, 187, net_x + 40, 187, COLOR_NEON_GLOW); // Down arrow
    char dl_str[24];
    snprintf(dl_str, sizeof(dl_str), "%5.1f MB/s", data.net_down_mbps);
    canvas.setTextColor(COLOR_NEON_GLOW);
    canvas.setCursor(net_x + 54, 187);
    canvas.print(dl_str);

    // Upload
    canvas.setTextColor(COLOR_BRIGHT);
    canvas.setCursor(net_x, 212);
    canvas.print("NET UL");
    canvas.fillTriangle(net_x + 44, 212, net_x + 48, 219, net_x + 40, 219, COLOR_NEON_GLOW); // Up arrow
    char ul_str[24];
    snprintf(ul_str, sizeof(ul_str), "%5.1f MB/s", data.net_up_mbps);
    canvas.setTextColor(COLOR_NEON_GLOW);
    canvas.setCursor(net_x + 54, 212);
    canvas.print(ul_str);
}

void HudRenderer::drawSegmentedBar(int x, int y, int w, int h, float percent, uint32_t color) {
    int num_blocks = 14;
    int gap = 2;
    int block_w = (w - (num_blocks - 1) * gap) / num_blocks;
    int active_blocks = (int)roundf((percent / 100.0f) * num_blocks);

    for (int i = 0; i < num_blocks; i++) {
        int bx = x + i * (block_w + gap);
        uint32_t b_color = (i < active_blocks) ? color : COLOR_FRAME_DARK;
        if (i == active_blocks - 1 && i > 0) {
            b_color = COLOR_NEON_GLOW; // Highlight leading block
        }
        canvas.fillRect(bx, y, block_w, h, b_color);
    }
}
