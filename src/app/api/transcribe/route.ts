import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "API key mancante" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "Nessun file audio inviato" }, { status: 400 });
    }

    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'it',
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error('Whisper transcription error:', error);
    return NextResponse.json({ error: 'Errore durante la trascrizione' }, { status: 500 });
  }
}
