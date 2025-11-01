import { Wifi, WifiOff, Inbox, Send } from 'lucide-react';

interface StatusBarProps {
  isConnected: boolean;
  stats: {
    pending: number;
    delivered: number;
    received: number;
    total: number;
  };
}

export default function StatusBar({ isConnected, stats }: StatusBarProps) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
            {isConnected ? (
              <Wifi className="w-6 h-6 text-green-600" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-0.5">Connection</p>
            <p className="font-bold text-gray-800">
              {isConnected ? 'Connected' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Send className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-0.5">Sent</p>
            <p className="font-bold text-gray-800 text-xl">{stats.delivered}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Inbox className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-0.5">Received</p>
            <p className="font-bold text-gray-800 text-xl">{stats.received}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
            <Inbox className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-0.5">Queued</p>
            <p className="font-bold text-gray-800 text-xl">{stats.pending}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
