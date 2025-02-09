
import HeroSection from "@/components/landing/HeroSection";
import MethodologySection from "@/components/landing/MethodologySection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsSection from "@/components/landing/StatsSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import FaqSection from "@/components/landing/FaqSection";
import NewsletterSection from "@/components/landing/NewsletterSection";
import CtaSection from "@/components/landing/CtaSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradient Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

      <HeroSection />
      <MethodologySection />
      <FeaturesSection />
      <StatsSection />
      <UseCasesSection />
      <FaqSection />
      <NewsletterSection />
      <CtaSection />
    </div>
  );
};

export default Index;
