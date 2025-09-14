import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

class LinkedInContentService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generatePost(topic: string, postType: string = 'professional'): Promise<string> {
    const prompt = `
    Create a LinkedIn post for micro-entrepreneur insurance agents based on: "${topic}"
    
    Post Type: ${postType}
    
    Requirements:
    - 200-300 words (LinkedIn's optimal length for engagement)
    - Professional, authoritative tone suitable for business network
    - Include 1-2 professional emojis
    - Add 3-5 relevant hashtags at the end
    - Include a clear call-to-action
    - Focus on insurance expertise, financial planning, business protection
    - Make it valuable and shareable for professional network
    - Include industry insights or personal experience
    - Target audience: business owners, professionals, entrepreneurs
    - Encourage meaningful comments and connections
    
    Post Types:
    - thought_leadership: Share expert opinions and insights on insurance industry
    - client_success: Highlight client success stories and case studies
    - insurance_education: Educate audience about insurance products and benefits
    - industry_insights: Share analysis of insurance market trends and changes
    - business_growth: Tips for growing insurance business and client base
    - risk_management: Discuss risk assessment and mitigation strategies
    - financial_planning: Connect insurance with broader financial planning
    - agent_journey: Share personal experiences as an insurance agent
    - networking: Build professional relationships in insurance industry
    - compliance_updates: Share regulatory and compliance information
    
    Make it perfect for micro-entrepreneur insurance agents to establish thought leadership.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating LinkedIn post:', error);
      throw error;
    }
  }

  async generateArticleOutline(topic: string): Promise<string> {
    const prompt = `
    Create a LinkedIn article outline for micro-entrepreneur insurance agents based on: "${topic}"
    
    Requirements:
    - Professional article structure with clear sections
    - 5-7 main sections with bullet points
    - Focus on insurance, financial planning, or business protection
    - Include actionable insights and tips
    - Target audience: business professionals, entrepreneurs
    - Establish expertise and thought leadership
    - Include introduction and conclusion sections
    - Add suggested call-to-action at the end
    
    Format:
    # Article Title
    ## Introduction
    ## Section 1: [Title]
    - Key point 1
    - Key point 2
    ## Section 2: [Title]
    - Key point 1
    - Key point 2
    [Continue pattern]
    ## Conclusion
    ## Call-to-Action
    
    Make it comprehensive and valuable for professional readers.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating LinkedIn article outline:', error);
      throw error;
    }
  }

  async generateComment(originalPost: string, commentType: string = 'insightful'): Promise<string> {
    const prompt = `
    Create a LinkedIn comment for micro-entrepreneur insurance agents on: "${originalPost}"
    
    Comment Type: ${commentType}
    
    Requirements:
    - 50-100 words
    - Professional and thoughtful tone
    - Add value to the conversation
    - Share relevant insurance/financial expertise
    - Be engaging and encourage further discussion
    - Build professional relationships
    - Include personal insight or experience if relevant
    
    Comment Types:
    - insightful: Share professional insight or expertise
    - supportive: Show support and add encouraging perspective
    - educational: Provide helpful information or tip
    - networking: Build connection and invite further discussion
    - contrarian: Respectfully present alternative viewpoint
    
    Make it authentic and professional, building authority in insurance field.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating LinkedIn comment:', error);
      throw error;
    }
  }

  async generateConnectionMessage(recipientProfile: string): Promise<string> {
    const prompt = `
    Create a LinkedIn connection request message for micro-entrepreneur insurance agents to: "${recipientProfile}"
    
    Requirements:
    - Maximum 300 characters (LinkedIn limit)
    - Professional and personalized tone
    - Mention specific reason for connecting
    - Reference their background or mutual interests
    - Briefly introduce insurance expertise
    - Be genuine and not overly promotional
    - Encourage acceptance and future networking
    
    Make it personal and professional to increase connection acceptance rate.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating LinkedIn connection message:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      topic, 
      content_type = 'post', 
      post_type = 'professional',
      original_post = '',
      comment_type = 'insightful',
      recipient_profile = ''
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Missing or empty topic' },
        { status: 400 }
      );
    }

    const service = new LinkedInContentService();
    let content = '';
    let additionalData: Record<string, unknown> = {};

    switch (content_type) {
      case 'post':
        content = await service.generatePost(topic, post_type);
        additionalData = {
          post_type,
          word_count: content.split(' ').length,
          character_count: content.length
        };
        break;
      
      case 'article':
        content = await service.generateArticleOutline(topic);
        additionalData = {
          content_type: 'article_outline',
          sections: content.split('##').length - 1
        };
        break;
      
      case 'comment':
        if (!original_post.trim()) {
          return NextResponse.json(
            { status: 'error', message: 'original_post is required for comment generation' },
            { status: 400 }
          );
        }
        content = await service.generateComment(original_post, comment_type);
        additionalData = {
          comment_type,
          word_count: content.split(' ').length,
          original_post,
          is_comment: true
        };
        break;
      
      case 'connection':
        if (!recipient_profile.trim()) {
          return NextResponse.json(
            { status: 'error', message: 'recipient_profile is required for connection message' },
            { status: 400 }
          );
        }
        content = await service.generateConnectionMessage(recipient_profile);
        additionalData = {
          character_count: content.length,
          recipient_profile,
          is_connection_request: true
        };
        break;
      
      default:
        return NextResponse.json(
          { status: 'error', message: 'Invalid content_type. Use: post, article, comment, or connection' },
          { status: 400 }
        );
    }

    // Extract hashtags from content
    const hashtags = content.split(' ').filter(word => word.startsWith('#'));

    return NextResponse.json({
      status: 'success',
      data: {
        content,
        hashtags,
        topic_used: topic,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('LinkedIn content generation error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
