# Pinout & Circuit Schematic

Detailed reference for the ESP32 pinouts and composite video circuit connections.

---

## 1. ESP32 DevKit 30-Pin Pinout Reference

```
                       ESP32-WROOM-32 (30-Pin)
                            ┌──────────┐
                     EN ───1│          │30─── CLK
             (ADC) GPIO 36 ───2│          │29─── GPIO 23 (VSPI MOSI)
             (ADC) GPIO 39 ───3│          │28─── GPIO 22 (I2C SCL)
             (ADC) GPIO 34 ───4│          │27─── GPIO 1  (U0 TXD)
             (ADC) GPIO 35 ───5│          │26─── GPIO 3  (U0 RXD)
             (ADC) GPIO 32 ───6│          │25─── GPIO 21 (I2C SDA)
             (ADC) GPIO 33 ───7│  [ESP32] │24─── GND
    (DAC2 / ADC) GPIO 26 ───8│          │23─── GPIO 19 (VSPI MISO)
 ★  (DAC1 / CVBS) GPIO 25 ───9│          │22─── GPIO 18 (VSPI SCK)  
             (ADC) GPIO 14 ──10│          │21─── GPIO 5  (VSPI SS)
             (ADC) GPIO 12 ──11│          │20─── NC
                   GND ──12│          │19─── GPIO 17 (U2 TXD)
             (ADC) GPIO 13 ──13│          │18─── GPIO 16 (U2 RXD)
                    D2 ──14│          │17─── GPIO 4
                    D3 ──15│          │16─── GPIO 0
                            └────┬┬────┘
                              [ Micro-USB ]
```

> **Pin 25 (GPIO 25 / DAC1)**: Dedicated analog composite video output pin.  
> **Pin 24 or 12 (GND)**: Video and power ground.  
> **VIN (5V)**: 5V power from USB.

---

## 2. Circuit Diagram

```
                 ESP32 BOARD
              ┌──────────────┐
              │              │
              │      GPIO 25 ├───[ 75Ω - 220Ω ]───o Video Out (+) ───o RCA Center (Yellow)
              │              │
              │          GND ├───┬────────────────o Video Out (-) ───o RCA Shield (Yellow)
              │              │   │
              │          VIN ├───┼────────────────o Power Out (+) ───o LCD DC Jack Center (+)
              │              │   │                                       (If 5V compatible)
              └──────────────┘   │
                                 └────────────────o Power Out (-) ───o LCD DC Jack Outer (-)
```

---

## 3. Signal Parameters

| Parameter | Value | Standard |
| :--- | :--- | :--- |
| **Output Type** | CVBS (Composite Video Baseband Signal) | NTSC / PAL |
| **Frame Rate** | 60 Hz (NTSC) / 50 Hz (PAL) | Progressive / Non-interlaced |
| **Resolution** | 320 x 240 pixels (active) | 4:3 Aspect Ratio |
| **Voltage Levels** | 0.0V (Sync tip), 0.3V (Blanking/Black), 1.0V (Max White) | IRE Standard |
| **Baud Rate** | 115,200 baud (Default) / 921,600 baud (High-speed) | Serial communication |
| **Frame Refresh** | 30 - 60 FPS smooth animation loop | Double-buffered sprite |
