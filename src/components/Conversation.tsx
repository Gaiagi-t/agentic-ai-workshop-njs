"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Square, Sparkles, Menu, X } from "lucide-react";
import dynamic from "next/dynamic";
import discoveryFlow from "@/config/discoveryFlow";

const SimplifiedReport = dynamic(() => import("./SimplifiedReport"), { ssr: false, loading: () => <div className="p-8">Caricando...</div> });

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function renderMessage(content: string) {
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
      content: discoveryFlow.initialMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Test conversation data
  const testConversation = [
    { role: "user" as const, content: "Voglio automatizzare la gestione delle richieste di supporto clienti via email" },
    { role: "assistant" as const, content: "Ottimo caso d'uso! Chi esegue attualmente questo lavoro?" },
    { role: "user" as const, content: "Il nostro team di customer support, circa 3-4 persone che leggono le email e rispondono manualmente" },
    { role: "assistant" as const, content: "Perfetto. Quali strumenti usate attualmente? Gmail, un ticketing system, o altro?" },
    { role: "user" as const, content: "Usiamo Gmail per ricevere le email e un foglio Excel per tracciare le richieste" },
    { role: "assistant" as const, content: "Capito. Quanto tempo mediamente richiede gestire una richiesta di supporto, dalla lettura della email alla risposta?" },
    { role: "user" as const, content: "In media 10-15 minuti per richiesta, considerando il tempo per leggere, cercare informazioni e rispondere" },
    { role: "assistant" as const, content: "Ok, ricapitolando su come funziona oggi:\n- Chi: Team di 3-4 persone del supporto\n- Strumenti: Gmail + Excel\n- Tempo: 10-15 minuti per richiesta\n- Problemi: Manuale, ripetitivo, lento\n\nAdesso immagina il futuro ideale: come dovrebbe funzionare con un agente AI? Cosa dovrebbe fare?" },
    { role: "user" as const, content: "L'agente dovrebbe leggere le email, categorizzarle, trovare la risposta appropriata dalla nostra knowledge base e rispondere automaticamente. Per le richieste complesse, dovrebbe avvisare il nostro team" },
    { role: "assistant" as const, content: "Fantastico. Quali sarebbero i principali benefici per il vostro team?" },
    { role: "user" as const, content: "Ridurremmo il tempo a 1-2 minuti per richiesta (solo revisione), potremmo gestire più clienti con lo stesso team, e ridurremmo gli errori. Stimiamo un risparmio di 20 ore a settimana" },
    { role: "assistant" as const, content: "Eccellente. L'agente dovrebbe decidere tutto in autonomia o dovrebbe supportare le decisioni del team?" },
    { role: "user" as const, content: "Preferibilmente affiancamento: l'agente suggerisce la risposta e il team la approva prima di inviarla. Per le risposte template standard può andare in autonomia" },
    { role: "assistant" as const, content: "Perfetto. A quali dati o sistemi dovrebbe accedere l'agente? La vostra knowledge base dove è? E come potrebbe inviare le email?" },
    { role: "user" as const, content: "Abbiamo una knowledge base in Notion e un account Gmail. Quindi dovrebbe accedere a Notion per cercare risposte e usare Gmail API per inviare le email" },
    { role: "assistant" as const, content: "Fantastico, ho tutto quello che mi serve. Grazie mille! [ANALISI_PRONTA]" },
  ];

  const handleLoadTestData = async () => {
    setIsTestMode(true);
    setMessages([]);
    setInput("");
    setIsFinished(false);
    setAnalysisData(null);

    // Simulate loading the test conversation
    for (const msg of testConversation) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: msg.role,
          content: msg.content,
        },
      ]);
    }

    setIsFinished(true);
  };

  const handleReset = () => {
    setIsTestMode(false);
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: discoveryFlow.initialMessage,
      },
    ]);
    setInput("");
    setIsFinished(false);
    setAnalysisData(null);
  };

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
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      setAnalysisData(data);
    } catch (error) {
      console.error(error);
      alert("Errore durante l'analisi. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className="text-purple-600 flex-shrink-0" size={24} />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-slate-900 truncate">
                Configuratore Agenti AI
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5 truncate">
                Identifica come automatizzare un tuo processo
              </p>
            </div>
          </div>
          {!isTestMode ? (
            <button
              onClick={handleLoadTestData}
              disabled={isLoading || isAnalyzing}
              className="flex-shrink-0 px-3 py-1.5 text-xs md:text-sm bg-slate-100 hover:bg-slate-200 disabled:bg-gray-300 text-slate-700 rounded transition whitespace-nowrap ml-2"
              title="Carica una conversazione di esempio"
            >
              📝 Test
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex-shrink-0 px-3 py-1.5 text-xs md:text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition whitespace-nowrap ml-2"
              title="Ricomincia da zero"
            >
              ↻ Reset
            </button>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col w-full">
        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-3 md:space-y-4 w-full"
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-slate-900 border border-slate-200 shadow"
                  }`}
                >
                  {renderMessage(msg.content)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-center text-slate-600"
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area - Mobile Fixed Bottom */}
        <div className="bg-white border-t border-slate-200 px-3 md:px-6 py-3 flex-shrink-0 w-full">
          {isFinished && !analysisData ? (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex gap-2 w-full"
            >
              <button
                onClick={handleAnalysis}
                disabled={isLoading}
                className="flex-1 px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Sparkles size={18} className="flex-shrink-0" />
                <span className="truncate">{isLoading ? "Generando..." : "Genera Config"}</span>
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Rispondi..."
                disabled={isLoading || isAnalyzing}
                className="flex-1 px-3 md:px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-sm md:text-base"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition flex-shrink-0 ${
                  isRecording
                    ? "bg-red-500 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
                disabled={isLoading}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <Square size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="submit"
                disabled={isLoading || isAnalyzing || !input.trim()}
                className="px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Analysis Modal */}
      {analysisData && (
        <SimplifiedReport
          data={analysisData}
          onClose={() => {
            setAnalysisData(null);
            setIsFinished(false);
            setMessages([
              {
                id: "1",
                role: "assistant",
                content: discoveryFlow.initialMessage,
              },
            ]);
          }}
        />
      )}
    </div>
  );
}
