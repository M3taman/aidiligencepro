
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Network, ShieldCheck, TrendingUp } from "lucide-react";

const methodologySteps = [
  {
    icon: <Brain className="w-8 h-8 text-blue-500" />,
    title: "AI-Powered Analysis",
    badge: "Core Feature",
    description: "Advanced machine learning algorithms process and analyze financial data, market intelligence, and regulatory records."
  },
  {
    icon: <Network className="w-8 h-8 text-purple-500" />,
    title: "Multi-Dimensional Framework",
    badge: "Comprehensive",
    description: "Evaluate investments across 7 critical dimensions using our proprietary scoring system."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
    title: "Risk Assessment",
    badge: "Real-time",
    description: "Continuous monitoring of operational, financial, and compliance risks with instant alerts."
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
    title: "Growth Analytics",
    badge: "Predictive",
    description: "Identify expansion opportunities and innovation potential through predictive modeling."
  }
];

const MethodologySection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16 fade-in">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Our AI-Powered Methodology</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A revolutionary approach that combines artificial intelligence with comprehensive analysis
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {methodologySteps.map((step, index) => (
          <Card 
            key={index} 
            className="p-8 hover-scale glass-card group transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 glass-card rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {step.badge}
                </Badge>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground flex-grow">{step.description}</p>
              
              <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary/60 to-primary mt-6 transition-all duration-500" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default MethodologySection;
