import { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, Users, Wifi, Globe } from 'lucide-react';
import DeviceList from '@/react-app/components/DeviceList';
import ChatInterface from '@/react-app/components/ChatInterface';
import StatusBar from '@/react-app/components/StatusBar';
import { bluetoothService, BluetoothDevice, Message } from '@/react-app/services/bluetoothService';
import { messageQueue, QueuedMessage } from '@/react-app/services/messageQueue';

export default function Home() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [messages, setMessages] = useState<(Message | QueuedMessage)[]>([]);
  const [stats, setStats] = useState(messageQueue.getStats());
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Check if already connected
    const device = bluetoothService.getConnectedDevice();
    if (device) {
      setConnectedDevice(device);
      loadMessages(device.id);
    }

    // Set up event listeners
    const handleDeviceDiscovered = (device: BluetoothDevice) => {
      setDevices(prev => [...prev, device]);
    };

    const handleScanCompleted = () => {
      setScanning(false);
    };

    const handleDeviceConnected = (device: BluetoothDevice) => {
      setConnectedDevice(device);
      setConnecting(false);
      loadMessages(device.id);
    };

    const handleDeviceDisconnected = () => {
      setConnectedDevice(null);
      setMessages([]);
    };

    const handleConnectionFailed = () => {
      setConnecting(false);
      alert('Failed to connect to device. Please try again.');
    };

    const handleMessageSent = () => {
      if (connectedDevice) {
        loadMessages(connectedDevice.id);
        updateStats();
      }
    };

    const handleMessageReceived = (data: { content: string; deviceId: string }) => {
      const message: Message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        deviceId: data.deviceId,
        content: data.content,
        timestamp: Date.now(),
        delivered: true,
        direction: 'received'
      };
      messageQueue.receiveMessage(message);
      if (connectedDevice?.id === data.deviceId) {
        loadMessages(data.deviceId);
      }
      updateStats();
    };

    bluetoothService.addEventListener('deviceDiscovered', handleDeviceDiscovered);
    bluetoothService.addEventListener('scanCompleted', handleScanCompleted);
    bluetoothService.addEventListener('deviceConnected', handleDeviceConnected);
    bluetoothService.addEventListener('deviceDisconnected', handleDeviceDisconnected);
    bluetoothService.addEventListener('connectionFailed', handleConnectionFailed);
    bluetoothService.addEventListener('messageSent', handleMessageSent);
    bluetoothService.addEventListener('messageReceived', handleMessageReceived);

    return () => {
      bluetoothService.removeEventListener('deviceDiscovered', handleDeviceDiscovered);
      bluetoothService.removeEventListener('scanCompleted', handleScanCompleted);
      bluetoothService.removeEventListener('deviceConnected', handleDeviceConnected);
      bluetoothService.removeEventListener('deviceDisconnected', handleDeviceDisconnected);
      bluetoothService.removeEventListener('connectionFailed', handleConnectionFailed);
      bluetoothService.removeEventListener('messageSent', handleMessageSent);
      bluetoothService.removeEventListener('messageReceived', handleMessageReceived);
    };
  }, [connectedDevice]);

  const loadMessages = (deviceId: string) => {
    const conversation = messageQueue.getConversation(deviceId);
    setMessages(conversation);
  };

  const updateStats = () => {
    setStats(messageQueue.getStats());
  };

  const handleStartScan = async () => {
    setScanning(true);
    setDevices([]);
    await bluetoothService.startScanning();
  };

  const handleConnect = async (deviceId: string) => {
    setConnecting(true);
    const success = await bluetoothService.connect(deviceId);
    if (!success) {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    bluetoothService.disconnect();
  };

  const handleSendMessage = async (content: string) => {
    if (!connectedDevice) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      deviceId: connectedDevice.id,
      content,
      timestamp: Date.now(),
      delivered: false,
      direction: 'sent'
    };

    messageQueue.enqueueMessage(message);
    const success = await bluetoothService.sendMessage(content);
    
    if (success) {
      messageQueue.markDelivered(message.id);
    }

    loadMessages(connectedDevice.id);
    updateStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Bluey Mini Chat</h1>
                <p className="text-sm text-blue-600 font-medium">Offline Bluetooth Messenger</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Impact Statement Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5" />
                <span className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Impact</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Connecting Communities Without Internet
              </h2>
              <p className="text-lg text-blue-50 leading-relaxed mb-6">
                Bluey Mini Chat enables people in low-connectivity regions like Uganda to communicate offline using Bluetooth. Perfect for students, farmers, and small communities where mobile data is expensive or unreliable.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-200" />
                  <span className="text-blue-50">Community-Driven</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-200" />
                  <span className="text-blue-50">No Internet Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-200" />
                  <span className="text-blue-50">Free Communication</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold mb-1">50%</div>
                  <div className="text-blue-100 text-sm">of Africa lacks reliable internet</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">2B+</div>
                  <div className="text-blue-100 text-sm">people could benefit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulation Notice */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Demo Mode</p>
            <p className="text-blue-700">
              This is a working prototype of the Bluey MeshConnect Algorithm. Web Bluetooth API has limited P2P support, so we're simulating device discovery and messaging for demonstration purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <StatusBar isConnected={connectedDevice !== null} stats={stats} />

        <div className="flex justify-center mt-8">
          {!connectedDevice ? (
            <DeviceList
              devices={devices}
              scanning={scanning}
              connectedDeviceId={null}
              onConnect={handleConnect}
              onStartScan={handleStartScan}
            />
          ) : (
            <ChatInterface
              device={connectedDevice}
              messages={messages}
              onSendMessage={handleSendMessage}
              onDisconnect={handleDisconnect}
            />
          )}
        </div>

        {connecting && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-800 font-semibold text-lg">Connecting to device...</p>
              <p className="text-gray-600 text-sm mt-1">Please wait</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 text-sm">
            Built with <span className="text-blue-600 font-semibold">Bluey MeshConnect Algorithm</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Empowering offline communication in communities worldwide
          </p>
        </div>
      </footer>
    </div>
  );
}
