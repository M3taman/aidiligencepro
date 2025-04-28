import React, { useEffect, useRef } from 'react';

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AQssVsG_YrsgV2JzMc4CQK_VhpYgfR00tT1752ZcDG_qu7BMP6slb39SjZ1GrbeG_j6lwleZnD-n44qi&currency=${currency}`;
      script.async = true;
      script.onload = () => renderButton();
      script.onerror = (err) => {
        console.error('PayPal SDK failed to load', err);
        onError?.(err);
      };
      document.body.appendChild(script);
    } else {
      renderButton();
    }

    function renderButton() {
      if (!window.paypal || !paypalRef.current) return;

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount,
                  currency_code: currency,
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            console.log('Payment approved:', details);
            onSuccess?.(details);
          } catch (err) {
            console.error('Payment capture error:', err);
            onError?.(err);
          }
        },
        onError: (err: any) => {
          console.error('PayPal Button error:', err);
          onError?.(err);
        },
      }).render(paypalRef.current);
    }
  }, [amount, currency, onSuccess, onError]);

  return <div ref={paypalRef} />;
};

export default PayPalButton;
