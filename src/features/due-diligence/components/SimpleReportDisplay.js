import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const SimpleReportDisplay = ({ report, showCharts = true, showTables = true }) => {
    // Helper function to render a section that might be a string or an object
    const renderSection = (section, title) => {
        if (!section)
            return null;
        if (typeof section === 'string') {
            return (_jsx(Card, { className: "mb-4", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: title }), _jsx("p", { className: "whitespace-pre-line", children: section })] }) }));
        }
        return null;
    };
    // Helper function to render a list of items
    const renderList = (items, title) => {
        if (!items)
            return null;
        const itemList = Array.isArray(items) ? items : [items];
        return (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: title }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: itemList.map((item, index) => (_jsx("li", { children: item }, index))) })] }));
    };
    // Generate financial metrics chart data
    const generateFinancialMetricsChart = () => {
        if (!report.financialAnalysis || typeof report.financialAnalysis === 'string') {
            return [];
        }
        const { metrics } = report.financialAnalysis;
        if (!metrics)
            return [];
        return Object.entries(metrics)
            .filter(([key]) => {
            // Filter out metrics that don't make sense for a bar chart
            const excludedMetrics = ['Market Cap', 'Cash & Equivalents', 'Revenue (TTM)', 'Net Income'];
            return !excludedMetrics.includes(key);
        })
            .map(([name, value]) => {
            // Extract numeric value from string like '$2.35' or '48.5%'
            let numericValue = 0;
            if (typeof value === 'string') {
                const match = value.match(/[\d.]+/);
                if (match) {
                    numericValue = parseFloat(match[0]);
                }
            }
            else if (typeof value === 'number') {
                numericValue = value;
            }
            return { name, value: numericValue };
        });
    };
    // Generate market share chart data
    const generateMarketShareChart = () => {
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
        if (!report.marketAnalysis || typeof report.marketAnalysis === 'string' || !report.marketAnalysis.competitors) {
            return { data: [], colors: [] };
        }
        const competitors = Array.isArray(report.marketAnalysis.competitors)
            ? report.marketAnalysis.competitors
            : [];
        // Create pie chart data with company and competitors
        const data = [
            { name: report.companyName, value: 35 }, // Example market share
            ...competitors.slice(0, 4).map((comp, index) => {
                const compName = typeof comp === 'string' ? comp : comp.name;
                // Distribute remaining market share among competitors
                return { name: compName, value: (65 / Math.min(competitors.length, 4)) };
            })
        ];
        return { data, colors: COLORS };
    };
    // Render financial metrics table
    const renderFinancialTable = () => {
        if (!showTables || !report.financialAnalysis || typeof report.financialAnalysis === 'string' || !report.financialAnalysis.metrics) {
            return null;
        }
        const { metrics } = report.financialAnalysis;
        return (_jsxs("div", { className: "my-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Financial Metrics" }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Metric" }), _jsx(TableHead, { children: "Value" })] }) }), _jsx(TableBody, { children: Object.entries(metrics).map(([key, value], index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: key }), _jsx(TableCell, { children: value })] }, index))) })] })] }));
    };
    // Render competitors table
    const renderCompetitorsTable = () => {
        if (!showTables || !report.marketAnalysis || typeof report.marketAnalysis === 'string' || !report.marketAnalysis.competitors) {
            return null;
        }
        const competitors = report.marketAnalysis.competitors;
        if (Array.isArray(competitors) && competitors.length > 0) {
            if (typeof competitors[0] === 'string') {
                return (_jsxs("div", { className: "my-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Key Competitors" }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsx(TableRow, { children: _jsx(TableHead, { children: "Company" }) }) }), _jsx(TableBody, { children: competitors.map((competitor, index) => (_jsx(TableRow, { children: _jsx(TableCell, { children: competitor }) }, index))) })] })] }));
            }
            else {
                return (_jsxs("div", { className: "my-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Key Competitors" }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Company" }), _jsx(TableHead, { children: "Strengths" }), _jsx(TableHead, { children: "Weaknesses" })] }) }), _jsx(TableBody, { children: competitors.map((competitor, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: competitor.name }), _jsx(TableCell, { children: competitor.strengths || '-' }), _jsx(TableCell, { children: competitor.weaknesses || '-' })] }, index))) })] })] }));
            }
        }
        return null;
    };
    // Render financial metrics chart
    const renderFinancialChart = () => {
        if (!showCharts)
            return null;
        const data = generateFinancialMetricsChart();
        if (data.length === 0)
            return null;
        return (_jsxs("div", { className: "my-6", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Financial Metrics Visualization" }), _jsx("div", { className: "h-64 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { dataKey: "value", fill: "#8884d8" })] }) }) })] }));
    };
    // Render market share chart
    const renderMarketShareChart = () => {
        if (!showCharts)
            return null;
        const { data, colors } = generateMarketShareChart();
        if (data.length === 0)
            return null;
        return (_jsxs("div", { className: "my-6", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Estimated Market Share" }), _jsx("div", { className: "h-64 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: true, label: ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: data.map((entry, index) => (_jsx(Cell, { fill: colors[index % colors.length] }, `cell-${index}`))) }), _jsx(Tooltip, {}), _jsx(Legend, {})] }) }) })] }));
    };
    // Render executive summary section
    const renderExecutiveSummary = () => {
        const { executiveSummary } = report;
        if (!executiveSummary)
            return null;
        if (typeof executiveSummary === 'string') {
            return renderSection(executiveSummary, 'Executive Summary');
        }
        return (_jsx(Card, { className: "mb-4", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Executive Summary" }), _jsx("p", { className: "mb-4", children: executiveSummary.overview }), renderList(executiveSummary.keyFindings, 'Key Findings'), executiveSummary.riskRating && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Risk Rating" }), _jsx(Badge, { variant: executiveSummary.riskRating.toLowerCase() === 'high' ? 'destructive' :
                                    executiveSummary.riskRating.toLowerCase() === 'medium' ? 'warning' : 'success', children: executiveSummary.riskRating })] })), executiveSummary.recommendation && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Recommendation" }), _jsx("p", { children: executiveSummary.recommendation })] }))] }) }));
    };
    // Render financial analysis section
    const renderFinancialAnalysis = () => {
        const { financialAnalysis } = report;
        if (!financialAnalysis)
            return null;
        if (typeof financialAnalysis === 'string') {
            return renderSection(financialAnalysis, 'Financial Analysis');
        }
        return (_jsx(Card, { className: "mb-4", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Financial Analysis" }), _jsx("p", { className: "mb-4", children: financialAnalysis.overview }), renderFinancialTable(), renderFinancialChart(), financialAnalysis.trends && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Financial Trends" }), _jsx("p", { children: financialAnalysis.trends })] })), renderList(financialAnalysis.strengths, 'Financial Strengths'), renderList(financialAnalysis.weaknesses, 'Financial Weaknesses')] }) }));
    };
    // Render market analysis section
    const renderMarketAnalysis = () => {
        const { marketAnalysis } = report;
        if (!marketAnalysis)
            return null;
        if (typeof marketAnalysis === 'string') {
            return renderSection(marketAnalysis, 'Market Analysis');
        }
        return (_jsx(Card, { className: "mb-4", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Market Analysis" }), _jsx("p", { className: "mb-4", children: marketAnalysis.overview }), marketAnalysis.position && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Market Position" }), _jsx("p", { children: marketAnalysis.position })] })), renderMarketShareChart(), renderCompetitorsTable(), marketAnalysis.swot && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "SWOT Analysis" }), _jsxs(Tabs, { defaultValue: "strengths", children: [_jsxs(TabsList, { className: "grid grid-cols-4", children: [_jsx(TabsTrigger, { value: "strengths", children: "Strengths" }), _jsx(TabsTrigger, { value: "weaknesses", children: "Weaknesses" }), _jsx(TabsTrigger, { value: "opportunities", children: "Opportunities" }), _jsx(TabsTrigger, { value: "threats", children: "Threats" })] }), _jsx(TabsContent, { value: "strengths", children: renderList(marketAnalysis.swot.strengths, 'Strengths') }), _jsx(TabsContent, { value: "weaknesses", children: renderList(marketAnalysis.swot.weaknesses, 'Weaknesses') }), _jsx(TabsContent, { value: "opportunities", children: renderList(marketAnalysis.swot.opportunities, 'Opportunities') }), _jsx(TabsContent, { value: "threats", children: renderList(marketAnalysis.swot.threats, 'Threats') })] })] }))] }) }));
    };
    // Render risk assessment section
    const renderRiskAssessment = () => {
        const { riskAssessment } = report;
        if (!riskAssessment)
            return null;
        if (typeof riskAssessment === 'string') {
            return renderSection(riskAssessment, 'Risk Assessment');
        }
        return (_jsx(Card, { className: "mb-4", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Risk Assessment" }), _jsx("p", { className: "mb-4", children: riskAssessment.overview }), riskAssessment.riskRating && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Overall Risk Rating" }), _jsx(Badge, { variant: riskAssessment.riskRating === 'high' ? 'destructive' :
                                    riskAssessment.riskRating === 'medium' ? 'warning' : 'success', children: riskAssessment.riskRating.charAt(0).toUpperCase() + riskAssessment.riskRating.slice(1) })] })), _jsxs(Accordion, { type: "single", collapsible: true, className: "w-full", children: [riskAssessment.financial && (_jsxs(AccordionItem, { value: "financial", children: [_jsx(AccordionTrigger, { children: "Financial Risks" }), _jsxs(AccordionContent, { children: [_jsx("p", { children: riskAssessment.financial }), riskAssessment.riskFactors?.financial && (_jsx("ul", { className: "list-disc pl-5 mt-2", children: riskAssessment.riskFactors.financial.map((risk, index) => (_jsx("li", { children: risk }, index))) }))] })] })), riskAssessment.operational && (_jsxs(AccordionItem, { value: "operational", children: [_jsx(AccordionTrigger, { children: "Operational Risks" }), _jsxs(AccordionContent, { children: [_jsx("p", { children: riskAssessment.operational }), riskAssessment.riskFactors?.operational && (_jsx("ul", { className: "list-disc pl-5 mt-2", children: riskAssessment.riskFactors.operational.map((risk, index) => (_jsx("li", { children: risk }, index))) }))] })] })), riskAssessment.market && (_jsxs(AccordionItem, { value: "market", children: [_jsx(AccordionTrigger, { children: "Market Risks" }), _jsxs(AccordionContent, { children: [_jsx("p", { children: riskAssessment.market }), riskAssessment.riskFactors?.market && (_jsx("ul", { className: "list-disc pl-5 mt-2", children: riskAssessment.riskFactors.market.map((risk, index) => (_jsx("li", { children: risk }, index))) }))] })] })), riskAssessment.regulatory && (_jsxs(AccordionItem, { value: "regulatory", children: [_jsx(AccordionTrigger, { children: "Regulatory Risks" }), _jsxs(AccordionContent, { children: [_jsx("p", { children: riskAssessment.regulatory }), riskAssessment.riskFactors?.regulatory && (_jsx("ul", { className: "list-disc pl-5 mt-2", children: riskAssessment.riskFactors.regulatory.map((risk, index) => (_jsx("li", { children: risk }, index))) }))] })] })), riskAssessment.esgConsiderations && (_jsxs(AccordionItem, { value: "esg", children: [_jsx(AccordionTrigger, { children: "ESG Considerations" }), _jsxs(AccordionContent, { children: [_jsx("p", { children: riskAssessment.esgConsiderations }), riskAssessment.riskFactors?.esg && (_jsx("ul", { className: "list-disc pl-5 mt-2", children: riskAssessment.riskFactors.esg.map((risk, index) => (_jsx("li", { children: risk }, index))) }))] })] }))] })] }) }));
    };
    // Render recent developments section
    const renderRecentDevelopments = () => {
        const { recentDevelopments } = report;
        if (!recentDevelopments)
            return null;
        return (_jsx(Card, { className: "mb-4", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Recent Developments" }), recentDevelopments.news && recentDevelopments.news.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Recent News" }), _jsx("ul", { className: "space-y-2", children: recentDevelopments.news.map((item, index) => (_jsxs("li", { className: "border-l-2 border-primary pl-4 py-1", children: [_jsx("div", { className: "font-medium", children: item.title }), _jsx("div", { className: "text-sm text-muted-foreground", children: item.date }), item.summary && _jsx("p", { className: "mt-1", children: item.summary }), item.url && (_jsx("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-500 hover:underline", children: "Read more" }))] }, index))) })] })), recentDevelopments.filings && recentDevelopments.filings.length > 0 && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Recent Filings" }), _jsx("ul", { className: "space-y-2", children: recentDevelopments.filings.map((item, index) => (_jsxs("li", { className: "border-l-2 border-secondary pl-4 py-1", children: [_jsx("div", { className: "font-medium", children: item.type || 'Filing' }), _jsx("div", { className: "text-sm text-muted-foreground", children: item.date }), item.description && _jsx("p", { className: "mt-1", children: item.description }), item.url && (_jsx("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-500 hover:underline", children: "View filing" }))] }, index))) })] })), recentDevelopments.strategic && (_jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-md font-medium mb-2", children: "Strategic Initiatives" }), Array.isArray(recentDevelopments.strategic) && typeof recentDevelopments.strategic[0] === 'string' ? (_jsx("ul", { className: "list-disc pl-5 space-y-1", children: recentDevelopments.strategic.map((item, index) => (_jsx("li", { children: item }, index))) })) : Array.isArray(recentDevelopments.strategic) ? (_jsx("ul", { className: "space-y-2", children: recentDevelopments.strategic.map((item, index) => (_jsxs("li", { className: "border-l-2 border-primary pl-4 py-1", children: [_jsx("div", { className: "font-medium", children: item.title }), _jsx("div", { className: "text-sm text-muted-foreground", children: item.date }), (item.summary || item.description) && _jsx("p", { className: "mt-1", children: item.summary || item.description })] }, index))) })) : (_jsx("p", { children: recentDevelopments.strategic }))] }))] }) }));
    };
    // Render conclusion section
    const renderConclusion = () => {
        const { conclusion } = report;
        if (!conclusion)
            return null;
        return (_jsx(Card, { className: "mb-4", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Conclusion" }), _jsx("p", { className: "whitespace-pre-line", children: conclusion })] }) }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [renderExecutiveSummary(), renderFinancialAnalysis(), renderMarketAnalysis(), renderRiskAssessment(), renderRecentDevelopments(), renderConclusion()] }));
};
export default SimpleReportDisplay;
