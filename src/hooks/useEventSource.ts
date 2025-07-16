import { useState, useEffect } from 'react';

export const useEventSource = (url: string) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return data;
};