
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, BarChart2, Lock, Users, FileText, Bot, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <BarChart2 className="w-6 h-6 text-blue-500" />,
      title: "Portfolio Analytics",
      description: "Real-time insights and performance tracking"
    },
    {
      icon: <Lock className="w-6 h-6 text-green-500" />,
      title: "Compliance Automation",
      description: "Automated compliance monitoring and reporting"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Client Management",
      description: "Streamlined client communication and reporting"
    },
    {
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      title: "Document Processing",
      description: "AI-powered document analysis and extraction"
    },
    {
      icon: <Bot className="w-6 h-6 text-teal-500" />,
      title: "AI Insights",
      description: "Advanced analytics and predictive insights"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      title: "Smart Automation",
      description: "Intelligent workflow automation tools"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradient Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 relative">
        <div className="text-center max-w-4xl mx-auto space-y-8 fade-in">
          <div className="inline-block mb-4 px-4 py-1.5 glass-card">
            <span className="text-primary text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Revolutionizing Due Diligence
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text leading-tight">
            Streamline Your Investment Due Diligence
          </h1>
          <p className="text-muted-foreground text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            AI-powered platform that automates portfolio management, compliance, and reporting for investment professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Button 
              size="lg"
              className="neo-button px-8 rounded-2xl h-12"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Get Started 
              <ChevronRight className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 glass-card hover:bg-primary/10 rounded-2xl h-12"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to streamline your investment processes and make data-driven decisions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover-scale glass-card group"
            >
              <div className="mb-4 transition-transform duration-300 group-hover:scale-110">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 gradient-text">Ready to Transform Your Due Diligence?</h2>
            <p className="text-muted-foreground mb-8">
              Join leading investment firms using our platform to make better decisions faster.
            </p>
            <Button size="lg" className="neo-button px-8 rounded-2xl h-12">
              Start Free Trial <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
