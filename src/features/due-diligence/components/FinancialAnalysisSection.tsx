import React from 'react';
import { DueDiligenceReport } from '../types';
import ReportSection from './ReportSection';

interface FinancialAnalysisSectionProps {
  data: DueDiligenceReport['financialAnalysis'];
}

/**
 * Financial Analysis section of the due diligence report
 */
export const FinancialAnalysisSection: React.FC<FinancialAnalysisSectionProps> = ({
  data
}) => {
  if (!data) return null;

  return (
    <ReportSection title="Financial Analysis">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {Object.entries(data.metrics || {}).slice(0, 6).map(([key, value]) => (
          <div key={key} className="p-4 bg-secondary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">{key}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold">Financial Trends</h4>
          <ul className="mt-2 list-disc pl-5">
            {Array.isArray(data.trends) 
              ? data.trends.map((trend, index) => (
                  <li key={index} className="mb-1">{trend}</li>
                ))
              : <li>{data.trends}</li>
            }
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold">Strengths & Weaknesses</h4>
          <div className="mt-2 space-y-4">
            <div>
              <h5 className="text-sm font-medium text-green-600 dark:text-green-400">Strengths</h5>
              <ul className="mt-1 list-disc pl-5">
                {Array.isArray(data.strengths) 
                  ? data.strengths.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))
                  : <li className="text-sm">{data.strengths}</li>
                }
              </ul>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-red-600 dark:text-red-400">Weaknesses</h5>
              <ul className="mt-1 list-disc pl-5">
                {Array.isArray(data.weaknesses) 
                  ? data.weaknesses.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))
                  : <li className="text-sm">{data.weaknesses}</li>
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ReportSection>
  );
};

export default FinancialAnalysisSection; 