import React from "react";
import { checkout } from "@/lib/stripe";
import { Button } from "@/components/ui/button";

type Props = {
  priceId: string; // Stripe price identifier
  quantity?: number;
  children?: React.ReactNode;
};

export const CheckoutButton: React.FC<Props> = ({ priceId, quantity = 1, children }) => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await checkout(priceId, quantity);
    } catch (err) {
      console.error(err);
      alert("Payment failed to start. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} className="neo-button">
      {loading ? "Redirecting…" : children || "Buy now"}
    </Button>
  );
};
