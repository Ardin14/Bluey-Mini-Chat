import { useState, useEffect, useRef } from 'react';
import { Send, Check, CheckCheck, Clock, Bluetooth, MessageSquare } from 'lucide-react';
import { BluetoothDevice, Message } from '@/react-app/services/bluetoothService';
import { QueuedMessage } from '@/react-app/services/messageQueue';

interface ChatInterfaceProps {
  device: BluetoothDevice;
  messages: (Message | QueuedMessage)[];
  onSendMessage: (content: string) => void;
  onDisconnect: () => void;
}

export default function ChatInterface({
  device,
  messages,
  onSendMessage,
  onDisconnect
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageStatus = (message: Message | QueuedMessage) => {
    if (message.direction === 'received') return null;
    
    const queuedMsg = message as QueuedMessage;
    if (queuedMsg.delivered) {
      return <CheckCheck className="w-4 h-4 text-blue-400" />;
    } else if (queuedMsg.retries && queuedMsg.retries > 0) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-blue-100 flex flex-col h-[700px]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Bluetooth className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{device.name}</h3>
            <p className="text-sm text-blue-100">Connected via Bluetooth</p>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all font-medium"
        >
          Disconnect
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/30 to-white">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No messages yet</p>
            <p className="text-gray-500 text-sm">Start the conversation!</p>
          </div>
        )}

        {messages.map(message => {
          const isSent = message.direction === 'sent';
          const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={message.id}
              className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`max-w-[75%] ${isSent ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className={`px-5 py-3 rounded-3xl shadow-sm ${
                    isSent
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                      : 'bg-white border border-blue-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-xs text-gray-500 px-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span>{time}</span>
                  {getMessageStatus(message)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-blue-100 bg-white rounded-b-3xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-800 text-[15px]"
            maxLength={200}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 px-1">
          {inputValue.length}/200 characters
        </p>
      </div>
    </div>
  );
}
