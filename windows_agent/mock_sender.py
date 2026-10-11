#!/usr/bin/env python3
"""
ESP32 Cyberpunk AV Dashboard - Mock Telemetry Sender
Sends simulated / demo hardware metrics over USB Serial to test the ESP32 display.
"""

import sys
import time
import json
import math
import argparse
from datetime import datetime

try:
    import serial
    import serial.tools.list_ports
except ImportError:
    print("[ERROR] 'pyserial' is not installed. Please run: pip install pyserial")
    sys.exit(1)


def find_esp32_port():
    ports = list(serial.tools.list_ports.comports())
    if not ports:
        return None
    known_chips = ["cp210", "ch340", "ftdi", "silicon labs", "usb-serial", "ch9102", "esp32"]
    for p in ports:
        desc = (p.description or "").lower() + " " + (p.manufacturer or "").lower()
        if any(chip in desc for chip in known_chips):
            return p.device
    return ports[0].device


def main():
    parser = argparse.ArgumentParser(description="Mock Telemetry Sender for ESP32 Dashboard")
    parser.add_argument("--port", type=str, default=None, help="Serial port (e.g., COM3, COM4)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--interval", type=float, default=0.5, help="Update interval (default: 0.5s)")
    args = parser.parse_args()

    port = args.port or find_esp32_port()
    if not port:
        print("[ERROR] No serial ports found. Please connect ESP32 via USB.")
        sys.exit(1)

    print(f"[CONNECTING] Opening {port} at {args.baud} baud...")
    ser = serial.Serial(port, args.baud, timeout=1.0)
    time.sleep(1.5)
    ser.write(b"PING\n")

    print("[STREAMING] Sending simulated Cyberpunk telemetry stream... Press Ctrl+C to stop.")

    t = 0.0
    try:
        while True:
            # Generate fluctuating synthetic telemetry
            cpu = max(5.0, min(98.0, 45.0 + 35.0 * math.sin(t * 0.8) + 12.0 * math.cos(t * 2.1)))
            cpu_t = round(48.0 + (cpu * 0.3), 1)

            gpu = max(2.0, min(99.0, 52.0 + 40.0 * math.sin(t * 1.1 + 1.2)))
            gpu_t = round(44.0 + (gpu * 0.35), 1)
            vram = round(max(10.0, min(95.0, 50.0 + 25.0 * math.sin(t * 0.5))), 1)

            ram = round(60.0 + 10.0 * math.sin(t * 0.3), 1)
            ram_total = 32.0
            ram_used = round(ram_total * (ram / 100.0), 1)

            net_d = round(abs(15.2 * math.sin(t * 1.5) + 6.0 * math.cos(t * 3.0)), 1)
            net_u = round(abs(3.8 * math.cos(t * 1.1)), 1)

            clock_str = datetime.now().strftime("%H:%M:%S")

            payload = {
                "cpu": round(cpu, 1),
                "cpu_t": cpu_t,
                "gpu": round(gpu, 1),
                "gpu_t": gpu_t,
                "ram": ram,
                "ram_u": ram_used,
                "ram_t": ram_total,
                "vram": vram,
                "net_d": net_d,
                "net_u": net_u,
                "time": clock_str
            }

            line = json.dumps(payload, separators=(',', ':')) + "\n"
            ser.write(line.encode("utf-8"))

            print(f"\r[MOCK] CPU: {cpu:4.1f}% ({cpu_t}°C) | GPU: {gpu:4.1f}% ({gpu_t}°C) | RAM: {ram:4.1f}% | DL: {net_d:4.1f}MB/s", end="", flush=True)

            t += 0.2
            time.sleep(args.interval)

    except KeyboardInterrupt:
        print("\n[STOPPED] Mock stream ended.")
    finally:
        ser.close()


if __name__ == "__main__":
    main()
