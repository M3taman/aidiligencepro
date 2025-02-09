
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="container mx-auto px-4 pt-20 pb-32 relative">
      <div className="text-center max-w-4xl mx-auto space-y-8 fade-in">
        <div className="inline-block mb-4 px-4 py-1.5 glass-card">
          <span className="text-primary text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI-Powered Due Diligence Platform
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text leading-tight">
          Transform Your Investment Due Diligence with AI
        </h1>
        <p className="text-muted-foreground text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
          Save 60% of your time with our AI-powered platform that performs comprehensive due diligence across 7 critical dimensions. Get real-time insights for just $499/month.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
          <Button 
            size="lg"
            className="neo-button px-8 rounded-2xl h-12"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Start Free Trial 
            <ChevronRight className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 glass-card hover:bg-primary/10 rounded-2xl h-12"
          >
            View Demo Report
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
