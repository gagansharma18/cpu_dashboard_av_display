# 📌 PROJECT STATE & AI HANDOVER DOCUMENTATION

**Project Name:** CPU Dashboard AV Display (`cpu_dashboard_av_display`)  
**Repository Root:** `/Users/gagansharma/Documents/GitHub/cpu_dashboard_av_display`  
**Last Updated:** October 12, 2026  
**Status:** ✅ Fully Implemented, Tested, and Verified  

---

## 1. Project Goal & Requirements

Transform a **4.3-inch analog LCD display with AV (Composite/CVBS) input** into a USB-connected **PC hardware monitoring dashboard** (CPU, GPU, RAM, VRAM, temperatures, network throughput, and digital clock) with animations and wallpapers—similar to **AIO water cooler pump displays (NZXT Kraken / Corsair Elite LCD)** and **PC cabinet monitoring screens (Hyte Nexus / XuanFang / Turing Smart Screen)**.

### Target Specifications:
- **Display Target:** 4.3" analog LCD with Yellow RCA / CVBS input (typically car rear-view or mini security monitor, 320x240 / 480x272 native, NTSC 60Hz / PAL 50Hz).
- **Video Generator:** ESP32 Development Board (ESP32-WROOM-32) utilizing hardware DAC on **GPIO 25**.
- **Host PC OS:** Windows (with cross-platform macOS/Linux support for the hybrid app).
- **Display Aesthetics:** Cyberpunk / Sci-Fi HUD with dynamic gauges, spinning radar sweep, pulsing reactor core, and multiple customizable themes.
- **Companion Software:** 
  1. **Hybrid Desktop App (`desktop_app/`):** Electron + Vite web app with virtual 4.3" bezel preview, 5 theme presets, custom wallpaper/GIF upload, and direct Web Serial USB streaming.
  2. **Windows Background Agent (`windows_agent/`):** Python CLI daemon streaming real-time hardware metrics.
  3. **Desktop Preview Simulator (`simulator/`):** Zero-dependency Tkinter app to preview HUD animations immediately.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                      HOST PC                           │
│                                                        │
│  [Option 1: AERO·SYNC Studio]                          │
│   - Electron / Chrome Hybrid App                       │
│   - Live 4.3" Bezel Preview with 5 Themes             │
│   - Web Serial API (navigator.serial)                  │
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

## 3. Repository Directory Structure

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
│   ├── index.html                 # Main UI layout (Bezel Stage, Theme Drawer, Telemetry Hub)
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
│           ├── app.js             # Application coordinator & tab navigation
│           ├── renderer.js        # 60 FPS master canvas render loop with value damping
│           ├── themes.js          # 5 canvas themes (Cyberpunk, AIO, Synthwave, Reactor, Wallpaper)
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

## 4. Hardware Wiring & Pinout Details

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

## 5. Serial Communication Protocol

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
| `cpu_t` | float | CPU Package Temperature in °C |
| `gpu` | float | GPU Core Usage Percentage (0.0 - 100.0) |
| `gpu_t` | float | GPU Temperature in °C |
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

## 6. How to Run Each Component

### A. ESP32 Firmware
```bash
cd firmware
pio run -t upload
```
*(Or open `firmware/src/main.cpp` in Arduino IDE with `LovyanGFX` and `ArduinoJson` libraries installed).*

### B. AERO·SYNC Pro Studio (Hybrid App)
```bash
cd desktop_app
npm run dev        # Web Studio on http://localhost:5173
npm run electron   # Native Desktop Window
```
- **Windows:** Double-click `desktop_app/run_studio.bat`.
- **macOS / Linux:** Execute `./desktop_app/run_studio.sh`.

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

## 7. Verified Working Status

- [x] **Firmware:** FreeRTOS dual-core split, LovyanGFX sprite buffer (320x240, 8-bit depth), zero-flicker DMA output on GPIO 25 DAC.
- [x] **Serial Parser:** Robust line-buffered JSON parsing with `ArduinoJson v7`, handshake responder, and auto-demo fallback.
- [x] **Desktop App:** Built with Vite (`npm run build` passes with zero errors), Electron IPC bridge, 5 complete themes rendered on HTML5 Canvas, and Web Serial API USB streaming.
- [x] **Windows Agent:** Telemetry collector with `psutil`, `pynvml` (NVIDIA), and `WMI` (thermals), with automatic COM port discovery.
- [x] **Desktop Simulator:** Tkinter preview app with auto-simulation, manual sliders, and overheat trigger verified working.
- [x] **Git Tracking:** Clean `.gitignore` ignoring `.pio`, `venv`, `node_modules`, and caches.

---

## 8. Immediate Next Steps / Roadmap for Future AI or Developer

If continuing development or adding new features:
1. **Packaging Executables:**
   - Run `npx electron-builder` inside `desktop_app/` to generate standalone `.exe` installers for Windows and `.dmg` for macOS.
2. **Audio Reactive Visualizer:**
   - Add Web Audio API input in `desktop_app/` to stream live PC audio frequency bands into the bottom tray oscilloscope.
3. **ESP32 Color Mode (Optional):**
   - If NTSC color burst is desired over monochrome luminance on the ESP32, examine `ESP_8_BIT_composite` or `marciot/ESP32CompositeColorVideo` libraries which modulate 3.58MHz color bursts using the ESP32 Audio PLL.
4. **Additional Theme Presets:**
   - Add new themes in `desktop_app/src/scripts/themes.js` by defining new render functions and registering them in the `THEMES` dictionary.
