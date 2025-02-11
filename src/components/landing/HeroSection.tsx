
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleStartTrial = () => {
    navigate("/register");
    toast.success("Welcome! Let's get you started with your free trial.");
  };

  const handleViewDemo = () => {
    const demoSection = document.getElementById("demo-section");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="container mx-auto px-4 pt-20 pb-32 relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10" />

      <div className="text-center max-w-4xl mx-auto space-y-8 fade-in">
        <div className="inline-block mb-4 px-4 py-1.5 glass-card">
          <span className="text-primary text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI-Powered Due Diligence Platform
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 gradient-text leading-tight animate-fade-in">
            Transform Your Investment
            <br />
            Due Diligence with AI
          </h1>
          
          <p className="text-muted-foreground text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Save 60% of your time with our AI-powered platform that performs comprehensive due diligence across 7 critical dimensions. 
            <span className="hidden sm:inline"> Get real-time insights and make data-driven decisions faster than ever.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button 
            size="lg"
            className="neo-button px-8 rounded-2xl h-12 w-full sm:w-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleStartTrial}
          >
            Start Free Trial 
            <ChevronRight className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 glass-card hover:bg-primary/10 rounded-2xl h-12 w-full sm:w-auto"
            onClick={handleViewDemo}
          >
            View Demo
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="pt-12 flex justify-center gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>7-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>No credit card required</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
