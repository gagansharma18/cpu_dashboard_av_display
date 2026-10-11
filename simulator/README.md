# Desktop Preview Simulator

A real-time, interactive simulator built using Python's native `tkinter` library. It replicates the exact 320x240 Cyberpunk HUD layout, animated radar, reactor core, gauges, and telemetry meters on your desktop **with zero external dependencies**!

---

## How to Run

From the root of the repository, execute:

```bash
python3 simulator/preview_simulator.py
```

---

## Features

1. **Auto Simulation Mode**:
   - Procedurally generates fluid sinusoidal CPU, GPU, RAM, VRAM, and Network spikes.
   - Showcases smooth needle damping/lerping, spinning radar sweeps, and pulsing reactor cores.

2. **Interactive Manual Sliders**:
   - Click **"Mode: AUTO SIMULATION"** to toggle to **MANUAL SLIDERS**.
   - Drag the CPU and GPU sliders to test how the dials, active track segments, and status badges react to dynamic load.

3. **Overheat Warning Test**:
   - Click the red **"Trigger Overheat"** button to simulate thermal throttling (>90°C), triggering the blinking `! HOT !` alert and `CORE STRESS` warning badges.
