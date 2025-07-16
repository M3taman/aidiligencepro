import React from 'react';
import Pricing from './Pricing';

const LandingPage = () => {
  return (
    <>
      <section id="hero" className="text-center py-20 bg-white">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            The Future of Due Diligence is Here
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Leverage AI and the Model Context Protocol for unparalleled insights and efficiency.
          </p>
          <a href="#pricing" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors text-lg">
            Get Started
          </a>
        </div>
      </section>
      <Pricing />
    </>
  );
};

export default LandingPage;
