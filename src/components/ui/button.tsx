import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:opacity-90 disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
