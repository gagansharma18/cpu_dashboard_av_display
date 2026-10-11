import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let popoutWindow = null;

// Dynamic import for systeminformation
let si = null;
try {
  si = await import('systeminformation');
} catch (err) {
  console.warn('systeminformation failed to load:', err);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#070a12',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableWebSQL: false
    }
  });

  // Load Vite dev server if running, or local index.html
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  mainWindow.loadURL(devServerUrl).catch(() => {
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (popoutWindow) {
      popoutWindow.close();
    }
  });
}

// Pop-out Floating Mini Preview Window (AIDA64 / Case Monitor Widget style)
function createPopoutWindow() {
  if (popoutWindow) {
    popoutWindow.focus();
    return;
  }

  popoutWindow = new BrowserWindow({
    width: 640,
    height: 480,
    resizable: true,
    alwaysOnTop: true,
    backgroundColor: '#000000',
    title: 'AIO Display Mini View',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  popoutWindow.loadFile(path.join(__dirname, '../index.html'), { query: { mode: 'popout' } });

  popoutWindow.on('closed', () => {
    popoutWindow = null;
    if (mainWindow) {
      mainWindow.webContents.send('popout-closed');
    }
  });
}

// Setup IPC Handlers
ipcMain.handle('get-system-telemetry', async () => {
  if (!si) return null;
  try {
    const [cpuLoad, cpuTemp, mem, graphics, netStats] = await Promise.all([
      si.currentLoad(),
      si.cpuTemperature(),
      si.mem(),
      si.graphics(),
      si.networkStats()
    ]);

    // Primary GPU detection
    const primaryGpu = (graphics.controllers && graphics.controllers[0]) || {};
    const vramTotal = primaryGpu.vram || 8192;
    const vramUsed = primaryGpu.memoryUsed || Math.round(vramTotal * 0.45);

    // Network throughput
    const net = netStats && netStats[0] ? netStats[0] : { rx_sec: 0, tx_sec: 0 };
    const netDownMb = Math.max(0, (net.rx_sec || 0) / (1024 * 1024));
    const netUpMb = Math.max(0, (net.tx_sec || 0) / (1024 * 1024));

    return {
      cpu: Math.round(cpuLoad.currentLoad || 0),
      cpu_t: Math.round(cpuTemp.main || (42 + (cpuLoad.currentLoad || 0) * 0.38)),
      gpu: Math.round(primaryGpu.utilizationGpu || 0),
      gpu_t: Math.round(primaryGpu.temperatureGpu || (40 + (primaryGpu.utilizationGpu || 0) * 0.35)),
      vram: Math.round((vramUsed / vramTotal) * 100),
      ram: Math.round((mem.active / mem.total) * 100),
      ram_u: Number((mem.active / (1024 ** 3)).toFixed(1)),
      ram_t: Number((mem.total / (1024 ** 3)).toFixed(1)),
      net_d: Number(netDownMb.toFixed(1)),
      net_u: Number(netUpMb.toFixed(1)),
      time: new Date().toLocaleTimeString('en-US', { hour12: false })
    };
  } catch (err) {
    console.error('Telemetry polling error:', err);
    return null;
  }
});

ipcMain.handle('toggle-popout-window', () => {
  if (popoutWindow) {
    popoutWindow.close();
  } else {
    createPopoutWindow();
  }
  return !!popoutWindow;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
