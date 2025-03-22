import { useState, useCallback } from 'react';
import { BlogGenerationService } from '../services/blogGenerationService';
import { BlogPost } from '../utils/blogMCP';
import { useAuth } from '@/components/auth/authContext';

/**
 * Custom hook for blog generation
 */
export const useBlogGeneration = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  
  // Initialize the blog generation service
  const blogGenerationService = new BlogGenerationService();
  
  /**
   * Generate a blog post
   */
  const generateBlogPost = useCallback(async (
    topic: string,
    options?: {
      tone?: 'professional' | 'conversational' | 'educational';
      style?: 'formal' | 'casual' | 'technical';
      targetAudience?: 'investors' | 'traders' | 'general' | 'professionals';
      targetWordCount?: number;
      keywords?: string[];
      includeMarketData?: boolean;
      isDemo?: boolean;
    }
  ) => {
    if (!topic) {
      setError('Please enter a topic for the blog post');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    setBlogPost(null);
    
    try {
      // If it's a demo, use demo blog post
      if (options?.isDemo) {
        const demoBlogPost = blogGenerationService.generateDemoBlogPost(topic);
        setBlogPost(demoBlogPost);
        return demoBlogPost;
      }
      
      // Generate real blog post
      const generatedBlogPost = await blogGenerationService.generateBlogPost(
        topic,
        user?.uid,
        options
      );
      
      setBlogPost(generatedBlogPost);
      return generatedBlogPost;
    } catch (err: any) {
      console.error('Error generating blog post:', err);
      setError(err.message || 'Failed to generate blog post');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, blogGenerationService]);
  
  /**
   * Save a blog post to the database
   */
  const saveBlogPost = useCallback(async (post: BlogPost) => {
    if (!user) {
      setError('You must be logged in to save a blog post');
      return false;
    }
    
    try {
      // Here you would implement the logic to save the blog post to your database
      // For now, we'll just simulate a successful save
      console.log('Saving blog post:', post);
      return true;
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      setError(err.message || 'Failed to save blog post');
      return false;
    }
  }, [user]);
  
  /**
   * Export the blog post as HTML
   */
  const exportAsHtml = useCallback((post: BlogPost) => {
    if (!post) return null;
    
    // Create a blob with the HTML content
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
  <meta name="description" content="${post.metaDescription}">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #333;
    }
    .meta {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 20px;
    }
    .tags {
      margin-top: 40px;
      color: #666;
    }
    .tag {
      background: #f0f0f0;
      padding: 5px 10px;
      border-radius: 3px;
      margin-right: 5px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <article>
    <div class="meta">
      <div>Published: ${new Date(post.publishDate).toLocaleDateString()}</div>
      <div>Author: ${post.author}</div>
      <div>Read time: ${post.readTime} min</div>
    </div>
    ${post.content}
    <div class="tags">
      ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
  </article>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.slug}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  }, []);
  
  /**
   * Export the blog post as Markdown
   */
  const exportAsMarkdown = useCallback((post: BlogPost) => {
    if (!post) return null;
    
    // Convert HTML to Markdown (simplified version)
    const htmlToMarkdown = (html: string) => {
      let markdown = html;
      
      // Replace headings
      markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
      markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');
      markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n');
      
      // Replace paragraphs
      markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
      
      // Replace lists
      markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, '$1\n');
      markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, '$1\n');
      markdown = markdown.replace(/<li>(.*?)<\/li>/g, '- $1\n');
      
      // Replace links
      markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
      
      // Replace emphasis
      markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
      markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
      
      // Remove other HTML tags
      markdown = markdown.replace(/<[^>]*>/g, '');
      
      return markdown;
    };
    
    const markdownContent = `---
title: "${post.title}"
description: "${post.metaDescription}"
date: "${post.publishDate}"
author: "${post.author}"
tags: [${post.tags.map(tag => `"${tag}"`).join(', ')}]
category: "${post.category}"
readTime: ${post.readTime}
---

${htmlToMarkdown(post.content)}

`;
    
    // Create a blob with the Markdown content
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.slug}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  }, []);
  
  return {
    isLoading,
    error,
    blogPost,
    generateBlogPost,
    saveBlogPost,
    exportAsHtml,
    exportAsMarkdown
  };
}; 