import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { datasetName, datasetDescription, columns, recordsSample, userQuery, mode = 'insights' } = body;

    const ai = getGeminiClient();

    const systemInstruction = `You are an elite Chief Business Intelligence Analyst and Data Scientist at a Fortune 500 company.
Your role is to analyze corporate operational and financial datasets, extract high-impact actionable insights, identify statistical anomalies, and respond to executive questions with data-backed rigor.
You MUST respond strictly in valid JSON matching the requested schema.`;

    const prompt = `
Dataset Name: "${datasetName}"
Dataset Description: "${datasetDescription}"
Data Schema (Columns): ${JSON.stringify(columns)}
Records Data Sample (JSON):
${JSON.stringify(recordsSample, null, 2)}

User Question / Analysis Directive: "${userQuery || 'Provide an executive summary and top strategic data insights.'}"
Mode requested: "${mode}"

Generate an executive business intelligence report analyzing this dataset. Include:
1. "headline": An impactful, professional 1-line executive takeaway (e.g., "SaaS ARR crossed $21.7M with Churn dropping to historic low of 1.4%").
2. "executiveSummary": A concise 2-3 sentence strategic executive brief.
3. "keyFindings": An array of 3 to 4 specific insights. Each finding must have "title", "description", and "impact" ('positive', 'neutral', or 'negative').
4. "anomalies": An array of 1 to 2 unusual spikes, trends, or outliers worth executive attention.
5. "recommendations": An array of 2 to 3 strategic recommendations for leadership.
6. "suggestedQuestions": An array of 3 analytical follow-up questions the executive could ask next.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            keyFindings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING },
                },
                required: ['title', 'description', 'impact'],
              },
            },
            anomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ['headline', 'executiveSummary', 'keyFindings', 'recommendations', 'suggestedQuestions'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json({ error: 'Empty response from AI engine' }, { status: 500 });
    }

    const parsedJson = JSON.parse(responseText);
    return NextResponse.json(parsedJson);
  } catch (error: any) {
    console.error('API /api/ai-insights error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}
