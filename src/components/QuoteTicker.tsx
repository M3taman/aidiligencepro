import { useEffect, useState } from "react";
import { useEventSource } from "@/hooks/useEventSource";

interface QuoteTickerProps {
  symbol: string;
  pollMs?: number;
}

export default function QuoteTicker({ symbol, pollMs = 15000 }: QuoteTickerProps) {
  const url = `/api/streamQuote?symbol=${encodeURIComponent(symbol)}&pollMs=${pollMs}`;
  const { data, error, isOpen } = useEventSource<{ symbol: string; price: number; ts: number }>(url);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  useEffect(() => {
    if (data?.price) {
      setLastPrice(data.price);
    }
  }, [data]);

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="font-semibold">{symbol.toUpperCase()}</span>
      {error && <span className="text-red-500">offline</span>}
      {!error && (
        <span className="tabular-nums">
          {lastPrice !== null ? lastPrice.toFixed(2) : "---"}
        </span>
      )}
      {!error && <span className={isOpen ? "text-green-500" : "text-yellow-500"}>●</span>}
    </div>
  );
}
