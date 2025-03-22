import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-12">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">
          Last updated: March 15, 2024
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="text-gray-600 mb-4">
            At Aidiligence Pro, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
          <p className="text-gray-600">
            Please read this privacy policy carefully. By using our services, you consent to the practices described in this policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
          <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Name and contact information</li>
            <li>Email address</li>
            <li>Company information</li>
            <li>Payment information</li>
            <li>Account credentials</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Usage Data</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited</li>
            <li>Time spent on our website</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Due Diligence Data</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Company information for analysis</li>
            <li>Financial data</li>
            <li>Market research data</li>
            <li>Generated reports</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>To provide and maintain our services</li>
            <li>To process your transactions</li>
            <li>To send you important updates and notifications</li>
            <li>To improve our services and user experience</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <p className="text-gray-600">
            However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Data Sharing and Disclosure</h2>
          <p className="text-gray-600 mb-4">
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Service providers and business partners</li>
            <li>Legal authorities when required by law</li>
            <li>Other users with your consent</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
          <p className="text-gray-600 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Cookies</h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at:
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

export default Privacy; 