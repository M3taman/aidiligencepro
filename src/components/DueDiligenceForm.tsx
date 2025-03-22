import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { useAuth } from "@/components/auth/authContext";
import { Link } from "react-router-dom";

interface DueDiligenceFormProps {
  onSubmit: (companyName: string) => Promise<void>;
  isLoading: boolean;
}

export function DueDiligenceForm({ onSubmit, isLoading }: DueDiligenceFormProps) {
  const [companyName, setCompanyName] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      await onSubmit(companyName.trim());
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Generate Due Diligence Report</CardTitle>
        <CardDescription>
          Enter a company name to generate a comprehensive due diligence report powered by AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-medium">
              Company Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                placeholder="Enter company name (e.g., Apple Inc)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>
          
          {!user && (
            <div className="text-sm text-muted-foreground">
              <p>
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to save your reports and access premium features.
              </p>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading || !companyName.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 