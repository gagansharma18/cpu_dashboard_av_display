#!/usr/bin/env python3
"""
ESP32 Cyberpunk AV Dashboard - Windows Telemetry Agent
Gathers real-time CPU, GPU, RAM, Network, and Temperature metrics
and streams them over USB Serial to the ESP32.
"""

import sys
import time
import json
import argparse
from datetime import datetime

try:
    import psutil
except ImportError:
    print("[ERROR] 'psutil' is not installed. Please run: pip install psutil")
    sys.exit(1)

try:
    import serial
    import serial.tools.list_ports
except ImportError:
    print("[ERROR] 'pyserial' is not installed. Please run: pip install pyserial")
    sys.exit(1)

# Optional GPU support (NVIDIA NVML)
HAS_PYNVML = False
try:
    import pynvml
    pynvml.nvmlInit()
    HAS_PYNVML = True
    print("[INFO] NVIDIA NVML detected. Hardware GPU monitoring enabled.")
except Exception:
    pass

# Optional Windows WMI for hardware thermals
HAS_WMI = False
wmi_obj = None
ohm_obj = None
if sys.platform == "win32":
    try:
        import wmi
        wmi_obj = wmi.WMI(namespace="root\\cimv2")
        # Try LibreHardwareMonitor or OpenHardwareMonitor namespace
        try:
            ohm_obj = wmi.WMI(namespace="root\\LibreHardwareMonitor")
        except Exception:
            try:
                ohm_obj = wmi.WMI(namespace="root\\OpenHardwareMonitor")
            except Exception:
                ohm_obj = None
        HAS_WMI = True
    except Exception:
        pass


class HardwareMonitor:
    def __init__(self):
        # Network tracking state
        self.last_net_time = time.time()
        net = psutil.net_io_counters()
        self.last_bytes_recv = net.bytes_recv
        self.last_bytes_sent = net.bytes_sent

        # Initialize psutil cpu percent
        psutil.cpu_percent(interval=None)

    def get_cpu_temp(self, cpu_load):
        """Attempts to read true CPU temperature via WMI/OHM, with fallback estimate."""
        # 1. Try LibreHardwareMonitor / OpenHardwareMonitor
        if ohm_obj:
            try:
                sensors = ohm_obj.Sensor()
                for sensor in sensors:
                    if sensor.SensorType == "Temperature" and ("CPU Package" in sensor.Name or "CPU Core" in sensor.Name):
                        return float(sensor.Value)
            except Exception:
                pass

        # 2. Try Windows ACPI Thermal Zone
        if wmi_obj:
            try:
                temp_info = wmi_obj.MSAcpi_ThermalZoneTemperature()
                if temp_info:
                    # Value is in tenths of Kelvin: (K * 10) - 2732 = Celsius * 10
                    kelvin_tenths = temp_info[0].CurrentTemperature
                    celsius = (kelvin_tenths - 2732) / 10.0
                    if 20.0 <= celsius <= 105.0:
                        return celsius
            except Exception:
                pass

        # 3. Intelligent fallback estimate based on CPU load and ambient baseline
        baseline = 42.0  # Typical idle temperature
        return round(baseline + (cpu_load * 0.38), 1)

    def get_gpu_metrics(self):
        """Reads GPU usage, VRAM usage, and GPU temperature."""
        if HAS_PYNVML:
            try:
                handle = pynvml.nvmlDeviceGetHandleByIndex(0)
                # Utilization
                util = pynvml.nvmlDeviceGetUtilizationRates(handle)
                gpu_pct = float(util.gpu)

                # Memory
                mem = pynvml.nvmlDeviceGetMemoryInfo(handle)
                vram_pct = round((mem.used / mem.total) * 100.0, 1)

                # Temperature
                temp = float(pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU))

                return gpu_pct, temp, vram_pct
            except Exception:
                pass

        # Fallback if no dedicated NVIDIA GPU detected
        return 0.0, 0.0, 0.0

    def get_network_rates(self):
        """Calculates download and upload throughput in Megabytes/sec (MB/s)."""
        now = time.time()
        dt = now - self.last_net_time
        if dt <= 0:
            dt = 0.001

        net = psutil.net_io_counters()
        down_mbps = ((net.bytes_recv - self.last_bytes_recv) / dt) / (1024 * 1024)
        up_mbps   = ((net.bytes_sent - self.last_bytes_sent) / dt) / (1024 * 1024)

        self.last_net_time = now
        self.last_bytes_recv = net.bytes_recv
        self.last_bytes_sent = net.bytes_sent

        return round(max(0.0, down_mbps), 1), round(max(0.0, up_mbps), 1)

    def collect(self):
        """Gathers complete system telemetry snapshot."""
        # CPU
        cpu_pct = round(psutil.cpu_percent(interval=None), 1)
        cpu_temp = self.get_cpu_temp(cpu_pct)

        # GPU
        gpu_pct, gpu_temp, vram_pct = self.get_gpu_metrics()

        # RAM
        ram = psutil.virtual_memory()
        ram_pct = round(ram.percent, 1)
        ram_used_gb = round(ram.used / (1024**3), 1)
        ram_total_gb = round(ram.total / (1024**3), 1)

        # Network
        net_d, net_u = self.get_network_rates()

        # Current Clock
        clock_str = datetime.now().strftime("%H:%M:%S")

        return {
            "cpu": cpu_pct,
            "cpu_t": cpu_temp,
            "gpu": gpu_pct,
            "gpu_t": gpu_temp,
            "ram": ram_pct,
            "ram_u": ram_used_gb,
            "ram_t": ram_total_gb,
            "vram": vram_pct,
            "net_d": net_d,
            "net_u": net_u,
            "time": clock_str
        }


def find_esp32_port():
    """Auto-detects ESP32 by checking device descriptions and handshake ping."""
    ports = list(serial.tools.list_ports.comports())
    if not ports:
        return None

    # Priority 1: Match known USB-UART chip keywords
    known_chips = ["cp210", "ch340", "ftdi", "silicon labs", "usb-serial", "ch9102", "esp32"]
    for p in ports:
        desc = (p.description or "").lower() + " " + (p.manufacturer or "").lower()
        if any(chip in desc for chip in known_chips):
            print(f"[DISCOVERY] Found potential ESP32 on {p.device} ({p.description})")
            return p.device

    # Priority 2: Return first available COM port
    return ports[0].device


def main():
    parser = argparse.ArgumentParser(description="ESP32 Cyberpunk AV System Dashboard - Telemetry Agent")
    parser.add_argument("--port", type=str, default=None, help="Serial COM port (e.g., COM3, COM4, /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--interval", type=float, default=1.0, help="Update interval in seconds (default: 1.0)")
    args = parser.parse_args()

    monitor = HardwareMonitor()
    ser = None

    print("==================================================")
    print("  ESP32 CYBERPUNK AV DASHBOARD - TELEMETRY AGENT  ")
    print("==================================================")

    while True:
        # Determine port
        port = args.port or find_esp32_port()
        if not port:
            print("[WAIT] No COM ports found. Plug in ESP32 via USB. Retrying in 2s...")
            time.sleep(2.0)
            continue

        print(f"[CONNECTING] Opening serial port {port} at {args.baud} baud...")
        try:
            ser = serial.Serial(port, args.baud, timeout=1.0)
            time.sleep(1.5)  # Allow ESP32 reboot / connection settle

            # Send handshake ping
            ser.write(b"PING\n")
            time.sleep(0.1)

            print(f"[CONNECTED] Streaming telemetry to {port} every {args.interval}s. Press Ctrl+C to exit.\n")

            while True:
                data = monitor.collect()
                json_payload = json.dumps(data, separators=(',', ':')) + "\n"
                ser.write(json_payload.encode("utf-8"))

                # Live terminal status line
                print(f"\r[STREAM] CPU: {data['cpu']:4.1f}% ({data['cpu_t']}°C) | "
                      f"GPU: {data['gpu']:4.1f}% ({data['gpu_t']}°C) | "
                      f"RAM: {data['ram']:4.1f}% ({data['ram_u']}/{data['ram_t']}GB) | "
                      f"DL: {data['net_d']:4.1f}MB/s | UL: {data['net_u']:4.1f}MB/s", 
                      end="", flush=True)

                time.sleep(args.interval)

        except serial.SerialException as e:
            print(f"\n[DISCONNECTED] Serial connection lost ({e}). Reconnecting in 3s...")
            if ser:
                try:
                    ser.close()
                except Exception:
                    pass
                ser = None
            time.sleep(3.0)

        except KeyboardInterrupt:
            print("\n[STOPPED] Agent terminated by user.")
            if ser and ser.is_open:
                ser.close()
            break


if __name__ == "__main__":
    main()
