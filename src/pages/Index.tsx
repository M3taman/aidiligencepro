
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, BarChart2, Lock, Users, FileText, Bot, ArrowRight } from "lucide-react";

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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto fade-in">
          <div className="inline-block mb-4 px-3 py-1 bg-blue-50 rounded-full">
            <span className="text-blue-600 text-sm font-medium">Revolutionizing Due Diligence</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Streamline Your Investment Due Diligence
          </h1>
          <p className="text-slate-600 text-xl mb-8 leading-relaxed">
            AI-powered platform that automates portfolio management, compliance, and reporting for investment professionals.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Get Started 
              <ChevronRight className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything you need to streamline your investment processes and make data-driven decisions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover-scale glass-card"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Due Diligence?</h2>
          <p className="text-slate-600 mb-8">
            Join leading investment firms using our platform to make better decisions faster.
          </p>
          <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8">
            Start Free Trial <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
