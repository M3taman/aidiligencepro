
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does the AI-powered document processing work?",
    answer: "Our advanced AI technology automatically extracts, categorizes, and analyzes information from various document types including PDFs, emails, and financial statements. It identifies key data points, risks, and opportunities while maintaining accuracy and compliance."
  },
  {
    question: "What security measures are in place to protect sensitive data?",
    answer: "We implement bank-level encryption, role-based access controls, and regular security audits. All data is encrypted both in transit and at rest, and we maintain compliance with industry standards including SOC 2 and GDPR."
  },
  {
    question: "Can I integrate with existing systems?",
    answer: "Yes, our platform offers seamless integration with popular CRM systems, email providers, and financial software. We provide APIs and pre-built connectors for major platforms, making integration straightforward."
  },
  {
    question: "How long does implementation take?",
    answer: "Most clients are up and running within 2-3 weeks. Our dedicated implementation team provides comprehensive training and support throughout the onboarding process."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide 24/7 technical support, dedicated account managers, and regular check-ins to ensure your success. Our team of industry experts is always available to help optimize your workflows."
  }
];

const FaqSection = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Frequently Asked Questions</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get answers to common questions about our platform.
        </p>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <Card 
            key={index}
            className="glass-card overflow-hidden"
          >
            <button
              className="w-full p-6 text-left flex items-center justify-between hover:bg-primary/5"
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <span className="font-semibold">{faq.question}</span>
              {expandedFaq === index ? (
                <Minus className="w-5 h-5 text-primary" />
              ) : (
                <Plus className="w-5 h-5 text-primary" />
              )}
            </button>
            {expandedFaq === index && (
              <div className="p-6 pt-0 text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
