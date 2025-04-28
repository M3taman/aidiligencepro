import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ReportSection - A reusable component for sections in the due diligence report
 */
export const ReportSection = ({ title, children, className = '', }) => {
    return (_jsxs("section", { className: `mb-8 ${className}`, children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: title }), _jsx("div", { className: "space-y-4", children: children })] }));
};
export default ReportSection;
