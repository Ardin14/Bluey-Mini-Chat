import { Bluetooth, Signal, Loader2 } from 'lucide-react';
import { BluetoothDevice } from '@/react-app/services/bluetoothService';

interface DeviceListProps {
  devices: BluetoothDevice[];
  scanning: boolean;
  connectedDeviceId: string | null;
  onConnect: (deviceId: string) => void;
  onStartScan: () => void;
}

export default function DeviceList({
  devices,
  scanning,
  connectedDeviceId,
  onConnect,
  onStartScan
}: DeviceListProps) {
  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return { bars: 3, color: 'text-green-500' };
    if (rssi > -70) return { bars: 2, color: 'text-yellow-500' };
    return { bars: 1, color: 'text-red-500' };
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Bluetooth className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900">Nearby Devices</h2>
        </div>
        <button
          onClick={onStartScan}
          disabled={scanning}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning
            </>
          ) : (
            'Scan'
          )}
        </button>
      </div>

      {devices.length === 0 && !scanning && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bluetooth className="w-10 h-10 text-blue-300" />
          </div>
          <p className="text-gray-600 font-medium mb-1">No devices found</p>
          <p className="text-gray-500 text-sm">Tap Scan to discover nearby devices</p>
        </div>
      )}

      <div className="space-y-3">
        {devices.map(device => {
          const signal = getSignalStrength(device.rssi);
          const isConnected = device.id === connectedDeviceId;

          return (
            <button
              key={device.id}
              onClick={() => !isConnected && onConnect(device.id)}
              className={`w-full p-5 rounded-2xl transition-all ${
                isConnected
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-[1.02]'
                  : 'bg-blue-50 hover:bg-blue-100 text-gray-800 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConnected ? 'bg-white/20' : 'bg-white'}`}>
                    <Bluetooth className={`w-6 h-6 ${isConnected ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-lg">{device.name}</p>
                    {isConnected && (
                      <p className="text-sm text-blue-100">Connected</p>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${isConnected ? 'text-white' : signal.color}`}>
                  <Signal className="w-5 h-5" />
                  <span className="text-sm font-medium">{device.rssi} dBm</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
