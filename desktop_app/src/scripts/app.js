import { THEMES, ThemeManager } from './themes.js';
import { TelemetryManager } from './telemetry.js';
import { UsbStreamer } from './usb-streamer.js';
import { DisplayRenderer } from './renderer.js';

class AppController {
  constructor() {
    this.themeManager = new ThemeManager();
    this.telemetryManager = new TelemetryManager();
    this.usbStreamer = new UsbStreamer();

    this.canvas = document.getElementById('lcd-canvas');
    this.renderer = new DisplayRenderer(this.canvas, this.themeManager, this.usbStreamer);

    this.initNavigation();
    this.initThemeStudio();
    this.initTelemetryHub();
    this.initUsbStreamer();
    this.initPopoutAndFullscreen();

    // Check URL parameters for popout mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'popout') {
      this.enablePopoutMode();
    }
  }

  /* -------------------------------------------------------------------------
   * NAVIGATION TABS
   * ------------------------------------------------------------------------- */
  initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const panes = document.querySelectorAll('.view-pane');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const viewId = item.getAttribute('data-view');
        navItems.forEach(i => i.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        const targetPane = document.getElementById(`pane-${viewId}`);
        if (targetPane) targetPane.classList.add('active');
      });
    });
  }

  /* -------------------------------------------------------------------------
   * THEME STUDIO CONTROLS
   * ------------------------------------------------------------------------- */
  initThemeStudio() {
    // Theme Cards
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      card.addEventListener('click', () => {
        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const themeId = card.getAttribute('data-theme');
        this.themeManager.setTheme(themeId);
      });
    });

    // Color Swatches
    const swatches = document.querySelectorAll('.swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const color = swatch.getAttribute('data-color');
        this.themeManager.setAccentColor(color);

        // Update CSS Variables
        document.documentElement.style.setProperty('--theme-color', color);
        document.documentElement.style.setProperty('--theme-glow', `${color}55`);
      });
    });

    // Custom Wallpaper Upload
    const dropzone = document.getElementById('wallpaper-dropzone');
    const fileInput = document.getElementById('wallpaper-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.loadWallpaperFile(file);
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('hover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('hover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('hover');
        if (e.dataTransfer.files[0]) {
          this.loadWallpaperFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Resolution Selector
    const resSelect = document.getElementById('select-resolution');
    if (resSelect) {
      resSelect.addEventListener('change', (e) => {
        this.renderer.setResolution(e.target.value);
      });
    }

    // Scaling Mode Selector
    const scalingSelect = document.getElementById('select-scaling');
    if (scalingSelect) {
      scalingSelect.addEventListener('change', (e) => {
        this.renderer.setScalingMode(e.target.value);
      });
    }

    // Scanlines toggle
    const scanlineToggle = document.getElementById('toggle-scanlines');
    const scanlineOverlay = document.querySelector('.scanlines-overlay');
    if (scanlineToggle && scanlineOverlay) {
      scanlineToggle.addEventListener('change', (e) => {
        scanlineOverlay.style.display = e.target.checked ? 'block' : 'none';
      });
    }

    // Keyboard navigation to cycle themes with Arrow Left/Right or [ / ]
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === ']' || e.key === 'n') {
        this.cycleTheme(1);
      } else if (e.key === 'ArrowLeft' || e.key === '[' || e.key === 'p') {
        this.cycleTheme(-1);
      }
    });
  }

  cycleTheme(direction = 1) {
    const cards = Array.from(document.querySelectorAll('.theme-card'));
    if (!cards.length) return;
    const currentIndex = cards.findIndex(c => c.classList.contains('active'));
    const nextIndex = (currentIndex + direction + cards.length) % cards.length;
    cards[nextIndex].click();
    cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  loadWallpaperFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        this.themeManager.setCustomImage(img);
        this.themeManager.setTheme(THEMES.CUSTOM_WALLPAPER);

        // Select custom wallpaper card in UI
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        const customCard = document.querySelector('[data-theme="custom_wallpaper"]');
        if (customCard) customCard.classList.add('active');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* -------------------------------------------------------------------------
   * TELEMETRY HUB & HARDWARE METRICS
   * ------------------------------------------------------------------------- */
  initTelemetryHub() {
    this.telemetryManager.subscribe((data) => {
      // Pass to 320x240 renderer
      this.renderer.setTargetTelemetry(data);

      // Update Telemetry Hub Cards
      this.updateMetricCard('cpu', data.cpu, `${data.cpu}%`, data.cpu_t);
      this.updateMetricCard('gpu', data.gpu, `${data.gpu}%`, data.gpu_t);
      this.updateMetricCard('ram', data.ram, `${data.ram}%`, null, `${data.ram_u || 0}/${data.ram_t || 16} GB`);
      this.updateMetricCard('net', Math.min(100, data.net_d * 2), `${data.net_d} MB/s`, null, `▲ ${data.net_u} MB/s`);
    });

    // Interactive Sliders in Simulation Panel
    const simCpu = document.getElementById('sim-cpu');
    const simGpu = document.getElementById('sim-gpu');
    const simRam = document.getElementById('sim-ram');
    const simAutoToggle = document.getElementById('sim-auto-toggle');

    if (simCpu) {
      simCpu.addEventListener('input', (e) => {
        this.telemetryManager.setManualOverride('cpu', e.target.value);
        document.getElementById('sim-cpu-val').innerText = `${e.target.value}%`;
      });
    }
    if (simGpu) {
      simGpu.addEventListener('input', (e) => {
        this.telemetryManager.setManualOverride('gpu', e.target.value);
        document.getElementById('sim-gpu-val').innerText = `${e.target.value}%`;
      });
    }
    if (simRam) {
      simRam.addEventListener('input', (e) => {
        this.telemetryManager.setManualOverride('ram', e.target.value);
        document.getElementById('sim-ram-val').innerText = `${e.target.value}%`;
      });
    }

    if (simAutoToggle) {
      simAutoToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.telemetryManager.clearManualOverride();
        } else {
          this.telemetryManager.setManualOverride('cpu', simCpu.value);
        }
      });
    }
  }

  updateMetricCard(id, percent, displayVal, temp = null, subdetail = null) {
    const card = document.getElementById(`card-${id}`);
    if (!card) return;

    const valEl = card.querySelector('.big-value');
    if (valEl) valEl.innerText = displayVal;

    const barEl = card.querySelector('.sensor-bar-fill');
    if (barEl) barEl.style.width = `${Math.min(100, Math.max(0, percent))}%`;

    if (temp !== null) {
      const tempEl = card.querySelector('.temp-badge');
      if (tempEl) {
        tempEl.innerText = `${Math.round(temp)}°C`;
        tempEl.classList.toggle('hot', temp > 80);
      }
    }

    if (subdetail) {
      const subEl = card.querySelector('.subdetail');
      if (subEl) subEl.innerText = subdetail;
    }
  }

  /* -------------------------------------------------------------------------
   * USB HARDWARE STREAMER (Web Serial API)
   * ------------------------------------------------------------------------- */
  initUsbStreamer() {
    const btnConnect = document.getElementById('btn-connect-usb');
    const btnDisconnect = document.getElementById('btn-disconnect-usb');
    const statusBadge = document.getElementById('usb-status-badge');
    const consoleEl = document.getElementById('serial-log-console');
    const baudSelect = document.getElementById('baud-rate-select');

    this.usbStreamer.onLog = (msg) => {
      if (consoleEl) {
        const line = `[${new Date().toLocaleTimeString()}] ${msg}\n`;
        consoleEl.innerText += line;
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }
    };

    this.usbStreamer.onStateChange = (isConnected) => {
      if (statusBadge) {
        statusBadge.classList.toggle('active', isConnected);
        statusBadge.querySelector('.status-text').innerText = isConnected ? 'USB: CONNECTED' : 'USB: STANDBY';
      }
      if (btnConnect) btnConnect.style.display = isConnected ? 'none' : 'inline-flex';
      if (btnDisconnect) btnDisconnect.style.display = isConnected ? 'inline-flex' : 'none';
    };

    if (btnConnect) {
      btnConnect.addEventListener('click', async () => {
        const baud = baudSelect ? parseInt(baudSelect.value) : 115200;
        try {
          await this.usbStreamer.connect(baud);
        } catch (err) {
          alert('Could not connect to USB device: ' + err.message);
        }
      });
    }

    if (btnDisconnect) {
      btnDisconnect.addEventListener('click', () => {
        this.usbStreamer.disconnect();
      });
    }
  }

  /* -------------------------------------------------------------------------
   * POP-OUT MINI WIDGET & FULLSCREEN
   * ------------------------------------------------------------------------- */
  initPopoutAndFullscreen() {
    const btnPopout = document.getElementById('btn-popout-window');
    const btnFullscreen = document.getElementById('btn-fullscreen-preview');

    if (btnPopout) {
      btnPopout.addEventListener('click', () => {
        if (window.electronAPI && window.electronAPI.togglePopout) {
          window.electronAPI.togglePopout();
        } else {
          // Fallback browser popup window
          window.open(
            window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'mode=popout',
            'AioDisplayPopout',
            'width=640,height=480,menubar=no,toolbar=no,location=no,status=no'
          );
        }
      });
    }

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        const housing = document.querySelector('.screen-housing');
        if (!document.fullscreenElement) {
          if (housing.requestFullscreen) housing.requestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });
    }
  }

  enablePopoutMode() {
    document.body.classList.add('popout-mode');
    const header = document.querySelector('.app-header');
    const sidebar = document.querySelector('.app-sidebar');
    const drawer = document.querySelector('.studio-drawer');
    const controls = document.querySelector('.stage-controls');

    if (header) header.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    if (drawer) drawer.style.display = 'none';
    if (controls) controls.style.display = 'none';

    const stage = document.querySelector('.display-stage');
    if (stage) {
      stage.style.padding = '0';
      stage.style.margin = '0';
      stage.style.height = '100vh';
      stage.style.width = '100vw';
    }

    const bezel = document.querySelector('.bezel-chassis');
    if (bezel) {
      bezel.style.padding = '0';
      bezel.style.borderRadius = '0';
      bezel.style.boxShadow = 'none';
    }

    const housing = document.querySelector('.screen-housing');
    if (housing) {
      housing.style.width = '100vw';
      housing.style.height = '100vh';
      housing.style.borderRadius = '0';
    }
  }
}

// Initialize Application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
