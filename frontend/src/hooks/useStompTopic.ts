import { useEffect, useRef } from 'react';
import { subscribe } from '@/lib/ws';

/**
 * Subscribe to a STOMP topic for the lifetime of the component.
 *
 * The handler is kept in a ref so callers can pass an inline function without
 * re-subscribing on every render; the subscription only resets when `topic`
 * changes or `enabled` flips.
 */
export function useStompTopic<T = unknown>(
  topic: string | null | undefined,
  handler: (payload: T) => void,
  enabled = true,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || !topic) return;
    const unsubscribe = subscribe(topic, (payload) => {
      handlerRef.current(payload as T);
    });
    return unsubscribe;
  }, [topic, enabled]);
}
