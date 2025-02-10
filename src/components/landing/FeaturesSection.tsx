
import { Card } from "@/components/ui/card";
import { LineChart, ShieldCheck, TrendingUp, Target, Scale, FileSearch } from "lucide-react";

const features = [
  {
    icon: <LineChart className="w-6 h-6 text-blue-500" />,
    title: "Real-Time Financial Analysis",
    description: "Live SEC filings analysis and financial health monitoring",
    delay: 0
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
    title: "Risk Assessment",
    description: "Continuous operational and financial risk evaluation",
    delay: 100
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
    title: "Market Intelligence",
    description: "Dynamic market positioning and competitor analysis",
    delay: 200
  },
  {
    icon: <Target className="w-6 h-6 text-orange-500" />,
    title: "Growth Analytics",
    description: "AI-powered growth opportunity identification",
    delay: 300
  },
  {
    icon: <Scale className="w-6 h-6 text-teal-500" />,
    title: "Compliance Monitoring",
    description: "Real-time regulatory compliance tracking",
    delay: 400
  },
  {
    icon: <FileSearch className="w-6 h-6 text-yellow-500" />,
    title: "Due Diligence Automation",
    description: "7-dimensional automated analysis framework",
    delay: 500
  }
];

const FeaturesSection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16 fade-in">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Platform Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything you need for comprehensive due diligence analysis
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="p-6 hover-scale glass-card group transition-all duration-300"
            style={{ 
              animationDelay: `${feature.delay}ms`,
              opacity: 0,
              animation: 'fade-in 0.6s ease-out forwards'
            }}
          >
            <div className="relative">
              <div className="mb-4 transition-transform duration-300 group-hover:scale-110 bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="absolute -inset-1 bg-primary/5 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary/60 to-primary mt-4 transition-all duration-500" />
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
