#!/usr/bin/env python3
"""
ESP32 Cyberpunk AV Dashboard - Desktop Preview Simulator
Interactive Tkinter-based simulator that replicates the exact 320x240 Cyberpunk HUD
graphics, animations, and gauges on your desktop with ZERO external dependencies!
"""

import math
import time
from datetime import datetime
import tkinter as tk
from tkinter import ttk

# Screen dimensions
NATIVE_W = 320
NATIVE_H = 240
SCALE = 2.5  # 800 x 600 display window
WIN_W = int(NATIVE_W * SCALE)
WIN_H = int(NATIVE_H * SCALE)

# Cyberpunk Palette
COLOR_BG          = "#050811"  # Deep obsidian void
COLOR_GRID        = "#0f1a28"  # Subtle radar grid lines
COLOR_FRAME_DARK  = "#1a2c42"  # Inactive segments
COLOR_FRAME_MID   = "#416584"  # Reticles, labels, brackets
COLOR_ACTIVE      = "#00c3ff"  # Electric Cyan
COLOR_BRIGHT      = "#64d8ff"  # High priority readouts
COLOR_NEON_GLOW   = "#ffffff"  # Peak highlights, radar beam
COLOR_WARN        = "#ff0055"  # Overheat / Critical alert
COLOR_WARN_TEXT   = "#ff4070"


class CyberHudSimulator:
    def __init__(self, root):
        self.root = root
        self.root.title("ESP32 Cyberpunk AV Dashboard - Desktop Preview")
        self.root.configure(bg="#020408")
        self.root.resizable(False, False)

        # Simulation state
        self.auto_sim = True
        self.sim_time = 0.0
        self.frame_count = 0

        # Telemetry values
        self.cpu = 45.0
        self.cpu_target = 45.0
        self.cpu_temp = 58.0

        self.gpu = 68.0
        self.gpu_target = 68.0
        self.gpu_temp = 64.0

        self.ram = 62.0
        self.ram_used = 9.9
        self.ram_total = 16.0

        self.vram = 54.0
        self.net_dl = 14.2
        self.net_ul = 2.4

        # Animations
        self.radar_angle = 0.0
        self.pulse_phase = 0.0

        # Create Layout
        self.create_widgets()

        # Start render loop (~35 FPS)
        self.last_update = time.time()
        self.update_loop()

    def sx(self, x):
        return x * SCALE

    def sy(self, y):
        return y * SCALE

    def create_widgets(self):
        main_frame = tk.Frame(self.root, bg="#020408")
        main_frame.pack(padx=12, pady=12)

        # Canvas replicating the 320x240 LCD
        self.canvas = tk.Canvas(main_frame, width=WIN_W, height=WIN_H, bg=COLOR_BG, highlightthickness=1, highlightbackground="#00f0ff")
        self.canvas.pack()

        # Controls panel
        ctrl_frame = tk.Frame(main_frame, bg="#0a101d", pady=8, padx=12)
        ctrl_frame.pack(fill=tk.X, pady=(10, 0))

        # Auto simulation toggle
        self.btn_mode = tk.Button(ctrl_frame, text="Mode: AUTO SIMULATION (Playing)", 
                                  bg="#00c3ff", fg="#000000", font=("Helvetica", 10, "bold"),
                                  activebackground="#64d8ff", command=self.toggle_mode, relief=tk.FLAT)
        self.btn_mode.pack(side=tk.LEFT, padx=5)

        # Sliders container
        self.slider_frame = tk.Frame(ctrl_frame, bg="#0a101d")
        self.slider_frame.pack(side=tk.RIGHT)

        # CPU slider
        tk.Label(self.slider_frame, text="CPU:", bg="#0a101d", fg="#64d8ff", font=("Helvetica", 9)).pack(side=tk.LEFT, padx=(10, 2))
        self.cpu_slider = tk.Scale(self.slider_frame, from_=0, to_=100, orient=tk.HORIZONTAL, 
                                   bg="#0a101d", fg="#ffffff", highlightthickness=0, length=90,
                                   command=self.on_cpu_slider)
        self.cpu_slider.set(45)
        self.cpu_slider.pack(side=tk.LEFT)

        # GPU slider
        tk.Label(self.slider_frame, text="GPU:", bg="#0a101d", fg="#64d8ff", font=("Helvetica", 9)).pack(side=tk.LEFT, padx=(10, 2))
        self.gpu_slider = tk.Scale(self.slider_frame, from_=0, to_=100, orient=tk.HORIZONTAL, 
                                   bg="#0a101d", fg="#ffffff", highlightthickness=0, length=90,
                                   command=self.on_gpu_slider)
        self.gpu_slider.set(68)
        self.gpu_slider.pack(side=tk.LEFT)

        # Overheat toggle
        self.btn_overheat = tk.Button(self.slider_frame, text="Trigger Overheat", 
                                      bg="#ff0055", fg="#ffffff", font=("Helvetica", 9, "bold"),
                                      activebackground="#ff4070", command=self.trigger_overheat, relief=tk.FLAT)
        self.btn_overheat.pack(side=tk.LEFT, padx=(15, 0))

    def toggle_mode(self):
        self.auto_sim = not self.auto_sim
        if self.auto_sim:
            self.btn_mode.config(text="Mode: AUTO SIMULATION (Playing)", bg="#00c3ff", fg="#000000")
        else:
            self.btn_mode.config(text="Mode: MANUAL SLIDERS (Paused)", bg="#ff9900", fg="#000000")

    def trigger_overheat(self):
        self.cpu_target = 98.0
        self.cpu_temp = 92.0
        self.gpu_target = 96.0
        self.gpu_temp = 89.0
        self.cpu_slider.set(98)
        self.gpu_slider.set(96)

    def on_cpu_slider(self, val):
        if not self.auto_sim:
            self.cpu_target = float(val)
            self.cpu_temp = round(42.0 + (self.cpu_target * 0.45), 1)

    def on_gpu_slider(self, val):
        if not self.auto_sim:
            self.gpu_target = float(val)
            self.gpu_temp = round(40.0 + (self.gpu_target * 0.42), 1)

    def update_loop(self):
        now = time.time()
        dt = now - self.last_update
        self.last_update = now

        self.frame_count += 1
        if self.auto_sim:
            self.sim_time += dt
            t = self.sim_time
            # Simulated smooth telemetry
            self.cpu_target = max(5.0, min(98.0, 45.0 + 35.0 * math.sin(t * 0.9) + 12.0 * math.cos(t * 2.3)))
            self.cpu_temp = round(44.0 + (self.cpu_target * 0.35), 1)

            self.gpu_target = max(2.0, min(99.0, 55.0 + 40.0 * math.sin(t * 1.2 + 1.2)))
            self.gpu_temp = round(42.0 + (self.gpu_target * 0.38), 1)
            self.vram = round(max(10.0, min(95.0, 52.0 + 25.0 * math.sin(t * 0.5))), 1)

            self.ram = round(62.0 + 8.0 * math.sin(t * 0.3), 1)
            self.ram_used = round(self.ram_total * (self.ram / 100.0), 1)

            self.net_dl = round(abs(15.2 * math.sin(t * 1.5) + 5.0 * math.cos(t * 3.1)), 1)
            self.net_ul = round(abs(3.8 * math.cos(t * 1.1)), 1)

            # Update sliders display
            self.cpu_slider.set(int(self.cpu_target))
            self.gpu_slider.set(int(self.gpu_target))

        # Smooth interpolation
        self.cpu += (self.cpu_target - self.cpu) * 0.15
        self.gpu += (self.gpu_target - self.gpu) * 0.15

        # Spin radar & pulse core
        self.radar_angle = (self.radar_angle + 3.5 + (self.cpu * 0.05)) % 360.0
        self.pulse_phase = (self.pulse_phase + 0.08 + (self.cpu * 0.002)) % 6.28318

        # Draw frame
        self.render_frame()

        # Schedule next frame (~30ms = 33 FPS)
        self.root.after(30, self.update_loop)

    def render_frame(self):
        self.canvas.delete("all")

        # 1. Background Grid
        for y in range(28, 180, 24):
            self.canvas.create_line(self.sx(8), self.sy(y), self.sx(NATIVE_W - 8), self.sy(y), fill=COLOR_GRID)
        for x in range(16, NATIVE_W - 8, 32):
            self.canvas.create_line(self.sx(x), self.sy(28), self.sx(x), self.sy(176), fill=COLOR_GRID)

        # 2. Tech Corner Brackets
        b_len = 10
        # Top-Left
        self.canvas.create_line(self.sx(4), self.sy(4), self.sx(4 + b_len), self.sy(4), fill=COLOR_FRAME_MID, width=2)
        self.canvas.create_line(self.sx(4), self.sy(4), self.sx(4), self.sy(4 + b_len), fill=COLOR_FRAME_MID, width=2)
        # Top-Right
        self.canvas.create_line(self.sx(NATIVE_W - 4 - b_len), self.sy(4), self.sx(NATIVE_W - 4), self.sy(4), fill=COLOR_FRAME_MID, width=2)
        self.canvas.create_line(self.sx(NATIVE_W - 4), self.sy(4), self.sx(NATIVE_W - 4), self.sy(4 + b_len), fill=COLOR_FRAME_MID, width=2)
        # Bottom-Left
        self.canvas.create_line(self.sx(4), self.sy(NATIVE_H - 4), self.sx(4 + b_len), self.sy(NATIVE_H - 4), fill=COLOR_FRAME_MID, width=2)
        self.canvas.create_line(self.sx(4), self.sy(NATIVE_H - 4 - b_len), self.sx(4), self.sy(NATIVE_H - 4), fill=COLOR_FRAME_MID, width=2)
        # Bottom-Right
        self.canvas.create_line(self.sx(NATIVE_W - 4 - b_len), self.sy(NATIVE_H - 4), self.sx(NATIVE_W - 4), self.sy(NATIVE_H - 4), fill=COLOR_FRAME_MID, width=2)
        self.canvas.create_line(self.sx(NATIVE_W - 4), self.sy(NATIVE_H - 4 - b_len), self.sx(NATIVE_W - 4), self.sy(NATIVE_H - 4), fill=COLOR_FRAME_MID, width=2)

        # 3. Top Header Bar
        self.canvas.create_line(self.sx(6), self.sy(22), self.sx(NATIVE_W - 6), self.sy(22), fill=COLOR_FRAME_MID)
        self.canvas.create_text(self.sx(10), self.sy(12), text="// CYBER_HUD_AV", fill=COLOR_BRIGHT, 
                                font=("Courier", int(8 * SCALE), "bold"), anchor="w")

        # Online Status Badge
        blink = (self.frame_count % 30) < 22
        status_x = 115
        if blink:
            self.canvas.create_oval(self.sx(status_x), self.sy(9), self.sx(status_x + 6), self.sy(15), fill=COLOR_ACTIVE, outline="")
        self.canvas.create_text(self.sx(status_x + 10), self.sy(12), text="LINK_ONLINE", fill=COLOR_ACTIVE, 
                                font=("Courier", int(7 * SCALE), "bold"), anchor="w")

        # System Clock
        clock_str = datetime.now().strftime("%H:%M:%S")
        self.canvas.create_text(self.sx(NATIVE_W - 10), self.sy(12), text=clock_str, fill=COLOR_NEON_GLOW, 
                                font=("Courier", int(8 * SCALE), "bold"), anchor="e")

        # 4. Left Arc Gauge - CPU Core
        self.draw_arc_gauge(52, 98, 38, 135.0, 405.0, self.cpu, 100.0, "CPU CORE", "%", self.cpu_temp)

        # 5. Center Radar & Core Matrix
        self.draw_center_radar(160, 98, 44, self.cpu)

        # 6. Right Arc Gauge - GPU Core
        self.draw_arc_gauge(268, 98, 38, 135.0, 405.0, self.gpu, 100.0, "GPU CORE", "%", self.gpu_temp)

        # 7. Bottom Tray - RAM & Network
        self.draw_bottom_stats()

    def draw_arc_gauge(self, cx, cy, r, start_deg, end_deg, current_val, max_val, title, unit, temp):
        sweep = end_deg - start_deg
        pct = max(0.0, min(1.0, current_val / max_val))
        total_segments = 24
        active_segments = int(round(pct * total_segments))

        # Title
        self.canvas.create_text(self.sx(cx), self.sy(cy - r - 9), text=title, fill=COLOR_FRAME_MID, 
                                font=("Courier", int(7 * SCALE), "bold"))

        # Segmented circular track
        for i in range(total_segments):
            angle = math.radians(start_deg + (i * (sweep / total_segments)))
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)

            x1 = cx + (r - 5) * cos_a
            y1 = cy + (r - 5) * sin_a
            x2 = cx + r * cos_a
            y2 = cy + r * sin_a

            seg_color = COLOR_ACTIVE if (i < active_segments) else COLOR_FRAME_DARK
            if i == active_segments - 1 and i > 0:
                seg_color = COLOR_NEON_GLOW

            self.canvas.create_line(self.sx(x1), self.sy(y1), self.sx(x2), self.sy(y2), 
                                    fill=seg_color, width=int(1.8 * SCALE))

        # Numerical readout
        val_str = f"{int(round(current_val))}{unit}"
        self.canvas.create_text(self.sx(cx), self.sy(cy - 2), text=val_str, fill=COLOR_NEON_GLOW, 
                                font=("Courier", int(14 * SCALE), "bold"))

        # Temp readout
        is_hot = temp > 80.0
        if is_hot and (self.frame_count % 16 < 8):
            self.canvas.create_text(self.sx(cx), self.sy(cy + 18), text="! HOT !", fill=COLOR_WARN, 
                                    font=("Courier", int(8 * SCALE), "bold"))
        else:
            temp_str = f"{int(round(temp))} C"
            self.canvas.create_text(self.sx(cx), self.sy(cy + 18), text=temp_str, 
                                    fill=COLOR_WARN_TEXT if is_hot else COLOR_ACTIVE, 
                                    font=("Courier", int(7 * SCALE)))

    def draw_center_radar(self, cx, cy, r, cpu_load):
        # Reticle Rings
        self.canvas.create_oval(self.sx(cx - r), self.sy(cy - r), self.sx(cx + r), self.sy(cy + r), 
                                outline=COLOR_FRAME_MID, width=int(1 * SCALE))
        self.canvas.create_oval(self.sx(cx - (r - 8)), self.sy(cy - (r - 8)), self.sx(cx + (r - 8)), self.sy(cy + (r - 8)), 
                                outline=COLOR_FRAME_DARK)
        self.canvas.create_oval(self.sx(cx - (r // 2)), self.sy(cy - (r // 2)), self.sx(cx + (r // 2)), self.sy(cy + (r // 2)), 
                                outline=COLOR_FRAME_DARK)

        # Cardinal crosshairs
        self.canvas.create_line(self.sx(cx - r - 4), self.sy(cy), self.sx(cx - r + 4), self.sy(cy), fill=COLOR_FRAME_MID)
        self.canvas.create_line(self.sx(cx + r - 4), self.sy(cy), self.sx(cx + r + 4), self.sy(cy), fill=COLOR_FRAME_MID)
        self.canvas.create_line(self.sx(cx), self.sy(cy - r - 4), self.sx(cx), self.sy(cy - r + 4), fill=COLOR_FRAME_MID)
        self.canvas.create_line(self.sx(cx), self.sy(cy + r - 4), self.sx(cx), self.sy(cy + r + 4), fill=COLOR_FRAME_MID)

        # Rotating Radar Beam
        r_rad = math.radians(self.radar_angle)
        beam_x = cx + (r - 1) * math.cos(r_rad)
        beam_y = cy + (r - 1) * math.sin(r_rad)
        self.canvas.create_line(self.sx(cx), self.sy(cy), self.sx(beam_x), self.sy(beam_y), 
                                fill=COLOR_NEON_GLOW, width=int(1.5 * SCALE))

        # Secondary faint trail beam
        trail_rad = math.radians(self.radar_angle - 14.0)
        trail_x = cx + (r - 4) * math.cos(trail_rad)
        trail_y = cy + (r - 4) * math.sin(trail_rad)
        self.canvas.create_line(self.sx(cx), self.sy(cy), self.sx(trail_x), self.sy(trail_y), 
                                fill=COLOR_FRAME_MID, width=int(1 * SCALE))

        # Pulsing Reactor Hexagon
        pulse = 0.5 + 0.5 * math.sin(self.pulse_phase)
        core_r = 7 + (pulse * (4.0 + (cpu_load * 0.05)))

        hex_pts = []
        for i in range(6):
            h_ang = math.radians(i * 60.0)
            hx = cx + core_r * math.cos(h_ang)
            hy = cy + core_r * math.sin(h_ang)
            hex_pts.extend([self.sx(hx), self.sy(hy)])
        self.canvas.create_polygon(hex_pts, outline=COLOR_NEON_GLOW, fill="", width=int(1.2 * SCALE))
        self.canvas.create_oval(self.sx(cx - 2), self.sy(cy - 2), self.sx(cx + 2), self.sy(cy + 2), fill=COLOR_NEON_GLOW, outline="")

        # Status text below radar
        if cpu_load > 85.0:
            warn_blink = (self.frame_count % 16) < 8
            self.canvas.create_text(self.sx(cx), self.sy(cy + r + 5), text="CORE STRESS", 
                                    fill=COLOR_WARN if warn_blink else COLOR_FRAME_DARK, 
                                    font=("Courier", int(7 * SCALE), "bold"))
        else:
            self.canvas.create_text(self.sx(cx), self.sy(cy + r + 5), text="SYS NOMINAL", 
                                    fill=COLOR_ACTIVE, font=("Courier", int(7 * SCALE), "bold"))

    def draw_bottom_stats(self):
        # Separator Line
        self.canvas.create_line(self.sx(6), self.sy(178), self.sx(NATIVE_W - 6), self.sy(178), fill=COLOR_FRAME_MID)

        # 1. RAM Bar
        self.canvas.create_text(self.sx(8), self.sy(187), text="RAM", fill=COLOR_BRIGHT, 
                                font=("Courier", int(7 * SCALE), "bold"), anchor="w")
        ram_str = f"{self.ram_used:.1f}/{self.ram_total:.1f}GB ({int(round(self.ram))}%)"
        self.canvas.create_text(self.sx(36), self.sy(187), text=ram_str, fill=COLOR_ACTIVE, 
                                font=("Courier", int(7 * SCALE)), anchor="w")
        self.draw_segmented_bar(8, 196, 140, 8, self.ram, COLOR_ACTIVE)

        # 2. VRAM Bar
        self.canvas.create_text(self.sx(8), self.sy(212), text="VRAM", fill=COLOR_BRIGHT, 
                                font=("Courier", int(7 * SCALE), "bold"), anchor="w")
        vram_str = f"{int(round(self.vram))}%"
        self.canvas.create_text(self.sx(40), self.sy(212), text=vram_str, fill=COLOR_ACTIVE, 
                                font=("Courier", int(7 * SCALE)), anchor="w")
        self.draw_segmented_bar(8, 221, 140, 8, self.vram, COLOR_ACTIVE)

        # 3. Network DL / UL
        net_x = 168
        # Download
        self.canvas.create_text(self.sx(net_x), self.sy(187), text="NET DL", fill=COLOR_BRIGHT, 
                                font=("Courier", int(7 * SCALE), "bold"), anchor="w")
        # Down arrow
        self.canvas.create_polygon(self.sx(net_x + 44), self.sy(193), 
                                   self.sx(net_x + 48), self.sy(186), 
                                   self.sx(net_x + 40), self.sy(186), 
                                   fill=COLOR_NEON_GLOW)
        dl_str = f"{self.net_dl:5.1f} MB/s"
        self.canvas.create_text(self.sx(net_x + 54), self.sy(187), text=dl_str, fill=COLOR_NEON_GLOW, 
                                font=("Courier", int(8 * SCALE), "bold"), anchor="w")

        # Upload
        self.canvas.create_text(self.sx(net_x), self.sy(212), text="NET UL", fill=COLOR_BRIGHT, 
                                font=("Courier", int(7 * SCALE), "bold"), anchor="w")
        # Up arrow
        self.canvas.create_polygon(self.sx(net_x + 44), self.sy(212), 
                                   self.sx(net_x + 48), self.sy(219), 
                                   self.sx(net_x + 40), self.sy(219), 
                                   fill=COLOR_NEON_GLOW)
        ul_str = f"{self.net_ul:5.1f} MB/s"
        self.canvas.create_text(self.sx(net_x + 54), self.sy(212), text=ul_str, fill=COLOR_NEON_GLOW, 
                                font=("Courier", int(8 * SCALE), "bold"), anchor="w")

    def draw_segmented_bar(self, x, y, w, h, percent, color):
        num_blocks = 14
        gap = 2
        block_w = (w - (num_blocks - 1) * gap) / num_blocks
        active_blocks = int(round((percent / 100.0) * num_blocks))

        for i in range(num_blocks):
            bx = x + i * (block_w + gap)
            b_color = color if (i < active_blocks) else COLOR_FRAME_DARK
            if i == active_blocks - 1 and i > 0:
                b_color = COLOR_NEON_GLOW
            self.canvas.create_rectangle(self.sx(bx), self.sy(y), self.sx(bx + block_w), self.sy(y + h), 
                                         fill=b_color, outline="")


def main():
    root = tk.Tk()
    app = CyberHudSimulator(root)
    root.mainloop()


if __name__ == "__main__":
    main()
