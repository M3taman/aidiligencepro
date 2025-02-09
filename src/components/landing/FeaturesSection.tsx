
import { Card } from "@/components/ui/card";
import { LineChart, ShieldCheck, TrendingUp, Target, Scale, FileSearch } from "lucide-react";

const features = [
  {
    icon: <LineChart className="w-6 h-6 text-blue-500" />,
    title: "Real-Time Financial Analysis",
    description: "Live SEC filings analysis and financial health monitoring"
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
    title: "Risk Assessment",
    description: "Continuous operational and financial risk evaluation"
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
    title: "Market Intelligence",
    description: "Dynamic market positioning and competitor analysis"
  },
  {
    icon: <Target className="w-6 h-6 text-orange-500" />,
    title: "Growth Analytics",
    description: "AI-powered growth opportunity identification"
  },
  {
    icon: <Scale className="w-6 h-6 text-teal-500" />,
    title: "Compliance Monitoring",
    description: "Real-time regulatory compliance tracking"
  },
  {
    icon: <FileSearch className="w-6 h-6 text-yellow-500" />,
    title: "Due Diligence Automation",
    description: "7-dimensional automated analysis framework"
  }
];

const FeaturesSection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Platform Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything you need for comprehensive due diligence analysis
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="p-6 hover-scale glass-card group"
          >
            <div className="mb-4 transition-transform duration-300 group-hover:scale-110">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
