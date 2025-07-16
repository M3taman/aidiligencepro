import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define the structure of the report data
interface ReportData {
  reportSummary: string;
  sentiment: number;
  prediction: string;
  confidence: number;
  companyName: string;
  keyMetrics: { [key: string]: string | number };
  sentimentHistory: number[];
}

const DashboardPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!companyName) {
      setError('Please enter a company name.');
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const functions = getFunctions();
      const getMCPData = httpsCallable(functions, 'getMCPData');
      const result = await getMCPData({ company: companyName }) as { data: ReportData };
      setReport({ ...result.data, companyName }); // Add companyName to the report
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    // This is a placeholder for the PDF generation logic.
    // In a real application, you would use a library like jsPDF or a backend service.
    alert('Downloading PDF...');
  };

  const sentimentChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Current'],
    datasets: [
      {
        label: 'Sentiment Trend',
        data: report ? [...report.sentimentHistory, report.sentiment] : [],
        fill: false,
        borderColor: report && report.sentiment >= 0.5 ? '#4ade80' : '#f87171',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold">AI-Powered Due Diligence</h1>
          <p className="text-gray-400 mt-2">Generate comprehensive reports in seconds.</p>
        </div>

        {/* Report Generation Input */}
        <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter Company Name (e.g., Apple, Tesla)"
              className="flex-grow bg-gray-800 text-white placeholder-gray-500 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:bg-gray-500"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>

        {/* Report Display Area */}
        {report && (
          <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold">{report.companyName} Due Diligence Report</h2>
              <button
                onClick={handleDownloadPdf}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
              >
                Download as PDF
              </button>
            </div>

            {/* Summary & Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">AI-Generated Summary</h3>
                <p className="text-gray-300">{report.reportSummary}</p>
              </div>
              <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">Key Metrics</h3>
                <ul className="space-y-2">
                  {Object.entries(report.keyMetrics).map(([key, value]) => (
                    <li key={key} className="flex justify-between">
                      <span className="font-medium text-gray-400">{key}:</span>
                      <span className="font-bold">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sentiment Analysis Chart */}
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Sentiment Analysis Trend</h3>
              <div style={{ height: '300px' }}>
                <Line data={sentimentChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
