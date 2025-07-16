import React from 'react';

const ReportDisplay = ({ report }: { report: string }) => {
  const downloadPdf = () => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${report}`;
    link.download = "report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Report</h2>
      <div className="text-gray-600">
        {report ? (
          <div>
            <button 
              onClick={downloadPdf}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg mb-4"
            >
              Download PDF
            </button>
            <iframe 
              src={`data:application/pdf;base64,${report}`}
              className="w-full h-96"
              title="Report"
            ></iframe>
          </div>
        ) : (
          <p>Your generated report will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default ReportDisplay;