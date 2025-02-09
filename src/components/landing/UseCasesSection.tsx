
import { Card } from "@/components/ui/card";
import { Building, Award, Users } from "lucide-react";

const UseCasesSection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Who Benefits Most?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trusted by leading investment professionals to make data-driven decisions
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 hover-scale glass-card">
          <Building className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Investment Firms</h3>
          <p className="text-muted-foreground">
            Cut due diligence time by 60% while gaining deeper insights through AI-powered analysis
          </p>
        </Card>
        <Card className="p-6 hover-scale glass-card">
          <Award className="w-8 h-8 text-purple-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Portfolio Managers</h3>
          <p className="text-muted-foreground">
            Monitor investments in real-time with comprehensive risk assessment
          </p>
        </Card>
        <Card className="p-6 hover-scale glass-card">
          <Users className="w-8 h-8 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Due Diligence Teams</h3>
          <p className="text-muted-foreground">
            Automate research and analysis across 7 critical dimensions
          </p>
        </Card>
      </div>
    </section>
  );
};

export default UseCasesSection;
