# ESP32 Cyberpunk AV System Dashboard
### Hardware Wiring & Connection Guide

This guide explains how to connect your **4.3-inch LCD with AV (Composite/CVBS) input** to an **ESP32 development board** and power it via USB from your PC.

---

## 1. Components & Bill of Materials (BOM)

| Item | Description | Approx. Cost | Notes |
| :--- | :--- | :--- | :--- |
| **ESP32 Dev Board** | ESP32-WROOM-32 / NodeMCU-32S / ESP32-DevKitC | $3 - $5 | **Must be classic ESP32** (ESP32-D0WDQ6) with hardware DAC on GPIO 25. *Do NOT use ESP32-S2, S3, or C3 as they lack the I2S DAC.* |
| **4.3" LCD with AV Input** | Car backup monitor / mini CVBS TFT display | $12 - $18 | Typically has Yellow RCA (Video 1), White RCA (Video 2), Red DC 5.5x2.1mm jack (Power). |
| **Resistor** | 75Ω to 330Ω (1/4W) | < $0.10 | 75Ω is ideal for standard video impedance matching. 100Ω or 220Ω also works well. |
| **USB Cable** | Micro-USB or USB-C (data + power) | On hand | Connects ESP32 to PC. |
| **RCA Cable / Connector** | Male RCA plug or bare RCA wire | On hand | Cuts open to expose Signal (center) and Ground (outer shield). |
| **Power Source** | USB 5V or 5V-to-12V booster | $1 - $3 | See power options below. |

---

## 2. Wiring Schematic

```
                          ┌──────────────────────────┐
                          │   ESP32-WROOM-32 BOARD   │
                          │                          │
   PC USB PORT ═══════════╡ [Micro-USB / USB-C]      │
   (Data & 5V Power)      │                          │
                          │                  GPIO 25 ├─────[ 75Ω Resistor ]───┐
                          │                   (DAC1) │                         │
                          │                          │                         │
                          │                      GND ├─────────────────┐       │
                          │                          │                 │       │
                          │                      VIN ├───────┐         │       │
                          │                     (+5V)│       │         │       │
                          └──────────────────────────┘       │         │       │
                                                             │         │       │
                                                             │         │       │
      ┌──────────────────────────────────────────────────────┘         │       │
      │                                                                │       │
      ▼                                                                ▼       ▼
┌──────────────┐                                                 ┌───────────────────┐
│ POWER IN     │                                                 │ AV / VIDEO INPUT  │
│ (Red Jack)   │                                                 │ (Yellow RCA Jack) │
│              │                                                 │                   │
│ Center Pin:  │ ── +5V (or +12V)                                │ Center Pin:       │ ◄── Video Signal
│ Outer Ring:  │ ── GND ─────────────────────────────────────────┤ Outer Shield:     │ ◄── Video Ground
└──────────────┘                                                 └───────────────────┘
```

---

## 3. Step-by-Step Pin Connections

### A. Video Signal Connection (AV / CVBS)
1. Take a spare RCA cable with a yellow connector (or cut a standard RCA audio/video cable).
2. Strip the wire to reveal:
   - **Center core wire**: Video Signal (+).
   - **Outer braided shield**: Video Ground (-).
3. Solder or connect:
   - **ESP32 GPIO 25** ➔ **75Ω Resistor** ➔ **RCA Center Core Wire**
   - **ESP32 GND** ➔ **RCA Outer Braided Shield**

> **Why the 75Ω resistor?**  
> Standard composite video expects a 75Ω transmission line and 1.0V peak-to-peak voltage. ESP32 DAC outputs up to 3.3V. The internal 75Ω load of the display combined with an inline 75Ω - 220Ω resistor steps the voltage down to the exact standard video level and prevents signal reflections and ghosting.

---

### B. Display Power Connection (5V vs 12V)

Most 4.3" car backup monitors are labeled `12V DC`, but **90% of them internally run at 5V and 3.3V**:

#### Option 1: Direct 5V Power from USB (Easiest)
- Connect display **Power Positive (+)** to **ESP32 `VIN` / `5V` pin**.
- Connect display **Power Negative (-)** to **ESP32 `GND` pin**.
- Test it: Plug the ESP32 into a high-current USB port (USB 3.0 or 2A phone charger/PC USB port). If the display turns on and lights up, you don't need any external power brick!

#### Option 2: 5V to 12V USB Step-Up Cable
If your specific LCD panel strictly requires 12V to turn on its backlight:
- Use an inexpensive **USB 5V to 12V DC boost cable** (available on Amazon/AliExpress for ~$2.50 with a 5.5mm DC barrel plug).
- Plug both the ESP32 and the 12V boost cable into adjacent PC USB ports.
- Ensure **all GND lines are tied together** (common ground).

#### Option 3: Direct 12V from PC Power Supply (Internal Mounting)
If you are mounting the display inside a desktop PC case:
- Tap into a SATA power connector or Molex connector:
  - **Yellow wire**: +12V ➔ LCD Power In (+)
  - **Black wire**: GND ➔ LCD Power In (-) & ESP32 GND

---

## 4. Signal Auto-Detection on 4.3" LCDs

Most 4.3" car displays feature a power-saving circuit that **puts the screen to sleep when no video signal is present**.
- When the ESP32 is powered off or not generating video, the screen remains dark/black or blue.
- As soon as the ESP32 firmware initializes the DAC video carrier on GPIO 25, the screen wakes up automatically and renders the Cyberpunk HUD.
- If your screen has two inputs (Yellow = Video 1, White = Video 2), plug into **Video 1 (Yellow)** as it has top priority.

---

## 5. Verification Checklist

- [ ] ESP32 is a classic **dual-core ESP32** (not ESP32-S2/S3/C3).
- [ ] Signal line connected to **GPIO 25**.
- [ ] Common ground connected between ESP32 and LCD AV ground.
- [ ] 75Ω to 220Ω series resistor installed on the signal line.
- [ ] Display powers on and backlight activates when video signal is driven.
