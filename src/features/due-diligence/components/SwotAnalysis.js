import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * A component for displaying SWOT analysis in a grid layout
 */
export const SwotAnalysis = ({ strengths, weaknesses, opportunities, threats }) => {
    return (_jsxs("div", { className: "mt-6 grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-green-600 dark:text-green-400", children: "Strengths" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: strengths.map((strength, index) => (_jsx("li", { children: strength }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-red-600 dark:text-red-400", children: "Weaknesses" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: weaknesses.map((weakness, index) => (_jsx("li", { children: weakness }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-blue-600 dark:text-blue-400", children: "Opportunities" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: opportunities.map((opportunity, index) => (_jsx("li", { children: opportunity }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-amber-600 dark:text-amber-400", children: "Threats" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: threats.map((threat, index) => (_jsx("li", { children: threat }, index))) })] })] }));
};
export default SwotAnalysis;
