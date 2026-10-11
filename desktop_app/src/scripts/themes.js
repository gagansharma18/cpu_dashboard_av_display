/**
 * Canvas Theme Renderers for 320x240 LCD Display
 * Supports 5 distinct visual styles matching AIO Cooler and Cabinet screens.
 */

export const THEMES = {
  CYBERPUNK_HUD: 'cyberpunk_hud',
  KRAKEN_AIO: 'kraken_aio',
  SYNTHWAVE_GRID: 'synthwave_grid',
  REACTOR_CORE: 'reactor_core',
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
  }

  setTheme(themeId) {
    if (Object.values(THEMES).includes(themeId)) {
      this.currentTheme = themeId;
    }
  }

  setAccentColor(colorHex) {
    this.accentColor = colorHex;
  }

  setCustomImage(imgElement) {
    this.customImage = imgElement;
  }

  render(ctx, width, height, data) {
    this.frameCount++;
    this.radarAngle = (this.radarAngle + 3.5 + (data.cpu * 0.04)) % 360;
    this.pulsePhase = (this.pulsePhase + 0.08 + (data.cpu * 0.002)) % (Math.PI * 2);
    this.gridOffset = (this.gridOffset + 1.2) % 24;

    // Clear Screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    switch (this.currentTheme) {
      case THEMES.CYBERPUNK_HUD:
        this.renderCyberpunkHud(ctx, width, height, data);
        break;
      case THEMES.KRAKEN_AIO:
        this.renderKrakenAio(ctx, width, height, data);
        break;
      case THEMES.SYNTHWAVE_GRID:
        this.renderSynthwaveGrid(ctx, width, height, data);
        break;
      case THEMES.REACTOR_CORE:
        this.renderReactorCore(ctx, width, height, data);
        break;
      case THEMES.CUSTOM_WALLPAPER:
        this.renderCustomWallpaper(ctx, width, height, data);
        break;
    }
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
    ctx.fillText(`PUMP: 2450 RPM  |  RAM: ${data.ram}%  |  ${data.time}`, 160, 222);
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
    this.drawGlassCard(ctx, 16, 20, 100, 72, 'CPU CORE', `${data.cpu}%`, `${data.cpu_t}°C`, '#00f0ff');
    this.drawGlassCard(ctx, 204, 20, 100, 72, 'GPU ENGINE', `${data.gpu}%`, `${data.gpu_t}°C`, '#f43f5e');

    // Bottom Cyber Pill
    ctx.fillStyle = 'rgba(12, 5, 26, 0.85)';
    ctx.fillRect(50, 208, 220, 24);
    ctx.strokeStyle = '#00f0ff';
    ctx.strokeRect(50, 208, 220, 24);
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`RAM: ${data.ram}%  //  NET: ${data.net_d} MB/s`, 160, 224);
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
    ctx.fillText(`CPU: ${data.cpu_t}°C`, 14, 24);
    ctx.fillText(`RAM: ${data.ram}%`, 14, 40);

    ctx.textAlign = 'right';
    ctx.fillText(`GPU: ${data.gpu}% (${data.gpu_t}°C)`, width - 14, 24);
    ctx.fillText(`VRAM: ${data.vram}%`, width - 14, 40);

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
    ctx.fillText(`${data.cpu_t}°C`, 30, 210);

    // GPU Stat
    ctx.font = '600 11px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GPU ENGINE', 130, 172);
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`${Math.round(data.gpu)}%`, 130, 194);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${data.gpu_t}°C`, 130, 210);

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
}
