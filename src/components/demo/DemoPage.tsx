import React, { useState } from 'react';

const DemoPage = () => {
  const [company, setCompany] = useState('Apple Inc.');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');

  const handleGenerate = () => {
    setLoading(true);
    setReport('');
    // Simulate API call with sample data
    setTimeout(() => {
      setReport(`This is a sample due diligence report for ${company}. It includes a summary of the company's financials, recent news, and an analysis of its market position.`);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Live Demo</h1>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate a Sample Report</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
              Company Name or Ticker
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <button
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Sample Report'}
          </button>
        </div>
        {report && (
          <div className="bg-white rounded-lg shadow-md p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Report</h2>
            <div className="text-gray-600">
              <p>{report}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPage;
