import { Client, type IMessage } from '@stomp/stompjs';
import type { NotificationRealtimePayload } from '../entities/notification/types';
import { STORAGE_KEYS } from '../shared/constants/storage';

const normalizeLocalWsProtocol = (url: string) => {
  // Local dev backend is plain HTTP by default, so wss://localhost will fail TLS handshake.
  if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
    return url.replace(/^wss:\/\/localhost(?::\d+)?/i, (match) => match.replace(/^wss:/i, 'ws:'));
  }

  return url;
};

const resolveWsUrl = () => {
  const wsBaseFromEnv = import.meta.env.VITE_WS_BASE_URL;
  if (wsBaseFromEnv) {
    return normalizeLocalWsProtocol(wsBaseFromEnv);
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
  const baseWithoutApi = apiBase.replace(/\/api\/?$/, '');
  const wsOrigin = baseWithoutApi.replace(/^http/, 'ws');
  return normalizeLocalWsProtocol(`${wsOrigin}/ws`);
};

const WS_URL = resolveWsUrl();

class NotificationSocketService {
  private client: Client | null = null;

  connect(
    onMessage: (payload: NotificationRealtimePayload) => void,
    onConnectionStateChange?: (isConnected: boolean) => void,
  ): () => void {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    if (!token) {
      onConnectionStateChange?.(false);
      return () => undefined;
    }

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        onConnectionStateChange?.(true);
        client.subscribe('/user/queue/notifications', (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body) as NotificationRealtimePayload;
            onMessage(payload);
          } catch {
            // Ignore malformed payloads to avoid breaking live updates.
          }
        });
      },
      onDisconnect: () => onConnectionStateChange?.(false),
      onStompError: () => onConnectionStateChange?.(false),
      onWebSocketClose: () => onConnectionStateChange?.(false),
      onWebSocketError: () => onConnectionStateChange?.(false),
    });

    client.activate();
    this.client = client;

    return () => {
      if (this.client) {
        onConnectionStateChange?.(false);
        this.client.deactivate();
        this.client = null;
      }
    };
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

const notificationSocketService = new NotificationSocketService();

export default notificationSocketService;
