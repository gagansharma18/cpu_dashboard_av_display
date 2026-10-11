# ESP32 Firmware Guide

This firmware turns your ESP32 into a dedicated Cyberpunk Hardware Dashboard generator, outputting standard analog composite video (CVBS) via **GPIO 25**.

---

## Prerequisites
- **Hardware**: Standard ESP32 dev board (ESP32-WROOM-32 / NodeMCU-32S).
- **Video Pin**: Connect GPIO 25 through a 75Ω resistor to the Yellow RCA video plug.

---

## Method 1: Build & Flash with PlatformIO (Recommended)

PlatformIO automatically installs the ESP32 toolchain, `LovyanGFX`, and `ArduinoJson` libraries with zero manual setup.

### 1. Install PlatformIO Core or VS Code Extension
If you have VS Code, install the **PlatformIO IDE** extension. Or install via CLI:
```bash
pip install platformio
```

### 2. Connect ESP32 via USB and Flash
Navigate to the `firmware/` folder:
```bash
cd firmware
pio run -t upload
```

### 3. Open Serial Monitor (Optional)
```bash
pio device monitor -b 115200
```

---

## Method 2: Build & Flash with Arduino IDE

### 1. Install ESP32 Board Support
1. In Arduino IDE, open **File ➔ Preferences**.
2. Add to *Additional Board Manager URLs*:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to **Tools ➔ Board ➔ Boards Manager**, search for `esp32` (by Espressif Systems), and install version **2.0.17** or **3.x**.

### 2. Install Required Libraries
Open **Tools ➔ Manage Libraries...** and install:
1. **LovyanGFX** (by lovyan03) - Version 1.1.16 or newer.
2. **ArduinoJson** (by Benoit Blanchon) - Version 7.x.

### 3. Open the Sketch & Configure
1. Create a sketch named `firmware.ino` containing the code from `src/main.cpp`.
2. Copy `config.h`, `hud_renderer.h`, `hud_renderer.cpp`, and `serial_protocol.h` into the same folder.
3. Select Board: **Tools ➔ Board ➔ ESP32 Arduino ➔ ESP32 Dev Module**.
4. Set Upload Speed: **921600** (or 115200).
5. Select your COM Port and click **Upload**.

---

## Video Standard Configuration

In `include/config.h`:
```cpp
// Set to 1 for NTSC (60 Hz - standard for most car backup monitors)
// Set to 0 for PAL (50 Hz)
#define USE_NTSC 1
```
Most 4.3" car LCDs auto-detect both NTSC and PAL, but `USE_NTSC 1` provides a silky-smooth 60Hz scan rate.
