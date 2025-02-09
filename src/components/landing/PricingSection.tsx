
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  "Real-time monitoring of investments",
  "Multi-dimensional AI analysis",
  "Automated due diligence reports",
  "Risk assessment & scoring",
  "Market intelligence insights",
  "Compliance tracking",
  "24/7 expert support"
];

const PricingSection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start your 14-day free trial today. No credit card required.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 hover-scale glass-card">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="text-sm text-primary font-semibold mb-2">PROFESSIONAL PLAN</div>
              <div className="text-4xl font-bold mb-2">$499<span className="text-lg text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground mb-4">Everything you need for comprehensive due diligence</p>
              <Button className="neo-button px-8 rounded-2xl">Start Free Trial</Button>
            </div>
            
            <div className="border-t md:border-l md:border-t-0 pt-6 md:pt-0 md:pl-6 w-full md:w-auto">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default PricingSection;
