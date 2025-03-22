import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Download, Save, Copy, FileDown, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from 'sonner';
import { useBlogGeneration } from '../hooks/useBlogGeneration';
import { BlogPost } from '../utils/blogMCP';
import { useAuth } from '@/components/auth/authContext';

interface BlogGeneratorProps {
  className?: string;
}

export function BlogGenerator({ className }: BlogGeneratorProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    tone: 'professional',
    style: 'formal',
    targetAudience: 'investors',
    targetWordCount: 1200,
    includeMarketData: true
  });
  
  const {
    isLoading,
    error,
    blogPost,
    generateBlogPost,
    saveBlogPost,
    exportAsHtml,
    exportAsMarkdown
  } = useBlogGeneration();
  
  const handleGenerateBlog = async () => {
    if (!topic) {
      toast.error('Please enter a topic for the blog post');
      return;
    }
    
    try {
      await generateBlogPost(topic, {
        tone: options.tone as any,
        style: options.style as any,
        targetAudience: options.targetAudience as any,
        targetWordCount: options.targetWordCount,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        includeMarketData: options.includeMarketData,
        isDemo: !user // Use demo mode if user is not logged in
      });
      
      toast.success('Blog post generated successfully');
    } catch (err) {
      console.error('Error generating blog post:', err);
      toast.error('Failed to generate blog post. Please try again.');
    }
  };
  
  const handleSaveBlog = async () => {
    if (!blogPost) return;
    
    try {
      const success = await saveBlogPost(blogPost);
      if (success) {
        toast.success('Blog post saved successfully');
      } else {
        toast.error('Failed to save blog post');
      }
    } catch (err) {
      console.error('Error saving blog post:', err);
      toast.error('Failed to save blog post. Please try again.');
    }
  };
  
  const handleExportHtml = () => {
    if (!blogPost) return;
    
    try {
      exportAsHtml(blogPost);
      toast.success('Blog post exported as HTML');
    } catch (err) {
      console.error('Error exporting blog post as HTML:', err);
      toast.error('Failed to export blog post. Please try again.');
    }
  };
  
  const handleExportMarkdown = () => {
    if (!blogPost) return;
    
    try {
      exportAsMarkdown(blogPost);
      toast.success('Blog post exported as Markdown');
    } catch (err) {
      console.error('Error exporting blog post as Markdown:', err);
      toast.error('Failed to export blog post. Please try again.');
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!blogPost) return;
    
    try {
      navigator.clipboard.writeText(blogPost.content);
      toast.success('Blog post content copied to clipboard');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast.error('Failed to copy to clipboard. Please try again.');
    }
  };
  
  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Blog Generator</CardTitle>
          <CardDescription>
            Generate SEO-optimized blog posts about market news and financial topics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Blog Topic</Label>
            <Input
              id="topic"
              placeholder="Enter a topic (e.g., 'Impact of rising interest rates on tech stocks')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma separated)</Label>
            <Input
              id="keywords"
              placeholder="interest rates, tech stocks, market impact, federal reserve"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              Advanced Options
              {showOptions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={handleGenerateBlog}
              disabled={isLoading || !topic}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Blog Post
                </>
              )}
            </Button>
          </div>
          
          {showOptions && (
            <div className="mt-4 space-y-4 border rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={options.tone}
                    onValueChange={(value) => setOptions({ ...options, tone: value })}
                  >
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select
                    value={options.style}
                    onValueChange={(value) => setOptions({ ...options, style: value })}
                  >
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select
                    value={options.targetAudience}
                    onValueChange={(value) => setOptions({ ...options, targetAudience: value })}
                  >
                    <SelectTrigger id="targetAudience">
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investors">Investors</SelectItem>
                      <SelectItem value="traders">Traders</SelectItem>
                      <SelectItem value="general">General Public</SelectItem>
                      <SelectItem value="professionals">Finance Professionals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetWordCount">Target Word Count</Label>
                  <Select
                    value={options.targetWordCount.toString()}
                    onValueChange={(value) => setOptions({ ...options, targetWordCount: parseInt(value) })}
                  >
                    <SelectTrigger id="targetWordCount">
                      <SelectValue placeholder="Select word count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="600">Short (~600 words)</SelectItem>
                      <SelectItem value="1200">Medium (~1200 words)</SelectItem>
                      <SelectItem value="2000">Long (~2000 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMarketData"
                  checked={options.includeMarketData}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, includeMarketData: checked as boolean })
                  }
                />
                <Label htmlFor="includeMarketData">Include current market data and news</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {blogPost && (
        <Card>
          <CardHeader>
            <CardTitle>{blogPost.title}</CardTitle>
            <CardDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {blogPost.tags.map((tag, index) => (
                  <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="preview">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="preview" className="p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blogPost.content }} />
            </TabsContent>
            
            <TabsContent value="html" className="p-6">
              <Textarea
                className="font-mono text-xs h-[500px]"
                value={blogPost.content}
                readOnly
              />
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex justify-between border-t p-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">SEO Score: {blogPost.seoScore}/100</span>
              <span className="mr-2">•</span>
              <span className="mr-2">{blogPost.readTime} min read</span>
              <span className="mr-2">•</span>
              <span>{new Date(blogPost.publishDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportHtml}>
                <Download className="mr-2 h-4 w-4" />
                HTML
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
                <FileDown className="mr-2 h-4 w-4" />
                Markdown
              </Button>
              {user && (
                <Button variant="default" size="sm" onClick={handleSaveBlog}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default BlogGenerator; 