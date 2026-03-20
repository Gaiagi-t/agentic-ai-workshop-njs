"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Square, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
const AnalysisReport = dynamic(() => import("./AnalysisReport"), { ssr: false });

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// Simple markdown-like renderer for chat messages
function renderMessage(content: string) {
  // Split by lines for processing
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm">{formatInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
    } else {
      flushList();
      if (trimmed === "") {
        elements.push(<br key={`br-${i}`} />);
      } else {
        elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed">{formatInline(trimmed)}</p>);
      }
    }
  }
  flushList();

  return <>{elements}</>;
}

function formatInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Ciao! Sono l'assistente per la progettazione del tuo AI Agent. Parlami del processo che vorresti trasformare: quale problema principale vuoi risolvere oggi?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await res.json();
      
      if (data.finished) {
        setIsFinished(true);
      }

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: data.reply },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: "Scusa, c'è stato un errore di connessione." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      mediaRecorderRef.current?.stream.getTracks().forEach(i => i.stop());
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');

          setIsLoading(true);
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.text) {
              setInput(data.text);
            }
          } catch (e) {
            console.error('Transcription failed:', e);
          } finally {
            setIsLoading(false);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone', err);
        alert('Non è stato possibile accedere al microfono. Verifica i permessi.');
      }
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setIsLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      setAnalysisData(data);
    } catch (e) {
      console.error(e);
      alert("Errore durante la generazione dell'analisi. Riprova.");
      setIsAnalyzing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestConversation = () => {
    setMessages([
      { id: "1", role: "assistant", content: "Ciao! Sono l'assistente per la progettazione del tuo AI Agent. Parlami del processo che vorresti trasformare: quale problema principale vuoi risolvere oggi?" },
      { id: "2", role: "user", content: "Vorrei automatizzare la risposta alle email di assistenza tecnica dei clienti che attualmente prende troppo tempo." },
      { id: "3", role: "assistant", content: "Capisco. Chi esegue attualmente queste attività?" },
      { id: "4", role: "user", content: "Il team di customer care, composto da 5 persone." },
      { id: "5", role: "assistant", content: "Quali software o strumenti utilizzano oggi?" },
      { id: "6", role: "user", content: "Usano Zendesk e a volte consultano il CRM Salesforce per i dati dei clienti." },
      { id: "7", role: "assistant", content: "Quanto tempo richiede mediamente questo processo oggi?" },
      { id: "8", role: "user", content: "In media impiegano circa 15 minuti per email, dovendo cercare le info nella manualistica." },
      { id: "9", role: "assistant", content: "Ok, per essere sicuro di aver capito sull'AS-IS abbiamo...\n- Gestione ticket in ritardo\n- 5 operatori care\n- Zendesk e Salesforce\n- 15 min a ticket\n\nCome immagini (in astratto) che l'AI trasformi il processo? (Visione TO-BE)" },
      { id: "10", role: "user", content: "Vorrei che l'AI leggesse la mail, cercasse la risposta giusta ne manuali e preparasse una bozza pronta." },
      { id: "11", role: "assistant", content: "Quali tool bisognerà integrare? Sarà un sistema Single Agent o Multi-Agent?" },
      { id: "12", role: "user", content: "Dobbiamo integrare Zendesk. Immagino un Multi-Agent: uno legge, uno cerca nel DB, uno scrive." },
      { id: "13", role: "assistant", content: "Livello di autonomia: Sostituzione assoluta o Affiancamento umano (Augmentation)?" },
      { id: "14", role: "user", content: "Augmentation. L'operatore deve sempre approvare la bozza prima dell'invio." },
      { id: "15", role: "assistant", content: "A quali database l'AI dovrà accedere?" },
      { id: "16", role: "user", content: "Alla knowledge base interna aziendale e a Salesforce." },
      { id: "17", role: "assistant", content: "Oltre alla mitigazione dei rischi, quali sono i principali vantaggi misurabili o KPI del progetto?" },
      { id: "18", role: "user", content: "Ridurre il tempo di gestione da 15 min a 3 min, e aumentare la soddisfazione cliente del 20%." },
      { id: "19", role: "assistant", content: "Ostacoli come privacy, resistenza al cambiamento, ecc.?" },
      { id: "20", role: "user", content: "La privacy dei dati in Salesforce è critica (GDPR)." },
      { id: "21", role: "assistant", content: "Timeline: Pilota veloce o trasformazione graduale?" },
      { id: "22", role: "user", content: "Un pilota veloce di 1 mese su un singolo dipartimento." },
      { id: "23", role: "assistant", content: "Perfetto, ho tutti gli elementi per generare l'analisi del progetto! [ANALISI_PRONTA]" }
    ]);
    setIsFinished(true);
    setTimeout(scrollToBottom, 100);
  };

  // Show analysis dashboard
  if (analysisData && !analysisData.error) {
    return <AnalysisReport data={analysisData} onBack={() => { setAnalysisData(null); setIsAnalyzing(false); }} />;
  }

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {!isFinished && messages.length <= 3 && (
        <div className="absolute top-4 right-4 z-10 hidden sm:block">
          <button 
            onClick={loadTestConversation}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-ifab-cyan/10 hover:from-blue-500/20 hover:to-ifab-cyan/20 border border-ifab-cyan/20 rounded-full text-xs font-semibold text-blue-800 dark:text-blue-300 transition-all shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3 text-ifab-cyan" /> Compile Test Rapido
          </button>
        </div>
      )}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${
                  message.role === "user"
                    ? "bg-ifab-cyan text-blue-950 font-medium"
                    : "bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50 shadow-sm text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {renderMessage(message.content)}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-zinc-800/80 rounded-2xl px-5 py-4 border border-zinc-100 dark:border-zinc-700/50 flex space-x-2 items-center">
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-ifab-cyan border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-zinc-500">Generazione analisi in corso...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-ifab-cyan animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-ifab-cyan animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-ifab-cyan animate-bounce" style={{ animationDelay: "300ms" }} />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-none p-4 bg-white/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
        {isFinished ? (
            <div className="flex justify-center p-2">
                <button 
                  onClick={handleAnalysis}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-105 disabled:opacity-50"
                >
                    <Sparkles className="w-5 h-5" />
                    {isLoading ? "Analisi in corso..." : "Fai Analisi"}
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
                <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-3 md:p-4 rounded-full transition-colors flex-shrink-0 ${
                    isRecording 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                >
                    {isRecording ? <Square className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Scrivi la tua risposta..."
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 border-transparent focus:border-ifab-cyan focus:ring-1 focus:ring-ifab-cyan rounded-full px-6 py-3 outline-none text-zinc-800 dark:text-zinc-200"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-3 md:p-4 rounded-full bg-ifab-cyan text-blue-950 hover:bg-ifab-cyan-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md"
                >
                    <Send className="w-5 h-5 md:w-6 md:h-6 ml-1" />
                </button>
            </form>
        )}
      </div>
    </div>
  );
}
