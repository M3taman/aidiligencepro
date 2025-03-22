import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportGenerationOptions } from '../types';

interface ReportOptionsProps {
  options: ReportGenerationOptions;
  onChange: (options: ReportGenerationOptions) => void;
}

export function ReportOptions({ options, onChange }: ReportOptionsProps) {
  const handleFormatChange = (key: 'includeCharts' | 'includeTables', value: boolean) => {
    onChange({
      ...options,
      [key]: value
    });
  };

  const handleDepthChange = (value: 'basic' | 'standard' | 'comprehensive') => {
    onChange({
      ...options,
      analysisDepth: value
    });
  };

  const handleReportFormatChange = (value: 'detailed' | 'summary') => {
    onChange({
      ...options,
      reportFormat: value
    });
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0 space-y-4">
        <div>
          <Label className="mb-2 block">Analysis Depth</Label>
          <Select 
            value={options.analysisDepth || 'standard'} 
            onValueChange={(value: any) => handleDepthChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select depth" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Report Format</Label>
          <Select 
            value={options.reportFormat || 'detailed'} 
            onValueChange={(value: any) => handleReportFormatChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="mb-2 block">Format Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeCharts" 
              checked={options.includeCharts} 
              onCheckedChange={(checked) => handleFormatChange('includeCharts', checked as boolean)}
            />
            <Label htmlFor="includeCharts">Include Charts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeTables" 
              checked={options.includeTables} 
              onCheckedChange={(checked) => handleFormatChange('includeTables', checked as boolean)}
            />
            <Label htmlFor="includeTables">Include Tables</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReportOptions;
