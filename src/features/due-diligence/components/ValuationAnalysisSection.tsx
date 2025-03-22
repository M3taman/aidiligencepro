import React from 'react';
import { DueDiligenceReport } from '../types';
import ReportSection from './ReportSection';

interface ValuationAnalysisSectionProps {
  data: DueDiligenceReport['valuationAnalysis'];
}

/**
 * Valuation Analysis section of the due diligence report
 */
export const ValuationAnalysisSection: React.FC<ValuationAnalysisSectionProps> = ({
  data
}) => {
  if (!data) return null;

  return (
    <ReportSection title="Valuation Analysis">
      <div className="space-y-6">
        {data.summary && (
          <div>
            <h4 className="font-semibold">Valuation Summary</h4>
            <p className="mt-2">{data.summary}</p>
          </div>
        )}

        {/* Key Metrics Table */}
        {data.metrics && Object.keys(data.metrics).length > 0 && (
          <div>
            <h4 className="font-semibold">Key Valuation Metrics</h4>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry Average</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(data.metrics).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {value.value || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {value.industryAverage || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Methods Used */}
        {data.methods && data.methods.length > 0 && (
          <div>
            <h4 className="font-semibold">Valuation Methods Used</h4>
            <ul className="mt-2 list-disc pl-5">
              {data.methods.map((method, index) => (
                <li key={index} className="text-sm">{method}</li>
              ))}
            </ul>
          </div>
        )}

        {/* DCF Analysis if available */}
        {data.dcfAnalysis && (
          <div>
            <h4 className="font-semibold">DCF Analysis</h4>
            <p className="mt-2">{data.dcfAnalysis.summary}</p>
            
            {data.dcfAnalysis.assumptions && data.dcfAnalysis.assumptions.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium">Key Assumptions:</h5>
                <ul className="mt-1 list-disc pl-5">
                  {data.dcfAnalysis.assumptions.map((assumption, index) => (
                    <li key={index} className="text-sm">{assumption}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Comparable Companies */}
        {data.comparableCompanies && data.comparableCompanies.length > 0 && (
          <div>
            <h4 className="font-semibold">Comparable Companies</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {data.comparableCompanies.map((company, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{company.name}</p>
                  {company.metrics && (
                    <div className="mt-2 text-sm">
                      {Object.entries(company.metrics).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-2 gap-2">
                          <span className="text-gray-600">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conclusion */}
        {data.conclusion && (
          <div>
            <h4 className="font-semibold">Valuation Conclusion</h4>
            <p className="mt-2">{data.conclusion}</p>
          </div>
        )}
      </div>
    </ReportSection>
  );
};

export default ValuationAnalysisSection; 