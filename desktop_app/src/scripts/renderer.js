/**
 * Master Display Renderer with Dynamic 480p & 240p Resolution Support
 * Runs 60 FPS smooth animation loop with value damping and USB streaming.
 */

export const RESOLUTION_PRESETS = {
  '640x480': { width: 640, height: 480, aspect: 4 / 3, label: '640 × 480 (480p Standard 4:3)', tag: '480p CVBS' },
  '720x480': { width: 720, height: 480, aspect: 3 / 2, label: '720 × 480 (480p NTSC D1 3:2)', tag: '480p D1' },
  '800x480': { width: 800, height: 480, aspect: 5 / 3, label: '800 × 480 (480p WVGA 5:3)', tag: '480p WVGA' },
  '854x480': { width: 854, height: 480, aspect: 16 / 9, label: '854 × 480 (480p FWVGA 16:9)', tag: '480p 16:9' },
  '480x320': { width: 480, height: 320, aspect: 3 / 2, label: '480 × 320 (3.5" IPS 3:2)', tag: '320p IPS' },
  '480x272': { width: 480, height: 272, aspect: 480 / 272, label: '480 × 272 (4.3" TFT 16:9)', tag: '272p TFT' },
  '320x240': { width: 320, height: 240, aspect: 4 / 3, label: '320 × 240 (240p QVGA 4:3)', tag: '240p CVBS' }
};

export class DisplayRenderer {
  constructor(canvasElement, themeManager, usbStreamer) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.themeManager = themeManager;
    this.usbStreamer = usbStreamer;

    // Active resolution (Default: 640x480 480p)
    this.currentResKey = '640x480';
    const initRes = RESOLUTION_PRESETS[this.currentResKey];
    this.width = initRes.width;
    this.height = initRes.height;
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

  setResolution(resKey) {
    const preset = RESOLUTION_PRESETS[resKey] || RESOLUTION_PRESETS['640x480'];
    this.currentResKey = resKey;
    this.width = preset.width;
    this.height = preset.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Dynamically reshape the screen housing to match physical aspect ratio
    const housing = document.querySelector('.screen-housing');
    const ledTag = document.querySelector('.hardware-led span');
    if (housing) {
      const baseHeight = 520;
      const calcWidth = Math.round(baseHeight * preset.aspect);
      housing.style.width = `${calcWidth}px`;
      housing.style.height = `${baseHeight}px`;
    }
    if (ledTag) {
      ledTag.innerText = `${preset.tag} DISP`;
    }
  }

  setScalingMode(mode) {
    this.themeManager.setScalingMode(mode);
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
