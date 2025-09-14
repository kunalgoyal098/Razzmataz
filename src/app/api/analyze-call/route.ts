import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genai = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

interface CallAnalysis {
  context_used: string;
  full_analysis: string;
  processing_time: string;
}

class CallAnalysisService {
  private model;

  constructor() {
    this.model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async analyzeCallRecording(audioFile: File): Promise<CallAnalysis> {
    try {
      // Convert audio file to base64 for Gemini
      const arrayBuffer = await audioFile.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString('base64');

      const prompt = `
You are an expert insurance sales call analyst. Analyze this insurance sales call recording and provide a comprehensive analysis.

Please provide a detailed analysis in the following structure:

**TRANSCRIPT:**
[Extract and provide the conversation transcript if possible, or note if transcript extraction is not available]

**CALL SUMMARY:**
Brief overview of the call purpose, participants, and main discussion points.

**POLICY DISCUSSED:**
- Type: [Insurance type discussed]
- Coverage: [Coverage amount/details]
- Premium: [Premium information if mentioned]
- Benefits: [Key benefits highlighted]

**CLIENT PROFILE:**
- Demographics: [Age group, profession, family status if mentioned]
- Needs: [Expressed or implied insurance needs]
- Concerns: [Any objections or concerns raised]
- Budget: [Budget constraints if mentioned]

**CONVERSATION ANALYSIS:**
- Client Interest Level: [High/Medium/Low with reasoning]
- Main Objections: [Key concerns or objections]
- Agent Performance:
  - Strengths: [What the agent did well]
  - Missing Information: [What information was not gathered]
- Missing Opportunities: [Opportunities the agent missed]

**CALL OUTCOME:**
- Status: [Successful/Follow-up needed/Lost opportunity]
- Next Steps: [Agreed next actions]
- Timeline: [Any timelines mentioned]

**COACHING TIPS:**
- What Went Well: [Positive aspects of the call]
- Areas for Improvement: [Specific areas to work on]
- Missing Opportunities: [What could have been done better]
- Compliance Notes: [Any compliance issues or recommendations]

**SENTIMENT ANALYSIS:**
- Client Sentiment: [Positive/Neutral/Negative with explanation]
- Agent Tone: [Professional/Friendly/Aggressive assessment]
- Call Quality: [Overall rating out of 10 with reasoning]

Provide actionable insights that will help improve the agent's sales performance and customer engagement.
`;

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: audioFile.type,
            data: base64Audio
          }
        },
        { text: prompt }
      ]);

      const response = await result.response;
      const analysisText = response.text();

      return {
        context_used: "Insurance sales call analysis",
        full_analysis: analysisText,
        processing_time: "audio_analysis_complete"
      };

    } catch (error) {
      console.error('Error analyzing call:', error);
      throw new Error('Failed to analyze call recording');
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { status: 'error', message: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid file type. Please upload MP3, WAV, or M4A files.' },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { status: 'error', message: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    const service = new CallAnalysisService();
    const analysis = await service.analyzeCallRecording(audioFile);

    return NextResponse.json({
      status: 'success',
      data: analysis
    });

  } catch (error) {
    console.error('Call analysis API error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to analyze call recording'
      },
      { status: 500 }
    );
  }
}
