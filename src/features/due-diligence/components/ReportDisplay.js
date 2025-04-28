import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
export function ReportDisplay({ report }) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('summary');
    const [expandedSections, setExpandedSections] = useState({
        executiveSummary: true,
        financialAnalysis: false,
        marketAnalysis: false,
        riskAssessment: false,
        recentDevelopments: false,
    });
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };
    const copyToClipboard = async () => {
        try {
            const reportText = `
# Due Diligence Report: ${report.companyName}
Generated on: ${new Date(report.timestamp).toLocaleDateString()}

## Executive Summary
${report.executiveSummary.overview}

### Key Findings
${report.executiveSummary.keyFindings.map(finding => `- ${finding}`).join('\n')}

### Risk Rating
${report.executiveSummary.riskRating}

### Recommendation
${report.executiveSummary.recommendation}

## Financial Analysis
${Object.entries(report.financialAnalysis.metrics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

### Trends
${report.financialAnalysis.trends.map(trend => `- ${trend}`).join('\n')}

### Strengths
${report.financialAnalysis.strengths.map(strength => `- ${strength}`).join('\n')}

### Weaknesses
${report.financialAnalysis.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

## Market Analysis
${report.marketAnalysis.position}

### Competitors
${report.marketAnalysis.competitors.map(competitor => `- ${competitor}`).join('\n')}

### Market Share
${report.marketAnalysis.marketShare}

### SWOT Analysis
#### Strengths
${report.marketAnalysis.swot.strengths.map(strength => `- ${strength}`).join('\n')}

#### Weaknesses
${report.marketAnalysis.swot.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

#### Opportunities
${report.marketAnalysis.swot.opportunities.map(opportunity => `- ${opportunity}`).join('\n')}

#### Threats
${report.marketAnalysis.swot.threats.map(threat => `- ${threat}`).join('\n')}

## Risk Assessment
### Financial Risks
${report.riskAssessment.financial.map(risk => `- ${risk}`).join('\n')}

### Operational Risks
${report.riskAssessment.operational.map(risk => `- ${risk}`).join('\n')}

### Market Risks
${report.riskAssessment.market.map(risk => `- ${risk}`).join('\n')}

### Regulatory Risks
${report.riskAssessment.regulatory.map(risk => `- ${risk}`).join('\n')}

### ESG Risks
${report.riskAssessment.esg.map(risk => `- ${risk}`).join('\n')}

## Recent Developments
### News
${report.recentDevelopments.news.map(item => `- ${item.title} (${new Date(item.date).toLocaleDateString()})`).join('\n')}

### Filings
${report.recentDevelopments.filings.map(filing => `- ${filing.type}: ${filing.description} (${new Date(filing.date).toLocaleDateString()})`).join('\n')}

### Management Updates
${report.recentDevelopments.management.map(update => `- ${update}`).join('\n')}

### Strategic Initiatives
${report.recentDevelopments.strategic.map(initiative => `- ${initiative}`).join('\n')}
`;
            await navigator.clipboard.writeText(reportText);
            toast({
                title: "Copied to clipboard",
                description: "Report has been copied to your clipboard",
            });
        }
        catch (error) {
            console.error('Failed to copy:', error);
            toast({
                title: "Copy failed",
                description: "Could not copy report to clipboard",
                variant: "destructive",
            });
        }
    };
    const downloadPDF = () => {
        try {
            const pdf = new jsPDF();
            // Add title
            pdf.setFontSize(18);
            pdf.text(`Due Diligence Report: ${report.companyName}`, 20, 20);
            // Add generation date
            pdf.setFontSize(12);
            pdf.text(`Generated on: ${new Date(report.timestamp).toLocaleDateString()}`, 20, 30);
            // Executive Summary
            pdf.setFontSize(16);
            pdf.text('Executive Summary', 20, 40);
            pdf.setFontSize(12);
            const executiveSummaryLines = pdf.splitTextToSize(report.executiveSummary.overview, 170);
            pdf.text(executiveSummaryLines, 20, 50);
            // Add more sections as needed...
            pdf.save(`${report.companyName.replace(/\s+/g, '_')}_due_diligence_report.pdf`);
            toast({
                title: "PDF Downloaded",
                description: "Report has been downloaded as PDF",
            });
        }
        catch (error) {
            console.error('Failed to generate PDF:', error);
            toast({
                title: "Download failed",
                description: "Could not generate PDF",
                variant: "destructive",
            });
        }
    };
    return (_jsxs(Card, { className: "shadow-lg", children: [_jsx(CardHeader, { className: "border-b", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(CardTitle, { className: "text-2xl", children: ["Due Diligence Report: ", report.companyName] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Generated on ", new Date(report.timestamp).toLocaleString()] })] }) }), _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex justify-end space-x-2 mb-6", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: copyToClipboard, children: [_jsx(Copy, { className: "h-4 w-4 mr-2" }), "Copy"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: downloadPDF, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download PDF"] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid grid-cols-5 mb-6", children: [_jsx(TabsTrigger, { value: "summary", children: "Summary" }), _jsx(TabsTrigger, { value: "financial", children: "Financial" }), _jsx(TabsTrigger, { value: "market", children: "Market" }), _jsx(TabsTrigger, { value: "risks", children: "Risks" }), _jsx(TabsTrigger, { value: "developments", children: "Developments" })] }), _jsx(TabsContent, { value: "summary", className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Executive Summary" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('executiveSummary'), children: expandedSections.executiveSummary ? _jsx(ChevronUp, { className: "h-4 w-4" }) : _jsx(ChevronDown, { className: "h-4 w-4" }) })] }), expandedSections.executiveSummary && (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm", children: report.executiveSummary.overview }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Key Findings" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.executiveSummary.keyFindings.map((finding, index) => (_jsx("li", { className: "text-sm", children: finding }, index))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Risk Rating" }), _jsx("div", { className: "text-sm", children: report.executiveSummary.riskRating })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Recommendation" }), _jsx("p", { className: "text-sm", children: report.executiveSummary.recommendation })] })] })] }))] }) }), _jsx(TabsContent, { value: "financial", className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Financial Analysis" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('financialAnalysis'), children: expandedSections.financialAnalysis ? _jsx(ChevronUp, { className: "h-4 w-4" }) : _jsx(ChevronDown, { className: "h-4 w-4" }) })] }), expandedSections.financialAnalysis && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Key Metrics" }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: Object.entries(report.financialAnalysis.metrics).map(([key, value], index) => (_jsxs("div", { className: "border p-3 rounded-md", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: key }), _jsx("div", { className: "text-lg font-semibold", children: value })] }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Trends" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.financialAnalysis.trends.map((trend, index) => (_jsx("li", { className: "text-sm", children: trend }, index))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Strengths" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.financialAnalysis.strengths.map((strength, index) => (_jsx("li", { className: "text-sm", children: strength }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Weaknesses" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.financialAnalysis.weaknesses.map((weakness, index) => (_jsx("li", { className: "text-sm", children: weakness }, index))) })] })] })] }))] }) }), _jsx(TabsContent, { value: "market", className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Market Analysis" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('marketAnalysis'), children: expandedSections.marketAnalysis ? _jsx(ChevronUp, { className: "h-4 w-4" }) : _jsx(ChevronDown, { className: "h-4 w-4" }) })] }), expandedSections.marketAnalysis && (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm", children: report.marketAnalysis.position }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Competitors" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.marketAnalysis.competitors.map((competitor, index) => (_jsx("li", { className: "text-sm", children: competitor }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Market Share" }), _jsx("p", { className: "text-sm", children: report.marketAnalysis.marketShare })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "SWOT Analysis" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium mb-1", children: "Strengths" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.marketAnalysis.swot.strengths.map((strength, index) => (_jsx("li", { className: "text-xs", children: strength }, index))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium mb-1", children: "Weaknesses" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.marketAnalysis.swot.weaknesses.map((weakness, index) => (_jsx("li", { className: "text-xs", children: weakness }, index))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium mb-1", children: "Opportunities" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.marketAnalysis.swot.opportunities.map((opportunity, index) => (_jsx("li", { className: "text-xs", children: opportunity }, index))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium mb-1", children: "Threats" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.marketAnalysis.swot.threats.map((threat, index) => (_jsx("li", { className: "text-xs", children: threat }, index))) })] })] })] })] }))] }) }), _jsx(TabsContent, { value: "risks", className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Risk Assessment" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('riskAssessment'), children: expandedSections.riskAssessment ? _jsx(ChevronUp, { className: "h-4 w-4" }) : _jsx(ChevronDown, { className: "h-4 w-4" }) })] }), expandedSections.riskAssessment && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Financial Risks" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.riskAssessment.financial.map((risk, index) => (_jsx("li", { className: "text-sm", children: risk }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Operational Risks" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.riskAssessment.operational.map((risk, index) => (_jsx("li", { className: "text-sm", children: risk }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Market Risks" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.riskAssessment.market.map((risk, index) => (_jsx("li", { className: "text-sm", children: risk }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Regulatory Risks" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.riskAssessment.regulatory.map((risk, index) => (_jsx("li", { className: "text-sm", children: risk }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "ESG Risks" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.riskAssessment.esg.map((risk, index) => (_jsx("li", { className: "text-sm", children: risk }, index))) })] })] }))] }) }), _jsx(TabsContent, { value: "developments", className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Recent Developments" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleSection('recentDevelopments'), children: expandedSections.recentDevelopments ? _jsx(ChevronUp, { className: "h-4 w-4" }) : _jsx(ChevronDown, { className: "h-4 w-4" }) })] }), expandedSections.recentDevelopments && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "News" }), _jsx("div", { className: "space-y-2", children: report.recentDevelopments.news.map((item, index) => (_jsxs("div", { className: "border p-3 rounded-md", children: [_jsx("div", { className: "font-medium", children: item.title }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [new Date(item.date).toLocaleDateString(), " \u2022 ", item.source] }), item.url && (_jsx("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline mt-1 block", children: "Read more" }))] }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Filings" }), _jsx("div", { className: "space-y-2", children: report.recentDevelopments.filings.map((filing, index) => (_jsxs("div", { className: "border p-3 rounded-md", children: [_jsx("div", { className: "font-medium", children: filing.type }), _jsx("div", { className: "text-sm", children: filing.description }), _jsx("div", { className: "text-xs text-muted-foreground", children: new Date(filing.date).toLocaleDateString() }), filing.url && (_jsx("a", { href: filing.url, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline mt-1 block", children: "View filing" }))] }, index))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Management Updates" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.recentDevelopments.management.map((update, index) => (_jsx("li", { className: "text-sm", children: update }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Strategic Initiatives" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: report.recentDevelopments.strategic.map((initiative, index) => (_jsx("li", { className: "text-sm", children: initiative }, index))) })] })] })] }))] }) })] })] }), _jsxs(CardFooter, { className: "border-t pt-6 flex justify-between", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Powered by AI Diligence Pro" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: downloadPDF, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download PDF"] })] })] }));
}
