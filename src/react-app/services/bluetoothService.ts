/**
 * Bluetooth Service Simulation
 * 
 * NOTE: This is a simulation of Bluetooth functionality.
 * Web Bluetooth API has limited support for P2P messaging in browsers.
 * This simulates device discovery and messaging for demonstration purposes.
 */

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number; // Signal strength
  connected: boolean;
  lastSeen: number;
}

export interface Message {
  id: string;
  deviceId: string;
  content: string;
  timestamp: number;
  delivered: boolean;
  direction: 'sent' | 'received';
}

class BluetoothServiceSimulator {
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();
  private connectedDevice: BluetoothDevice | null = null;
  private scanning: boolean = false;
  private listeners: Map<string, Set<(data?: unknown) => void>> = new Map();

  // Simulated nearby devices
  private readonly simulatedDevices = [
    { name: "Alex's Phone", baseRssi: -45 },
    { name: "Sarah's Tablet", baseRssi: -62 },
    { name: "Mike's Device", baseRssi: -78 },
    { name: "Emma's Phone", baseRssi: -55 },
    { name: "David's Laptop", baseRssi: -88 },
  ];

  constructor() {
    this.loadState();
  }

  private readonly storageKey = 'bluetooth_state_v1';

  private loadState() {
    try {
      const savedState = localStorage.getItem(this.storageKey);
      if (!savedState) return;
      const state = JSON.parse(savedState);
      if (state && state.connectedDevice) {
        this.connectedDevice = state.connectedDevice;
      }
    } catch (e) {
      // ignore corrupt storage
      console.warn('Failed to load bluetooth state from localStorage', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        connectedDevice: this.connectedDevice
      }));
    } catch (e) {
      console.warn('Failed to save bluetooth state to localStorage', e);
    }
  }

  addEventListener<T = unknown>(event: string, callback: (data: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    // Store as an unknown-accepting callback internally.
    this.listeners.get(event)!.add(callback as unknown as (data?: unknown) => void);
  }

  removeEventListener<T = unknown>(event: string, callback: (data: T) => void) {
    this.listeners.get(event)?.delete(callback as unknown as (data?: unknown) => void);
  }

  private emit(event: string, data?: unknown) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  async startScanning(): Promise<void> {
    if (this.scanning) return;
    
    this.scanning = true;
    this.discoveredDevices.clear();
    this.emit('scanStarted');

    // Simulate discovering devices over time
    for (let i = 0; i < this.simulatedDevices.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
      
      if (!this.scanning) break;

      const simDevice = this.simulatedDevices[i];
      const device: BluetoothDevice = {
        id: `device_${i}_${Date.now()}`,
        name: simDevice.name,
        rssi: simDevice.baseRssi + Math.floor(Math.random() * 10 - 5),
        connected: false,
        lastSeen: Date.now()
      };

      this.discoveredDevices.set(device.id, device);
      this.emit('deviceDiscovered', device);
    }

    this.scanning = false;
    this.emit('scanCompleted');
  }

  stopScanning() {
    this.scanning = false;
  }

  getDiscoveredDevices(): BluetoothDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  async connect(deviceId: string): Promise<boolean> {
    const device = this.discoveredDevices.get(deviceId);
    if (!device) return false;

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 90% success rate
    if (Math.random() > 0.1) {
      device.connected = true;
      this.connectedDevice = device;
      this.saveState();
      this.emit('deviceConnected', device);
      return true;
    } else {
      this.emit('connectionFailed', device);
      return false;
    }
  }

  disconnect() {
    if (this.connectedDevice) {
      const device = this.connectedDevice;
      device.connected = false;
      this.connectedDevice = null;
      this.saveState();
      this.emit('deviceDisconnected', device);
    }
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  async sendMessage(content: string): Promise<boolean> {
    if (!this.connectedDevice) return false;

    // Simulate transmission delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // 95% success rate if connected
    if (Math.random() > 0.05) {
      this.emit('messageSent', { content, deviceId: this.connectedDevice.id });
      
      // Simulate receiving an auto-response after a delay
      setTimeout(() => {
        if (this.connectedDevice) {
          const responses = [
            "Got it!",
            "Thanks for the message!",
            "👍",
            "I'll check on that",
            "Sure thing",
            "Sounds good",
          ];
          const response = responses[Math.floor(Math.random() * responses.length)];
          this.emit('messageReceived', {
            content: response,
            deviceId: this.connectedDevice.id
          });
        }
      }, 1000 + Math.random() * 2000);

      return true;
    } else {
      return false;
    }
  }

  // Check if Web Bluetooth API is available
  static isSupported(): boolean {
    return 'bluetooth' in navigator;
  }
}

// Singleton instance
export const bluetoothService = new BluetoothServiceSimulator();
