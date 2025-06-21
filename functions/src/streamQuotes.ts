import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import fetch from "node-fetch";

const ALPHA_VANTAGE_API_KEY = defineSecret("ALPHA_VANTAGE_API_KEY");

/**
 * Server-sent events endpoint that streams the latest quote for a given symbol
 * every `pollMs` milliseconds (default 15s). This keeps the HTTP connection
 * open and pushes JSON payloads in the form: { price: number, ts: number }
 *
 * Example request: /streamQuote?symbol=AAPL&pollMs=5000
 */
export const streamQuote = onRequest({
  timeoutSeconds: 540, // 9 minutes – max allowed for Functions v2 HTTPS
  memory: "256MiB",
  secrets: [ALPHA_VANTAGE_API_KEY],
}, async (req, res) => {
  const symbol = (req.query.symbol as string)?.toUpperCase() || "AAPL";
  const pollMs = Math.max(Number(req.query.pollMs) || 15000, 5000); // >=5s

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let active = true;
  req.on("close", () => {
    active = false;
  });

  const sendQuote = async () => {
    try {
      // Alpha Vantage free tier: 5 req/min => 12s interval is safe
      const url =
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY.value()}`;
      const resp = await fetch(url);
      const data = (await resp.json()) as any;
      const priceStr = data["Global Quote"]?.["05. price"];
      const price = priceStr ? Number(priceStr) : null;

      const payload = { symbol, price, ts: Date.now() };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err: any) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
    }
  };

  await sendQuote();
  const interval = setInterval(async () => {
    if (!active) {
      clearInterval(interval);
      return;
    }
    await sendQuote();
  }, pollMs);
});
