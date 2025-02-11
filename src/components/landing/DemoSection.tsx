
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, FileText, Database } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const DemoSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { toast } = useToast();

  const handleDemoClick = () => {
    // Replace this URL with your actual demo video URL
    const demoUrl = "https://yourvideourl.com/demo.mp4";
    window.open(demoUrl, "_blank");
    toast({
      title: "Demo video opened in new tab",
      description: "The 3-minute product demo is now playing"
    });
  };

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
          <h3 className="text-xl font-semibold mb-2">Platform Overview</h3>
          <p className="text-muted-foreground mb-6">
            Watch our 3-minute demo showcasing real-time AI analysis, data integration, and automated reporting
          </p>
          <Button className="neo-button w-full" onClick={handleDemoClick}>
            Watch Demo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Card>

        {/* Interactive Demo Card */}
        <Card className="p-8 hover-scale glass-card">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Sample Due Diligence Report</h3>
              <p className="text-muted-foreground">
                Explore an AI-generated sample report with real-time market data and comprehensive analysis
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">Real-Time Analysis</h4>
                </div>
                <div className="h-24 bg-primary/10 rounded animate-pulse" />
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">Insights & Recommendations</h4>
                </div>
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
