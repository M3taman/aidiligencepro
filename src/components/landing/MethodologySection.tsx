
import { Card } from "@/components/ui/card";

const methodologySteps = [
  {
    title: "Data Collection",
    description: "Automated gathering of financial data, market intelligence, leadership profiles, and regulatory records."
  },
  {
    title: "Multi-Dimensional Analysis",
    description: "Comprehensive evaluation across 7 critical dimensions using advanced AI algorithms."
  },
  {
    title: "Risk Assessment",
    description: "Real-time monitoring of operational, financial, and compliance risks."
  },
  {
    title: "Growth Analytics",
    description: "AI-powered identification of expansion opportunities and innovation potential."
  }
];

const MethodologySection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Our AI-Powered Methodology</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive 7-dimensional analysis framework that covers every aspect of due diligence
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {methodologySteps.map((step, index) => (
          <Card key={index} className="p-6 hover-scale glass-card">
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default MethodologySection;
