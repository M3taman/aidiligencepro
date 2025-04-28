import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReportSection from './ReportSection';
/**
 * Financial Analysis section of the due diligence report
 */
export const FinancialAnalysisSection = ({ data }) => {
    if (!data)
        return null;
    return (_jsxs(ReportSection, { title: "Financial Analysis", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4", children: Object.entries(data.metrics || {}).slice(0, 6).map(([key, value]) => (_jsxs("div", { className: "p-4 bg-secondary/10 rounded-lg", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: key }), _jsx("p", { className: "text-lg font-semibold", children: value })] }, key))) }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "Financial Trends" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: Array.isArray(data.trends)
                                    ? data.trends.map((trend, index) => (_jsx("li", { className: "mb-1", children: trend }, index)))
                                    : _jsx("li", { children: data.trends }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "Strengths & Weaknesses" }), _jsxs("div", { className: "mt-2 space-y-4", children: [_jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-green-600 dark:text-green-400", children: "Strengths" }), _jsx("ul", { className: "mt-1 list-disc pl-5", children: Array.isArray(data.strengths)
                                                    ? data.strengths.map((item, index) => (_jsx("li", { className: "text-sm", children: item }, index)))
                                                    : _jsx("li", { className: "text-sm", children: data.strengths }) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-red-600 dark:text-red-400", children: "Weaknesses" }), _jsx("ul", { className: "mt-1 list-disc pl-5", children: Array.isArray(data.weaknesses)
                                                    ? data.weaknesses.map((item, index) => (_jsx("li", { className: "text-sm", children: item }, index)))
                                                    : _jsx("li", { className: "text-sm", children: data.weaknesses }) })] })] })] })] })] }));
};
export default FinancialAnalysisSection;
