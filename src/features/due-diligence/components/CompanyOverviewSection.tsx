import React from 'react';
import { DueDiligenceReport } from '../types';
import ReportSection from './ReportSection';

interface CompanyOverviewSectionProps {
  data: DueDiligenceReport['companyOverview'];
}

/**
 * Company Overview section of the due diligence report
 */
export const CompanyOverviewSection: React.FC<CompanyOverviewSectionProps> = ({
  data
}) => {
  if (!data) return null;

  return (
    <ReportSection title="Company Overview">
      <div className="space-y-6">
        {/* Company Description */}
        {data.description && (
          <div>
            <p>{data.description}</p>
          </div>
        )}

        {/* Key Facts Table */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Headquarters */}
            {data.headquarters && (
              <div>
                <h4 className="font-semibold text-gray-700">Headquarters</h4>
                <p className="mt-1">{data.headquarters}</p>
              </div>
            )}

            {/* Founded */}
            {data.founded && (
              <div>
                <h4 className="font-semibold text-gray-700">Founded</h4>
                <p className="mt-1">{data.founded}</p>
              </div>
            )}

            {/* Industry */}
            {data.industry && (
              <div>
                <h4 className="font-semibold text-gray-700">Industry</h4>
                <p className="mt-1">{data.industry}</p>
              </div>
            )}

            {/* Sector */}
            {data.sector && (
              <div>
                <h4 className="font-semibold text-gray-700">Sector</h4>
                <p className="mt-1">{data.sector}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Employees */}
            {data.employees && (
              <div>
                <h4 className="font-semibold text-gray-700">Employees</h4>
                <p className="mt-1">{typeof data.employees === 'number' ? data.employees.toLocaleString() : data.employees}</p>
              </div>
            )}

            {/* Revenue */}
            {data.revenue && (
              <div>
                <h4 className="font-semibold text-gray-700">Annual Revenue</h4>
                <p className="mt-1">{data.revenue}</p>
              </div>
            )}

            {/* Market Cap */}
            {data.marketCap && (
              <div>
                <h4 className="font-semibold text-gray-700">Market Cap</h4>
                <p className="mt-1">{data.marketCap}</p>
              </div>
            )}

            {/* Ticker */}
            {data.ticker && (
              <div>
                <h4 className="font-semibold text-gray-700">Stock Symbol</h4>
                <p className="mt-1">{data.ticker}</p>
              </div>
            )}
          </div>
        </div>

        {/* Key People/Leadership */}
        {data.keyPeople && data.keyPeople.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Leadership</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {data.keyPeople.map((person, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{person.name}</p>
                  {person.title && <p className="text-sm text-gray-600">{person.title}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products & Services */}
        {data.productsServices && data.productsServices.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Products & Services</h4>
            <ul className="list-disc pl-5 space-y-1">
              {data.productsServices.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Business Model */}
        {data.businessModel && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Business Model</h4>
            <p>{data.businessModel}</p>
          </div>
        )}
      </div>
    </ReportSection>
  );
};

export default CompanyOverviewSection; 