/**
 * USB Hardware Streamer via Web Serial API
 * Directly streams JSON telemetry packets to the ESP32 via USB Serial.
 */

export class UsbStreamer {
  constructor() {
    this.port = null;
    this.writer = null;
    this.isConnected = false;
    this.baudRate = 115200;
    this.packetCount = 0;
    this.lastPacketTime = 0;
    this.onStateChange = null;
    this.onLog = null;
  }

  isSupported() {
    return 'serial' in navigator;
  }

  log(msg) {
    if (this.onLog) this.onLog(msg);
  }

  async connect(baud = 115200) {
    if (!this.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser. Please use Chrome, Edge, or the Electron Desktop App.');
    }

    try {
      this.baudRate = baud;
      this.log(`[SERIAL] Requesting USB device from user...`);
      this.port = await navigator.serial.requestPort();

      this.log(`[SERIAL] Opening port at ${this.baudRate} baud...`);
      await this.port.open({ baudRate: this.baudRate });

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();

      this.isConnected = true;
      this.packetCount = 0;
      this.log(`[SERIAL] Connected successfully! Handshaking with ESP32...`);

      // Send initial handshake ping
      await this.sendRaw('PING\n');
      this.log(`[SERIAL] Sent PING handshake.`);

      if (this.onStateChange) this.onStateChange(true);
      return true;
    } catch (err) {
      this.isConnected = false;
      this.log(`[ERROR] Connection failed: ${err.message}`);
      if (this.onStateChange) this.onStateChange(false);
      throw err;
    }
  }

  async disconnect() {
    try {
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      this.isConnected = false;
      this.log(`[SERIAL] Disconnected.`);
      if (this.onStateChange) this.onStateChange(false);
    } catch (err) {
      console.warn('Error during disconnect:', err);
    }
  }

  async sendRaw(str) {
    if (!this.isConnected || !this.writer) return;
    try {
      await this.writer.write(str);
    } catch (err) {
      this.log(`[ERROR] Write error: ${err.message}`);
      this.disconnect();
    }
  }

  async sendTelemetry(data) {
    if (!this.isConnected || !this.writer) return;

    const payload = JSON.stringify({
      cpu: data.cpu,
      cpu_t: data.cpu_t,
      gpu: data.gpu,
      gpu_t: data.gpu_t,
      vram: data.vram,
      ram: data.ram,
      ram_u: data.ram_u,
      ram_t: data.ram_t,
      net_d: data.net_d,
      net_u: data.net_u,
      time: data.time
    }) + '\n';

    await this.sendRaw(payload);
    this.packetCount++;
    this.lastPacketTime = Date.now();
  }
}
