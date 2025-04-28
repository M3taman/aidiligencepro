import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import DueDiligenceReportWrapper from './DueDiligenceReportWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
const DueDiligenceReportUsage = () => {
    const [company, setCompany] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [reportGenerated, setReportGenerated] = useState(false);
    // Example of saving generated report data
    const handleReportGenerated = (report) => {
        console.log('Report data received in parent component:', report);
        setReportGenerated(true);
        // You could save this data to state, context, or a database
        // Example: saveReportToUserHistory(report);
    };
    // Example of handling errors from the report generation
    const handleError = (error) => {
        console.error('Error generating report:', error);
        // You could show a custom error UI or log errors
    };
    const startAnalysis = () => {
        if (company.trim()) {
            setSelectedCompany(company);
            setReportGenerated(false);
        }
    };
    return (_jsxs("div", { className: "container mx-auto py-8 px-4", children: [_jsx("h1", { className: "text-3xl font-bold mb-8", children: "Company Research" }), !selectedCompany && (_jsxs(Card, { className: "max-w-md mx-auto", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Analyze a Company" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "company-search", children: "Enter Company Name" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "company-search", placeholder: "e.g., Apple, Microsoft, Tesla", value: company, onChange: (e) => setCompany(e.target.value), className: "pl-10" })] })] }), _jsx(Button, { onClick: startAnalysis, className: "w-full", disabled: !company.trim(), children: "Generate Report" })] }) })] })), selectedCompany && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("h2", { className: "text-xl font-semibold", children: ["Analysis for: ", _jsx("span", { className: "text-primary", children: selectedCompany })] }), _jsx(Button, { variant: "outline", onClick: () => {
                                    setSelectedCompany(null);
                                    setReportGenerated(false);
                                }, children: "New Search" })] }), _jsx(DueDiligenceReportWrapper, { companyName: selectedCompany, onReportGenerated: handleReportGenerated, onError: handleError, showControls: true }), reportGenerated && (_jsx("div", { className: "mt-8 text-center text-sm text-muted-foreground", children: _jsx("p", { children: "Report generated successfully. You can now download it or start a new search." }) }))] }))] }));
};
export default DueDiligenceReportUsage;
