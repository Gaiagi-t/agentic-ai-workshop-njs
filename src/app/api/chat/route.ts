import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configure the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `Sei un assistente per la progettazione di un AI Agent (Agentic Architect), e stai conducendo un workshop IFAB.
Il tuo obiettivo è mappare il processo AS-IS e TO-BE dell'utente per definire un progetto di Agentic AI.

Devi raccogliere questi blocchi di informazioni SEPARATAMENTE (mai nella stessa domanda):
1. Problema: Qual è il processo e il problema principale?
2. Attori: CHI esegue attualmente queste attività?
3. Strumenti AS-IS: Quali software o strumenti utilizzano oggi?
4. Tempi: Quanto tempo richiede mediamente questo processo oggi?
5. Visione TO-BE: Come immagini (in astratto) che l'AI trasformi il processo?
6. Architettura AI e Strumenti TO-BE: Quali tool bisognerà integrare? Sarà un sistema Single Agent o Multi-Agent?
7. Autonomia: Sostituzione assoluta o Affiancamento umano (Augmentation)?
8. Dati: A quali database l'AI dovrà accedere?
9. Benefici attesi: Oltre alla mitigazione dei rischi, quali sono i principali vantaggi misurabili o KPI del progetto?
10. Rischi: Ostacoli come privacy, resistenza al cambiamento, ecc.?
11. Timeline: Pilota veloce o trasformazione graduale?
REGOLE CRITICHE ASSOLUTE:
- FAI TASSATIVAMENTE UNA SOLA BREVISSIMA DOMANDA ALLA VOLTA. Non chiedere "Chi esegue E con quali strumenti". Chiedi PRIMA chi lo esegue. Attendi la risposta. SOLO DOPO chiedi gli strumenti.
- Sii molto conciso, moderno e accogliente (usa il "tu"). Non dilungarti in complimenti inutili o premesse lunghe. Niente elenchi puntati se non per il riepilogo.
- Se l'utente ti dice due cose insieme, deducile dal contesto e salta la domanda corrispondente.
- RIEPILOGO A METÀ CONVERSAZIONE: Non appena avrai terminato le domande sull'AS-IS (indicativamente dopo i primi 3 o 4 scambi) e prima di interrogare l'utente sul TO-BE, invia UN BREVE RIEPILOGO in un elenco puntato riassuntivo del tipo "Ok, per essere sicuro di aver capito sull'AS-IS abbiamo...". Nello stesso messaggio, fagli la prima domanda sul TO-BE (es. "Ora sulla visione ideale...").
- Quando ritieni di aver mappato a sufficienza AS-IS e TO-BE (almeno gli 8-9 punti base), ringrazia e aggiungi la stringa esatta [ANALISI_PRONTA] alla fine del tuo messaggio.

Il tuo primo messaggio è già stato inviato: "Ciao! Sono l'assistente per la progettazione... quale problema principale vuoi risolvere oggi?"
Ora prosegui. RICORDA: 1 SOLA DOMANDA IN QUESTO MESSAGGIO. NESSUNA ECCEZIONE.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ reply: "Errore: OPENAI_API_KEY non configurata nel file .env.local", finished: false });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content || "";
    const isFinished = reply.includes("[ANALISI_PRONTA]");
    const cleanReply = reply.replace("[ANALISI_PRONTA]", "").trim();

    return NextResponse.json({ reply: cleanReply, finished: isFinished });
  } catch (error) {
    console.error('OpenAI error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
