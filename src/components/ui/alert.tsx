import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700', className)} {...props} />;
}
export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <p className="font-medium">{children}</p>;
}
export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}
