# 🚀 Workshop Configuratore Agenti AI - Lavazza Group

**Una web app interattiva per identificare e configurare agenti AI per casi d'uso quotidiani.**

## ✨ Features

- 🎯 **Discovery conversazionale**: Chat interattiva guidata per scoprire i propri casi d'uso
- 📊 **Mappatura AS-IS → TO-BE**: Analisi strutturata dello stato attuale e visione futura
- 🤖 **Configurazione agente**: Genera automaticamente la configurazione dell'agente personalizzato
- 📥 **Export multipli**: Scarica in PDF, JSON o copia la configurazione negli appunti
- 🎤 **Voice input**: Registra audio e trascrivi in tempo reale con Whisper
- 🌐 **Multilingue**: Supporto per italiano e altre lingue

## 🎓 Come funziona il workshop

1. **Descrivi il tuo caso d'uso** - Racconti il processo che vuoi automatizzare
2. **Mappa lo stato attuale (AS-IS)** - Chi lo fa? Con quali strumenti? Quanto tempo?
3. **Immagina il futuro (TO-BE)** - Come sarebbe ideale? Quali sarebbero i benefici?
4. **Configura l'agente** - L'app genera automaticamente la configurazione
5. **Esporta e implementa** - Scarica la config e usa nei tuoi strumenti (Copilot, custom agents, etc)

## 🛠️ Setup locale

### Prerequisiti
- Node.js 18+
- OpenAI API key (per GPT-4o-mini e Whisper)

### Installazione

```bash
# Clone il repo
git clone https://github.com/Gaiagi-t/agentic-ai-workshop-njs.git
cd agentic-ai-workshop-njs

# Installa dipendenze
npm install

# Configura le env vars
# Crea file .env.local:
echo "OPENAI_API_KEY=sk-..." > .env.local

# Avvia il dev server
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 🌐 Deploy su Vercel (Production)

### Opzione 1: Deploy automatico (consigliato)

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Seleziona questo repo GitHub: `Gaiagi-t/agentic-ai-workshop-njs`
3. Nella sezione "Environment Variables", aggiungi:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-...` (la tua OpenAI API key)
4. Clicca "Deploy"

Vercel deployerà automaticamente ad ogni push su master.

### Opzione 2: Deploy manuale via CLI

```bash
# Installa Vercel CLI (se non presente)
npm install -g vercel

# Login
vercel login

# Deploy con produzione
vercel --prod --env OPENAI_API_KEY=sk-...
```

## 📁 Struttura del progetto

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # Chat orchestration (GPT-4o-mini)
│   │   ├── analyze/route.ts      # Analysis & agent config generation
│   │   └── transcribe/route.ts   # Audio transcription (Whisper)
│   ├── page.tsx                  # Main page
│   └── layout.tsx
├── components/
│   ├── Conversation.tsx           # Chat UI component
│   └── SimplifiedReport.tsx       # Agent config report & export
└── config/
    └── discoveryFlow.ts           # Discovery flow configuration (parametrizzabile)
```

## ⚙️ Configurazione Discovery Flow

La configurazione della scoperta è in `src/config/discoveryFlow.ts`. È facilmente parametrizzabile per:
- Cambiare il sistema prompt
- Modificare il numero/ordine di domande
- Adattare il linguaggio o il dominio

Ogni workshop può avere una propria configurazione:

```typescript
export const discoveryFlow = {
  systemPrompt: "...", // Persona e istruzioni dell'agente
  analysisPrompt: "...", // Schema output JSON
  initialMessage: "...",  // Messaggio di benvenuto
  completionToken: "[ANALISI_PRONTA]", // Token di terminazione
};
```

## 📊 Output dell'analisi

L'app genera un JSON strutturato con:

```json
{
  "useCase": "Nome del caso",
  "asIs": { "actors", "tools", "duration", "painPoints" },
  "toBe": { "vision", "benefits", "autonomyLevel", "approach" },
  "agentConfig": {
    "name": "Nome agente",
    "role": "Ruolo",
    "primaryGoal": "Obiettivo",
    "requiredDataSources": [...],
    "requiredTools": [...],
    "decisionFramework": "...",
    "humanOversight": "..."
  },
  "roadmap": [...],
  "nextSteps": [...]
}
```

## 🔑 Stack tecnologico

- **Frontend**: React 19 + Next.js 16 + Tailwind CSS + Framer Motion
- **Backend**: Next.js API Routes
- **LLM**: OpenAI (GPT-4o-mini + Whisper-1)
- **Export**: jsPDF + html2canvas
- **Deployment**: Vercel

## 📝 Environment Variables

```env
# .env.local (development)
OPENAI_API_KEY=sk-...
```

Per Vercel, aggiungi nel progetto Settings → Environment Variables.

## 🚀 Prossimi passi

Dopo il workshop, i partecipanti potranno:

1. **Usare la configurazione generata** nei loro strumenti preferiti:
   - Copilot custom agents
   - Assistants API
   - LangChain / LlamaIndex
   - n8n / Make automation

2. **Implementare l'agente** nel loro ambiente:
   - Integrare con sistemi esistenti
   - Configurare i data sources
   - Setup supervisione umana

3. **Iterare e migliorare**:
   - Feedback dei team
   - Ottimizzazione dei prompt
   - Aggiungere nuovi tool

## 📞 Support

Per domande o feedback durante il workshop:
- 📧 Email: gaia.gambarelli@ifabfoundation.org
- 🐙 Issues: [GitHub Issues](https://github.com/Gaiagi-t/agentic-ai-workshop-njs/issues)

---

**Made for Lavazza Group Workshop - July 2026**
