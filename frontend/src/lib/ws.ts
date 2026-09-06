/**
 * STOMP-over-SockJS client manager.
 *
 * A single shared `Client` is reused across the app; components subscribe to
 * topics through `subscribe()` and receive parsed JSON payloads. The backend
 * uses a simple broker (`/topic/...`) with no per-frame auth, so no token is
 * sent on CONNECT — see the README "WebSocket hardening" note for productionis-
 * ing this (authenticate the CONNECT frame + use user-scoped destinations).
 */

import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from './constants';

type Listener = (payload: unknown) => void;

let client: Client | null = null;
let connected = false;
/** Topic → set of listeners, so multiple components can share one subscription. */
const listeners = new Map<string, Set<Listener>>();
/** Topic → live STOMP subscription handle. */
const subscriptions = new Map<string, StompSubscription>();

function ensureClient(): Client {
  if (client) return client;

  client = new Client({
    // SockJS gives us fallback transport + works cleanly behind the Vite proxy.
    webSocketFactory: () => new SockJS(WS_URL) as unknown as WebSocket,
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      connected = true;
      // (Re)establish broker subscriptions for every topic with listeners.
      listeners.forEach((_set, topic) => openSubscription(topic));
    },
    onWebSocketClose: () => {
      connected = false;
      subscriptions.clear();
    },
    onStompError: (frame) => {
      // Broker-reported error — log for diagnostics, keep the client alive.
      // eslint-disable-next-line no-console
      console.warn('STOMP error', frame.headers['message'], frame.body);
    },
  });

  client.activate();
  return client;
}

function openSubscription(topic: string): void {
  if (!client || !connected || subscriptions.has(topic)) return;
  const sub = client.subscribe(topic, (message: IMessage) => {
    let payload: unknown = message.body;
    try {
      payload = JSON.parse(message.body);
    } catch {
      /* leave as raw string */
    }
    listeners.get(topic)?.forEach((fn) => {
      try {
        fn(payload);
      } catch {
        /* a bad listener must not break the others */
      }
    });
  });
  subscriptions.set(topic, sub);
}

/**
 * Subscribe to a broker topic. Returns an unsubscribe function that also tears
 * down the underlying STOMP subscription once the last listener leaves.
 */
export function subscribe(topic: string, listener: Listener): () => void {
  ensureClient();

  let set = listeners.get(topic);
  if (!set) {
    set = new Set();
    listeners.set(topic, set);
  }
  set.add(listener);

  openSubscription(topic);

  return () => {
    const current = listeners.get(topic);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) {
      listeners.delete(topic);
      subscriptions.get(topic)?.unsubscribe();
      subscriptions.delete(topic);
    }
  };
}

export const wsTopics = {
  notifications: (userId: number) => `/topic/notifications/${userId}`,
  leaderboard: (competitionId: number) =>
    `/topic/competitions/${competitionId}/leaderboard`,
};

/** Fully tear down the client (used on logout). */
export function disconnectWs(): void {
  listeners.clear();
  subscriptions.clear();
  connected = false;
  client?.deactivate();
  client = null;
}
