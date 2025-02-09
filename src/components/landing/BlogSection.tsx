
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "7 Key Dimensions of Modern Due Diligence",
    excerpt: "Learn about the critical areas that comprehensive due diligence must cover in today's business landscape.",
    category: "Guide",
    readTime: "5 min read"
  },
  {
    title: "AI-Powered Risk Assessment",
    excerpt: "Discover how artificial intelligence is revolutionizing the way we identify and evaluate potential risks.",
    category: "Technology",
    readTime: "4 min read"
  },
  {
    title: "Best Practices for Financial Analysis",
    excerpt: "Expert insights on conducting thorough financial analysis during the due diligence process.",
    category: "Finance",
    readTime: "6 min read"
  }
];

const BlogSection = () => {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Resources & Insights</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Stay informed with our latest articles, guides, and industry insights
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {blogPosts.map((post, index) => (
          <Card key={index} className="hover-scale glass-card overflow-hidden">
            <div className="h-48 bg-primary/5 animate-pulse" />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm text-primary font-medium">{post.category}</span>
                <span className="text-sm text-muted-foreground">{post.readTime}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <Button variant="link" className="p-0 h-auto text-primary">
                Read More <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button className="neo-button">
          View All Resources <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </section>
  );
};

export default BlogSection;
