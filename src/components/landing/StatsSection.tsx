
const stats = [
  { value: "24/7", label: "Real-Time Monitoring" },
  { value: "7+", label: "Analysis Dimensions" },
  { value: "500+", label: "Data Points Analyzed" },
  { value: "60%", label: "Time Saved in Analysis" }
];

const StatsSection = () => {
  return (
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
  );
};

export default StatsSection;
