# 🚀 Cyberpunk AV System Dashboard for ESP32 & 4.3" LCD

Transform a standard **4.3-inch analog LCD display (AV / Composite / CVBS input)** into a futuristic, USB-connected **Cyberpunk System Dashboard** for your PC.

Powered by a single **ESP32 microcontroller**, this project generates standard analog composite video directly from the ESP32 internal DAC (GPIO 25) with **smooth 30–60 FPS graphics, spinning radar animations, dynamic arc gauges, and live Windows hardware telemetry**.

---

## 🌟 Key Features

- **Futuristic Cyberpunk HUD**:
  - **CPU Core Gauge**: Live usage (%), package temperature (°C), and thermal alert indicator.
  - **GPU Core Gauge**: Live GPU load (%), temperature (°C), and dedicated VRAM meter.
  - **Center Sci-Fi Matrix**: Rotating radar sweep beam, cardinal reticles, and pulsing hexagonal reactor core synchronized to CPU load.
  - **Memory & Storage Tray**: Segmented bar graph showing used and total system RAM in GB.
  - **Network Flow Meters**: Real-time Download (`▼`) and Upload (`▲`) bandwidth in MB/s with animated indicator arrows.
  - **Live Digital Clock**: Real-time synchronized system time with active connection heartbeat.
- **Ultra-Low Cost & Minimal Hardware**:
  - Requires only an **ESP32 board** (~$4) and a **single 75Ω resistor**—no external display controller or HDMI bridge needed!
  - Single USB connection handles both power and data.
- **Instant Boot & Standalone Demo Mode**:
  - Powers up and outputs video in under 1 second.
  - If disconnected from the PC, the firmware automatically engages an animated **Standby / Sci-Fi Demo Mode** with simulated telemetry and radar sweeps!
- **Zero-Flicker Double Buffering**:
  - Powered by [LovyanGFX](https://github.com/lovyan03/LovyanGFX), rendering to an offscreen sprite buffer before DMA composite transfer.
- **Turnkey Windows Agent**:
  - Auto-discovers the ESP32 COM port and streams CPU, GPU (NVIDIA / AMD / Intel), RAM, and network metrics via lightweight JSON packets.
  - One-click launcher (`run_agent.bat`) with auto virtual environment and dependency setup.
- **Desktop Preview Simulator**:
  - Interactive Python/Tkinter preview tool (`preview_simulator.py`) to test the animations and gauge behaviors on your PC with zero external dependencies!

---

## 📐 System Architecture

```
┌─────────────────────────────────┐                    ┌─────────────────────────────────┐
│           WINDOWS PC            │                    │         ESP32 DEV BOARD         │
│                                 │                    │                                 │
│  [Hardware Telemetry Agent]     │    USB Serial      │  [Core 0: Serial JSON Parser]   │
│  - psutil (CPU, RAM, Net)       ├───────────────────►│  [Core 1: LovyanGFX CVBS Engine]│
│  - pynvml (NVIDIA GPU / VRAM)   │   (115,200 baud)   │  - Double-buffered 320x240      │
│  - WMI / LibreHardwareMonitor   │                    │  - Radar, Gauges, Animations    │
└─────────────────────────────────┘                    └────────────────┬────────────────┘
                                                                        │
                                                                 GPIO 25│ (DAC1 Out)
                                                                 + 75Ω  │
                                                                        ▼
                                                       ┌─────────────────────────────────┐
                                                       │      4.3" LCD WITH AV INPUT     │
                                                       │                                 │
                                                       │   Yellow RCA ➔ Video In (CVBS)  │
                                                       │   Red Plug   ➔ 5V USB / 12V DC  │
                                                       └─────────────────────────────────┘
```

---

## 🛠️ Bill of Materials (BOM)

| Item | Details | Approx. Price |
| :--- | :--- | :--- |
| **ESP32 Dev Board** | Standard **ESP32-WROOM-32** or **NodeMCU-32S** (Dual-Core). *Note: ESP32-S2/S3/C3 do not have the internal DAC on GPIO 25.* | $3 – $5 |
| **4.3" LCD Screen** | Car backup monitor or security monitor with yellow RCA / AV input. | $12 – $18 |
| **Resistor** | 75Ω to 330Ω (1/4 Watt). 75Ω is standard for video impedance. | < $0.10 |
| **RCA Plug / Cable** | Cut from an old RCA cable or bare male RCA plug. | On hand |
| **USB Cable** | Micro-USB or USB-C (Data + Power). | On hand |

---

## ⚡ Wiring Schematic

```
      ESP32 BOARD                                       4.3" AV LCD
  ┌──────────────────┐                            ┌─────────────────────┐
  │                  │                            │                     │
  │          GPIO 25 ├───[ 75Ω Resistor ]────────►│ Yellow RCA Center   │ (Video Signal)
  │           (DAC1) │                            │                     │
  │              GND ├───────────────────────────►│ Yellow RCA Shield   │ (Video Ground)
  │                  │                            │                     │
  │              VIN ├───[ Direct 5V power ]─────►│ Red Power Jack (+)  │ (Most 12V LCDs
  │            (+5V) │                            │                     │  run on 5V!)
  │              GND ├───────────────────────────►│ Red Power Jack (-)  │ (Power Ground)
  └──────────────────┘                            └─────────────────────┘
```

> 📖 **Full Hardware Guide**: Read [`hardware/WIRING_GUIDE.md`](file:///Users/gagansharma/Documents/GitHub/cpu_dashboard_av_display/hardware/WIRING_GUIDE.md) and [`hardware/PINOUT_AND_SCHEMATIC.md`](file:///Users/gagansharma/Documents/GitHub/cpu_dashboard_av_display/hardware/PINOUT_AND_SCHEMATIC.md) for details on 5V vs 12V LCD power options.

---

## 🚀 Quick Start Guide

### 1. Flash the ESP32 Firmware

#### Option A: Using PlatformIO (Recommended)
```bash
cd firmware
pio run -t upload
```

#### Option B: Using Arduino IDE
1. Open Arduino IDE and add ESP32 board support.
2. In **Tools ➔ Manage Libraries**, install:
   - `LovyanGFX` (by lovyan03)
   - `ArduinoJson` (by Benoit Blanchon)
3. Open `firmware/src/main.cpp`, select **ESP32 Dev Module**, and click **Upload**.
*(See [`firmware/README.md`](file:///Users/gagansharma/Documents/GitHub/cpu_dashboard_av_display/firmware/README.md) for step-by-step instructions).*

---

### 2. Run the Windows Telemetry Agent

1. Plug the flashed ESP32 into a USB port on your Windows PC.
2. Navigate to the `windows_agent` folder:
3. Double-click **`run_agent.bat`**.

The batch script automatically:
- Creates a Python virtual environment.
- Installs `psutil`, `pyserial`, and `pynvml`.
- Auto-detects the ESP32 COM port and initiates streaming!

---

### 3. Test on Desktop with Preview Simulator (No Hardware Needed!)

Want to test how the Cyberpunk HUD looks and feels right now?
Launch the interactive desktop simulator (zero third-party dependencies required):

```bash
python3 simulator/preview_simulator.py
```

- **Auto Simulation**: Watch fluid sinusoidal metrics, animated radar sweep, and pulsing reactor.
- **Manual Sliders**: Adjust CPU/GPU sliders to observe gauge needle response.
- **Overheat Trigger**: Test the high-temperature warning alarm (`! HOT !`).

---

## ⚙️ Configuration & Customization

All firmware settings are centralized in [`firmware/include/config.h`](file:///Users/gagansharma/Documents/GitHub/cpu_dashboard_av_display/firmware/include/config.h):

- **NTSC vs. PAL**:
  ```cpp
  #define USE_NTSC 1   // 1 for NTSC (60 Hz), 0 for PAL (50 Hz)
  ```
- **Baud Rate**:
  ```cpp
  #define SERIAL_BAUD_RATE 115200
  ```
- **Temperature Warning Threshold**:
  ```cpp
  #define CPU_TEMP_WARN_THRESHOLD 80.0f
  #define GPU_TEMP_WARN_THRESHOLD 82.0f
  ```

---

## ❓ Frequently Asked Questions (FAQ)

### Q: My 4.3" LCD screen doesn't turn on (black or blue screen).
Most car backup displays have a power-saving circuit that **only turns on the backlight when a valid video signal is detected**. Ensure your ESP32 is powered and flashed. As soon as GPIO 25 outputs the NTSC signal, the screen wakes up automatically.

### Q: Does my 4.3" screen require 12V?
Although labeled "12V", most 4.3" car screens use an internal buck converter (such as XL1509 or MP1482) that steps down the voltage to 5V and 3.3V. Connect the display's power wire to the ESP32's `VIN` (5V) pin. If the backlight turns on, you don't need an external 12V supply. If not, use an inexpensive ($2) USB 5V-to-12V boost converter cable.

### Q: Why do I need a classic ESP32 rather than ESP32-S3?
The video signal is produced by the ESP32's built-in 8-bit digital-to-analog converter (DAC1 on GPIO 25). The newer ESP32-S2, ESP32-S3, and ESP32-C3 variants do not have this hardware DAC peripheral. Always use standard ESP32-WROOM-32 or NodeMCU-32S boards.

---

## 📜 License
This project is open-source under the MIT License. Feel free to modify, extend, and build upon it!
