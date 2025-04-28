import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReportSection from './ReportSection';
import SwotAnalysis from './SwotAnalysis';
/**
 * Market Analysis section of the due diligence report
 */
export const MarketAnalysisSection = ({ data }) => {
    if (!data)
        return null;
    return (_jsxs(ReportSection, { title: "Market Analysis", children: [_jsx("p", { children: data.position }), data.competitors && data.competitors.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "font-semibold", children: "Key Competitors" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: data.competitors.map((competitor, index) => (_jsx("span", { className: "px-3 py-1 bg-secondary/20 rounded-full text-sm", children: competitor }, index))) })] })), data.swot && (_jsx(SwotAnalysis, { strengths: Array.isArray(data.swot.strengths) ? data.swot.strengths : [data.swot.strengths], weaknesses: Array.isArray(data.swot.weaknesses) ? data.swot.weaknesses : [data.swot.weaknesses], opportunities: Array.isArray(data.swot.opportunities) ? data.swot.opportunities : [data.swot.opportunities], threats: Array.isArray(data.swot.threats) ? data.swot.threats : [data.swot.threats] }))] }));
};
export default MarketAnalysisSection;
