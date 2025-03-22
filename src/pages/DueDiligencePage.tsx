import { Helmet } from 'react-helmet-async';
import { DueDiligenceForm } from "@/components/DueDiligenceForm";
import { DueDiligenceReport } from "@/features/due-diligence/DueDiligenceReport";
import { useDueDiligence } from "@/hooks/useDueDiligence";

export function DueDiligencePage() {
  const { report, isLoading, error, generateReport } = useDueDiligence();

  return (
    <>
      <Helmet>
        <title>AI-Powered Due Diligence Reports | Aidiligence Pro</title>
        <meta name="description" content="Generate comprehensive due diligence reports for any company in seconds using our AI-powered platform." />
      </Helmet>
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Generate Due Diligence Report</h1>
          
          <div className="mb-12">
            <DueDiligenceForm onSubmit={generateReport} isLoading={isLoading} />
          </div>
          
          <DueDiligenceReport 
            preloadedReport={report}
            isLoading={isLoading}
            error={error}
            onGenerateReport={generateReport}
          />
        </div>
      </div>
    </>
  );
} 