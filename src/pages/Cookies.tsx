import React from 'react';

const Cookies = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-12">Cookies Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">
          Last updated: March 15, 2024
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
          <p className="text-gray-600 mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide a better user experience.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
          <p className="text-gray-600 mb-4">
            We use cookies to understand how you use our website and to improve your experience. This includes personalizing content, providing social media features, and analyzing our traffic.
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li className="mb-2">Essential cookies: Required for the website to function properly</li>
            <li className="mb-2">Analytics cookies: Help us understand how visitors interact with our website</li>
            <li className="mb-2">Preference cookies: Remember your settings and preferences</li>
            <li>Marketing cookies: Track your activity across websites for marketing purposes</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
          
          <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies are necessary for the website to function properly. They enable core functionality such as:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li>User authentication</li>
            <li>Session management</li>
            <li>Security features</li>
            <li>Basic website functionality</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
          <p className="text-gray-600 mb-4">
            We use analytics cookies to understand how visitors interact with our website by:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li>Tracking page views</li>
            <li>Measuring user engagement</li>
            <li>Identifying popular content</li>
            <li>Improving website performance</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Preference Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies remember your settings and preferences, such as:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li>Language preferences</li>
            <li>Theme settings</li>
            <li>Report customization</li>
            <li>Notification preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Marketing Cookies</h3>
          <p className="text-gray-600 mb-4">
            We use marketing cookies to:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Track your visits across websites</li>
            <li>Display relevant advertisements</li>
            <li>Measure the effectiveness of our marketing campaigns</li>
            <li>Improve our marketing strategies</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
          <p className="text-gray-600 mb-4">
            We use cookies for various purposes, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Providing and maintaining our services</li>
            <li>Improving user experience</li>
            <li>Analyzing website performance</li>
            <li>Personalizing content and advertisements</li>
            <li>Ensuring security and preventing fraud</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
          <p className="text-gray-600 mb-4">
            We may use cookies from third-party services such as:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Google Analytics for website analytics</li>
            <li>Stripe for payment processing</li>
            <li>Social media platforms for sharing features</li>
            <li>Marketing tools for campaign tracking</li>
          </ul>
          <p className="text-gray-600">
            These third parties may also use cookies to collect information about your online activities across different websites.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
          <p className="text-gray-600 mb-4">
            You can control and manage cookies in various ways:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Browser settings to block or delete cookies</li>
            <li>Our cookie consent banner to manage preferences</li>
            <li>Third-party opt-out tools for advertising cookies</li>
          </ul>
          <p className="text-gray-600">
            Please note that blocking certain cookies may impact your experience on our website.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update this Cookies Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about our use of cookies, please contact us at:
          </p>
          <p className="text-gray-600 mt-2">
            Email: privacy@aidiligence.pro<br />
            Address: 123 Investment Street, New York, NY 10001, United States
          </p>
        </section>
      </div>
    </div>
  );
};

export default Cookies; 