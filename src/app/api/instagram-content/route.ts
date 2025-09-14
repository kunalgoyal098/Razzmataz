import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

class InstagramContentService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateCaption(imageBase64?: string, context: string = ''): Promise<string> {
    let prompt = `
    Create an engaging Instagram caption for insurance marketing by micro-entrepreneur agents.
    
    Context: ${context}
    
    Requirements:
    - Professional yet engaging tone for insurance/financial services
    - Include relevant emojis (3-5 emojis max)
    - Add 5-8 relevant hashtags at the end
    - Include a clear call-to-action encouraging DMs or contact
    - Keep it under 150 words
    - Focus on security, protection, family, financial benefits
    - Make it shareable and relatable for insurance clients
    - Avoid overly salesy language
    - Include trust-building elements
    - Target audience: families, young professionals, business owners
    
    Format: Caption text + hashtags
    Make it perfect for micro-entrepreneur insurance agents to attract clients.
    `;

    if (imageBase64) {
      prompt = `
      Analyze this image and create an engaging Instagram caption for insurance marketing by micro-entrepreneur agents.
      
      Context: ${context}
      
      Requirements:
      - Analyze the image content and relate it to insurance/protection themes
      - Professional yet engaging tone for insurance/financial services
      - Include relevant emojis (3-5 emojis max)
      - Add 5-8 relevant hashtags at the end
      - Include a clear call-to-action encouraging DMs or contact
      - Keep it under 150 words
      - Focus on security, protection, family, financial benefits based on image content
      - Make it shareable and relatable for insurance clients
      - Avoid overly salesy language
      - Include trust-building elements
      - Target audience: families, young professionals, business owners
      
      Format: Caption text + hashtags
      Make it perfect for micro-entrepreneur insurance agents to attract clients.
      `;
    }

    try {
      const contents = imageBase64 
        ? [
            { text: prompt },
            { 
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        : prompt;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating Instagram caption:', error);
      throw error;
    }
  }

  async generatePostIdeas(topic: string): Promise<string[]> {
    const prompt = `
    Generate 5 Instagram post ideas for micro-entrepreneur insurance agents based on: "${topic}"
    
    Requirements:
    - Each idea should be 1-2 sentences
    - Focus on insurance, financial planning, protection themes
    - Make them engaging and shareable
    - Include variety: educational, emotional, promotional, behind-the-scenes
    - Target audience: families, young professionals, business owners
    
    Return ONLY a valid JSON array of strings, no markdown formatting, no extra text.
    Example format: ["idea 1", "idea 2", "idea 3", "idea 4", "idea 5"]
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      let text = response.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      
      // Clean up the response - remove markdown code blocks if present
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // Try to extract JSON array if it's wrapped in other text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      console.log('Raw Gemini response for post ideas:', text);
      
      const ideas = JSON.parse(text);
      return Array.isArray(ideas) ? ideas : [];
    } catch (error) {
      console.error('Error generating post ideas:', error);
      
      // Fallback ideas if API fails
      return [
        "Share a client success story about how insurance protected their family during tough times.",
        "Create an infographic showing the difference between term and whole life insurance.",
        "Post a behind-the-scenes look at your day helping families secure their future.",
        "Share 5 common insurance myths and the truth behind them.",
        "Highlight the importance of life insurance for young professionals starting their careers."
      ];
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const context = formData.get('context') as string || '';
    const topic = formData.get('topic') as string || '';
    const action = formData.get('action') as string || 'caption';
    const image = formData.get('image') as File | null;

    const service = new InstagramContentService();

    if (action === 'post_ideas') {
      if (!topic.trim()) {
        return NextResponse.json(
          { status: 'error', message: 'Topic is required for post ideas generation' },
          { status: 400 }
        );
      }

      const ideas = await service.generatePostIdeas(topic);
      return NextResponse.json({
        status: 'success',
        data: {
          post_ideas: ideas,
          topic_used: topic
        }
      });
    }

    // Handle image caption generation
    let imageBase64: string | undefined;
    
    if (image) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { status: 'error', message: 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP' },
          { status: 400 }
        );
      }

      const maxSize = 16 * 1024 * 1024; // 16MB
      if (image.size > maxSize) {
        return NextResponse.json(
          { status: 'error', message: 'File too large. Maximum size: 16MB' },
          { status: 400 }
        );
      }

      const buffer = await image.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString('base64');
    }

    const caption = await service.generateCaption(imageBase64, context);
    
    // Extract hashtags from caption
    const hashtags = caption.split(' ').filter(word => word.startsWith('#'));

    return NextResponse.json({
      status: 'success',
      data: {
        caption,
        hashtags,
        character_count: caption.length,
        context_used: context || null,
        has_image: !!image
      }
    });

  } catch (error) {
    console.error('Instagram content generation error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
