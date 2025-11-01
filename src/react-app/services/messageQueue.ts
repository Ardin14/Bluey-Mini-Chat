/**
 * Bluey MeshConnect Algorithm Implementation
 * 
 * Manages message queuing, delivery, and retries for offline messaging
 */

import { Message } from './bluetoothService';

// Re-export Message for convenience
export type { Message } from './bluetoothService';

export interface QueuedMessage extends Message {
  retries: number;
  maxRetries: number;
  nextRetry?: number;
}

class MessageQueueManager {
  private outbox: Map<string, QueuedMessage> = new Map();
  private inbox: Map<string, Message> = new Map();
  private readonly STORAGE_KEY_OUTBOX = 'bluey_outbox';
  private readonly STORAGE_KEY_INBOX = 'bluey_inbox';
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY = 3000; // 3 seconds

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const outboxData = localStorage.getItem(this.STORAGE_KEY_OUTBOX);
      if (outboxData) {
        const parsed = JSON.parse(outboxData);
        this.outbox = new Map(Object.entries(parsed));
      }

      const inboxData = localStorage.getItem(this.STORAGE_KEY_INBOX);
      if (inboxData) {
        const parsed = JSON.parse(inboxData);
        this.inbox = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load message queue from storage', error);
    }
  }

  private saveToStorage() {
    try {
      const outboxObj = Object.fromEntries(this.outbox);
      localStorage.setItem(this.STORAGE_KEY_OUTBOX, JSON.stringify(outboxObj));

      const inboxObj = Object.fromEntries(this.inbox);
      localStorage.setItem(this.STORAGE_KEY_INBOX, JSON.stringify(inboxObj));
    } catch (error) {
      console.error('Failed to save message queue to storage', error);
    }
  }

  // Add a message to the outbox
  enqueueMessage(message: Message): QueuedMessage {
    const queuedMessage: QueuedMessage = {
      ...message,
      retries: 0,
      maxRetries: this.MAX_RETRIES,
      delivered: false
    };

    this.outbox.set(message.id, queuedMessage);
    this.saveToStorage();
    return queuedMessage;
  }

  // Add a received message to inbox
  receiveMessage(message: Message) {
    this.inbox.set(message.id, message);
    this.saveToStorage();
  }

  // Mark a message as delivered
  markDelivered(messageId: string): boolean {
    const message = this.outbox.get(messageId);
    if (message) {
      message.delivered = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Get all pending messages for a device
  getPendingMessages(deviceId?: string): QueuedMessage[] {
    const pending = Array.from(this.outbox.values()).filter(
      msg => !msg.delivered && (!deviceId || msg.deviceId === deviceId)
    );
    return pending;
  }

  // Get all delivered messages
  getDeliveredMessages(deviceId?: string): QueuedMessage[] {
    const delivered = Array.from(this.outbox.values()).filter(
      msg => msg.delivered && (!deviceId || msg.deviceId === deviceId)
    );
    return delivered;
  }

  // Get all received messages
  getReceivedMessages(deviceId?: string): Message[] {
    const received = Array.from(this.inbox.values()).filter(
      msg => !deviceId || msg.deviceId === deviceId
    );
    return received;
  }

  // Get all messages for a conversation
  getConversation(deviceId: string): (Message | QueuedMessage)[] {
    const sent = Array.from(this.outbox.values()).filter(
      msg => msg.deviceId === deviceId
    );
    const received = Array.from(this.inbox.values()).filter(
      msg => msg.deviceId === deviceId
    );

    const all = [...sent, ...received];
    all.sort((a, b) => a.timestamp - b.timestamp);
    return all;
  }

  // Retry failed messages
  async retryPendingMessages(
    deviceId: string,
    sendFunction: (content: string) => Promise<boolean>
  ): Promise<number> {
    const pending = this.getPendingMessages(deviceId);
    let successCount = 0;

    for (const message of pending) {
      if (message.retries >= message.maxRetries) continue;

      const now = Date.now();
      if (message.nextRetry && message.nextRetry > now) continue;

      message.retries++;
      message.nextRetry = now + this.RETRY_DELAY;

      const success = await sendFunction(message.content);
      if (success) {
        this.markDelivered(message.id);
        successCount++;
      }
    }

    this.saveToStorage();
    return successCount;
  }

  // Clear old messages (older than 7 days)
  cleanupOldMessages() {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    for (const [id, message] of this.outbox) {
      if (message.timestamp < sevenDaysAgo) {
        this.outbox.delete(id);
      }
    }

    for (const [id, message] of this.inbox) {
      if (message.timestamp < sevenDaysAgo) {
        this.inbox.delete(id);
      }
    }

    this.saveToStorage();
  }

  // Get queue statistics
  getStats() {
    return {
      pending: this.getPendingMessages().length,
      delivered: this.getDeliveredMessages().length,
      received: Array.from(this.inbox.values()).length,
      total: this.outbox.size + this.inbox.size
    };
  }

  // Clear all messages
  clearAll() {
    this.outbox.clear();
    this.inbox.clear();
    this.saveToStorage();
  }
}

// Singleton instance
export const messageQueue = new MessageQueueManager();
