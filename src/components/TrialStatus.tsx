import React from 'react';
import { useAuth } from '@/components/auth/authContext';
import { useReportUsage } from '@/hooks/useReportUsage';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Clock, FileText } from 'lucide-react';

interface TrialStatusProps {
  className?: string;
}

const TrialStatus: React.FC<TrialStatusProps> = ({ className = '' }) => {
  const { user, trialStatus } = useAuth();
  const { usage, loading } = useReportUsage();

  if (!user || loading) return null;

  // Calculate days remaining in trial
  const daysRemaining = trialStatus.endDate ? 
    Math.max(0, Math.ceil((trialStatus.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // Calculate percentage of reports used
  const totalTrialReports = 5;
  const reportsUsed = totalTrialReports - usage.remainingInTrial;
  const reportsPercentage = Math.min(100, (reportsUsed / totalTrialReports) * 100);

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Trial Status</span>
            </div>
            {trialStatus.isActive ? (
              <span className="text-sm text-green-500 font-medium">Active</span>
            ) : (
              <span className="text-sm text-red-500 font-medium">Expired</span>
            )}
          </div>
          
          {trialStatus.isActive && (
            <div className="text-sm text-muted-foreground">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining in your trial
            </div>
          )}

          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">Report Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {reportsUsed} of {totalTrialReports} used
              </span>
            </div>
            <Progress value={reportsPercentage} className="h-2" />
          </div>

          {!trialStatus.isActive && (
            <Button asChild className="w-full mt-2">
              <Link to="/pricing">Upgrade Now</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialStatus;
