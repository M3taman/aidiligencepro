
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, FileText, Database, Search, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const DemoSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { toast } = useToast();

  const handleDiligenceAccess = () => {
    toast({
      title: "Free 7-Day Trial",
      description: "Start your due diligence journey with full access to our AI-powered platform"
    });
    // Navigate to trial signup
    window.location.href = "/register";
  };

  const handleDemoClick = () => {
    const demoUrl = "https://yourvideourl.com/demo.mp4";
    window.open(demoUrl, "_blank");
    toast({
      title: "Demo video opened in new tab",
      description: "Watch how our AI performs comprehensive due diligence analysis"
    });
  };

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 gradient-text">AI-Powered Due Diligence</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience real-time, comprehensive company analysis powered by advanced AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* AI Due Diligence Card */}
        <Card className="p-8 hover-scale glass-card">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Multi-Source Analysis
              </h3>
              <p className="text-muted-foreground">
                Our AI analyzes data from SEC filings, financial databases, news sources, and more
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">Real-Time Processing</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get instant insights from multiple authoritative sources
                </p>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">Risk Assessment</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comprehensive risk evaluation and market positioning analysis
                </p>
              </div>
            </div>

            <Button className="neo-button w-full" onClick={handleDiligenceAccess}>
              Start 7-Day Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Video Demo Card */}
        <Card className="p-8 hover-scale glass-card">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-transparent rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/40" />
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full w-16 h-16 relative z-10 hover:scale-110 transition-transform"
              onClick={handleDemoClick}
            >
              <Play className="w-8 h-8" />
            </Button>
          </div>
          <h3 className="text-xl font-semibold mb-2">See It In Action</h3>
          <p className="text-muted-foreground mb-6">
            Watch our 3-minute demo showcasing real-time AI analysis and automated reporting
          </p>
          <Button className="neo-button w-full" onClick={handleDemoClick}>
            Watch Demo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Card>
      </div>
    </section>
  );
};

export default DemoSection;
