
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const stats = [
  { value: "24/7", label: "Real-Time Monitoring", suffix: "" },
  { value: "7", label: "Analysis Dimensions", suffix: "+" },
  { value: "500", label: "Data Points Analyzed", suffix: "+" },
  { value: "60", label: "Time Saved in Analysis", suffix: "%" }
];

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section id="stats-section" className="container mx-auto px-4 py-24">
      <div className="glass-card p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center"
              style={{
                opacity: 0,
                animation: isVisible ? `fade-in 0.6s ease-out ${index * 0.1}s forwards` : 'none'
              }}
            >
              <div className="relative">
                <div className="text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                  <span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500" />
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
