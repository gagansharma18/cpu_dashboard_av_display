const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getTelemetry: () => ipcRenderer.invoke('get-system-telemetry'),
  togglePopout: () => ipcRenderer.invoke('toggle-popout-window'),
  onPopoutClosed: (callback) => ipcRenderer.on('popout-closed', callback)
});
