import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, className = "", ...props }, ref) => {
    const percentage = Math.min(Math.max(value, 0), max) / max * 100;
    return (
      <div
        ref={ref}
        className={`w-full h-3 bg-gray-200 rounded-full overflow-hidden ${className}`}
        {...props}
      >
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export default Progress;
