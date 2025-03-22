import React from 'react';

interface SwotProps {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

/**
 * A component for displaying SWOT analysis in a grid layout
 */
export const SwotAnalysis: React.FC<SwotProps> = ({
  strengths,
  weaknesses,
  opportunities,
  threats
}) => {
  return (
    <div className="mt-6 grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold text-green-600 dark:text-green-400">Strengths</h4>
        <ul className="mt-2 list-disc pl-5">
          {strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-red-600 dark:text-red-400">Weaknesses</h4>
        <ul className="mt-2 list-disc pl-5">
          {weaknesses.map((weakness, index) => (
            <li key={index}>{weakness}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-blue-600 dark:text-blue-400">Opportunities</h4>
        <ul className="mt-2 list-disc pl-5">
          {opportunities.map((opportunity, index) => (
            <li key={index}>{opportunity}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-amber-600 dark:text-amber-400">Threats</h4>
        <ul className="mt-2 list-disc pl-5">
          {threats.map((threat, index) => (
            <li key={index}>{threat}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SwotAnalysis; 