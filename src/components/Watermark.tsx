import React from "react";

export const Watermark: React.FC = () => (
  <a
    href="https://ai-diligence.pro"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-4 right-4 opacity-20 hover:opacity-50 transition pointer-events-auto z-50 select-none"
  >
    <img src="/logo.svg" alt="AI Diligence Pro" className="h-12 w-auto" />
  </a>
);
