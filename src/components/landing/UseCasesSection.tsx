
import { Card } from "@/components/ui/card";
import { Building, Award, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const useCases = [
  {
    icon: <Building className="w-8 h-8 text-blue-500" />,
    title: "Investment Firms",
    description: "Cut due diligence time by 60% while gaining deeper insights through AI-powered analysis",
    benefits: ["Automated data collection", "Real-time market insights", "Risk assessment automation"]
  },
  {
    icon: <Award className="w-8 h-8 text-purple-500" />,
    title: "Portfolio Managers",
    description: "Monitor investments in real-time with comprehensive risk assessment",
    benefits: ["Portfolio optimization", "Risk monitoring", "Performance tracking"]
  },
  {
    icon: <Users className="w-8 h-8 text-green-500" />,
    title: "Due Diligence Teams",
    description: "Automate research and analysis across 7 critical dimensions",
    benefits: ["Workflow automation", "Compliance tracking", "Team collaboration"]
  }
];

const UseCasesSection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16 fade-in">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Who Benefits Most?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trusted by leading investment professionals to make data-driven decisions
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {useCases.map((useCase, index) => (
          <Card 
            key={index} 
            className="p-8 hover-scale glass-card group"
            style={{
              opacity: 0,
              animation: `fade-in 0.6s ease-out ${index * 0.2}s forwards`
            }}
          >
            <div className="p-3 bg-primary/10 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              {useCase.icon}
            </div>
            <h3 className="text-xl font-semibold mb-4">{useCase.title}</h3>
            <p className="text-muted-foreground mb-6">
              {useCase.description}
            </p>
            <ul className="space-y-3 mb-6">
              {useCase.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4 mr-2 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500" />
          </Card>
        ))}
      </div>
    </section>
  );
};

export default UseCasesSection;
