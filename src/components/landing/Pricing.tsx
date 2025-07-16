import React from 'react';

const Pricing = () => {
  const tiers = [
    {
      name: 'Professional',
      price: '$499',
      freq: '/month',
      description: 'For professionals and small teams.',
      features: [
        '50 Full Reports per Month',
        'Real-time Data via MCP',
        'AI-Powered Analysis',
        'Email Support',
      ],
      cta: 'Choose Professional',
    },
    {
      name: 'Enterprise',
      price: '$2000',
      freq: '/month',
      description: 'For large organizations and heavy usage.',
      features: [
        'Unlimited Full Reports',
        'Real-time Data via MCP',
        'AI-Powered Analysis',
        'Dedicated Account Manager',
        'Priority Support',
      ],
      cta: 'Contact Sales',
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Find the Right Plan for Your Team</h2>
          <p className="text-lg text-gray-600 mt-2">Start your journey with our powerful AI-driven due diligence platform.</p>
        </div>
        <div className="flex justify-center gap-8">
          {tiers.map((tier) => (
            <div key={tier.name} className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800">{tier.name}</h3>
              <p className="text-gray-500 mt-2">{tier.description}</p>
              <div className="my-6">
                <span className="text-5xl font-extrabold text-gray-900">{tier.price}</span>
                <span className="text-xl font-medium text-gray-500">{tier.freq}</span>
              </div>
              <ul className="space-y-4 text-gray-600 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <a href="/checkout" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center">
                  {tier.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
