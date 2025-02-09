
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play } from "lucide-react";

const DemoSection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 gradient-text">See Our Platform in Action</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience how our AI-powered platform transforms due diligence processes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Video Demo Card */}
        <Card className="p-8 hover-scale glass-card">
          <div className="aspect-video bg-black/10 rounded-lg mb-6 flex items-center justify-center">
            <Button variant="outline" size="lg" className="rounded-full w-16 h-16">
              <Play className="w-8 h-8" />
            </Button>
          </div>
          <h3 className="text-xl font-semibold mb-2">Platform Overview</h3>
          <p className="text-muted-foreground mb-6">
            Watch a 3-minute demo of our platform's key features and capabilities
          </p>
          <Button className="neo-button w-full">
            Watch Demo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Card>

        {/* Interactive Demo Card */}
        <Card className="p-8 hover-scale glass-card">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Sample Due Diligence Report</h3>
              <p className="text-muted-foreground">
                Explore an interactive sample report to see the depth and quality of our analysis
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-medium mb-2">Financial Analysis</h4>
                <div className="h-24 bg-primary/10 rounded animate-pulse" />
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-medium mb-2">Risk Assessment</h4>
                <div className="h-24 bg-primary/10 rounded animate-pulse" />
              </div>
            </div>

            <Button className="neo-button w-full">
              View Sample Report <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default DemoSection;
