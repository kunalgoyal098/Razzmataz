import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

class FacebookContentService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generatePost(topic: string, postType: string = 'general'): Promise<string> {
    const prompt = `
    Create a Facebook post for micro-entrepreneur insurance agents based on: "${topic}"
    
    Post Type: ${postType}
    
    Requirements:
    - 150-250 words (Facebook's optimal length)
    - Professional yet friendly tone suitable for insurance agents
    - Include 2-4 relevant emojis
    - Add 3-5 relevant hashtags at the end
    - Include a clear call-to-action
    - Focus on insurance, financial security, family protection
    - Make it engaging and shareable
    - Include trust-building elements
    - Target audience: families, young professionals, small business owners
    - Encourage comments and engagement
    
    Post Types:
    - policy_awareness: Educate about different insurance policies and their importance
    - client_success: Share client success stories and testimonials (use placeholders)
    - insurance_tips: Share practical insurance tips and financial planning advice
    - family_protection: Focus on protecting family's financial future
    - financial_planning: Comprehensive financial planning with insurance
    - claim_assistance: Help and guidance with insurance claims process
    - premium_benefits: Highlight premium benefits and value propositions
    - tax_savings: Insurance as tax-saving investment tool
    - myth_busting: Debunk common insurance myths and misconceptions
    - agent_introduction: Personal introduction and credentials as insurance agent
    
    Make it perfect for micro-entrepreneur insurance agents to build their local presence.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating Facebook post:', error);
      throw error;
    }
  }

  async generateEventPost(eventDetails: string): Promise<string> {
    const prompt = `
    Create a Facebook event post for micro-entrepreneur insurance agents based on: "${eventDetails}"
    
    Requirements:
    - Announce an insurance-related event (seminar, consultation, community meeting)
    - Include event details with placeholders: [Date], [Time], [Location]
    - Professional yet inviting tone
    - Include benefits of attending
    - Clear call-to-action for registration/RSVP
    - 100-150 words
    - Include relevant emojis
    - Add hashtags for local community and insurance
    - Encourage sharing and tagging friends
    
    Make it engaging for local community members to attend insurance events.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating Facebook event post:', error);
      throw error;
    }
  }

  async generateAdCopy(productDetails: string): Promise<string> {
    const prompt = `
    Create Facebook ad copy for micro-entrepreneur insurance agents based on: "${productDetails}"
    
    Requirements:
    - Compelling headline (under 40 characters)
    - Primary text (under 125 characters for mobile optimization)
    - Description text (under 30 words)
    - Strong call-to-action
    - Focus on benefits, not features
    - Include urgency or scarcity if applicable
    - Target pain points: financial security, family protection
    - Professional and trustworthy tone
    - Include placeholders for contact info
    
    Format:
    HEADLINE: [headline]
    PRIMARY TEXT: [primary text]
    DESCRIPTION: [description]
    CTA: [call to action]
    
    Optimize for Facebook ad performance and micro-entrepreneur budget constraints.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating Facebook ad copy:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, content_type = 'post', post_type = 'general' } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Missing or empty topic' },
        { status: 400 }
      );
    }

    const service = new FacebookContentService();
    let content = '';
    let additionalData: Record<string, unknown> = {};

    switch (content_type) {
      case 'post':
        content = await service.generatePost(topic, post_type);
        additionalData = {
          post_type,
          word_count: content.split(' ').length
        };
        break;
      
      case 'event':
        content = await service.generateEventPost(topic);
        additionalData = {
          content_type: 'event',
          word_count: content.split(' ').length
        };
        break;
      
      case 'ad':
        content = await service.generateAdCopy(topic);
        additionalData = {
          content_type: 'advertisement',
          optimized_for: 'facebook_ads'
        };
        break;
      
      default:
        return NextResponse.json(
          { status: 'error', message: 'Invalid content_type. Use: post, event, or ad' },
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
        character_count: content.length,
        topic_used: topic,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Facebook content generation error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
