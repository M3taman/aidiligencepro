import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface BackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function Background({ className, children }: BackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn('relative min-h-screen bg-background', className)}>
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
      
      {/* Animated grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Radial gradient for a subtle glow effect */}
      <div className="fixed inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      {/* Animated dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default Background; 