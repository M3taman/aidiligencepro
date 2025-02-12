
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

const blogPosts = [
  {
    title: "7 Key Dimensions of Modern Due Diligence",
    excerpt: "Learn about the critical areas that comprehensive due diligence must cover in today's business landscape.",
    category: "Guide",
    readTime: "5 min read",
    image: "/blog/due-diligence-dimensions.jpg",
    fullContent: "Modern due diligence requires a comprehensive approach across multiple dimensions. The seven key areas include: 1) Financial Analysis - examining historical performance and future projections, 2) Market Position - evaluating competitive advantages and industry standing, 3) Operational Assessment - reviewing processes and efficiency, 4) Technology Infrastructure - assessing digital capabilities and security measures, 5) Legal & Regulatory Compliance - ensuring adherence to relevant regulations, 6) Human Capital - evaluating team strength and culture, and 7) Strategic Fit - assessing alignment with investment objectives."
  },
  {
    title: "AI-Powered Risk Assessment",
    excerpt: "Discover how artificial intelligence is revolutionizing the way we identify and evaluate potential risks.",
    category: "Technology",
    readTime: "4 min read",
    image: "/blog/ai-risk-assessment.jpg",
    fullContent: "Artificial Intelligence is transforming risk assessment in due diligence processes. Advanced algorithms can now analyze vast amounts of data to identify patterns and potential risks that human analysts might miss. Machine learning models can predict future risks based on historical data, while natural language processing can scan documents and news sources for red flags. This technological advancement not only speeds up the due diligence process but also significantly improves its accuracy and comprehensiveness."
  },
  {
    title: "Best Practices for Financial Analysis",
    excerpt: "Expert insights on conducting thorough financial analysis during the due diligence process.",
    category: "Finance",
    readTime: "6 min read",
    image: "/blog/financial-analysis.jpg",
    fullContent: "Effective financial analysis in due diligence requires a systematic approach. Start with reviewing historical financial statements, focusing on revenue trends, profit margins, and cash flow patterns. Analyze key financial ratios including liquidity, solvency, and efficiency metrics. Pay special attention to working capital management and capital structure. Consider off-balance-sheet items and contingent liabilities. Finally, assess the quality of earnings and validate financial projections against market conditions and historical performance."
  }
];

const BlogSection = () => {
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const togglePost = (index: number) => {
    setExpandedPosts(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );

    // Announce to screen readers
    const post = blogPosts[index];
    const isExpanding = !expandedPosts.includes(index);
    if (isExpanding) {
      toast.info(`Expanded article: ${post.title}`);
    }
  };

  const handleViewAll = () => {
    toast.info("Redirecting to resources library...");
    // Navigation logic will be implemented later
  };

  return (
    <section 
      className="container mx-auto px-4 py-24"
      aria-labelledby="resources-title"
    >
      <div className="text-center mb-16">
        <h2 id="resources-title" className="text-3xl font-bold mb-4 gradient-text">
          Resources & Insights
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Stay informed with our latest articles, guides, and industry insights
        </p>
      </div>

      <div 
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        role="list"
        aria-label="Blog posts"
      >
        {blogPosts.map((post, index) => (
          <Card 
            key={index} 
            className={`hover-scale glass-card overflow-hidden transition-all duration-300 ${
              hoverIndex === index ? 'scale-105' : ''
            }`}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            role="listitem"
          >
            <div 
              className="h-48 bg-primary/5 animate-pulse"
              role="img"
              aria-label={`Illustration for ${post.title}`}
            />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <span 
                  className="text-sm text-primary font-medium px-2 py-1 bg-primary/10 rounded-full"
                  role="note"
                >
                  {post.category}
                </span>
                <span 
                  className="text-sm text-muted-foreground"
                  role="note"
                >
                  {post.readTime}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                {post.title}
              </h3>
              
              <Collapsible 
                open={expandedPosts.includes(index)}
                className="space-y-4"
              >
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <CollapsibleContent 
                  className="text-muted-foreground mb-4 animate-accordion-down"
                >
                  {post.fullContent}
                </CollapsibleContent>
                
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary flex items-center group"
                    onClick={() => togglePost(index)}
                    aria-expanded={expandedPosts.includes(index)}
                    aria-controls={`content-${index}`}
                  >
                    {expandedPosts.includes(index) ? (
                      <>
                        Read Less 
                        <ChevronUp className="ml-2 w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                      </>
                    ) : (
                      <>
                        Read More 
                        <ChevronDown className="ml-2 w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button 
          className="neo-button group"
          onClick={handleViewAll}
          aria-label="View all resources in the library"
        >
          View All Resources 
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
};

export default BlogSection;
