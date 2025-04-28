import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReportSection from './ReportSection';
/**
 * Risk Assessment section of the due diligence report
 */
export const RiskAssessmentSection = ({ data }) => {
    if (!data)
        return null;
    return (_jsx(ReportSection, { title: "Risk Assessment", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "Financial Risks" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: Array.isArray(data.financial)
                                ? data.financial.map((risk, index) => (_jsx("li", { children: risk }, index)))
                                : _jsx("li", { children: data.financial }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "Market Risks" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: Array.isArray(data.market)
                                ? data.market.map((risk, index) => (_jsx("li", { children: risk }, index)))
                                : _jsx("li", { children: data.market }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "Operational Risks" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: Array.isArray(data.operational)
                                ? data.operational.map((risk, index) => (_jsx("li", { children: risk }, index)))
                                : _jsx("li", { children: data.operational }) })] }), data.regulatory && data.regulatory.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: "Regulatory Risks" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: Array.isArray(data.regulatory)
                                ? data.regulatory.map((risk, index) => (_jsx("li", { children: risk }, index)))
                                : _jsx("li", { children: data.regulatory }) })] })), data.esg && data.esg.length > 0 && (_jsxs("div", { className: "md:col-span-2", children: [_jsx("h4", { className: "font-semibold", children: "ESG Considerations" }), _jsx("ul", { className: "mt-2 list-disc pl-5", children: Array.isArray(data.esg)
                                ? data.esg.map((item, index) => (_jsx("li", { children: item }, index)))
                                : _jsx("li", { children: data.esg }) })] }))] }) }));
};
export default RiskAssessmentSection;
