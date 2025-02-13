
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Download,
  BookOpen,
  Newspaper,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

type Resource = {
  id: string;
  title: string;
  description: string;
  type: "report" | "guide" | "analysis";
  date: string;
  downloadUrl: string;
};

const resources: Resource[] = [
  {
    id: "1",
    title: "Due Diligence Best Practices Guide",
    description: "Comprehensive guide on conducting thorough due diligence analysis.",
    type: "guide",
    date: "2024-03-15",
    downloadUrl: "#"
  },
  {
    id: "2",
    title: "Market Analysis Framework",
    description: "Step-by-step framework for analyzing market opportunities and risks.",
    type: "guide",
    date: "2024-03-10",
    downloadUrl: "#"
  },
  {
    id: "3",
    title: "Technology Sector Report 2024",
    description: "In-depth analysis of the technology sector trends and opportunities.",
    type: "report",
    date: "2024-03-01",
    downloadUrl: "#"
  },
  {
    id: "4",
    title: "ESG Investment Analysis",
    description: "Comprehensive analysis of ESG investment criteria and impact.",
    type: "analysis",
    date: "2024-02-28",
    downloadUrl: "#"
  }
];

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "report":
        return <FileText className="w-5 h-5" />;
      case "guide":
        return <BookOpen className="w-5 h-5" />;
      case "analysis":
        return <Newspaper className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 gradient-text">Resources</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access our comprehensive collection of reports, guides, and analysis to enhance your due diligence process.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            className="bg-background border border-input rounded-md px-3 py-2"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="report">Reports</option>
            <option value="guide">Guides</option>
            <option value="analysis">Analysis</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getIcon(resource.type)}
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(resource.date).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {resource.description}
            </p>
            <Button className="w-full neo-button" onClick={() => window.open(resource.downloadUrl)}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No resources found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
