/**
 * Canvas Theme Renderers for 320x240 LCD Display
 * 10 distinct visual templates matching AIO Coolers, PC Cabinet Screens, and Turing Smart Screens.
 */

export const THEMES = {
  CYBERPUNK_HUD: 'cyberpunk_hud',
  KRAKEN_AIO: 'kraken_aio',
  SYNTHWAVE_GRID: 'synthwave_grid',
  REACTOR_CORE: 'reactor_core',
  AUTOMOTIVE_SUPERCAR: 'automotive_supercar',
  MECHA_GAMING_ROG: 'mecha_gaming_rog',
  MATRIX_CODE_RAIN: 'matrix_code_rain',
  PIPBOY_VAULT: 'pipboy_vault',
  MINIMAL_NORDIC: 'minimal_nordic',
  NASA_MISSION_CONTROL: 'nasa_mission_control',
  RETRO_VT100_TERMINAL: 'retro_vt100_terminal',
  CYBER_NEO_TOKYO: 'cyber_neo_tokyo',
  CHIBI_DESK_PET: 'chibi_desk_pet',
  STEAMPUNK_CHRONO: 'steampunk_chrono',
  PIXEL_RPG_STATUS: 'pixel_rpg_status',
  CUSTOM_WALLPAPER: 'custom_wallpaper'
};

export class ThemeManager {
  constructor() {
    this.currentTheme = THEMES.CYBERPUNK_HUD;
    this.accentColor = '#00f0ff';
    this.customImage = null;

    // Animation internal counters
    this.radarAngle = 0;
    this.pulsePhase = 0;
    this.gridOffset = 0;
    this.frameCount = 0;

    // Matrix digital rain state (32 columns)
    this.matrixDrops = Array.from({ length: 32 }, () => Math.floor(Math.random() * -30));
    this.matrixChars = '0123456789ABCDEF$#@%&*+-=<>~日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

    // ECG pulse offset
    this.ecgOffset = 0;

    // Steampunk rotating gear angle
    this.gearAngle = 0;

    // Scaling mode: 'stretch' (fills entire 480p raster) or 'fit' (preserves 4:3 1:1 pixel aspect)
    this.scalingMode = 'stretch';

    // Chibi desk pet breathing/wobble phase
    this.petPhase = 0;

    // NASA Starfield (40 persistent stars)
    this.stars = Array.from({ length: 42 }, () => ({
      x: Math.random() * 320,
      y: Math.random() * 240,
      size: Math.random() > 0.85 ? 2 : 1,
      phase: Math.random() * Math.PI * 2
    }));
  }

  setTheme(themeId) {
    if (Object.values(THEMES).includes(themeId)) {
      this.currentTheme = themeId;
    }
  }

  setAccentColor(colorHex) {
    this.accentColor = colorHex;
  }

  setScalingMode(mode) {
    this.scalingMode = mode;
  }

  setCustomImage(imgElement) {
    this.customImage = imgElement;
  }

  render(ctx, width, height, data) {
    this.frameCount++;
    this.radarAngle = (this.radarAngle + 3.5 + (data.cpu * 0.04)) % 360;
    this.pulsePhase = (this.pulsePhase + 0.08 + (data.cpu * 0.002)) % (Math.PI * 2);
    this.gridOffset = (this.gridOffset + 1.2) % 24;
    this.ecgOffset = (this.ecgOffset + 2 + (data.cpu * 0.03)) % 320;
    this.gearAngle = (this.gearAngle + 0.03 + (data.cpu * 0.001)) % (Math.PI * 2);
    this.petPhase = (this.petPhase + 0.08 + (data.cpu * 0.002)) % (Math.PI * 2);

    // Clear Screen at full native resolution
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // High-Resolution 480p / Wide-Aspect Auto-Scaler
    if (width !== 320 || height !== 240) {
      if (this.scalingMode === 'fit') {
        const scale = Math.min(width / 320, height / 240);
        const offsetX = (width - 320 * scale) / 2;
        const offsetY = (height - 240 * scale) / 2;
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
      } else {
        // Stretch to fill full display raster (Default for analog composite / 480p LCDs)
        ctx.scale(width / 320, height / 240);
      }
    }

    switch (this.currentTheme) {
      case THEMES.CYBERPUNK_HUD:
        this.renderCyberpunkHud(ctx, 320, 240, data);
        break;
      case THEMES.KRAKEN_AIO:
        this.renderKrakenAio(ctx, 320, 240, data);
        break;
      case THEMES.SYNTHWAVE_GRID:
        this.renderSynthwaveGrid(ctx, 320, 240, data);
        break;
      case THEMES.REACTOR_CORE:
        this.renderReactorCore(ctx, 320, 240, data);
        break;
      case THEMES.AUTOMOTIVE_SUPERCAR:
        this.renderAutomotiveSupercar(ctx, 320, 240, data);
        break;
      case THEMES.MECHA_GAMING_ROG:
        this.renderMechaGamingRog(ctx, 320, 240, data);
        break;
      case THEMES.MATRIX_CODE_RAIN:
        this.renderMatrixCodeRain(ctx, 320, 240, data);
        break;
      case THEMES.PIPBOY_VAULT:
        this.renderPipboyVault(ctx, 320, 240, data);
        break;
      case THEMES.MINIMAL_NORDIC:
        this.renderMinimalNordic(ctx, 320, 240, data);
        break;
      case THEMES.NASA_MISSION_CONTROL:
        this.renderNasaMissionControl(ctx, 320, 240, data);
        break;
      case THEMES.RETRO_VT100_TERMINAL:
        this.renderRetroVt100Terminal(ctx, 320, 240, data);
        break;
      case THEMES.CYBER_NEO_TOKYO:
        this.renderCyberNeoTokyo(ctx, 320, 240, data);
        break;
      case THEMES.CHIBI_DESK_PET:
        this.renderChibiDeskPet(ctx, 320, 240, data);
        break;
      case THEMES.STEAMPUNK_CHRONO:
        this.renderSteampunkChrono(ctx, 320, 240, data);
        break;
      case THEMES.PIXEL_RPG_STATUS:
        this.renderPixelRpgStatus(ctx, 320, 240, data);
        break;
      case THEMES.CUSTOM_WALLPAPER:
        this.renderCustomWallpaper(ctx, 320, 240, data);
        break;
    }

    ctx.restore();
  }

  /* =========================================================================
   * 1. CYBERPUNK HUD (Exact match to ESP32 firmware)
   * ========================================================================= */
  renderCyberpunkHud(ctx, width, height, data) {
    // Background Grid
    ctx.strokeStyle = '#121c2b';
    ctx.lineWidth = 1;
    for (let y = 28; y < 180; y += 24) {
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(width - 8, y);
      ctx.stroke();
    }
    for (let x = 16; x < width - 8; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 28);
      ctx.lineTo(x, 176);
      ctx.stroke();
    }

    // Tech Brackets
    this.drawCornerBrackets(ctx, width, height, '#38516d');

    // Header Bar
    ctx.strokeStyle = '#38516d';
    ctx.beginPath();
    ctx.moveTo(6, 22);
    ctx.lineTo(width - 6, 22);
    ctx.stroke();

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('// CYBER_HUD_AV', 8, 14);

    // Online Badge
    const blink = (this.frameCount % 30) < 22;
    if (blink) {
      ctx.fillStyle = this.accentColor;
      ctx.beginPath();
      ctx.arc(118, 12, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = this.accentColor;
    ctx.fillText('LINK_ONLINE', 126, 15);

    // Clock
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(data.time, width - 8, 15);
    ctx.textAlign = 'left';

    // Left CPU Arc Gauge
    this.drawSegmentedArc(ctx, 52, 98, 38, 135, 405, data.cpu, 100, 'CPU CORE', '%', data.cpu_t);

    // Center Radar & Matrix
    this.drawRadarMatrix(ctx, 160, 98, 44, data.cpu);

    // Right GPU Arc Gauge
    this.drawSegmentedArc(ctx, 268, 98, 38, 135, 405, data.gpu, 100, 'GPU CORE', '%', data.gpu_t);

    // Bottom Stats Tray
    this.drawBottomTray(ctx, width, height, data);
  }

  /* =========================================================================
   * 2. KRAKEN AIO DUAL RING (NZXT Liquid Cooler Style)
   * ========================================================================= */
  renderKrakenAio(ctx, width, height, data) {
    // Subtle circular ambient glow in background
    const grad = ctx.createRadialGradient(160, 120, 10, 160, 120, 160);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Top Brand Tag
    ctx.font = '600 10px "Outfit", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('AERO // LIQUID COOLER', 160, 24);

    // Left Dial - CPU TEMP
    this.drawAioRing(ctx, 88, 120, 52, data.cpu_t, 100, 'CPU', '°C', data.cpu, this.accentColor);

    // Right Dial - GPU TEMP
    this.drawAioRing(ctx, 232, 120, 52, data.gpu_t, 100, 'GPU', '°C', data.gpu, '#a855f7');

    // Bottom Ambient Status Bar
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`PUMP: 2450 RPM  |  RAM: ${Math.round(data.ram)}%  |  ${data.time}`, 160, 222);
    ctx.textAlign = 'left';
  }

  /* =========================================================================
   * 3. SYNTHWAVE 80s OUTRUN GRID
   * ========================================================================= */
  renderSynthwaveGrid(ctx, width, height, data) {
    // Deep purple sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 140);
    sky.addColorStop(0, '#0c051a');
    sky.addColorStop(1, '#3b0764');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, 140);

    // Synthwave Neon Sun
    const sunGrad = ctx.createLinearGradient(160, 40, 160, 140);
    sunGrad.addColorStop(0, '#fde047');
    sunGrad.addColorStop(0.5, '#f43f5e');
    sunGrad.addColorStop(1, '#d946ef');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(160, 110, 46, Math.PI, 0);
    ctx.fill();

    // Horizon line
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 112);
    ctx.lineTo(width, 112);
    ctx.stroke();

    // Perspective 3D Grid Terrain
    ctx.fillStyle = '#06030c';
    ctx.fillRect(0, 112, width, height - 112);

    ctx.strokeStyle = '#c026d3';
    ctx.lineWidth = 1;
    // Horizontal perspective lines
    for (let i = 1; i <= 6; i++) {
      const y = 112 + Math.pow(i, 2.2) * 2.8 + this.gridOffset;
      if (y < height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    // Vanishing vertical perspective lines
    for (let x = -width; x < width * 2; x += 40) {
      ctx.beginPath();
      ctx.moveTo(160, 112);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Floating Neon HUD Cards
    this.drawGlassCard(ctx, 16, 20, 100, 72, 'CPU CORE', `${Math.round(data.cpu)}%`, `${Math.round(data.cpu_t)}°C`, '#00f0ff');
    this.drawGlassCard(ctx, 204, 20, 100, 72, 'GPU ENGINE', `${Math.round(data.gpu)}%`, `${Math.round(data.gpu_t)}°C`, '#f43f5e');

    // Bottom Cyber Pill
    ctx.fillStyle = 'rgba(12, 5, 26, 0.85)';
    ctx.fillRect(50, 208, 220, 24);
    ctx.strokeStyle = '#00f0ff';
    ctx.strokeRect(50, 208, 220, 24);
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`RAM: ${Math.round(data.ram)}%  //  NET: ${data.net_d} MB/s`, 160, 224);
    ctx.textAlign = 'left';
  }

  /* =========================================================================
   * 4. SCI-FI ARC REACTOR (Stark Industries Style)
   * ========================================================================= */
  renderReactorCore(ctx, width, height, data) {
    const cx = 160;
    const cy = 120;

    // Dark technical backdrop
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Concentric Energy Containment Rings
    const pulse = 0.5 + 0.5 * Math.sin(this.pulsePhase);

    // Outer Ring
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 94, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating segment coils
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((this.radarAngle * Math.PI) / 180);
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 80, (i * Math.PI) / 4 + 0.1, ((i + 1) * Math.PI) / 4 - 0.2);
      ctx.stroke();
    }
    ctx.restore();

    // Reverse rotating inner coil
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-this.radarAngle * 1.5 * Math.PI) / 180);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 56, (i * Math.PI) / 6 + 0.1, ((i + 1) * Math.PI) / 6 - 0.2);
      ctx.stroke();
    }
    ctx.restore();

    // Central Glowing Reactor Core
    const coreR = 26 + pulse * (6 + data.cpu * 0.1);
    const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, coreR);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, this.accentColor);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Center Core Numbers
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#05070d';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(data.cpu)}%`, cx, cy + 5);

    // Corner Telemetry Readouts
    ctx.font = '600 10px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(`CPU: ${Math.round(data.cpu_t)}°C`, 14, 24);
    ctx.fillText(`RAM: ${Math.round(data.ram)}%`, 14, 40);

    ctx.textAlign = 'right';
    ctx.fillText(`GPU: ${Math.round(data.gpu)}% (${Math.round(data.gpu_t)}°C)`, width - 14, 24);
    ctx.fillText(`VRAM: ${Math.round(data.vram)}%`, width - 14, 40);

    ctx.textAlign = 'center';
    ctx.fillStyle = this.accentColor;
    ctx.fillText(`CORE FREQ: ${(3.6 + (data.cpu * 0.015)).toFixed(2)} GHz`, cx, 226);
    ctx.textAlign = 'left';
  }

  /* =========================================================================
   * 5. CUSTOM WALLPAPER / GIF STUDIO
   * ========================================================================= */
  renderCustomWallpaper(ctx, width, height, data) {
    if (this.customImage) {
      ctx.drawImage(this.customImage, 0, 0, width, height);
    } else {
      // Default abstract geometric wallpaper
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Frosted Glass Stat Overlay Card
    ctx.fillStyle = 'rgba(10, 15, 29, 0.75)';
    ctx.fillRect(16, 150, width - 32, 76);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 150, width - 32, 76);

    // Dual mini meters
    ctx.font = '600 11px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';

    // CPU Stat
    ctx.fillText('CPU LOAD', 30, 172);
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = this.accentColor;
    ctx.fillText(`${Math.round(data.cpu)}%`, 30, 194);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${Number(data.cpu_t).toFixed(1)}°C`, 30, 210);

    // GPU Stat
    ctx.font = '600 11px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GPU ENGINE', 130, 172);
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`${Math.round(data.gpu)}%`, 130, 194);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${Number(data.gpu_t).toFixed(1)}°C`, 130, 210);

    // RAM & Clock
    ctx.font = '600 11px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MEMORY', 230, 172);
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${Math.round(data.ram)}%`, 230, 194);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(data.time, 230, 210);
  }

  /* =========================================================================
   * SHARED HELPER ROUTINES
   * ========================================================================= */
  drawCornerBrackets(ctx, w, h, color) {
    const b = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    // TL
    ctx.beginPath(); ctx.moveTo(4, 4 + b); ctx.lineTo(4, 4); ctx.lineTo(4 + b, 4); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(w - 4 - b, 4); ctx.lineTo(w - 4, 4); ctx.lineTo(w - 4, 4 + b); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(4, h - 4 - b); ctx.lineTo(4, h - 4); ctx.lineTo(4 + b, h - 4); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(w - 4 - b, h - 4); ctx.lineTo(w - 4, h - 4); ctx.lineTo(w - 4, h - 4 - b); ctx.stroke();
  }

  drawSegmentedArc(ctx, cx, cy, r, startDeg, endDeg, val, maxVal, title, unit, temp) {
    const sweep = endDeg - startDeg;
    const pct = Math.max(0, Math.min(1, val / maxVal));
    const totalSegs = 24;
    const activeSegs = Math.round(pct * totalSegs);

    // Title
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText(title, cx, cy - r - 6);

    // Track Segments
    for (let i = 0; i < totalSegs; i++) {
      const angle = ((startDeg + i * (sweep / totalSegs)) * Math.PI) / 180;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const x1 = cx + (r - 5) * cosA;
      const y1 = cy + (r - 5) * sinA;
      const x2 = cx + r * cosA;
      const y2 = cy + r * sinA;

      let segColor = i < activeSegs ? this.accentColor : '#1e293b';
      if (i === activeSegs - 1 && i > 0) segColor = '#ffffff';

      ctx.strokeStyle = segColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Number Readout
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${Math.round(val)}${unit}`, cx, cy + 5);

    // Temp Readout
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = temp > 80 ? '#ef4444' : this.accentColor;
    ctx.fillText(`${Math.round(temp)}°C`, cx, cy + 20);
    ctx.textAlign = 'left';
  }

  drawRadarMatrix(ctx, cx, cy, r, cpuLoad) {
    // Rings
    ctx.strokeStyle = '#38516d';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(cx, cy, r - 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r / 2, 0, Math.PI * 2); ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = '#38516d';
    ctx.beginPath();
    ctx.moveTo(cx - r - 4, cy); ctx.lineTo(cx + r + 4, cy);
    ctx.moveTo(cx, cy - r - 4); ctx.lineTo(cx, cy + r + 4);
    ctx.stroke();

    // Radar Beam
    const rad = (this.radarAngle * Math.PI) / 180;
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (r - 1) * Math.cos(rad), cy + (r - 1) * Math.sin(rad));
    ctx.stroke();

    // Pulsing Hexagon
    const pulse = 0.5 + 0.5 * Math.sin(this.pulsePhase);
    const coreR = 7 + pulse * (4 + cpuLoad * 0.05);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 * Math.PI) / 180;
      const hx = cx + coreR * Math.cos(a);
      const hy = cy + coreR * Math.sin(a);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    // Status label
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = cpuLoad > 85 ? '#ef4444' : this.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(cpuLoad > 85 ? 'CORE STRESS' : 'SYS NOMINAL', cx, cy + r + 10);
    ctx.textAlign = 'left';
  }

  drawBottomTray(ctx, width, height, data) {
    ctx.strokeStyle = '#38516d';
    ctx.beginPath();
    ctx.moveTo(6, 178);
    ctx.lineTo(width - 6, 178);
    ctx.stroke();

    // RAM Bar
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RAM', 8, 190);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${data.ram_u || (data.ram * 0.16).toFixed(1)}/${data.ram_t || 16}GB (${Math.round(data.ram)}%)`, 36, 190);
    this.drawSegmentedBar(ctx, 8, 196, 140, 7, data.ram, this.accentColor);

    // VRAM Bar
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('VRAM', 8, 215);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${Math.round(data.vram)}%`, 42, 215);
    this.drawSegmentedBar(ctx, 8, 222, 140, 7, data.vram, this.accentColor);

    // Network DL / UL
    const netX = 168;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('NET DL', netX, 192);
    ctx.fillStyle = this.accentColor;
    ctx.fillText(`▼ ${data.net_d || 0} MB/s`, netX + 48, 192);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('NET UL', netX, 218);
    ctx.fillStyle = this.accentColor;
    ctx.fillText(`▲ ${data.net_u || 0} MB/s`, netX + 48, 218);
  }

  drawSegmentedBar(ctx, x, y, w, h, pct, color) {
    const blocks = 14;
    const gap = 2;
    const blockW = (w - (blocks - 1) * gap) / blocks;
    const activeBlocks = Math.round((pct / 100) * blocks);

    for (let i = 0; i < blocks; i++) {
      ctx.fillStyle = i < activeBlocks ? color : '#1e293b';
      if (i === activeBlocks - 1 && i > 0) ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + i * (blockW + gap), y, blockW, h);
    }
  }

  drawAioRing(ctx, cx, cy, r, val, maxVal, label, unit, subval, color) {
    const pct = Math.max(0, Math.min(1, val / maxVal));

    // Outer Track
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Active Gradient Arc
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
    ctx.stroke();
    ctx.lineCap = 'butt';

    // Center Big Temperature Value
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(val)}${unit}`, cx, cy + 4);

    // Label & Usage Below
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(`${label} LOAD: ${Math.round(subval)}%`, cx, cy + 22);
    ctx.textAlign = 'left';
  }

  drawGlassCard(ctx, x, y, w, h, title, val, subval, color) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(title, x + 8, y + 16);

    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(val, x + 8, y + 42);

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(subval, x + 8, y + 60);
  }

  /* =========================================================================
   * 6. AUTOMOTIVE SUPERCAR (Sports Car Instrument Cluster / Tachometer)
   * ========================================================================= */
  renderAutomotiveSupercar(ctx, width, height, data) {
    // Carbon Fiber Weave Background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let i = -width; i < width * 2; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // Left Dial: Tachometer (CPU)
    this.drawAutoGauge(ctx, 76, 116, 44, data.cpu, 100, 'CPU RPM', '%', data.cpu_t, '#ef4444', true);

    // Right Dial: Speedometer (GPU)
    this.drawAutoGauge(ctx, 244, 116, 44, data.gpu, 100, 'GPU SPEED', '%', data.gpu_t, '#3b82f6', false);

    // Center Console Cluster (x: 124 to 196)
    // Warning Lamps Row
    const warnY = 32;
    // High Beams (Blue)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(142, warnY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Check Engine (Amber/Red when CPU/GPU > 80°C)
    const isHot = data.cpu_t > 80 || data.gpu_t > 80;
    ctx.fillStyle = isHot ? '#ef4444' : 'rgba(245, 158, 11, 0.2)';
    ctx.fillRect(156, warnY - 4, 8, 8);

    // Battery / Power OK (Green)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(178, warnY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Digital Gearbox Indicator Box
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(130, 50, 60, 52);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(130, 50, 60, 52);

    ctx.font = 'bold 24px "Outfit", sans-serif';
    ctx.fillStyle = this.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText('S 7', 160, 84);

    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SPORT', 160, 96);

    // Center Digital Speed / Clock
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.time, 160, 126);

    // Bottom Odometer / Telemetry Tray
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, 188, width - 40, 42);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(20, 188, width - 40, 42);

    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(`ODO RAM: ${data.ram}% (${data.ram_u || (data.ram * 0.16).toFixed(1)} GB)`, 32, 206);
    ctx.fillText(`VRAM: ${data.vram}%`, 32, 220);

    ctx.textAlign = 'right';
    ctx.fillText(`FLOW DL: ${data.net_d} MB/s`, width - 32, 206);
    ctx.fillText(`FLOW UL: ${data.net_u} MB/s`, width - 32, 220);
    ctx.textAlign = 'left';
  }

  drawAutoGauge(ctx, cx, cy, r, val, maxVal, title, unit, temp, needleColor, isTach) {
    const startDeg = 140;
    const sweepDeg = 260;
    const pct = Math.max(0, Math.min(1, val / maxVal));

    // Outer Dial Ring
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Dial Ticks
    for (let i = 0; i <= 20; i++) {
      const a = ((startDeg + i * (sweepDeg / 20)) * Math.PI) / 180;
      const isRedline = isTach && i >= 16;
      const tLen = (i % 5 === 0) ? 6 : 3;

      ctx.strokeStyle = isRedline ? '#ef4444' : '#64748b';
      ctx.lineWidth = (i % 5 === 0) ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + (r - 2) * Math.cos(a), cy + (r - 2) * Math.sin(a));
      ctx.lineTo(cx + (r - 2 - tLen) * Math.cos(a), cy + (r - 2 - tLen) * Math.sin(a));
      ctx.stroke();
    }

    // Sweeping Illuminated Needle
    const needleAngle = ((startDeg + pct * sweepDeg) * Math.PI) / 180;
    ctx.strokeStyle = needleColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (r - 6) * Math.cos(needleAngle), cy + (r - 6) * Math.sin(needleAngle));
    ctx.stroke();

    // Center Needle Metallic Cap
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(title, cx, cy - r - 8);

    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${Math.round(val)}${unit}`, cx, cy + 22);

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = temp > 80 ? '#ef4444' : '#38bdf8';
    ctx.fillText(`${temp.toFixed(1)}°C`, cx, cy + 34);
    ctx.textAlign = 'left';
  }

  /* =========================================================================
   * 7. MECHA GAMING ROG (Asus ROG / Gundam Stealth Armor HUD)
   * ========================================================================= */
  renderMechaGamingRog(ctx, width, height, data) {
    // Dark Gunmetal Angular Plating
    ctx.fillStyle = '#090a10';
    ctx.fillRect(0, 0, width, height);

    // Angled Cyber Armor Lines
    ctx.strokeStyle = '#ff003b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(60, 24);
    ctx.lineTo(76, 8);
    ctx.lineTo(width - 76, 8);
    ctx.lineTo(width - 60, 24);
    ctx.lineTo(width, 24);
    ctx.stroke();

    // Header ROG Brand
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ff003b';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ROG MECHA HUD // OVERCLOCK', 160, 20);

    // Left Angular Diamond Gauge: CPU
    this.drawMechaDiamond(ctx, 20, 38, 120, 118, 'CPU CORE', `${data.cpu}%`, `${data.cpu_t.toFixed(1)}°C`, data.cpu, '#ff003b');

    // Right Angular Diamond Gauge: GPU
    this.drawMechaDiamond(ctx, 180, 38, 120, 118, 'GPU BOOST', `${data.gpu}%`, `${data.gpu_t.toFixed(1)}°C`, data.gpu, '#ff6200');

    // Center Power Capacitor Conduits
    const cx = 160;
    const barW = 20;
    const totalBars = 6;
    const activeBars = Math.round((data.cpu / 100) * totalBars);

    for (let i = 0; i < totalBars; i++) {
      const by = 136 - i * 14;
      ctx.fillStyle = i < activeBars ? '#ff003b' : '#1e1b2e';
      ctx.fillRect(cx - barW / 2, by, barW, 9);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(cx - barW / 2, by, barW, 9);
    }

    // Status Ribbon
    ctx.fillStyle = 'rgba(255, 0, 59, 0.12)';
    ctx.fillRect(16, 168, width - 32, 24);
    ctx.strokeStyle = '#ff003b';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 168, width - 32, 24);

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`STATUS: COMBAT LOCKED  |  FREQ: ${(3.8 + (data.cpu * 0.012)).toFixed(2)} GHz`, 160, 184);

    // Bottom Bus
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`RAM: ${data.ram}% (${data.ram_u || 9.8}GB)  //  VRAM: ${data.vram}%  //  DL: ${data.net_d}MB/s`, 160, 214);
    ctx.textAlign = 'left';
  }

  drawMechaDiamond(ctx, x, y, w, h, title, val, temp, pct, color) {
    ctx.fillStyle = 'rgba(18, 20, 32, 0.85)';
    ctx.beginPath();
    ctx.moveTo(x + 14, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - 14);
    ctx.lineTo(x + w - 14, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + 14);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Title
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(title, x + 12, y + 20);

    // Big Value
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(val, x + 12, y + 54);

    // Temp
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(temp, x + 12, y + 76);

    // Stepped Gauge Bar
    const fillW = Math.max(0, Math.min(w - 24, ((w - 24) * pct) / 100));
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 12, y + 88, w - 24, 8);
    ctx.fillStyle = color;
    ctx.fillRect(x + 12, y + 88, fillW, 8);
  }

  /* =========================================================================
   * 8. MATRIX CODE RAIN (The Matrix Hacker Terminal)
   * ========================================================================= */
  renderMatrixCodeRain(ctx, width, height, data) {
    // Dark Green Matrix Void
    ctx.fillStyle = '#020d06';
    ctx.fillRect(0, 0, width, height);

    // Falling Digital Rain Columns
    ctx.font = '10px monospace';
    for (let i = 0; i < this.matrixDrops.length; i++) {
      const colX = i * 10;
      let dropY = this.matrixDrops[i];

      // Draw trailing glyphs
      for (let j = 0; j < 9; j++) {
        const charY = dropY - j * 11;
        if (charY > 0 && charY < height) {
          const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
          if (j === 0) {
            ctx.fillStyle = '#ffffff'; // Glowing head
          } else if (j < 4) {
            ctx.fillStyle = '#00ff66'; // Bright green
          } else {
            ctx.fillStyle = 'rgba(0, 180, 50, 0.35)'; // Fading tail
          }
          ctx.fillText(char, colX, charY);
        }
      }

      // Advance Drop
      this.matrixDrops[i] += 4;
      if (this.matrixDrops[i] > height + 80) {
        this.matrixDrops[i] = Math.floor(Math.random() * -40);
      }
    }

    // Semi-Transparent Hacker Terminal Card
    ctx.fillStyle = 'rgba(2, 16, 7, 0.88)';
    ctx.fillRect(16, 20, width - 32, height - 40);
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 20, width - 32, height - 40);

    // Terminal Header
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00ff66';
    ctx.fillText('>_ MAINFRAME TELEMETRY SYSTEM // ACTIVE', 28, 42);

    ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
    ctx.beginPath();
    ctx.moveTo(28, 48);
    ctx.lineTo(width - 28, 48);
    ctx.stroke();

    // Data Rows
    ctx.font = '10px "JetBrains Mono", monospace';
    const cpuBar = this.makeAsciiBar(data.cpu, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`CPU_LOAD : [${cpuBar}] ${data.cpu}%`, 28, 74);
    ctx.fillStyle = '#00ff66';
    ctx.fillText(`CPU_TEMP : ${data.cpu_t.toFixed(1)}°C`, 28, 92);

    const gpuBar = this.makeAsciiBar(data.gpu, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`GPU_LOAD : [${gpuBar}] ${data.gpu}%`, 28, 120);
    ctx.fillStyle = '#00ff66';
    ctx.fillText(`GPU_TEMP : ${data.gpu_t.toFixed(1)}°C`, 28, 138);

    ctx.fillText(`RAM_CAP  : ${data.ram}% (${data.ram_u || (data.ram * 0.16).toFixed(1)} / ${data.ram_t || 16} GB)`, 28, 164);
    ctx.fillText(`NET_FLOW : DL ${data.net_d} MB/s  |  UL ${data.net_u} MB/s`, 28, 182);

    // Blinking Prompt
    const cursor = (this.frameCount % 30 < 15) ? '_' : ' ';
    ctx.fillText(`SYS_TICK : ${data.time} ${cursor}`, 28, 204);
  }

  makeAsciiBar(pct, len) {
    const filled = Math.round((pct / 100) * len);
    return '|'.repeat(filled) + '.'.repeat(len - filled);
  }

  /* =========================================================================
   * 9. PIP-BOY VAULT (Fallout 3000 CRT Terminal)
   * ========================================================================= */
  renderPipboyVault(ctx, width, height, data) {
    // Vintage Phosphor Amber/Green CRT
    const pColor = '#22c55e'; // Classic Pip-Boy Green
    const dimColor = '#14532d';

    ctx.fillStyle = '#031206';
    ctx.fillRect(0, 0, width, height);

    // Top Header Navigation Tabs
    ctx.fillStyle = dimColor;
    ctx.fillRect(10, 8, width - 20, 20);

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    // Active [STAT] Tab highlighted
    ctx.fillStyle = pColor;
    ctx.fillRect(10, 8, 54, 20);
    ctx.fillStyle = '#031206';
    ctx.fillText(' STAT ', 18, 22);

    ctx.fillStyle = pColor;
    ctx.fillText('INV', 80, 22);
    ctx.fillText('DATA', 124, 22);
    ctx.fillText('MAP', 174, 22);
    ctx.fillText('RADIO', 220, 22);

    // Subtitle Line
    ctx.strokeStyle = pColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 32);
    ctx.lineTo(width - 10, 32);
    ctx.stroke();

    // Center Animated Medical ECG / Heart Rate Oscilloscope
    ctx.strokeStyle = pColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const ecgY = 86;
    for (let x = 10; x < width - 10; x += 2) {
      const waveX = (x + this.ecgOffset) % 120;
      let dy = 0;
      if (waveX > 35 && waveX < 45) dy = -6; // P-wave
      else if (waveX >= 45 && waveX < 50) dy = 6;
      else if (waveX >= 50 && waveX < 58) dy = -32; // Sharp R-spike
      else if (waveX >= 58 && waveX < 66) dy = 16;  // S-wave
      else if (waveX >= 75 && waveX < 90) dy = -10; // T-wave

      if (x === 10) ctx.moveTo(x, ecgY + dy);
      else ctx.lineTo(x, ecgY + dy);
    }
    ctx.stroke();

    // Condition Status
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = pColor;
    ctx.textAlign = 'center';
    const condText = (data.cpu_t > 80 || data.gpu_t > 80) ? 'CONDITION: CRITICAL HAZARD' : 'CONDITION: OPTIMAL';
    ctx.fillText(condText, 160, 124);
    ctx.textAlign = 'left';

    // Vitals Gauges
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = pColor;

    // HP (CPU)
    ctx.fillText(`HP 100/100  (CPU: ${data.cpu}% · ${data.cpu_t.toFixed(1)}°C)`, 18, 154);
    this.drawPipboyBar(ctx, 18, 160, width - 36, 6, data.cpu, pColor);

    // AP (GPU)
    ctx.fillText(`AP  85/100  (GPU: ${data.gpu}% · ${data.gpu_t.toFixed(1)}°C)`, 18, 184);
    this.drawPipboyBar(ctx, 18, 190, width - 36, 6, data.gpu, pColor);

    // Bottom Stats
    ctx.fillText(`RADS: 0  |  WEIGHT: ${data.ram}/100  |  ${data.time}`, 18, 222);
  }

  drawPipboyBar(ctx, x, y, w, h, pct, color) {
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);
    const fillW = Math.max(0, Math.min(w - 2, ((w - 2) * pct) / 100));
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, fillW, h - 2);
  }

  /* =========================================================================
   * 10. MINIMAL NORDIC (Clean Dark Studio / Precision Rings)
   * ========================================================================= */
  renderMinimalNordic(ctx, width, height, data) {
    // Matte Obsidian Space
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, width, height);

    // Fine Vertical Center Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(160, 30);
    ctx.lineTo(160, 160);
    ctx.stroke();

    // Top Subtle Time
    ctx.font = '500 11px "Outfit", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText(data.time, 160, 24);

    // Left Dial: CPU Minimal Ring
    this.drawNordicRing(ctx, 84, 95, 46, data.cpu, 100, 'CPU', `${data.cpu_t.toFixed(1)}°C`, this.accentColor);

    // Right Dial: GPU Minimal Ring
    this.drawNordicRing(ctx, 236, 95, 46, data.gpu, 100, 'GPU', `${data.gpu_t.toFixed(1)}°C`, '#a855f7');

    // Bottom Tray
    ctx.textAlign = 'left';
    ctx.font = '500 10px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RAM', 24, 188);
    ctx.textAlign = 'right';
    ctx.fillText(`${data.ram}% (${data.ram_u || 9.8}/${data.ram_t || 16}GB)`, width - 24, 188);

    // Clean Thin RAM Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(24, 196, width - 48, 4);
    ctx.fillStyle = this.accentColor;
    ctx.fillRect(24, 196, ((width - 48) * data.ram) / 100, 4);

    // Micro Network Stats
    ctx.textAlign = 'center';
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`↓ ${data.net_d} MB/s   ·   ↑ ${data.net_u} MB/s`, 160, 224);
    ctx.textAlign = 'left';
  }

  drawNordicRing(ctx, cx, cy, r, val, maxVal, label, subtext, color) {
    const pct = Math.max(0, Math.min(1, val / maxVal));

    // Thin Background Track
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Active Micro Ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
    ctx.stroke();

    // Big Crisp Number
    ctx.font = '300 24px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(val)}%`, cx, cy + 5);

    // Label Above
    ctx.font = '600 9px "Outfit", sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(label, cx, cy - 14);

    // Subtext Below
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(subtext, cx, cy + 22);
    ctx.textAlign = 'left';
  }

  /* =========================================================================
   * 11. NASA MISSION CONTROL (Apollo / Flight Director Navball & Telemetry)
   * ========================================================================= */
  renderNasaMissionControl(ctx, width, height, data) {
    // Deep space black
    ctx.fillStyle = '#02050f';
    ctx.fillRect(0, 0, width, height);

    // Starfield twinkle
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const alpha = 0.25 + 0.75 * Math.abs(Math.sin(this.frameCount * 0.05 + s.phase));
      ctx.globalAlpha = alpha;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1.0;

    // Header Panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(8, 6, width - 16, 20);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 6, width - 16, 20);

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('★ NASA // DSN MISSION TELEMETRY', 14, 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`MET: ${data.time}`, width - 14, 20);
    ctx.textAlign = 'left';

    // Center Navball / Artificial Horizon (Apollo FDAI)
    const ncx = 160;
    const ncy = 104;
    const nr = 38;

    ctx.save();
    ctx.beginPath();
    ctx.arc(ncx, ncy, nr, 0, Math.PI * 2);
    ctx.clip();

    // Sky half (cyan/navy)
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(ncx - nr, ncy - nr, nr * 2, nr);

    // Ground half (amber/brown)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(ncx - nr, ncy, nr * 2, nr);

    // Pitch lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // 0 deg horizon line
    ctx.moveTo(ncx - 26, ncy);
    ctx.lineTo(ncx + 26, ncy);
    // +10 deg pitch
    ctx.moveTo(ncx - 14, ncy - 12);
    ctx.lineTo(ncx + 14, ncy - 12);
    // -10 deg pitch
    ctx.moveTo(ncx - 14, ncy + 12);
    ctx.lineTo(ncx + 14, ncy + 12);
    ctx.stroke();

    // Crosshair Reticle
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ncx - 12, ncy);
    ctx.lineTo(ncx - 4, ncy);
    ctx.moveTo(ncx + 4, ncy);
    ctx.lineTo(ncx + 12, ncy);
    ctx.moveTo(ncx, ncy - 8);
    ctx.lineTo(ncx, ncy - 3);
    ctx.stroke();
    ctx.restore();

    // Outer Navball Ring & Ticks
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ncx, ncy, nr, 0, Math.PI * 2);
    ctx.stroke();

    // Compass headings
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText('N', ncx, ncy - nr - 2);
    ctx.fillText('S', ncx, ncy + nr + 9);
    ctx.fillText('W', ncx - nr - 5, ncy + 3);
    ctx.fillText('E', ncx + nr + 6, ncy + 3);

    // Left Pod: STAGE 1 / CPU
    this.drawNasaPod(ctx, 10, 32, 96, 126, 'STAGE 1 // CPU', data.cpu, data.cpu_t, '#38bdf8');

    // Right Pod: PROPULSION / GPU
    this.drawNasaPod(ctx, width - 106, 32, 96, 126, 'RCS THRUST // GPU', data.gpu, data.gpu_t, '#f59e0b');

    // Center Navball Caption
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('FDAI HORIZON', ncx, ncy + nr + 20);
    ctx.fillText('STATUS: IN ORBIT', ncx, ncy + nr + 30);
    ctx.textAlign = 'left';

    // Bottom Telemetry Bus
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(8, 192, width - 16, 40);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeRect(8, 192, width - 16, 40);

    // Cryo / RAM Bar
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`O2/RAM: ${data.ram}% (${data.ram_u || (data.ram * 0.16).toFixed(1)}/${data.ram_t || 16}GB)`, 16, 206);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(16, 212, 130, 4);
    ctx.fillStyle = this.accentColor;
    ctx.fillRect(16, 212, (130 * data.ram) / 100, 4);

    // Downlink / Uplink
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`DOWN: ${data.net_d} MB/s`, 168, 206);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`UP: ${data.net_u} MB/s  | BER: 0%`, 168, 222);
  }

  drawNasaPod(ctx, x, y, w, h, title, pct, temp, color) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Title
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(title, x + 6, y + 14);

    // Large readout
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${Math.round(pct)}%`, x + 6, y + 40);

    // Temp readout
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = temp > 75 ? '#ef4444' : (temp > 60 ? '#f59e0b' : '#10b981');
    ctx.fillText(`${temp.toFixed(1)}°C`, x + 6, y + 58);

    // Subtext
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(temp > 75 ? 'STATUS: HIGH' : 'STATUS: NOMINAL', x + 6, y + 72);

    // Stepped vertical bar graph (10 segments)
    const segCount = 10;
    const activeSegs = Math.round((pct / 100) * segCount);
    const barX = x + w - 18;
    const barY = y + 26;
    const barH = h - 34;
    const segH = (barH - 12) / segCount;

    for (let i = 0; i < segCount; i++) {
      const sy = barY + barH - (i + 1) * (segH + 1);
      const isActive = i < activeSegs;
      ctx.fillStyle = isActive ? color : 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(barX, sy, 10, segH);
    }
  }

  /* =========================================================================
   * 12. RETRO VT100 TERMINAL (1980s Vintage Amber Phosphor CRT)
   * ========================================================================= */
  renderRetroVt100Terminal(ctx, width, height, data) {
    const amber = '#ffb000';
    const dimAmber = '#8f5c00';
    const bgAmber = '#0c0700';

    // Amber CRT phosphor background
    ctx.fillStyle = bgAmber;
    ctx.fillRect(0, 0, width, height);

    // CRT Bezel border
    ctx.strokeStyle = dimAmber;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Scanlines
    ctx.fillStyle = 'rgba(255, 176, 0, 0.04)';
    for (let y = 10; y < height - 10; y += 3) {
      ctx.fillRect(8, y, width - 16, 1);
    }

    // Terminal Text
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = amber;

    // Line 1: Header
    ctx.fillText('*** DIGITAL VAX/VMS V5.5 // VT100 CONSOLE ***', 16, 24);
    ctx.fillStyle = dimAmber;
    ctx.fillText('HOST: ALPHA-SERVER   TTY: /dev/tty0   LINK: SERIAL-9600', 16, 38);

    ctx.strokeStyle = dimAmber;
    ctx.beginPath();
    ctx.moveTo(16, 44);
    ctx.lineTo(width - 16, 44);
    ctx.stroke();

    // Data Rows
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = amber;

    // CPU Row
    const cpuBar = this.makeAsciiBlockBar(data.cpu, 14);
    ctx.fillText(`CPU0_LOAD : [${cpuBar}] ${Math.round(data.cpu).toString().padStart(3, ' ')}%`, 16, 68);
    const cpuState = data.cpu_t > 75 ? 'HIGH_TEMP' : 'NOMINAL';
    ctx.fillText(`CPU0_TEMP : ${data.cpu_t.toFixed(1)} DEG C   [STATUS: ${cpuState}]`, 16, 84);

    // GPU Row
    const gpuBar = this.makeAsciiBlockBar(data.gpu, 14);
    ctx.fillText(`GPU0_CORE : [${gpuBar}] ${Math.round(data.gpu).toString().padStart(3, ' ')}%`, 16, 112);
    ctx.fillText(`GPU0_TEMP : ${data.gpu_t.toFixed(1)} DEG C   FAN: ${Math.round(1400 + data.gpu * 12)} RPM`, 16, 128);

    // RAM Row
    const ramBar = this.makeAsciiBlockBar(data.ram, 14);
    ctx.fillText(`MEM_PAGES : [${ramBar}] ${Math.round(data.ram)}%`, 16, 156);
    ctx.fillText(`ALLOCATED : ${data.ram_u || (data.ram * 0.16).toFixed(1)} GB / ${data.ram_t || 16} GB PHYSICAL`, 16, 172);

    // Network & Clock Row
    ctx.fillText(`PACKET_IO : RX ${data.net_d} MB/s   TX ${data.net_u} MB/s   ERR: 0`, 16, 198);

    // Blinking prompt cursor
    const cursor = (this.frameCount % 30 < 15) ? '█' : ' ';
    ctx.fillText(`SYS_TICK  : ${data.time} ${cursor}`, 16, 218);
  }

  makeAsciiBlockBar(pct, len) {
    const filled = Math.max(0, Math.min(len, Math.round((pct / 100) * len)));
    return '▓'.repeat(filled) + '░'.repeat(len - filled);
  }

  /* =========================================================================
   * 13. CYBER NEO-TOKYO (Akira / Ghost in the Shell Japanese Arcade HUD)
   * ========================================================================= */
  renderCyberNeoTokyo(ctx, width, height, data) {
    // Midnight cyber void
    ctx.fillStyle = '#060410';
    ctx.fillRect(0, 0, width, height);

    // Neon perspective horizon grid lines
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 140; y < height; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Top Cyber Banner
    ctx.fillStyle = 'rgba(255, 0, 127, 0.1)';
    ctx.fillRect(8, 6, width - 16, 22);
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 6, width - 16, 22);

    ctx.font = 'bold 9px "Outfit", sans-serif';
    ctx.fillStyle = '#ff007f';
    ctx.fillText('ネオ東京 // 電脳管制システム  [NEO-TOKYO CORE]', 16, 20);

    // Dynamic Kanji Warning Stamp
    let stampText = '正常';
    let stampColor = '#00f0ff';
    if (data.cpu_t >= 75 || data.gpu_t >= 75) {
      stampText = '臨界';
      stampColor = (this.frameCount % 20 < 10) ? '#ff0055' : '#ffffff';
    } else if (data.cpu_t >= 60 || data.gpu_t >= 60) {
      stampText = '警告';
      stampColor = '#ffe600';
    }

    ctx.fillStyle = stampColor;
    ctx.strokeStyle = stampColor;
    ctx.strokeRect(width - 54, 8, 44, 18);
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`[ ${stampText} ]`, width - 32, 21);
    ctx.textAlign = 'left';

    // Left Angular Hex Gauge: CPU 中央演算
    this.drawNeoTokyoHexGauge(ctx, 12, 36, 142, 94, '中央演算 // CPU', data.cpu, data.cpu_t, '#ff007f');

    // Right Angular Hex Gauge: GPU 画像処理
    this.drawNeoTokyoHexGauge(ctx, width - 154, 36, 142, 94, '画像処理 // GPU', data.gpu, data.gpu_t, '#00f0ff');

    // Center Cyber City Skyline Silhouette
    ctx.fillStyle = 'rgba(18, 10, 36, 0.9)';
    ctx.beginPath();
    ctx.moveTo(110, 170);
    ctx.lineTo(110, 145);
    ctx.lineTo(125, 145);
    ctx.lineTo(135, 135);
    ctx.lineTo(145, 135);
    ctx.lineTo(150, 120);
    ctx.lineTo(155, 120);
    ctx.lineTo(160, 110); // Antenna
    ctx.lineTo(165, 120);
    ctx.lineTo(170, 120);
    ctx.lineTo(175, 135);
    ctx.lineTo(185, 135);
    ctx.lineTo(195, 145);
    ctx.lineTo(210, 145);
    ctx.lineTo(210, 170);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Red beacon blinking on Tokyo tower antenna
    if (this.frameCount % 40 < 20) {
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(160, 108, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Kanji label in center
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#ffe600';
    ctx.textAlign = 'center';
    ctx.fillText('電脳都市', 160, 160);
    ctx.textAlign = 'left';

    // Bottom Stats Tray
    ctx.fillStyle = 'rgba(8, 5, 20, 0.92)';
    ctx.fillRect(8, 178, width - 16, 54);
    ctx.strokeStyle = '#ff007f';
    ctx.strokeRect(8, 178, width - 16, 54);

    // RAM Kanji bar
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('主記憶 (RAM)', 16, 194);
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`${Math.round(data.ram)}% [${data.ram_u || (data.ram * 0.16).toFixed(1)}/${data.ram_t || 16}GB]`, 96, 194);

    // RAM Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(16, 200, width - 32, 6);
    ctx.fillStyle = '#ffe600';
    ctx.fillRect(16, 200, ((width - 32) * data.ram) / 100, 6);

    // Bottom Subtext
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`通信: ↓${data.net_d}MB/s  ↑${data.net_u}MB/s`, 16, 222);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff007f';
    ctx.fillText(`刻時: ${data.time}`, width - 16, 222);
    ctx.textAlign = 'left';
  }

  drawNeoTokyoHexGauge(ctx, x, y, w, h, label, val, temp, color) {
    // Chamfered polygon card
    ctx.fillStyle = 'rgba(12, 8, 24, 0.88)';
    ctx.beginPath();
    ctx.moveTo(x + 12, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - 12);
    ctx.lineTo(x + w - 12, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + 12);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(label, x + 10, y + 16);

    // Huge Number
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${Math.round(val)}%`, x + 10, y + 48);

    // Temperature Badge
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = temp > 75 ? '#ff0055' : (temp > 60 ? '#ffe600' : '#00f0ff');
    ctx.fillText(`${temp.toFixed(1)}°C`, x + 10, y + 68);

    // Segmented neon mini bar
    const barW = w - 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x + 10, y + 76, barW, 6);
    ctx.fillStyle = color;
    ctx.fillRect(x + 10, y + 76, (barW * val) / 100, 6);
  }

  /* =========================================================================
   * 14. CHIBI DESK PET (Dynamic Tamagotchi / Virtual Desk Companion)
   * ========================================================================= */
  renderChibiDeskPet(ctx, width, height, data) {
    // Cute pastel dark backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#161226');
    grad.addColorStop(1, '#090712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Floating pastel sparkles
    ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
    for (let i = 0; i < 8; i++) {
      const sx = (i * 42 + this.frameCount * 0.4) % width;
      const sy = (20 + (i * 31) + Math.sin(this.frameCount * 0.05 + i) * 12) % height;
      ctx.fillRect(sx, sy, 2, 2);
    }

    const maxTemp = Math.max(data.cpu_t, data.gpu_t);

    // Top Status Header
    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.fillStyle = '#f472b6';
    ctx.fillText('🐾 VIRTUAL DESK COMPANION', 14, 18);

    ctx.textAlign = 'right';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(data.time, width - 14, 18);
    ctx.textAlign = 'left';

    // Center Pet Character Box (Vector animated kitty/pet)
    const petX = 160;
    const petY = 82;
    this.drawChibiPetMascot(ctx, petX, petY, maxTemp, data.cpu);

    // Left Floating Bubble Card: CPU
    this.drawChibiPillCard(ctx, 10, 32, 92, 108, 'CPU CORE', `${Math.round(data.cpu)}%`, `${data.cpu_t.toFixed(1)}°C`, data.cpu, '#f472b6');

    // Right Floating Bubble Card: GPU
    this.drawChibiPillCard(ctx, width - 102, 32, 92, 108, 'GPU ENGINE', `${Math.round(data.gpu)}%`, `${data.gpu_t.toFixed(1)}°C`, data.gpu, '#c084fc');

    // Bottom Tray Card
    ctx.fillStyle = 'rgba(30, 24, 52, 0.75)';
    ctx.fillRect(10, 154, width - 20, 78);
    ctx.strokeStyle = 'rgba(255, 182, 193, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 154, width - 20, 78);

    // Memory bar
    ctx.font = 'bold 9px "Outfit", sans-serif';
    ctx.fillStyle = '#f9a8d4';
    ctx.fillText(`MEMORY: ${Math.round(data.ram)}% (${data.ram_u || (data.ram * 0.16).toFixed(1)}/${data.ram_t || 16}GB)`, 20, 172);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(20, 178, width - 40, 6);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(20, 178, ((width - 40) * data.ram) / 100, 6);

    // Bottom Stats
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`SPEED: ↓${data.net_d}MB/s  ↑${data.net_u}MB/s`, 20, 202);

    // Pet Tamagotchi Status
    ctx.font = 'bold 9px "Outfit", sans-serif';
    ctx.fillStyle = '#fcd34d';
    ctx.textAlign = 'right';
    ctx.fillText(`LEVEL 99 · HAPPINESS 100%`, width - 20, 202);
    ctx.textAlign = 'left';

    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('TOUCH TO PET  ·  60 FPS SYNCHRONIZED', 160, 222);
    ctx.textAlign = 'left';
  }

  drawChibiPillCard(ctx, x, y, w, h, title, val, temp, pct, color) {
    ctx.fillStyle = 'rgba(24, 18, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(title, x + 8, y + 16);

    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(val, x + 8, y + 44);

    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f9a8d4';
    ctx.fillText(temp, x + 8, y + 64);

    // Mini pill bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x + 8, y + 74, w - 16, 6);
    ctx.fillStyle = color;
    ctx.fillRect(x + 8, y + 74, ((w - 16) * pct) / 100, 6);
  }

  drawChibiPetMascot(ctx, cx, cy, temp, cpuLoad) {
    const bounce = Math.sin(this.petPhase) * 2;
    const petY = cy + bounce;

    // Cat Face / Head Body
    ctx.fillStyle = '#fef08a'; // Soft cream yellow cat
    ctx.beginPath();
    ctx.arc(cx, petY, 24, 0, Math.PI * 2);
    ctx.fill();

    // Cat Ears
    ctx.fillStyle = '#fef08a';
    // Left ear
    ctx.beginPath();
    ctx.moveTo(cx - 18, petY - 14);
    ctx.lineTo(cx - 24, petY - 32);
    ctx.lineTo(cx - 8, petY - 22);
    ctx.closePath();
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.moveTo(cx + 18, petY - 14);
    ctx.lineTo(cx + 24, petY - 32);
    ctx.lineTo(cx + 8, petY - 22);
    ctx.closePath();
    ctx.fill();

    // Pink ear interiors
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(cx - 16, petY - 16);
    ctx.lineTo(cx - 21, petY - 28);
    ctx.lineTo(cx - 10, petY - 21);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 16, petY - 16);
    ctx.lineTo(cx + 21, petY - 28);
    ctx.lineTo(cx + 10, petY - 21);
    ctx.closePath();
    ctx.fill();

    // Pink Blush Cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
    ctx.beginPath();
    ctx.arc(cx - 14, petY + 4, 4, 0, Math.PI * 2);
    ctx.arc(cx + 14, petY + 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cute Expressions based on Temperature
    if (temp < 45) {
      // NAP MODE (Sleeping closed eyes)
      ctx.strokeStyle = '#33271e';
      ctx.lineWidth = 1.8;
      // Left eye closed curve
      ctx.beginPath(); ctx.arc(cx - 9, petY - 2, 4, 0.2, Math.PI - 0.2); ctx.stroke();
      // Right eye closed curve
      ctx.beginPath(); ctx.arc(cx + 9, petY - 2, 4, 0.2, Math.PI - 0.2); ctx.stroke();

      // Mouth cute cat w
      ctx.beginPath();
      ctx.moveTo(cx - 3, petY + 6); ctx.lineTo(cx, petY + 8); ctx.lineTo(cx + 3, petY + 6);
      ctx.stroke();

      // Floating Zzz
      ctx.font = 'bold 9px "Outfit", sans-serif';
      ctx.fillStyle = '#38bdf8';
      const zOffset = (this.frameCount * 0.8) % 30;
      ctx.fillText('z', cx + 18, petY - 14 - zOffset);
      ctx.fillText('Z', cx + 24, petY - 22 - zOffset);

      // Label
      ctx.font = 'bold 8px "Outfit", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('( ˘ω˘ ) NAP // COOL', cx, petY + 38);
      ctx.textAlign = 'left';

    } else if (temp < 68) {
      // HAPPY MODE (Awake smile)
      ctx.fillStyle = '#33271e';
      const blink = (this.frameCount % 60) < 5;
      if (blink) {
        ctx.strokeStyle = '#33271e';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx - 12, petY - 2); ctx.lineTo(cx - 6, petY - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 6, petY - 2); ctx.lineTo(cx + 12, petY - 2); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(cx - 9, petY - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 9, petY - 2, 3, 0, Math.PI * 2); ctx.fill();
      }

      // Mouth smile
      ctx.strokeStyle = '#33271e';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, petY + 4, 4, 0, Math.PI); ctx.stroke();

      // Floating heart
      ctx.fillStyle = '#f472b6';
      ctx.font = '10px sans-serif';
      ctx.fillText('♡', cx + 18, petY - 18);

      // Label
      ctx.font = 'bold 8px "Outfit", sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.fillText('(｡♥‿♥｡) HAPPY // ALL GOOD', cx, petY + 38);
      ctx.textAlign = 'left';

    } else if (temp < 78) {
      // SWEATING MODE
      ctx.fillStyle = '#33271e';
      ctx.beginPath(); ctx.arc(cx - 9, petY - 2, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 9, petY - 2, 2.5, 0, Math.PI * 2); ctx.fill();

      // Open O mouth
      ctx.beginPath(); ctx.arc(cx, petY + 6, 3, 0, Math.PI * 2); ctx.fill();

      // Sweating blue teardrop
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx + 20, petY - 4, 3, 0, Math.PI * 2);
      ctx.lineTo(cx + 20, petY - 10);
      ctx.fill();

      // Label
      ctx.font = 'bold 8px "Outfit", sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.textAlign = 'center';
      ctx.fillText('(；ﾟДﾟ) SWEATING! WORK HARD', cx, petY + 38);
      ctx.textAlign = 'left';

    } else {
      // OVERHEAT / PANIC MODE
      // Spiral/X eyes
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      // Left X
      ctx.beginPath();
      ctx.moveTo(cx - 12, petY - 5); ctx.lineTo(cx - 6, petY + 1);
      ctx.moveTo(cx - 6, petY - 5); ctx.lineTo(cx - 12, petY + 1);
      // Right X
      ctx.moveTo(cx + 6, petY - 5); ctx.lineTo(cx + 12, petY + 1);
      ctx.moveTo(cx + 12, petY - 5); ctx.lineTo(cx + 6, petY + 1);
      ctx.stroke();

      // Screaming wide mouth
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(cx, petY + 7, 5, 0, Math.PI); ctx.fill();

      // Fire flame particles above ears
      ctx.fillStyle = '#f97316';
      const flameH = (this.frameCount % 10) * 1.5;
      ctx.beginPath();
      ctx.arc(cx, petY - 32 - flameH, 6, 0, Math.PI * 2);
      ctx.arc(cx - 12, petY - 28 - flameH, 4, 0, Math.PI * 2);
      ctx.arc(cx + 12, petY - 28 - flameH, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = 'bold 8px "Outfit", sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('(ノಠ益ಠ)ノ TOO HOT!! OVERHEAT', cx, petY + 38);
      ctx.textAlign = 'left';
    }
  }

  /* =========================================================================
   * 15. STEAMPUNK CHRONOMETER (Victorian Brass & Copper Industrial Boiler)
   * ========================================================================= */
  renderSteampunkChrono(ctx, width, height, data) {
    // Dark aged bronze & mahogany plate
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#1c1008');
    bg.addColorStop(1, '#0c0703');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Brass edge rivets
    ctx.fillStyle = '#d97706';
    for (let x = 12; x < width; x += 32) {
      this.drawRivet(ctx, x, 6);
      this.drawRivet(ctx, x, height - 6);
    }
    for (let y = 16; y < height - 10; y += 32) {
      this.drawRivet(ctx, 6, y);
      this.drawRivet(ctx, width - 6, y);
    }

    // Top Brass Plaque
    ctx.fillStyle = 'rgba(217, 119, 6, 0.15)';
    ctx.fillRect(16, 12, width - 32, 20);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 12, width - 32, 20);

    ctx.font = 'bold 9px "Outfit", serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('⚙ VICTORIAN STEAM ENGINE // TELEMETRY CHRONO', 24, 26);

    ctx.textAlign = 'right';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#d97706';
    ctx.fillText(data.time, width - 24, 26);
    ctx.textAlign = 'left';

    // Center Rotating Brass Interlocking Gears
    this.drawSteampunkGears(ctx, 160, 102, this.gearAngle);

    // Left Dial: Steam Boiler Pressure Gauge (CPU)
    this.drawVictorianDial(ctx, 68, 102, 42, 'BOILER / CPU', data.cpu, data.cpu_t, 'PSI');

    // Right Dial: Dynamo Speedometer (GPU)
    this.drawVictorianDial(ctx, width - 68, 102, 42, 'DYNAMO / GPU', data.gpu, data.gpu_t, 'RPM');

    // Bottom Element: Mercury Barometer Vacuum Tube (RAM)
    ctx.fillStyle = 'rgba(12, 7, 3, 0.9)';
    ctx.fillRect(20, 172, width - 40, 56);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 172, width - 40, 56);

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`MERCURY BAROMETER (RAM): ${Math.round(data.ram)}%`, 30, 190);

    // Glass tube with glowing amber mercury column
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(30, 196, width - 60, 10);
    ctx.strokeStyle = '#92400e';
    ctx.strokeRect(30, 196, width - 60, 10);

    // Liquid mercury fill
    const mercW = ((width - 60) * data.ram) / 100;
    const mercGrad = ctx.createLinearGradient(30, 196, 30, 206);
    mercGrad.addColorStop(0, '#fef08a');
    mercGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = mercGrad;
    ctx.fillRect(30, 196, mercW, 10);

    // Plaque footer
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#a16207';
    ctx.fillText(`PATENT 1892  ·  STEAM FLOW: ${data.net_d} MB/s  ·  VENT: ${data.net_u} MB/s`, 30, 220);
  }

  drawRivet(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#92400e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 0.8, y - 0.8, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#fde68a';
    ctx.fill();
  }

  drawVictorianDial(ctx, cx, cy, r, label, val, temp, unit) {
    // Aged Cream Parchment Face
    const dialGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    dialGrad.addColorStop(0, '#fef3c7');
    dialGrad.addColorStop(0.85, '#fde68a');
    dialGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = dialGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Brass Bezel Outer Rings
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tick Marks around perimeter
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 12; i++) {
      const angle = ((-135 + i * 24.5) * Math.PI) / 180;
      const x1 = cx + (r - 7) * Math.cos(angle);
      const y1 = cy + (r - 7) * Math.sin(angle);
      const x2 = cx + (r - 2) * Math.cos(angle);
      const y2 = cy + (r - 2) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Needle Angle (-135 deg to +135 deg)
    const pct = Math.max(0, Math.min(1, val / 100));
    const needleAngle = ((-135 + pct * 270) * Math.PI) / 180;

    // Needle
    ctx.strokeStyle = '#b91c1c'; // Red oxide needle
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (r - 9) * Math.cos(needleAngle), cy + (r - 9) * Math.sin(needleAngle));
    ctx.stroke();

    // Brass center cap
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Dial text
    ctx.font = 'bold 8px "Outfit", serif';
    ctx.fillStyle = '#78350f';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy - 14);

    // Digital readout below dial
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${Math.round(val)}%`, cx, cy + r + 13);
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#fde68a';
    ctx.fillText(`${temp.toFixed(1)}°C`, cx, cy + r + 24);
    ctx.textAlign = 'left';
  }

  drawSteampunkGears(ctx, cx, cy, angle) {
    // Primary Large Gear (12 teeth)
    this.drawSingleGear(ctx, cx - 10, cy, 24, 12, angle, '#b45309');

    // Secondary Interlocking Smaller Gear (8 teeth)
    this.drawSingleGear(ctx, cx + 18, cy + 14, 16, 8, -angle * 1.5, '#d97706');
  }

  drawSingleGear(ctx, x, y, r, teeth, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = color;
    ctx.beginPath();
    const toothDepth = 4;
    for (let i = 0; i < teeth; i++) {
      const a1 = (i * 2 * Math.PI) / teeth;
      const a2 = a1 + Math.PI / teeth;
      ctx.arc(0, 0, r + toothDepth, a1, a1 + Math.PI / (teeth * 2));
      ctx.arc(0, 0, r, a1 + Math.PI / (teeth * 2), a2);
    }
    ctx.closePath();
    ctx.fill();

    // Center hub cutout
    ctx.fillStyle = '#1c1008';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Center brass screw
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /* =========================================================================
   * 16. PIXEL RPG STATUS (16-Bit JRPG Boss Battle Status Screen)
   * ========================================================================= */
  renderPixelRpgStatus(ctx, width, height, data) {
    // Classic 16-bit royal blue gradient box
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#0a2366');
    bg.addColorStop(1, '#020b22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Classic 16-Bit White Beveled Window Borders
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, width - 16, height - 16);
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Header: Party Leader info
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText('⚔ HERO PC // LV.99', 18, 26);

    // Status condition
    const isHot = data.cpu_t > 75 || data.gpu_t > 75;
    const condText = isHot ? '[ STATUS: OVERHEAT ]' : '[ STATUS: HASTE ]';
    const condColor = isHot ? ((this.frameCount % 20 < 10) ? '#ef4444' : '#ffffff') : '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillStyle = condColor;
    ctx.fillText(condText, width - 18, 26);
    ctx.textAlign = 'left';

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(18, 34);
    ctx.lineTo(width - 18, 34);
    ctx.stroke();

    // HP Bar = CPU
    this.drawRpgBar(ctx, 18, 44, width - 36, 'HP (CPU)', data.cpu, data.cpu_t, '#22c55e', '#15803d');

    // MP Bar = GPU
    this.drawRpgBar(ctx, 18, 86, width - 36, 'MP (GPU)', data.gpu, data.gpu_t, '#38bdf8', '#0369a1');

    // EXP Bar = RAM
    this.drawRpgBar(ctx, 18, 128, width - 36, 'EXP (RAM)', data.ram, null, '#facc15', '#a16207', `${data.ram_u || (data.ram * 0.16).toFixed(1)}/${data.ram_t || 16}GB`);

    // Bottom RPG Command Menu Window
    ctx.fillStyle = 'rgba(2, 11, 34, 0.95)';
    ctx.fillRect(14, 172, width - 28, 56);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(14, 172, width - 28, 56);

    // Blinking Pointer Cursor
    const cursor = (this.frameCount % 30 < 15) ? '▶' : ' ';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${cursor} ATTACK    MAGIC    ITEM    BOOST`, 24, 192);

    // Gold & System Clock
    const goldCount = Math.round(data.net_d * 1000 + 3450);
    ctx.fillStyle = '#facc15';
    ctx.fillText(`GOLD: ${goldCount.toLocaleString()} G`, 24, 214);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`TIME: ${data.time}`, width - 24, 214);
    ctx.textAlign = 'left';
  }

  drawRpgBar(ctx, x, y, w, label, pct, temp, c1, c2, extra = null) {
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x, y + 8);

    // Numbers
    ctx.textAlign = 'right';
    if (temp !== null) {
      ctx.fillStyle = temp > 75 ? '#ef4444' : '#ffffff';
      ctx.fillText(`${Math.round(pct)}/100  (${temp.toFixed(1)}°C)`, x + w, y + 8);
    } else if (extra) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(`${Math.round(pct)}%  (${extra})`, x + w, y + 8);
    }
    ctx.textAlign = 'left';

    // 16-bit 3D beveled bar box
    const barY = y + 14;
    const barH = 12;

    // Dark inset background
    ctx.fillStyle = '#050c1e';
    ctx.fillRect(x, barY, w, barH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, barY, w, barH);

    // Filled progress
    const fillW = Math.max(0, Math.min(w - 2, ((w - 2) * pct) / 100));
    if (fillW > 0) {
      const grad = ctx.createLinearGradient(x + 1, barY + 1, x + 1, barY + barH - 1);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, barY + 1, fillW, barH - 2);

      // Top highlight line for 16-bit gloss
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(x + 1, barY + 1, fillW, 2);
    }
  }
}

