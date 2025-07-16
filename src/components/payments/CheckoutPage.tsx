import React from 'react';
import SubscriptionPanel from './SubscriptionPanel';

const CheckoutPage = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-white mb-8">Choose Your Plan</h1>
      <div className="max-w-4xl mx-auto">
        <SubscriptionPanel />
      </div>
      <div id="paypal-button-container" className="max-w-md mx-auto mt-8"></div>
    </div>
  );
};

export default CheckoutPage;