import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

interface PolicyInfo {
  policy_type?: string;
  coverage_amount?: string;
  premium_details?: string;
  target_audience?: string;
  key_benefits?: string[];
  geographic_focus?: string;
  urgency_factors?: string;
  special_offers?: string;
}

class WhatsAppContentService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async extractPolicyInfo(userInput: string): Promise<PolicyInfo> {
    const prompt = `
    Extract insurance policy information from: "${userInput}"
    
    Extract if available:
    - Policy type (term, health, auto, etc.)
    - Coverage amount
    - Premium details
    - Target audience
    - Key benefits (as array)
    - Geographic focus
    - Urgency factors
    - Special offers
    
    Return as JSON. Use null for missing information.
    Focus on micro-entrepreneur insurance agents and their clients.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      let cleanedText = text.trim();
      
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to find JSON object in the text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error extracting policy info:', error);
      return {};
    }
  }

  async generateBroadcastMessage(policyInfo: PolicyInfo, userInput: string): Promise<string> {
    const prompt = `
    Create a WhatsApp broadcast message for micro-entrepreneur insurance agents based on:
    
    Original Input: "${userInput}"
    Extracted Info: ${JSON.stringify(policyInfo)}
    
    Requirements:
    - 250-300 words
    - Include [Name] placeholder for personalization
    - Professional, friendly tone suitable for insurance agents
    - Clear value proposition for insurance products
    - 3-4 key benefits with emojis
    - Trust-building elements (licensed agent, company backing)
    - Strong call-to-action encouraging contact
    - WhatsApp-friendly format with proper line breaks
    - Focus on financial security and family protection
    - Include [Agent Name] and [Contact] placeholders
    
    Make it engaging and conversion-focused for insurance sales by micro-entrepreneurs.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating broadcast message:', error);
      throw error;
    }
  }

  async generateStatusMessage(policyInfo: PolicyInfo, userInput: string): Promise<string> {
    const prompt = `
    Create a short WhatsApp status message for micro-entrepreneur insurance agents based on:
    
    Original Input: "${userInput}"
    Extracted Info: ${JSON.stringify(policyInfo)}
    
    Requirements:
    - 50-80 words maximum
    - Eye-catching with emojis (3-4 max)
    - Include 4-6 relevant hashtags for insurance/financial planning
    - Shareable and engaging for status/story format
    - Create excitement about the insurance policy
    - Focus on protection, security, family benefits
    - Professional yet approachable tone
    - Include urgency or limited-time elements if applicable
    
    Make it viral-worthy for social media sharing by insurance agents.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating status message:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_prompt, content_type = 'both' } = body;

    if (!user_prompt || !user_prompt.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Missing or empty user_prompt' },
        { status: 400 }
      );
    }

    const service = new WhatsAppContentService();
    
    // Extract policy information
    const policyInfo = await service.extractPolicyInfo(user_prompt);
    
    const result: Record<string, unknown> = {
      extracted_info: policyInfo
    };

    // Generate content based on request type
    if (content_type === 'both' || content_type === 'broadcast') {
      const broadcast = await service.generateBroadcastMessage(policyInfo, user_prompt);
      result.broadcast_message = {
        text: broadcast,
        word_count: broadcast.split(' ').length
      };
    }

    if (content_type === 'both' || content_type === 'status') {
      const status = await service.generateStatusMessage(policyInfo, user_prompt);
      const hashtags = status.split(' ').filter(word => word.startsWith('#'));
      result.status_message = {
        text: status,
        character_count: status.length,
        hashtags
      };
    }

    return NextResponse.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('WhatsApp content generation error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
