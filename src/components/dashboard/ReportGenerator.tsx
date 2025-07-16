import React, { useState } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";

const ReportGenerator = ({ setReport }: { setReport: (report: string) => void }) => {
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    const functions = getFunctions();
    const generateReport = httpsCallable(functions, 'generateReport');

    try {
      const result = await generateReport({ company });
      const data = result.data as { report: string };
      setReport(data.report);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate a New Report</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
          Company Name or Ticker
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="company"
          type="text"
          placeholder="e.g., Apple Inc. or AAPL"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
      <button
        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="button"
        onClick={handleGenerate}
        disabled={loading || !company}
      >
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
    </div>
  );
};

export default ReportGenerator;