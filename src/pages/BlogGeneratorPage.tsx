import React from 'react';
import { Helmet } from 'react-helmet-async';
import BlogGenerator from '@/features/blog/components/BlogGenerator';

const BlogGeneratorPage = () => {
  return (
    <>
      <Helmet>
        <title>AI Blog Generator | AI Diligence Pro</title>
        <meta name="description" content="Generate SEO-optimized blog posts about market news and financial topics using AI" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Blog Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate SEO-optimized blog posts about market news and financial topics using our advanced AI technology.
            Perfect for content marketing, thought leadership, and keeping your audience informed.
          </p>
        </div>
        
        <BlogGenerator />
      </div>
    </>
  );
};

export default BlogGeneratorPage; 