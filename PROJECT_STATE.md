# 📌 PROJECT STATE & AI HANDOVER DOCUMENTATION

**Project Name:** CPU Dashboard AV Display (`cpu_dashboard_av_display`)  
**Repository Root:** `/Users/gagansharma/Documents/GitHub/cpu_dashboard_av_display`  
**Last Updated:** October 12, 2026  
**Status:** ✅ Fully Implemented, Tested, and Verified (16 Curated Themes)  

---

## 1. Project Goal & Requirements

Transform a **4.3-inch analog LCD display with AV (Composite/CVBS) input** into a USB-connected **PC hardware monitoring dashboard** (CPU, GPU, RAM, VRAM, temperatures, network throughput, and digital clock) with animations and wallpapers—similar to **AIO water cooler pump displays (NZXT Kraken / Corsair Elite LCD)** and **PC cabinet monitoring screens (Hyte Nexus / XuanFang / Turing Smart Screen)**.

### Target Specifications:
- **Display Target:** 4.3" or 3.5" to 7" analog/USB LCD displays with Yellow RCA / CVBS or digital input (Supporting **480p Standard 640×480**, **480p NTSC D1 720×480**, **480p WVGA 800×480**, **480p FWVGA 854×480**, and **240p QVGA 320×240**).
- **Video Generator:** ESP32 Development Board (ESP32-WROOM-32) utilizing hardware DAC on **GPIO 25**.
- **Host PC OS:** Windows (with cross-platform macOS/Linux support for the hybrid app).
- **Display Aesthetics:** 16 rich, curated templates spanning Cyberpunk, AIO liquid cooler rings, Supercar instrument clusters, Retro amber CRTs, Spaceflight telemetry, and Pixel art.
- **Companion Software:** 
  1. **Hybrid Desktop App (`desktop_app/`):** Electron + Vite web app with virtual bezel preview, **dynamic 480p and 240p resolution presets**, scaling modes (Stretch vs. Aspect Fit), 16 theme presets, custom wallpaper/GIF upload, keyboard theme cycling (Left/Right Arrow or `[`/`]`), and direct Web Serial USB streaming.
  2. **Windows Background Agent (`windows_agent/`):** Python CLI daemon streaming real-time hardware metrics.
  3. **Desktop Preview Simulator (`simulator/`):** Zero-dependency Tkinter app supporting real-time resolution switching (480p, WVGA, 240p).

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                      HOST PC                           │
│                                                        │
│  [Option 1: AERO·SYNC Studio]                          │
│   - Electron / Chrome Hybrid App                       │
│   - Live 4.3" Bezel Preview with 16 Themes             │
│   - Web Serial API (navigator.serial)                  │
│   - Keyboard Cycling (Arrow Left/Right, [ / ])         │
│                                                        │
│  [Option 2: Windows Background Agent]                  │
│   - Python: psutil, pynvml, WMI                        │
│   - Auto COM Port Scanner                              │
└──────────────────────────┬─────────────────────────────┘
                           │ USB Cable (Serial @ 115,200 baud)
                           │ JSON Telemetry Protocol
                           ▼
┌────────────────────────────────────────────────────────┐
│               ESP32 CONTROLLER (Core 0 & 1)            │
│                                                        │
│  - Core 0: Non-blocking Serial JSON parser             │
│  - Core 1: LovyanGFX CVBS DMA Engine (GPIO 25 DAC)     │
│  - Double-buffered sprite: 320x240 @ 30-60 FPS         │
│  - Standby Demo Mode when USB is disconnected          │
└──────────────────────────┬─────────────────────────────┘
                           │ Analog CVBS Signal (1.0V p-p)
                           │ GPIO 25 ➔ 75Ω Resistor ➔ RCA Center
                           │ GND ➔ RCA Outer Shield
                           ▼
┌────────────────────────────────────────────────────────┐
│               4.3" LCD DISPLAY (AV / CVBS)             │
│                                                        │
│  - Video In: Yellow RCA                                │
│  - Power: 5V from ESP32 VIN (or 12V DC via boost)      │
└────────────────────────────────────────────────────────┘
```

---

## 3. 16 Curated Display Templates

Inspired by the 3.5" Smart USB System Monitor (YouTube: [cII_G00hFUk](https://www.youtube.com/watch?v=cII_G00hFUk&t=21s)), AIDA64 SensorPanels, and AIO cooler screens, `desktop_app/src/scripts/themes.js` includes **16 distinct 320x240 themes**:

1. **CYBERPUNK_HUD:** Vector arc gauges, rotating radar sweep, pulsing reactor, tech corner brackets.
2. **KRAKEN_AIO:** NZXT Kraken style dual circular RGB temperature rings with glowing center stats.
3. **SYNTHWAVE_GRID:** 80s outrun wireframe perspective terrain grid, glowing sunset, horizon wireframe.
4. **REACTOR_CORE:** Iron Man / Stark Arc reactor rotating containment rings & core overload glow.
5. **AUTOMOTIVE_SUPERCAR:** Dual tachometer/speedometer, redline rev counter, digital gear indicator `[S 7]`, warning lamps.
6. **MECHA_GAMING_ROG:** Asus ROG / Gundam mecha armor plates with angular diamond gauges & aggressive gaming cuts.
7. **MATRIX_CODE_RAIN:** 32 columns of animated falling green digital code rain with terminal overlay.
8. **PIPBOY_VAULT:** Fallout Pip-Boy 3000 CRT green phosphor terminal with animated scrolling ECG heart rate pulse line.
9. **MINIMAL_NORDIC:** Scandinavian minimalist dark studio with ultra-thin micro-rings & elegant typography.
10. **NASA_MISSION_CONTROL:** Apollo FDAI artificial horizon navball gimbal, starry space background, orbital flight telemetry, cryogenic oxygen bus.
11. **RETRO_VT100_TERMINAL:** 1980s DEC VAX/VMS amber phosphor CRT console with ASCII block bar meters and blinking amber cursor `█`.
12. **CYBER_NEO_TOKYO:** Japanese Akira arcade HUD with kanji headers (`中央演算`, `画像処理`, `主記憶`), cyber city silhouette, and dynamic warning stamp (`[正常]`, `[警告]`, `[臨界]`).
13. **CHIBI_DESK_PET:** Animated pixel desk pet companion that sleeps when idle (`( ˘ω˘ ) Zzz`), smiles when active, sweats under load, and panics/catches fire if overheated (`(ノಠ益ಠ)ノ TOO HOT`).
14. **STEAMPUNK_CHRONO:** Victorian brass boiler pressure dials, sepia parchment dials, and rotating mechanical brass cogwheels.
15. **PIXEL_RPG_STATUS:** 16-bit JRPG battle status screen with HP/MP/EXP bevel bars, party leader `[HERO PC LV.99]`, and blinking command prompt.
16. **CUSTOM_WALLPAPER:** Drag-and-drop custom image or animated GIF background with frosted-glass stat pill overlays.

---

## 4. Repository Directory Structure

```
cpu_dashboard_av_display/
├── .gitignore                     # Ignores PlatformIO, venv, node_modules, and cache
├── README.md                      # Comprehensive user documentation & quickstart
├── PROJECT_STATE.md               # [THIS FILE] Complete state & technical handover
│
├── hardware/                      # Hardware schematics & wiring guides
│   ├── WIRING_GUIDE.md            # Detailed RCA, 75Ω resistor, and 5V/12V LCD power mod guide
│   └── PINOUT_AND_SCHEMATIC.md    # Circuit schematic & ESP32 pinout diagram
│
├── firmware/                      # ESP32 C++ firmware (LovyanGFX + ArduinoJson)
│   ├── platformio.ini             # PlatformIO build configuration for esp32dev
│   ├── README.md                  # Compilation & flashing guide (PlatformIO & Arduino IDE)
│   ├── include/
│   │   ├── config.h               # NTSC/PAL switch, pin assignments, thresholds, structs
│   │   ├── hud_renderer.h         # Double-buffered composite graphics renderer class
│   │   └── serial_protocol.h      # Serial reader, JSON parser & Standby demo mode
│   └── src/
│       ├── main.cpp               # FreeRTOS dual-core setup (Core 0: Serial, Core 1: Video)
│       └── hud_renderer.cpp       # Cyberpunk HUD graphics engine (radar, gauges, reactor)
│
├── desktop_app/                   # Cross-platform Hybrid Studio (NZXT CAM / iCUE style)
│   ├── package.json               # Electron + Vite + systeminformation configuration
│   ├── README.md                  # Studio user guide & feature breakdown
│   ├── run_studio.bat             # One-click Windows runner
│   ├── run_studio.sh              # One-click macOS / Linux runner
│   ├── index.html                 # Main UI layout (Bezel Stage, 16 Themes Drawer, Telemetry Hub)
│   ├── electron/
│   │   ├── main.js                # Electron main process (IPC telemetry, popout window)
│   │   └── preload.js             # Secure IPC bridge
│   └── src/
│       ├── styles/
│       │   ├── main.css           # Design tokens, typography, layout, glassmorphism
│       │   ├── cabinet-bezel.css  # 4.3" LCD frame with screws, LED, glass glare, scanlines
│       │   ├── studio.css         # Theme grid, swatches, wallpaper dropzone, settings
│       │   └── telemetry.css      # Hardware sensor cards & simulation sliders
│       └── scripts/
│           ├── app.js             # Application coordinator & tab navigation + keyboard cycling
│           ├── renderer.js        # 60 FPS master canvas render loop with 1-decimal-place clamping
│           ├── themes.js          # 16 canvas themes matching Turing screens & AIO coolers
│           ├── telemetry.js       # Live OS metrics (Electron IPC) + procedural simulation
│           └── usb-streamer.js    # Web Serial API driver for direct ESP32 USB streaming
│
├── windows_agent/                 # Lightweight Windows CLI background daemon
│   ├── dashboard_agent.py         # Hardware telemetry agent (psutil, pynvml, WMI)
│   ├── mock_sender.py             # Test utility for simulated hardware streaming
│   ├── requirements.txt           # Python packages: psutil, pyserial, pynvml, wmi
│   └── run_agent.bat              # One-click Windows launcher (auto-venv & auto-install)
│
└── simulator/                     # Standalone Python preview simulator
    ├── preview_simulator.py       # Tkinter simulator (zero dependencies)
    └── README.md                  # Simulator guide
```

---

## 5. Hardware Wiring & Pinout Details

### Components:
1. **ESP32 Dev Board:** Standard dual-core **ESP32-WROOM-32** (or NodeMCU-32S).
   > ⚠️ **CRITICAL NOTE:** Must be classic ESP32 with DAC1 on **GPIO 25**. ESP32-S2, ESP32-S3, and ESP32-C3 do NOT possess the internal DAC/I2S peripheral required for analog CVBS video output.
2. **Resistor:** 75Ω to 220Ω (1/4W) inline on video signal line for impedance matching.
3. **Display:** 4.3" TFT LCD with composite video (Yellow RCA) and power (Red DC 5.5x2.1mm jack).

### Connections:
- **ESP32 GPIO 25 (DAC1)** ➔ **75Ω Resistor** ➔ **RCA Center Pin (Yellow Wire)**
- **ESP32 GND** ➔ **RCA Outer Shield (Ground)**
- **ESP32 VIN (5V)** ➔ **LCD Power Positive (+)** *(90% of car 12V LCDs run internally on 5V)*
- **ESP32 GND** ➔ **LCD Power Negative (-)**

---

## 6. Serial Communication Protocol

### Connection Parameters:
- **Baud Rate:** `115200` baud (default) or `921600` baud (high speed)
- **Data Bits:** 8, Stop Bits: 1, Parity: None
- **Packet Frequency:** 1 Hz (1 packet per second)

### Handshake:
- **Host sends:** `PING\n`
- **ESP32 replies:** `ACK:CYBER_HUD_ESP32\n`

### Telemetry JSON Payload Format:
Single-line JSON string terminated by `\n`:
```json
{"cpu":48.2,"cpu_t":58.0,"gpu":72.1,"gpu_t":65.0,"ram":61.4,"ram_u":9.8,"ram_t":16.0,"vram":48.0,"net_d":12.5,"net_u":1.2,"time":"20:45:10"}
```

### Data Fields:
| Key | Type | Description |
| :--- | :--- | :--- |
| `cpu` | float | CPU Usage Percentage (0.0 - 100.0) |
| `cpu_t` | float | CPU Package Temperature in °C (clamped to 1 decimal place) |
| `gpu` | float | GPU Core Usage Percentage (0.0 - 100.0) |
| `gpu_t` | float | GPU Temperature in °C (clamped to 1 decimal place) |
| `ram` | float | RAM Usage Percentage (0.0 - 100.0) |
| `ram_u` | float | RAM Used in GB |
| `ram_t` | float | RAM Total Capacity in GB |
| `vram` | float | GPU Video Memory Usage Percentage (0.0 - 100.0) |
| `net_d` | float | Network Download Speed in MB/s |
| `net_u` | float | Network Upload Speed in MB/s |
| `time` | string| Current local system time (`"HH:MM:SS"`) |

### Standby Demo Mode:
If no serial packet is received within `3500ms` (e.g. PC booted off or disconnected), the ESP32 automatically switches to **Standby / Sci-Fi Demo Mode**, displaying animated sinusoidal metrics and radar sweeps.

---

## 7. How to Run Each Component

### A. AERO·SYNC Pro Studio (Hybrid App)
```bash
cd desktop_app
npm run dev        # Web Studio on http://localhost:5173
npm run electron   # Native Desktop Window
```
- **Keyboard shortcuts:** Press `[` / `]` or Left / Right Arrow keys to cycle through all 16 presets!
- **Windows:** Double-click `desktop_app/run_studio.bat`.
- **macOS / Linux:** Execute `./desktop_app/run_studio.sh`.

### B. ESP32 Firmware
```bash
cd firmware
pio run -t upload
```
*(Or open `firmware/src/main.cpp` in Arduino IDE with `LovyanGFX` and `ArduinoJson` libraries installed).*

### C. Windows CLI Background Agent
```bash
cd windows_agent
run_agent.bat
```
*(Or run `python dashboard_agent.py` after `pip install -r requirements.txt`).*

### D. Desktop Preview Simulator (Python Tkinter)
```bash
python3 simulator/preview_simulator.py
```

---

## 8. Verified Working Status

- [x] **Firmware:** FreeRTOS dual-core split, LovyanGFX sprite buffer (320x240, 8-bit depth), zero-flicker DMA output on GPIO 25 DAC.
- [x] **Serial Parser:** Robust line-buffered JSON parsing with `ArduinoJson v7`, handshake responder, and auto-demo fallback.
- [x] **Desktop App:** Built with Vite (`npm run build` passes with 0 errors), 16 complete themes rendered on HTML5 Canvas, Web Serial API USB streaming, and decimal rounding fixed to 1 decimal place (`XX.X°C`).
- [x] **Windows Agent:** Telemetry collector with `psutil`, `pynvml` (NVIDIA), and `WMI` (thermals), with automatic COM port discovery.
- [x] **Desktop Simulator:** Tkinter preview app with auto-simulation, manual sliders, and overheat trigger verified working.
- [x] **Git Tracking:** Clean `.gitignore` ignoring `.pio`, `venv`, `node_modules`, and caches.
