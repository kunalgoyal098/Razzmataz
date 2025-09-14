import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

class XContentService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateTweet(topic: string, tweetType: string = 'general'): Promise<string> {
    const prompt = `
    Create a Twitter/X post for micro-entrepreneur insurance agents based on: "${topic}"
    
    Tweet Type: ${tweetType}
    
    Requirements:
    - Maximum 280 characters (Twitter limit)
    - Professional yet engaging tone
    - Include 1-2 relevant emojis
    - Add 2-4 relevant hashtags
    - Include a clear call-to-action within character limit
    - Focus on insurance, financial security, protection
    - Make it shareable and engaging
    - Target audience: young professionals, families, entrepreneurs
    - Encourage retweets and engagement
    
    Tweet Types:
    - tip: Quick insurance/financial tip
    - quote: Inspirational quote about protection/security
    - fact: Insurance industry fact or statistic
    - promotional: Product/service highlight
    - question: Engaging question to start conversation
    - thread_starter: First tweet of a thread (indicate with 1/n)
    
    Make it perfect for micro-entrepreneur insurance agents to build their Twitter presence.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating X/Twitter post:', error);
      throw error;
    }
  }

  async generateThread(topic: string, threadLength: number = 3): Promise<string[]> {
    const prompt = `
    Create a Twitter/X thread for micro-entrepreneur insurance agents based on: "${topic}"
    
    Requirements:
    - ${threadLength} tweets in the thread
    - Each tweet maximum 280 characters
    - First tweet should hook the audience
    - Progressive information sharing across tweets
    - Professional yet engaging tone
    - Include relevant emojis and hashtags
    - Focus on insurance education, tips, or insights
    - End with a call-to-action
    - Number each tweet (1/n, 2/n, etc.)
    
    Return ONLY a valid JSON array of tweet strings, no markdown formatting, no extra text.
    Example format: ["Tweet 1/n content", "Tweet 2/n content", "Tweet 3/n content"]
    Make it educational and valuable for the audience while promoting insurance services.
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
      
      console.log('Raw Gemini response for X thread:', text);
      
      const tweets = JSON.parse(text);
      return Array.isArray(tweets) ? tweets : [];
    } catch (error) {
      console.error('Error generating X/Twitter thread:', error);
      
      // Fallback thread if API fails
      return [
        `🧵 Thread: ${topic} (1/${threadLength})`,
        `💡 Insurance protects your financial future. Here's what you need to know... (2/${threadLength})`,
        `📞 Need help choosing the right policy? DM me for a free consultation! (${threadLength}/${threadLength})`
      ].slice(0, threadLength);
    }
  }

  async generateReply(originalTweet: string, replyType: string = 'helpful'): Promise<string> {
    const prompt = `
    Create a Twitter/X reply for micro-entrepreneur insurance agents to: "${originalTweet}"
    
    Reply Type: ${replyType}
    
    Requirements:
    - Maximum 280 characters
    - Professional and helpful tone
    - Add value to the conversation
    - Subtly promote insurance services if relevant
    - Include relevant emoji if appropriate
    - Be engaging and encourage further discussion
    
    Reply Types:
    - helpful: Provide useful information or tip
    - supportive: Show empathy and offer assistance
    - educational: Share relevant insurance knowledge
    - promotional: Soft promotion of services (not pushy)
    
    Make it authentic and valuable, building trust and authority in insurance.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating X/Twitter reply:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      topic, 
      content_type = 'tweet', 
      tweet_type = 'general',
      thread_length = 3,
      original_tweet = '',
      reply_type = 'helpful'
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Missing or empty topic' },
        { status: 400 }
      );
    }

    const service = new XContentService();
    let content: string | string[] = '';
    let additionalData: Record<string, unknown> = {};

    switch (content_type) {
      case 'tweet':
        content = await service.generateTweet(topic, tweet_type);
        additionalData = {
          tweet_type,
          character_count: (content as string).length,
          is_thread: false
        };
        break;
      
      case 'thread':
        content = await service.generateThread(topic, thread_length);
        additionalData = {
          thread_length: (content as string[]).length,
          total_characters: (content as string[]).reduce((sum, tweet) => sum + tweet.length, 0),
          is_thread: true
        };
        break;
      
      case 'reply':
        if (!original_tweet.trim()) {
          return NextResponse.json(
            { status: 'error', message: 'original_tweet is required for reply generation' },
            { status: 400 }
          );
        }
        content = await service.generateReply(original_tweet, reply_type);
        additionalData = {
          reply_type,
          character_count: (content as string).length,
          original_tweet,
          is_reply: true
        };
        break;
      
      default:
        return NextResponse.json(
          { status: 'error', message: 'Invalid content_type. Use: tweet, thread, or reply' },
          { status: 400 }
        );
    }

    // Extract hashtags from content
    const contentText = Array.isArray(content) ? content.join(' ') : content;
    const hashtags = contentText.split(' ').filter(word => word.startsWith('#'));

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
    console.error('X/Twitter content generation error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
