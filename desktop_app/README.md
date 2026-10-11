# ⚡ AERO·SYNC // AIO & PC Cabinet Display Studio

A cross-platform hybrid desktop application and display studio for PC cabinet screens and 4.3" AV displays—inspired by **NZXT CAM**, **Corsair iCUE**, and **Hyte Nexus**.

---

## 🌟 Highlights

- **Virtual 4.3" Bezel Preview**:
  - Exact 1:1 hardware simulation of the 4.3" LCD screen inside a brushed titanium/carbon PC chassis with mounting screws, status LED, matte glass reflection, and CRT scanlines.
- **5 Gorgeous Display Themes**:
  1. **Cyberpunk HUD**: Vector arc gauges, rotating radar sweep, pulsing reactor core, and tech reticles.
  2. **Kraken AIO Dual Ring**: Liquid cooler style dual concentric rings for CPU and GPU temperatures.
  3. **Synthwave Outrun Grid**: 80s retro perspective grid, neon sun, and floating HUD glass cards.
  4. **Arc Reactor Core**: Concentric counter-rotating energy containment coils with pulsing core load.
  5. **Custom Wallpaper / GIF Studio**: Drag and drop any image or animated GIF with frosted-glass stat overlays!
- **Direct USB Hardware Streaming (Web Serial API)**:
  - Click **"Connect USB Display"** right from the interface (supported in Chrome, Edge, and Electron).
  - Automatically streams real-time JSON telemetry packets to the ESP32 over USB at 115,200 baud.
- **Pop-Out Mini Widget Mode**:
  - Pop out the live preview into a floating, always-on-top borderless mini-window for secondary case screens or desktop monitoring.
- **Cross-Platform Hybrid Architecture**:
  - Works on **Windows**, **macOS**, and **Linux**.

---

## 🚀 How to Run

### Method 1: Web / Local Studio Mode (Easiest & Fastest)

#### On Windows:
Double-click **`run_studio.bat`**.

#### On macOS or Linux:
Run in your terminal:
```bash
cd desktop_app
./run_studio.sh
```
Or with npm:
```bash
npm run dev
```
Open **`http://localhost:5173`** in Google Chrome or Microsoft Edge.

---

### Method 2: Native Electron Desktop App

To launch as an installed desktop window:
```bash
cd desktop_app
npm run electron
```

---

## 🔌 Connecting to Your Physical 4.3" LCD

1. Flash your ESP32 with the firmware located in [`firmware/`](../firmware).
2. Connect your ESP32 to your PC via USB.
3. In **AERO·SYNC Studio**, click the cyan **"Connect USB Display"** button in the top header.
4. Select your ESP32's COM port in the browser/app prompt.
5. The status badge will switch to **`USB: CONNECTED`**, and live hardware metrics will immediately begin streaming to the physical 4.3" screen!

---

## 🛠️ Tech Stack

- **Core**: Vanilla HTML5 Canvas & Modern ES6+ JavaScript.
- **Styling**: Vanilla CSS with glassmorphism, HSL neon palettes, and custom hardware bezels.
- **Bundler & Server**: Vite.
- **Desktop Shell**: Electron (with secure context isolation & IPC).
- **Serial Engine**: Chromium Web Serial API (`navigator.serial`).
- **Telemetry**: `systeminformation` (cross-platform OS metrics) & procedural sinusoidal generator.
