import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import discoveryFlow from '@/config/discoveryFlow';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        reply: "Errore: OPENAI_API_KEY non configurata nel file .env.local",
        finished: false
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: discoveryFlow.systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content || "";
    const isFinished = reply.includes(discoveryFlow.completionToken);
    const cleanReply = reply.replace(discoveryFlow.completionToken, "").trim();

    return NextResponse.json({ reply: cleanReply, finished: isFinished });
  } catch (error) {
    console.error('OpenAI error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
