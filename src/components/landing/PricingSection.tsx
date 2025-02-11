
import { Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tiers = [
  {
    name: "Growth",
    price: "499",
    users: "5",
    description: "Perfect for small teams and startups",
    features: [
      "5 team members",
      "Real-time due diligence reports",
      "AI-powered analysis",
      "Market intelligence insights",
      "Basic risk assessment",
      "Email support"
    ]
  },
  {
    name: "Business",
    price: "999",
    users: "10",
    description: "Ideal for growing companies",
    features: [
      "10 team members",
      "Advanced due diligence features",
      "Priority AI processing",
      "Custom report templates",
      "Advanced risk modeling",
      "Priority support"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited team members",
      "Custom AI model training",
      "API access",
      "Advanced integrations",
      "Dedicated success manager",
      "24/7 premium support"
    ]
  }
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
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier, index) => (
          <Card key={index} className="p-8 hover-scale glass-card">
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-primary font-semibold mb-1">{tier.name}</div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold">
                        {tier.price === "Custom" ? "Custom" : `$${tier.price}`}
                      </span>
                      {tier.price !== "Custom" && (
                        <span className="text-muted-foreground mb-1">/month</span>
                      )}
                    </div>
                  </div>
                  {tier.users && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span>{tier.users} users</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="neo-button w-full">
                {tier.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
