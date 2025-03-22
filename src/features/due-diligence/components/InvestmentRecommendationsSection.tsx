import React from 'react';
import { DueDiligenceReport } from '../types';
import ReportSection from './ReportSection';

interface InvestmentRecommendationsSectionProps {
  data: DueDiligenceReport['investmentRecommendations'];
}

/**
 * Investment Recommendations section of the due diligence report
 */
export const InvestmentRecommendationsSection: React.FC<InvestmentRecommendationsSectionProps> = ({
  data
}) => {
  if (!data) return null;

  return (
    <ReportSection title="Investment Recommendations">
      <div className="space-y-6">
        {data.summary && (
          <div>
            <h4 className="font-semibold">Summary</h4>
            <p className="mt-2">{data.summary}</p>
          </div>
        )}

        {data.recommendation && (
          <div>
            <h4 className="font-semibold">Recommendation</h4>
            <p className="mt-2 font-medium text-lg">{data.recommendation}</p>
          </div>
        )}

        {data.targetPrice && (
          <div>
            <h4 className="font-semibold">Target Price</h4>
            <p className="mt-2 text-lg">
              <span className="font-medium">{data.targetPrice}</span>
              {data.upside && <span className="ml-2 text-emerald-600">(+{data.upside}% upside)</span>}
              {data.downside && <span className="ml-2 text-red-600">({data.downside}% downside)</span>}
            </p>
          </div>
        )}

        {data.timeline && (
          <div>
            <h4 className="font-semibold">Investment Timeline</h4>
            <p className="mt-2">{data.timeline}</p>
          </div>
        )}

        {data.riskLevel && (
          <div>
            <h4 className="font-semibold">Risk Level</h4>
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                data.riskLevel.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                data.riskLevel.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {data.riskLevel}
              </span>
            </div>
          </div>
        )}

        {data.keyFactors && data.keyFactors.length > 0 && (
          <div>
            <h4 className="font-semibold">Key Factors for Consideration</h4>
            <ul className="mt-2 list-disc pl-5">
              {data.keyFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}

        {data.catalysts && data.catalysts.length > 0 && (
          <div>
            <h4 className="font-semibold">Potential Catalysts</h4>
            <ul className="mt-2 list-disc pl-5">
              {data.catalysts.map((catalyst, index) => (
                <li key={index}>{catalyst}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ReportSection>
  );
};

export default InvestmentRecommendationsSection; 