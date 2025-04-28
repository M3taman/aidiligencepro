import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export function ReportOptions({ options, onChange }) {
    const handleFormatChange = (key, value) => {
        onChange({
            ...options,
            [key]: value
        });
    };
    const handleDepthChange = (value) => {
        onChange({
            ...options,
            analysisDepth: value
        });
    };
    const handleReportFormatChange = (value) => {
        onChange({
            ...options,
            reportFormat: value
        });
    };
    return (_jsx(Card, { className: "p-4", children: _jsxs(CardContent, { className: "p-0 space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "mb-2 block", children: "Analysis Depth" }), _jsxs(Select, { value: options.analysisDepth || 'standard', onValueChange: (value) => handleDepthChange(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select depth" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "basic", children: "Basic" }), _jsx(SelectItem, { value: "standard", children: "Standard" }), _jsx(SelectItem, { value: "comprehensive", children: "Comprehensive" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "mb-2 block", children: "Report Format" }), _jsxs(Select, { value: options.reportFormat || 'detailed', onValueChange: (value) => handleReportFormatChange(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select format" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "detailed", children: "Detailed" }), _jsx(SelectItem, { value: "summary", children: "Summary" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "mb-2 block", children: "Format Options" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includeCharts", checked: options.includeCharts, onCheckedChange: (checked) => handleFormatChange('includeCharts', checked) }), _jsx(Label, { htmlFor: "includeCharts", children: "Include Charts" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includeTables", checked: options.includeTables, onCheckedChange: (checked) => handleFormatChange('includeTables', checked) }), _jsx(Label, { htmlFor: "includeTables", children: "Include Tables" })] })] })] }) }));
}
export default ReportOptions;
