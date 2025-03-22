import React from 'react';
import { DueDiligenceReport } from '../types';
import ReportSection from './ReportSection';

interface ExecutiveSummarySectionProps {
  data: DueDiligenceReport['executiveSummary'];
}

/**
 * Executive Summary section of the due diligence report
 */
const ExecutiveSummarySection: React.FC<ExecutiveSummarySectionProps> = ({
  data
}) => {
  if (!data) return null;

  return (
    <ReportSection title="Executive Summary">
      <div className="space-y-6">
        {data.summary && (
          <div>
            <p className="text-lg leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Key Highlights */}
        {data.keyHighlights && data.keyHighlights.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-3">Key Highlights</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {data.keyHighlights.map((highlight, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-md">
                  <p className="text-blue-800">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investment Thesis */}
        {data.investmentThesis && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Investment Thesis</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>{data.investmentThesis}</p>
            </div>
          </div>
        )}

        {/* Key Metrics Overview */}
        {data.keyMetrics && Object.keys(data.keyMetrics).length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-3">Key Metrics at a Glance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.keyMetrics).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-md text-center">
                  <p className="text-sm text-gray-600">{key}</p>
                  <p className="text-lg font-semibold mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Summary */}
        {data.recommendation && (
          <div className="mt-6 bg-primary-50 p-4 rounded-md">
            <h4 className="font-semibold text-primary-900 mb-2">Recommendation</h4>
            <p className="text-primary-800 font-medium">{data.recommendation}</p>
            
            {data.targetPrice && (
              <div className="mt-2">
                <span className="text-sm text-primary-700">Target Price: </span>
                <span className="font-semibold text-primary-900">{data.targetPrice}</span>
                
                {data.upside && <span className="ml-2 text-emerald-600">(+{data.upside}% upside)</span>}
                {data.downside && <span className="ml-2 text-red-600">({data.downside}% downside)</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </ReportSection>
  );
};

export default ExecutiveSummarySection; 