import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import discoveryFlow from '@/config/discoveryFlow';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY mancante" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const conversationText = messages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: discoveryFlow.analysisPrompt },
        { role: 'user', content: `Ecco la conversazione da analizzare:\n\n${conversationText}` }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const analysis = JSON.parse(content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json({ error: 'Errore durante la generazione' }, { status: 500 });
  }
}
