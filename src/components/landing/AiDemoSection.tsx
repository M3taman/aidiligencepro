import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, Loader2, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";

// Define the type for the Cloud Function response
type DueDiligenceResponse = {
  data: string;
};

const AiDemoSection = () => {
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const navigate = useNavigate();
  const functions = getFunctions();

  const handleAnalysis = async () => {
    if (!company.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    setIsLoading(true);
    try {
      const generateDueDiligence = httpsCallable<{ company: string }, DueDiligenceResponse>(
        functions,
        'generateDueDiligence'
      );
      const result = await generateDueDiligence({ company });
      setAnalysis(result.data.data);
      toast.success("Analysis generated successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Error generating analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
          <Bot className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
        </div>
        <h2 className="text-4xl font-bold mb-4 gradient-text">
          Experience AI Due Diligence
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Try our AI analysis engine with any company name. Get a preview of our comprehensive due diligence report.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto p-8 glass-card">
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter company name (e.g., Tesla, Apple, Microsoft)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              className="h-12 px-6 neo-button"
              onClick={handleAnalysis}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>

          {analysis && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Analysis Complete</span>
              </div>
              <div className="bg-background/50 p-6 rounded-lg backdrop-blur-sm">
                <pre className="whitespace-pre-wrap text-sm">
                  {analysis}
                </pre>
              </div>
              <Button
                className="w-full neo-button"
                onClick={() => navigate("/register")}
              >
                Sign Up for Full Analysis
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {["Real-time data", "7-dimensional analysis", "AI-powered insights"].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default AiDemoSection;
