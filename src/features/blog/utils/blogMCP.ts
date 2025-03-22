/**
 * Model Context Protocol (MCP) for Blog Generation
 * 
 * This module provides a structured context for AI model interactions
 * when generating blog content based on market news.
 */

// Define the structure of the blog MCP context
export interface BlogMCPContext {
  metadata: {
    version: string;
    timestamp: string;
    requestId: string;
  };
  user: {
    id?: string;
    preferences?: {
      tone?: 'professional' | 'conversational' | 'educational';
      style?: 'formal' | 'casual' | 'technical';
      targetAudience?: 'investors' | 'traders' | 'general' | 'professionals';
    };
  };
  content: {
    topic: string;
    keywords: string[];
    targetWordCount?: number;
    includeSEOMetadata?: boolean;
    includeImages?: boolean;
    includeCallToAction?: boolean;
  };
  marketData?: {
    relatedNews: Array<{
      title: string;
      source: string;
      date: string;
      summary: string;
      url?: string;
    }>;
    marketTrends?: Array<{
      sector: string;
      trend: 'up' | 'down' | 'stable';
      percentageChange?: number;
    }>;
    keyStocks?: Array<{
      symbol: string;
      name: string;
      price?: number;
      change?: number;
      percentChange?: number;
    }>;
  };
  seo: {
    targetKeywords: string[];
    metaDescription?: string;
    suggestedTitle?: string;
    targetKeywordDensity?: number;
    headingStructure?: 'traditional' | 'journalistic' | 'listicle';
  };
}

// Define the structure of a generated blog post
export interface BlogPost {
  title: string;
  metaDescription: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  publishDate: string;
  author: string;
  readTime: number;
  seoScore?: number;
  sections: Array<{
    heading: string;
    content: string;
    level: 1 | 2 | 3;
  }>;
}

/**
 * Create a default MCP context for blog generation
 */
export function createDefaultBlogMCPContext(
  topic: string,
  userId?: string
): BlogMCPContext {
  return {
    metadata: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      requestId: `blog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    },
    user: {
      id: userId,
      preferences: {
        tone: 'professional',
        style: 'formal',
        targetAudience: 'investors',
      },
    },
    content: {
      topic,
      keywords: [],
      targetWordCount: 1200,
      includeSEOMetadata: true,
      includeImages: true,
      includeCallToAction: true,
    },
    seo: {
      targetKeywords: [],
      targetKeywordDensity: 2.0,
      headingStructure: 'traditional',
    },
  };
}

/**
 * Format the MCP context for API requests
 */
export function formatBlogMCPContextForAPI(context: BlogMCPContext): any {
  return {
    context: JSON.stringify(context),
  };
}

/**
 * Create a prompt for the AI model based on the MCP context
 */
export function createBlogMCPPrompt(context: BlogMCPContext): string {
  const { content, seo, user } = context;
  
  let prompt = `Generate a high-quality, SEO-optimized blog post about "${content.topic}".`;
  
  // Add tone and style preferences
  if (user.preferences) {
    const { tone, style, targetAudience } = user.preferences;
    prompt += ` Write in a ${tone || 'professional'}, ${style || 'formal'} style`;
    prompt += targetAudience ? ` for ${targetAudience}.` : '.';
  }
  
  // Add content requirements
  if (content.targetWordCount) {
    prompt += ` The blog post should be approximately ${content.targetWordCount} words.`;
  }
  
  // Add SEO requirements
  if (seo.targetKeywords && seo.targetKeywords.length > 0) {
    prompt += ` Optimize for these keywords: ${seo.targetKeywords.join(', ')}.`;
  }
  
  if (seo.headingStructure) {
    prompt += ` Use a ${seo.headingStructure} heading structure.`;
  }
  
  // Add market data context if available
  if (context.marketData) {
    const { relatedNews, marketTrends, keyStocks } = context.marketData;
    
    if (relatedNews && relatedNews.length > 0) {
      prompt += `\n\nIncorporate insights from these recent news items:`;
      relatedNews.forEach(news => {
        prompt += `\n- ${news.title} (${news.source}, ${news.date}): ${news.summary}`;
      });
    }
    
    if (marketTrends && marketTrends.length > 0) {
      prompt += `\n\nReference these market trends:`;
      marketTrends.forEach(trend => {
        prompt += `\n- ${trend.sector}: ${trend.trend}${trend.percentageChange ? ` (${trend.percentageChange}%)` : ''}`;
      });
    }
    
    if (keyStocks && keyStocks.length > 0) {
      prompt += `\n\nMention these key stocks:`;
      keyStocks.forEach(stock => {
        prompt += `\n- ${stock.symbol} (${stock.name})${stock.percentChange ? `: ${stock.percentChange}%` : ''}`;
      });
    }
  }
  
  // Add structural requirements
  prompt += `\n\nThe blog post should include:
1. An engaging title
2. A meta description (approximately 150-160 characters)
3. An introduction that hooks the reader
4. Well-structured body with subheadings
5. A conclusion with key takeaways`;
  
  if (content.includeCallToAction) {
    prompt += `\n6. A call to action at the end`;
  }
  
  // Add SEO optimization instructions
  prompt += `\n\nEnsure the content is SEO-optimized with:
- Proper keyword placement in title, headings, and throughout the content
- A keyword density of approximately ${seo.targetKeywordDensity || 2}%
- Meta description that includes primary keywords
- Internal linking opportunities where relevant
- Proper heading hierarchy (H1, H2, H3)`;
  
  // Add formatting instructions
  prompt += `\n\nFormat the response as a JSON object with the following structure:
{
  "title": "The blog post title",
  "metaDescription": "SEO meta description",
  "slug": "url-friendly-slug",
  "content": "The full blog post content with HTML markup",
  "excerpt": "A short excerpt for previews",
  "tags": ["tag1", "tag2", ...],
  "category": "Primary category",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content",
      "level": 1|2|3
    },
    ...
  ]
}`;
  
  return prompt;
}

/**
 * Process the AI response into a structured blog post
 */
export function processBlogMCPResponse(response: any, context: BlogMCPContext): BlogPost {
  try {
    // Try to parse the response as JSON
    let parsedResponse: BlogPost;
    
    if (typeof response === 'string') {
      // Extract JSON from the response if it's a string
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
      } else {
        throw new Error('Could not extract JSON from response');
      }
    } else if (response.text) {
      // If response is an object with a text property (like from Gemini)
      const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/) || 
                        response.text.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
      } else {
        throw new Error('Could not extract JSON from response text');
      }
    } else if (response.candidates && response.candidates[0]?.content?.parts) {
      // Handle Gemini API response format
      const text = response.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
      } else {
        throw new Error('Could not extract JSON from Gemini response');
      }
    } else {
      // Assume response is already a parsed JSON object
      parsedResponse = response;
    }
    
    // Add missing fields with defaults
    const blogPost: BlogPost = {
      ...parsedResponse,
      publishDate: parsedResponse.publishDate || new Date().toISOString(),
      author: parsedResponse.author || 'AI Diligence Pro',
      readTime: parsedResponse.readTime || Math.ceil(parsedResponse.content.split(' ').length / 200),
      seoScore: calculateSEOScore(parsedResponse, context),
      tags: parsedResponse.tags || context.seo.targetKeywords || [],
      sections: parsedResponse.sections || [],
    };
    
    return blogPost;
  } catch (error) {
    console.error('Error processing blog MCP response:', error);
    
    // Return a fallback blog post
    return {
      title: `Article about ${context.content.topic}`,
      metaDescription: `Learn about ${context.content.topic} in this informative article.`,
      slug: context.content.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: typeof response === 'string' ? response : 'Content generation failed.',
      excerpt: `An article about ${context.content.topic}.`,
      tags: context.seo.targetKeywords || [],
      category: 'General',
      publishDate: new Date().toISOString(),
      author: 'AI Diligence Pro',
      readTime: 5,
      sections: [],
    };
  }
}

/**
 * Calculate an SEO score for the blog post
 */
function calculateSEOScore(blogPost: BlogPost, context: BlogMCPContext): number {
  let score = 0;
  const maxScore = 100;
  
  // Check if title contains keywords
  if (context.seo.targetKeywords) {
    const titleContainsKeywords = context.seo.targetKeywords.some(
      keyword => blogPost.title.toLowerCase().includes(keyword.toLowerCase())
    );
    if (titleContainsKeywords) score += 15;
  }
  
  // Check meta description length and keywords
  if (blogPost.metaDescription) {
    const metaLength = blogPost.metaDescription.length;
    if (metaLength >= 120 && metaLength <= 160) score += 10;
    
    if (context.seo.targetKeywords) {
      const metaContainsKeywords = context.seo.targetKeywords.some(
        keyword => blogPost.metaDescription.toLowerCase().includes(keyword.toLowerCase())
      );
      if (metaContainsKeywords) score += 10;
    }
  }
  
  // Check content length
  const wordCount = blogPost.content.split(' ').length;
  if (wordCount >= (context.content.targetWordCount || 1000)) score += 15;
  
  // Check heading structure
  if (blogPost.sections && blogPost.sections.length > 0) {
    score += 10;
    
    // Check if headings contain keywords
    if (context.seo.targetKeywords) {
      const headingsWithKeywords = blogPost.sections.filter(section => 
        context.seo.targetKeywords!.some(
          keyword => section.heading.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      if (headingsWithKeywords.length > 0) score += 10;
    }
  }
  
  // Check keyword density
  if (context.seo.targetKeywords && context.seo.targetKeywords.length > 0) {
    const keywordCount = context.seo.targetKeywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      const matches = blogPost.content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    const density = (keywordCount / wordCount) * 100;
    const targetDensity = context.seo.targetKeywordDensity || 2;
    
    if (density >= targetDensity - 0.5 && density <= targetDensity + 1) {
      score += 15;
    } else if (density > 0) {
      score += 5;
    }
  }
  
  // Check for internal links (simplified check)
  if (blogPost.content.includes('href=')) {
    score += 5;
  }
  
  // Check for images (simplified check)
  if (blogPost.content.includes('<img') || blogPost.featuredImage) {
    score += 5;
  }
  
  // Check for call to action
  if (blogPost.content.toLowerCase().includes('call to action') || 
      blogPost.content.toLowerCase().includes('contact us') ||
      blogPost.content.toLowerCase().includes('learn more') ||
      blogPost.content.toLowerCase().includes('sign up')) {
    score += 5;
  }
  
  return Math.min(score, maxScore);
} 