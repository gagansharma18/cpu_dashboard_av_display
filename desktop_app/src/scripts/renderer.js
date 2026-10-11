/**
 * Master 320x240 Display Renderer
 * Runs 60 FPS smooth animation loop with value damping and USB streaming.
 */

export class DisplayRenderer {
  constructor(canvasElement, themeManager, usbStreamer) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.themeManager = themeManager;
    this.usbStreamer = usbStreamer;

    // Fixed Native Resolution
    this.width = 320;
    this.height = 240;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Smoothed Values for Fluid Needle Movement
    this.smoothed = {
      cpu: 45,
      cpu_t: 58,
      gpu: 68,
      gpu_t: 64,
      ram: 62,
      ram_u: 9.9,
      ram_t: 16.0,
      vram: 54,
      net_d: 14.2,
      net_u: 2.4,
      time: '00:00:00'
    };

    this.target = { ...this.smoothed };
    this.isRunning = true;
    this.lastStreamTime = 0;
    this.streamIntervalMs = 1000;

    this.startLoop();
  }

  setTargetTelemetry(data) {
    this.target = { ...data };
  }

  setStreamInterval(ms) {
    this.streamIntervalMs = ms;
  }

  startLoop() {
    const loop = (timestamp) => {
      if (this.isRunning) {
        this.renderFrame(timestamp);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  renderFrame(timestamp) {
    // Smooth Interpolation (Lerp)
    this.smoothed.cpu += (this.target.cpu - this.smoothed.cpu) * 0.14;
    this.smoothed.cpu_t += (this.target.cpu_t - this.smoothed.cpu_t) * 0.1;
    this.smoothed.gpu += (this.target.gpu - this.smoothed.gpu) * 0.14;
    this.smoothed.gpu_t += (this.target.gpu_t - this.smoothed.gpu_t) * 0.1;
    this.smoothed.ram += (this.target.ram - this.smoothed.ram) * 0.1;
    this.smoothed.vram += (this.target.vram - this.smoothed.vram) * 0.1;
    this.smoothed.net_d = this.target.net_d;
    this.smoothed.net_u = this.target.net_u;
    this.smoothed.ram_u = this.target.ram_u;
    this.smoothed.ram_t = this.target.ram_t;
    this.smoothed.time = this.target.time;

    // Cleanly formatted snapshot for renderers to prevent floating-point decimal leaks
    const formattedData = {
      ...this.smoothed,
      cpu: Math.round(this.smoothed.cpu),
      gpu: Math.round(this.smoothed.gpu),
      ram: Math.round(this.smoothed.ram),
      vram: Math.round(this.smoothed.vram),
      cpu_t: Number(this.smoothed.cpu_t.toFixed(1)),
      gpu_t: Number(this.smoothed.gpu_t.toFixed(1))
    };

    // Render active theme to canvas
    this.themeManager.render(this.ctx, this.width, this.height, formattedData);

    // Transmit telemetry to ESP32 USB hardware
    const now = Date.now();
    if (this.usbStreamer.isConnected && (now - this.lastStreamTime >= this.streamIntervalMs)) {
      this.lastStreamTime = now;
      this.usbStreamer.sendTelemetry(this.target);
    }
  }
}
