
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

const CtaSection = () => {
  return (
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
  );
};

export default CtaSection;
