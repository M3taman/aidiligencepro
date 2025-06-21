import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import cors from "cors";

// Expect STRIPE_SECRET_KEY to be stored as a Firebase secret via
//  firebase functions:secrets:set STRIPE_SECRET_KEY
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

// Create a Stripe client – Node-20 runtime supports the latest API version
const stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
  apiVersion: "2023-10-16",
});

// Helper to wrap CORS for simple JSON endpoints
const corsHandler = cors({ origin: true, methods: ["POST"] });

// 1) Create Stripe Checkout Session
export const createCheckoutSession = onRequest({
  secrets: [STRIPE_SECRET_KEY],
}, async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { priceId, quantity = 1, customer_email } = req.body as {
        priceId: string;
        quantity?: number;
        customer_email?: string;
      };

      if (!priceId) {
        res.status(400).json({ error: "priceId required" });
        return;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: priceId,
            quantity,
          },
        ],
        success_url:
          "https://ai-diligence.web.app/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://ai-diligence.web.app/cancel",
        customer_email,
        automatic_tax: { enabled: true },
      });

      res.json({ sessionId: session.id });
    } catch (err) {
      console.error("Stripe checkout session error", err);
      res.status(500).json({ error: "Unable to create session" });
    }
  });
});

// 2) Webhook – Stripe hits this to confirm payment. Use the signing secret.
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

export const stripeWebhook = onRequest({
  secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
}, async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const rawBody = (req as any).rawBody as Buffer;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig ?? "",
      STRIPE_WEBHOOK_SECRET.value()
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  // Handle the completed checkout – credit the user
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // TODO: grant report credits in Firestore or mark user as premium
    console.log("Payment received for session", session.id);
  }

  res.json({ received: true });
});
