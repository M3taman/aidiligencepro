import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Lazy-loads Stripe.js instance. Publishable key expected in VITE_STRIPE_PUBLISHABLE_KEY
 */
export function getStripe() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    stripePromise = loadStripe(key ?? "");
  }
  return stripePromise;
}

/** Create checkout session and redirect */
export async function checkout(priceId: string, quantity = 1) {
  const resp = await fetch("/createCheckoutSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, quantity }),
  });
  if (!resp.ok) throw new Error("Unable to initialise payment");
  const { sessionId } = await resp.json();
  const stripe = await getStripe();
  await stripe?.redirectToCheckout({ sessionId });
}
