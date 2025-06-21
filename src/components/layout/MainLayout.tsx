import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

import { Outlet, Link } from 'react-router-dom';

export default function MainLayout({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-5xl px-4', className)}>
      <nav className="flex gap-4 py-4 border-b mb-6">
        <Link to="/" className="font-bold">AI Diligence Pro</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/about">About</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/login">Login</Link>
      </nav>
      {children}
      <Outlet />
    </div>
  );
}
