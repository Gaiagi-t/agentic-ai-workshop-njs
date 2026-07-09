# 🚀 Deployment Quick Start - Lavazza Workshop

## 30 secondi per mandare live

### Step 1: Prepara l'OpenAI API Key
- Vai su [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Crea una nuova API key (Project API key)
- Copiano il valore: `sk-proj-...`

### Step 2: Deploy su Vercel (5 click)

1. Apri [vercel.com/new](https://vercel.com/new)
2. Clicca **"Continue with GitHub"**
3. Seleziona il repo: **`Gaiagi-t/agentic-ai-workshop-njs`**
4. Scorri a "Environment Variables"
   - Add: `OPENAI_API_KEY` = `sk-proj-...` (incolla la key da Step 1)
5. Clicca **Deploy** ⚡

**Fine!** Vercel deployerà in ~2 minuti.

---

## URL finale

Dopo il deploy, avrai un URL come:
```
https://agentic-ai-workshop-njs.vercel.app
```

Oppure usa un custom domain (opzionale):
- Nelle Vercel settings del progetto → Domains
- Aggiungi `workshop-agenti.tuodominio.com` o simile

---

## Test rapido

Dopo il deploy:

1. Apri l'URL nel browser
2. Descrivi un caso d'uso (es: "Voglio automatizzare la risposta ai customer support")
3. Rispondi alle 8-10 domande della chat
4. Clicca "Genera Configurazione Agente"
5. Scarica il PDF o il JSON

✅ Se funziona → sei pronto per il workshop!

---

## Auto-deployment (bonus)

Ogni volta che fai `git push origin master`:
1. GitHub notifica Vercel del change
2. Vercel rebuilda automaticamente
3. L'app va live con le modifiche in ~2 minuti

Niente deploy manuale necessari più!

---

## Troubleshooting

### ❌ "OPENAI_API_KEY not found"
→ Verifica che la env var sia settata nelle Vercel project settings

### ❌ Build fallisce
→ Controlla i Vercel build logs nel dashboard
→ Assicurati che `npm run build` funziona localmente: `npm run build`

### ❌ App lenta
→ Potrebbe essere Whisper (transcription audio)
→ Disabilita il Mic button se non serve per il workshop

---

## Costi stimati

- **OpenAI**: ~$0.50-$2 per 100 chat (dipende dalla lunghezza)
- **Vercel**: Free tier è sufficiente (fino a 100k function invocations/mese)

---

## Rollback (se serve)

Se un deploy va male:
1. Vercel project → Deployments
2. Seleziona un deployment precedente
3. Clicca "Promote to production"

Fatto!

---

**Domande? Vai a [GitHub Issues](https://github.com/Gaiagi-t/agentic-ai-workshop-njs/issues)**
