import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  ChevronRight, 
  BarChart2, 
  Lock, 
  Users, 
  FileText, 
  Bot, 
  ArrowRight, 
  Sparkles,
  Mail,
  Plus,
  Minus,
  Clock,
  Zap,
  Building,
  Award,
  LineChart,
  ShieldCheck,
  TrendingUp,
  Target,
  Scale,
  FileSearch
} from "lucide-react";

const Index = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing!");
      setEmail("");
    }
  };

  const features = [
    {
      icon: <LineChart className="w-6 h-6 text-blue-500" />,
      title: "Real-Time Financial Analysis",
      description: "Live SEC filings analysis and financial health monitoring"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
      title: "Risk Assessment",
      description: "Continuous operational and financial risk evaluation"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      title: "Market Intelligence",
      description: "Dynamic market positioning and competitor analysis"
    },
    {
      icon: <Target className="w-6 h-6 text-orange-500" />,
      title: "Growth Analytics",
      description: "AI-powered growth opportunity identification"
    },
    {
      icon: <Scale className="w-6 h-6 text-teal-500" />,
      title: "Compliance Monitoring",
      description: "Real-time regulatory compliance tracking"
    },
    {
      icon: <FileSearch className="w-6 h-6 text-yellow-500" />,
      title: "Due Diligence Automation",
      description: "7-dimensional automated analysis framework"
    }
  ];

  const stats = [
    { value: "24/7", label: "Real-Time Monitoring" },
    { value: "7+", label: "Analysis Dimensions" },
    { value: "500+", label: "Data Points Analyzed" },
    { value: "60%", label: "Time Saved in Analysis" }
  ];

  const faqs = [
    {
      question: "How does the AI-powered document processing work?",
      answer: "Our advanced AI technology automatically extracts, categorizes, and analyzes information from various document types including PDFs, emails, and financial statements. It identifies key data points, risks, and opportunities while maintaining accuracy and compliance."
    },
    {
      question: "What security measures are in place to protect sensitive data?",
      answer: "We implement bank-level encryption, role-based access controls, and regular security audits. All data is encrypted both in transit and at rest, and we maintain compliance with industry standards including SOC 2 and GDPR."
    },
    {
      question: "Can I integrate with existing systems?",
      answer: "Yes, our platform offers seamless integration with popular CRM systems, email providers, and financial software. We provide APIs and pre-built connectors for major platforms, making integration straightforward."
    },
    {
      question: "How long does implementation take?",
      answer: "Most clients are up and running within 2-3 weeks. Our dedicated implementation team provides comprehensive training and support throughout the onboarding process."
    },
    {
      question: "What kind of support do you offer?",
      answer: "We provide 24/7 technical support, dedicated account managers, and regular check-ins to ensure your success. Our team of industry experts is always available to help optimize your workflows."
    }
  ];

  const methodologySteps = [
    {
      title: "Data Collection",
      description: "Automated gathering of financial data, market intelligence, leadership profiles, and regulatory records."
    },
    {
      title: "Multi-Dimensional Analysis",
      description: "Comprehensive evaluation across 7 critical dimensions using advanced AI algorithms."
    },
    {
      title: "Risk Assessment",
      description: "Real-time monitoring of operational, financial, and compliance risks."
    },
    {
      title: "Growth Analytics",
      description: "AI-powered identification of expansion opportunities and innovation potential."
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

      {/* Methodology Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Our AI-Powered Methodology</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive 7-dimensional analysis framework that covers every aspect of due diligence
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {methodologySteps.map((step, index) => (
            <Card key={index} className="p-6 hover-scale glass-card">
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Platform Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for comprehensive due diligence analysis
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

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="glass-card p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
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

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get answers to common questions about our platform.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card 
              key={index}
              className="glass-card overflow-hidden"
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-primary/5"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span className="font-semibold">{faq.question}</span>
                {expandedFaq === index ? (
                  <Minus className="w-5 h-5 text-primary" />
                ) : (
                  <Plus className="w-5 h-5 text-primary" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="p-6 pt-0 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <Mail className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 gradient-text">Stay Updated</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter for the latest updates, industry insights, and expert tips.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-card"
              />
              <Button type="submit" className="neo-button whitespace-nowrap">
                Subscribe <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>
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
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="neo-button px-8 rounded-2xl h-12">
                Start Free Trial <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="glass-card hover:bg-primary/10 px-8 rounded-2xl h-12"
              >
                Schedule Demo <Clock className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
