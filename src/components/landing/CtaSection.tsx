import React from 'react';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="py-20 text-center bg-primary/5">
      <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
      <Button onClick={() => window.location.href = '/register'}>Create your free account</Button>
    </section>
  );
}
