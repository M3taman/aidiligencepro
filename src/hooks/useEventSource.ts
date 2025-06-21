import { useEffect, useRef, useState } from "react";

interface EventData<T> {
  data: T;
  event?: string;
}

export function useEventSource<T = any>(
  url: string | null,
  { start = true }: { start?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url || !start) return;

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setIsOpen(true);
    es.onerror = (e) => {
      setIsOpen(false);
      setError("Connection lost");
    };
    es.onmessage = (e) => {
      try {
        const parsed: EventData<T> = JSON.parse(e.data);
        setData(parsed as any);
      } catch {
        // non-json, ignore
      }
    };

    return () => {
      es.close();
    };
  }, [url, start]);

  return { data, error, isOpen };
}
