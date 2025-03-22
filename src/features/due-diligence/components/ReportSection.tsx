import React from 'react';

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * ReportSection - A reusable component for sections in the due diligence report
 */
export const ReportSection: React.FC<ReportSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <section className={`mb-8 ${className}`}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
};

export default ReportSection; 