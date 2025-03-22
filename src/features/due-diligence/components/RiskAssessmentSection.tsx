import React from 'react';
import { DueDiligenceReport } from '../types';
import ReportSection from './ReportSection';

interface RiskAssessmentSectionProps {
  data: DueDiligenceReport['riskAssessment'];
}

/**
 * Risk Assessment section of the due diligence report
 */
export const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({
  data
}) => {
  if (!data) return null;

  return (
    <ReportSection title="Risk Assessment">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold">Financial Risks</h4>
          <ul className="mt-2 list-disc pl-5">
            {Array.isArray(data.financial) 
              ? data.financial.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))
              : <li>{data.financial}</li>
            }
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold">Market Risks</h4>
          <ul className="mt-2 list-disc pl-5">
            {Array.isArray(data.market) 
              ? data.market.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))
              : <li>{data.market}</li>
            }
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold">Operational Risks</h4>
          <ul className="mt-2 list-disc pl-5">
            {Array.isArray(data.operational) 
              ? data.operational.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))
              : <li>{data.operational}</li>
            }
          </ul>
        </div>
        
        {data.regulatory && data.regulatory.length > 0 && (
          <div>
            <h4 className="font-semibold">Regulatory Risks</h4>
            <ul className="mt-2 list-disc pl-5">
              {Array.isArray(data.regulatory) 
                ? data.regulatory.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))
                : <li>{data.regulatory}</li>
              }
            </ul>
          </div>
        )}
        
        {data.esg && data.esg.length > 0 && (
          <div className="md:col-span-2">
            <h4 className="font-semibold">ESG Considerations</h4>
            <ul className="mt-2 list-disc pl-5">
              {Array.isArray(data.esg) 
                ? data.esg.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                : <li>{data.esg}</li>
              }
            </ul>
          </div>
        )}
      </div>
    </ReportSection>
  );
};

export default RiskAssessmentSection; 