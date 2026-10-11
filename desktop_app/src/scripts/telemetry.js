/**
 * Telemetry Manager
 * Unifies real-time hardware metrics from Electron IPC and simulated web telemetry.
 */

export class TelemetryManager {
  constructor() {
    this.isElectron = !!(window.electronAPI && window.electronAPI.isElectron);
    this.simulatedMode = !this.isElectron;
    this.listeners = [];

    // Current State
    this.data = {
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

    // Manual slider overrides
    this.manualOverrides = {
      active: false,
      cpu: 45,
      gpu: 68,
      ram: 60
    };

    this.simTime = 0;
    this.startPolling();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.data);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.data));
  }

  setManualOverride(metric, val) {
    this.manualOverrides[metric] = Number(val);
    this.manualOverrides.active = true;
    this.updateData();
  }

  clearManualOverride() {
    this.manualOverrides.active = false;
  }

  setSimulatedMode(enabled) {
    this.simulatedMode = enabled;
  }

  startPolling() {
    setInterval(() => {
      this.updateData();
    }, 1000);
  }

  async updateData() {
    const clockStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (this.isElectron && !this.simulatedMode) {
      try {
        const live = await window.electronAPI.getTelemetry();
        if (live) {
          this.data = { ...live, time: clockStr };
          this.notify();
          return;
        }
      } catch (err) {
        console.warn('Electron telemetry fetch failed, falling back to sim:', err);
      }
    }

    // Procedural Simulation
    this.simTime += 1;
    const t = this.simTime;

    let cpu = 45 + 35 * Math.sin(t * 0.15) + 10 * Math.cos(t * 0.4);
    let gpu = 55 + 38 * Math.sin(t * 0.18 + 1.2);
    let ram = 60 + 8 * Math.sin(t * 0.05);

    if (this.manualOverrides.active) {
      if (this.manualOverrides.cpu !== undefined) cpu = this.manualOverrides.cpu;
      if (this.manualOverrides.gpu !== undefined) gpu = this.manualOverrides.gpu;
      if (this.manualOverrides.ram !== undefined) ram = this.manualOverrides.ram;
    }

    cpu = Math.max(5, Math.min(99, Math.round(cpu)));
    gpu = Math.max(2, Math.min(99, Math.round(gpu)));
    ram = Math.max(10, Math.min(95, Math.round(ram)));

    const cpu_t = Math.round(42 + cpu * 0.4);
    const gpu_t = Math.round(40 + gpu * 0.38);
    const vram = Math.max(10, Math.min(95, Math.round(50 + 25 * Math.sin(t * 0.1))));

    const net_d = Number(Math.abs(14.2 * Math.sin(t * 0.25) + 5 * Math.cos(t * 0.6)).toFixed(1));
    const net_u = Number(Math.abs(3.8 * Math.cos(t * 0.2)).toFixed(1));

    this.data = {
      cpu,
      cpu_t,
      gpu,
      gpu_t,
      ram,
      ram_u: Number(((ram / 100) * 16.0).toFixed(1)),
      ram_t: 16.0,
      vram,
      net_d,
      net_u,
      time: clockStr
    };

    this.notify();
  }
}
