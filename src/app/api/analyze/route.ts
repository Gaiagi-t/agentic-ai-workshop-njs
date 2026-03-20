import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analysisPrompt = `Sei un consulente esperto in Agentic AI per executive e manager.
Devi analizzare la conversazione fornita e generare un'analisi strutturata.

Rispondi ESCLUSIVAMENTE con un JSON valido (nessun testo prima o dopo). Usa questo schema esatto:

{
  "processName": "Nome del processo analizzato",
  "problemSummary": "Riassunto breve del problema principale (1-2 frasi)",
  "conversationSummary": "Un riepilogo narrativo della conversazione (3-4 frasi) che descrive la mappatura AS-IS e la trasformazione TO-BE discussa.",
  "score": 7,
  "feasibility": "ALTA",
  "strengths": ["Punto di forza 1", "Punto di forza 2", "Punto di forza 3"],
  "cautions": ["Attenzione 1", "Attenzione 2"],
  "asIs": {
    "actors": "Chi esegue il processo attualmente",
    "tools": "Strumenti e software utilizzati",
    "time": "Tempi attuali del processo",
    "painPoints": ["Problema 1", "Problema 2", "Problema 3"]
  },
  "toBe": {
    "vision": "Come sarà il processo con l'AI",
    "architecture": "Single Agent o Multi-Agent, o sistema con Router",
    "benefits": ["Beneficio 1", "Beneficio misurabile 2", "Beneficio 3"],
    "autonomy": "Livello di autonomia dell'AI",
    "approach": "Sostituzione o Augmentation"
  },
  "roi": {
    "savingsYear1": "€30.000",
    "investment": "€15.000",
    "breakevenMonths": 6,
    "roiPercent": 150
  },
  "radarChart": {
    "fattibilitaTecnica": 4.0,
    "impattoBusinesss": 3.5,
    "gestioneRischi": 3.0,
    "roiPrevisto": 4.5,
    "facilitaImplementazione": 3.5
  },
  "impactMatrix": {
    "processComplexity": 0.6,
    "aiAutonomy": 0.4,
    "quadrant": "Augmentation"
  },
  "riskAssessment": [
    {"category": "Tecnico", "level": 2, "description": "Integrazione con sistemi esistenti"},
    {"category": "Privacy/GDPR", "level": 3, "description": "Gestione dati personali"},
    {"category": "Organizzativo", "level": 2, "description": "Change management"},
    {"category": "Legale", "level": 2, "description": "Compliance normativa"},
    {"category": "Resistenza", "level": 3, "description": "Adozione da parte del team"}
  ],
  "timeComparison": {
    "asIsMinutes": 120,
    "toBeMinutes": 30,
    "unit": "minuti per ciclo"
  },
  "comparisonChart": {
    "categories": ["Tempo", "Costo", "Errori", "Soddisfazione"],
    "asIsValues": [80, 70, 60, 45],
    "toBeValues": [25, 35, 10, 85]
  },
  "roadmap": [
    {"phase": "Pilota", "duration": "2-4 settimane", "activities": ["Attività 1", "Attività 2"], "budget": "€5.000"},
    {"phase": "Scale", "duration": "2-3 mesi", "activities": ["Attività 1"], "budget": "€8.000"},
    {"phase": "Full Deploy", "duration": "Mese 4+", "activities": ["Attività 1"], "budget": "€5.000"}
  ],
  "nextSteps": ["Azione immediata 1", "Azione immediata 2", "Azione immediata 3"],
  "risks": [
    {"risk": "Nome rischio", "impact": "ALTO", "mitigation": "Azione mitigativa"}
  ]
}

REGOLE IMPORTANTI:
- Rispondi in ITALIANO
- Score da 1 a 10 realistico
- radarChart: valori da 0 a 5 (scala /5)
- impactMatrix: processComplexity e aiAutonomy da 0.0 a 1.0
- riskAssessment: level da 1 (basso) a 5 (alto)
- timeComparison: stime realistiche in minuti
- comparisonChart: percentuali 0-100
- ROI con numeri concreti e realistici
- Rispondi SOLO con il JSON valido`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY mancante" }, { status: 500 });
    }

    const conversationText = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: analysisPrompt },
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
