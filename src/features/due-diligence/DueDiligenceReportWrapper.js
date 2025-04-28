import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { DueDiligenceReport } from './DueDiligenceReport';
import { generateMockDueDiligenceReport } from './mockApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, RefreshCcw } from 'lucide-react';
const DueDiligenceReportWrapper = ({ companyName, onReportGenerated, onError, className, showControls = true, }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    // Function to generate a report using the mock API or real API
    const generateReport = async (company) => {
        if (!company.trim()) {
            const errorMsg = 'Please enter a company name';
            setError(errorMsg);
            onError?.(errorMsg);
            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Check if we're in development mode
            const isDev = process.env.NODE_ENV === 'development';
            if (isDev) {
                // Use mock API in development
                console.log("Using mock API for development");
                const mockReport = await generateMockDueDiligenceReport(company);
                setReport(mockReport);
                onReportGenerated?.(mockReport);
                toast({
                    title: 'Success',
                    description: 'Report generated successfully',
                });
            }
            else {
                // Use real API in production
                const response = await fetch('https://generateduediligence-toafsgw4rq-uc.a.run.app/generateDueDiligence', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ companyName: company }),
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Network response was not ok');
                }
                const result = await response.json();
                const reportData = result.data;
                setReport(reportData);
                onReportGenerated?.(reportData);
                toast({
                    title: 'Success',
                    description: 'Report generated successfully',
                });
            }
        }
        catch (error) {
            console.error("Analysis error:", error);
            const errorMsg = error instanceof Error ? error.message : 'Error generating analysis. Please try again.';
            setError(errorMsg);
            onError?.(errorMsg);
            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    // Function to reset the report and start over
    const resetReport = () => {
        setReport(null);
        setError(null);
    };
    // If companyName is provided, automatically generate a report for that company
    React.useEffect(() => {
        if (companyName && !report && !loading) {
            generateReport(companyName);
        }
    }, [companyName]);
    return (_jsxs("div", { className: className, children: [_jsx(DueDiligenceReport, { preloadedReport: report, isLoading: loading, error: error, onGenerateReport: generateReport, className: className }), showControls && report && (_jsx("div", { className: "mt-4 flex justify-end space-x-2", children: _jsxs(Button, { variant: "outline", onClick: resetReport, disabled: loading, children: [_jsx(RefreshCcw, { className: "w-4 h-4 mr-2" }), "New Report"] }) })), loading && (_jsx(Card, { className: "mt-4", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-center py-6", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }), _jsx("p", { className: "ml-2 text-sm text-muted-foreground", children: "Generating report..." })] }) }) })), error && !loading && (_jsxs(Card, { className: "mt-4 border-destructive", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-destructive", children: "Error" }), _jsx(CardDescription, { children: "There was a problem generating the report" })] }), _jsx(CardContent, { children: _jsx("p", { children: error }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setError(null), children: "Dismiss" }) })] }))] }));
};
export default DueDiligenceReportWrapper;
