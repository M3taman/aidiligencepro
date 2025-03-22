import React from 'react';
import { DueDiligenceReport } from '../types';
import ReportSection from './ReportSection';
import SwotAnalysis from './SwotAnalysis';

interface MarketAnalysisSectionProps {
  data: DueDiligenceReport['marketAnalysis'];
}

/**
 * Market Analysis section of the due diligence report
 */
export const MarketAnalysisSection: React.FC<MarketAnalysisSectionProps> = ({
  data
}) => {
  if (!data) return null;

  return (
    <ReportSection title="Market Analysis">
      <p>{data.position}</p>
      
      {data.competitors && data.competitors.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Key Competitors</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.competitors.map((competitor, index) => (
              <span key={index} className="px-3 py-1 bg-secondary/20 rounded-full text-sm">
                {competitor}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {data.swot && (
        <SwotAnalysis 
          strengths={Array.isArray(data.swot.strengths) ? data.swot.strengths : [data.swot.strengths]}
          weaknesses={Array.isArray(data.swot.weaknesses) ? data.swot.weaknesses : [data.swot.weaknesses]}
          opportunities={Array.isArray(data.swot.opportunities) ? data.swot.opportunities : [data.swot.opportunities]}
          threats={Array.isArray(data.swot.threats) ? data.swot.threats : [data.swot.threats]}
        />
      )}
    </ReportSection>
  );
};

export default MarketAnalysisSection; 