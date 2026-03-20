"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Download, ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, Clock, Zap, Star, Shield } from "lucide-react";

type AnalysisData = {
  processName: string;
  problemSummary: string;
  conversationSummary?: string;
  score: number;
  feasibility: string;
  strengths: string[];
  cautions: string[];
  asIs: { actors: string; tools: string; time: string; painPoints: string[] };
  toBe: { vision: string; benefits: string[]; autonomy: string; approach: string; architecture: string };
  roi: { savingsYear1: string; investment: string; breakevenMonths: number; roiPercent: number };
  radarChart: { fattibilitaTecnica: number; impattoBusinesss: number; gestioneRischi: number; roiPrevisto: number; facilitaImplementazione: number };
  impactMatrix: { processComplexity: number; aiAutonomy: number; quadrant: string };
  riskAssessment: { category: string; level: number; description: string }[];
  timeComparison: { asIsMinutes: number; toBeMinutes: number; unit: string };
  comparisonChart: { categories: string[]; asIsValues: number[]; toBeValues: number[] };
  roadmap: { phase: string; duration: string; activities: string[]; budget: string }[];
  nextSteps: string[];
  risks: { risk: string; impact: string; mitigation: string }[];
};

// Radar chart using SVG
function RadarChart({ data }: { data: AnalysisData["radarChart"] }) {
  const labels = ["Fattibilità\nTecnica", "Impatto\nBusiness", "Gestione\nRischi", "ROI\nPrevisto", "Facilità\nImplement."];
  const values = [data.fattibilitaTecnica, data.impattoBusinesss, data.gestioneRischi, data.roiPrevisto, data.facilitaImplementazione];
  const cx = 150, cy = 150, maxR = 100;
  const angleStep = (2 * Math.PI) / 5;

  const getPoint = (index: number, value: number) => {
    const angle = (index * angleStep) - Math.PI / 2;
    const r = (value / 5) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [1, 2, 3, 4, 5];

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto">
      {/* Grid */}
      {gridLevels.map(level => {
        const points = Array.from({ length: 5 }, (_, i) => {
          const p = getPoint(i, level);
          return `${p.x},${p.y}`;
        }).join(" ");
        return <polygon key={level} points={points} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />;
      })}

      {/* Axes */}
      {Array.from({ length: 5 }, (_, i) => {
        const p = getPoint(i, 5);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="0.5" />;
      })}

      {/* Data polygon */}
      <polygon
        points={values.map((v, i) => { const p = getPoint(i, v); return `${p.x},${p.y}`; }).join(" ")}
        fill="rgba(0, 229, 255, 0.25)" stroke="#00E5FF" strokeWidth="2"
      />

      {/* Data points */}
      {values.map((v, i) => {
        const p = getPoint(i, v);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#00E5FF" stroke="white" strokeWidth="1.5" />;
      })}

      {/* Labels */}
      {labels.map((label, i) => {
        const p = getPoint(i, 6.2);
        const lines = label.split("\n");
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="text-[9px] fill-zinc-500">
            {lines.map((line, j) => (
              <tspan key={j} x={p.x} dy={j === 0 ? 0 : 12}>{line}</tspan>
            ))}
          </text>
        );
      })}

      {/* Values */}
      {values.map((v, i) => {
        const p = getPoint(i, v);
        return <text key={`v${i}`} x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] font-bold fill-ifab-cyan">{v.toFixed(1)}</text>;
      })}
    </svg>
  );
}

// Impact Matrix (2x2 quadrant)
function ImpactMatrix({ data }: { data: AnalysisData["impactMatrix"] }) {
  const x = data.processComplexity * 100;
  const y = (1 - data.aiAutonomy) * 100; // Invert Y for SVG coords

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[320px] mx-auto">
      {/* Quadrants */}
      <rect x="10" y="10" width="100" height="100" fill="#FEE2E2" rx="4" />
      <rect x="110" y="10" width="100" height="100" fill="#D1FAE5" rx="4" />
      <rect x="10" y="110" width="100" height="100" fill="#FEF3C7" rx="4" />
      <rect x="110" y="110" width="100" height="100" fill="#DBEAFE" rx="4" />

      {/* Labels */}
      <text x="60" y="55" textAnchor="middle" className="text-[8px] fill-zinc-500">Alto Rischio</text>
      <text x="60" y="67" textAnchor="middle" className="text-[7px] fill-zinc-400">Serve Giudizio</text>
      <text x="160" y="55" textAnchor="middle" className="text-[8px] fill-zinc-500">Automazione</text>
      <text x="160" y="67" textAnchor="middle" className="text-[7px] fill-zinc-400">Completa</text>
      <text x="60" y="155" textAnchor="middle" className="text-[8px] fill-zinc-500">Quick Wins</text>
      <text x="60" y="167" textAnchor="middle" className="text-[7px] fill-zinc-400">Basso Rischio</text>
      <text x="160" y="155" textAnchor="middle" className="text-[8px] fill-zinc-500">Augmentation</text>
      <text x="160" y="167" textAnchor="middle" className="text-[7px] fill-zinc-400">Supporto Umano</text>

      {/* Axes labels */}
      <text x="110" y="225" textAnchor="middle" className="text-[9px] fill-zinc-500">Complessità Processo →</text>
      <text x="5" y="110" textAnchor="middle" transform="rotate(-90, 5, 110)" className="text-[9px] fill-zinc-500">Autonomia AI →</text>

      {/* Process marker */}
      <g transform={`translate(${10 + x * 2}, ${10 + y * 2})`}>
        <polygon points="0,-12 4,-4 12,-4 6,2 8,10 0,6 -8,10 -6,2 -12,-4 -4,-4" fill="#00E5FF" stroke="white" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// Risk Heatmap
function RiskHeatmap({ data }: { data: AnalysisData["riskAssessment"] }) {
  const getColor = (level: number) => {
    if (level >= 4) return "#EF4444";
    if (level >= 3) return "#F59E0B";
    return "#10B981";
  };

  return (
    <div className="space-y-2">
      {data.map((r, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 w-24 text-right flex-shrink-0">{r.category}</span>
          <div className="flex-1 h-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
            <div
              className="h-full rounded-lg transition-all duration-1000 flex items-center justify-end pr-2"
              style={{ width: `${(r.level / 5) * 100}%`, backgroundColor: getColor(r.level) }}
            >
              <span className="text-xs font-bold text-white">{r.level}/5</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalysisReport({ data, onBack }: { data: AnalysisData; onBack: () => void }) {
  const reportRef = useRef<HTMLDivElement>(null);

  // Robust PDF export using html-to-image (handles modern CSS like lab/oklch)
  const exportAsPdf = async () => {
    if (!reportRef.current) return;
    
    const btn = document.activeElement as HTMLButtonElement;
    const originalText = btn?.innerText;
    if (btn) btn.innerText = "Generazione PDF...";

    try {
      const { toJpeg } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const element = reportRef.current;
      
      // Capture the element as a high-quality JPEG
      const dataUrl = await toJpeg(element, {
        quality: 0.95,
        backgroundColor: "#f8fafc",
        pixelRatio: 2,
        style: {
          height: "auto",
          maxHeight: "none",
          overflow: "visible"
        }
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Multi-page handling
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Analisi_AI_${data.processName.replace(/\s+/g, '_')}.pdf`);
    } catch (err: any) {
      console.error("PDF Export failed:", err);
      alert("Errore PDF: " + (err.message || "Problema di compatibilità."));
    } finally {
      if (btn) btn.innerText = originalText;
    }
  };

  const scoreColor = data.score >= 7 ? "text-green-500" : data.score >= 5 ? "text-yellow-500" : "text-red-500";
  const scoreBg = data.score >= 7 ? "from-green-400 to-emerald-600" : data.score >= 5 ? "from-yellow-400 to-orange-500" : "from-red-400 to-red-600";
  const timeSaved = data.timeComparison ? Math.round(((data.timeComparison.asIsMinutes - data.timeComparison.toBeMinutes) / data.timeComparison.asIsMinutes) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: none !important;
            padding: 20px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .flex-1 {
            overflow: visible !important;
            height: auto !important;
          }
          /* Ensure charts and elements background colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 1cm;
            size: auto;
          }
        }
      `}</style>
      <div className="flex-1 overflow-y-auto print-scroll-fix">
        <div ref={reportRef} className="max-w-5xl mx-auto w-full p-6 md:p-10 space-y-8 print-container">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-ifab-cyan to-blue-600">
              🎯 Analisi Agentic AI
            </h1>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200">{data.processName}</h2>
              <p className="text-zinc-500 italic text-sm max-w-2xl mx-auto">{data.problemSummary}</p>
            </div>
            
            {data.conversationSummary && (
              <div className="bg-[#f0fdff] border border-[#d1f7ff] rounded-xl p-4 mt-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF] mb-2">Recap Mappatura</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {data.conversationSummary}
                </p>
              </div>
            )}
          </motion.div>

          {/* Score + ROI Row */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Score */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-zinc-100 dark:border-zinc-800">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
                    strokeDasharray={`${(data.score / 10) * 314} 314`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#00E5FF" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${scoreColor}`}>{data.score}</span>
                  <span className="text-[10px] text-zinc-400">/10</span>
                </div>
              </div>
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${scoreBg}`}>
                {data.feasibility} FATTIBILITÀ
              </span>
            </div>

            {/* ROI Metrics */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              {[
                { label: "Risparmio Anno 1", value: data.roi.savingsYear1, emoji: "💰" },
                { label: "Investimento", value: data.roi.investment, emoji: "📊" },
                { label: "Break-even", value: `${data.roi.breakevenMonths} mesi`, emoji: "⏱️" },
                { label: "ROI 12 mesi", value: `${data.roi.roiPercent}%`, emoji: "🚀" },
              ].map((item) => (
                <div key={item.label} className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-4 text-center border border-zinc-100 dark:border-zinc-800">
                  <div className="text-xl mb-1">{item.emoji}</div>
                  <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{item.value}</div>
                  <div className="text-[10px] text-zinc-400">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Strengths & Cautions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-5 border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-green-600 flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4" /> Punti di Forza</h3>
              <ul className="space-y-2">
                {data.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-5 border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-yellow-600 flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4" /> Attenzioni</h3>
              <ul className="space-y-2">
                {data.cautions?.map((c, i) => (
                  <li key={i} className="text-sm text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* AS-IS vs TO-BE Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border-l-4 border-red-400">
              <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-4"><Clock className="w-5 h-5" /> Situazione AS-IS</h3>
              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <p><span className="font-semibold">Attori:</span> {data.asIs.actors}</p>
                <p><span className="font-semibold">Strumenti:</span> {data.asIs.tools}</p>
                <p><span className="font-semibold">Tempi:</span> {data.asIs.time}</p>
                <div>
                  <span className="font-semibold">Problemi:</span>
                  <ul className="mt-1 list-disc list-inside">
                    {data.asIs.painPoints.map((p, i) => (<li key={i}>{p}</li>))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
              <h3 className="text-lg font-bold text-green-500 flex items-center gap-2 mb-4"><Zap className="w-5 h-5" /> Visione TO-BE</h3>
              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <p>{data.toBe.vision}</p>
                <p><span className="font-semibold">Architettura:</span> {data.toBe.architecture}</p>
                <p><span className="font-semibold">Approccio:</span> {data.toBe.approach}</p>
                <p><span className="font-semibold">Autonomia AI:</span> {data.toBe.autonomy}</p>
                <div>
                  <span className="font-semibold">Benefici Principali:</span>
                  <ul className="mt-1 list-disc list-inside">
                    {data.toBe.benefits.map((b, i) => (<li key={i}>{b}</li>))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Time Comparison Bar */}
          {data.timeComparison && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-ifab-cyan" /> Confronto Tempo: AS-IS vs TO-BE</h3>
              <div className="flex items-end gap-8 justify-center h-48">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 bg-red-400 rounded-t-lg transition-all duration-1000 flex items-end justify-center pb-2"
                    style={{ height: `${Math.min(160, (data.timeComparison.asIsMinutes / Math.max(data.timeComparison.asIsMinutes, data.timeComparison.toBeMinutes)) * 160)}px` }}>
                    <span className="text-white font-bold text-sm">{data.timeComparison.asIsMinutes}</span>
                  </div>
                  <span className="text-xs text-zinc-500">AS-IS</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 bg-green-400 rounded-t-lg transition-all duration-1000 flex items-end justify-center pb-2"
                    style={{ height: `${Math.min(160, (data.timeComparison.toBeMinutes / Math.max(data.timeComparison.asIsMinutes, data.timeComparison.toBeMinutes)) * 160)}px` }}>
                    <span className="text-white font-bold text-sm">{data.timeComparison.toBeMinutes}</span>
                  </div>
                  <span className="text-xs text-zinc-500">TO-BE</span>
                </div>
              </div>
              <p className="text-center mt-2 text-sm text-green-600 font-bold">Risparmio: {timeSaved}% ({data.timeComparison.unit})</p>
            </motion.div>
          )}

          {/* Charts Row: Radar + Impact Matrix */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Radar Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-ifab-cyan" /> Analisi Multi-dimensionale</h3>
              {data.radarChart && <RadarChart data={data.radarChart} />}
            </div>

            {/* Impact Matrix */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-ifab-cyan" /> Matrice Impatto</h3>
              <p className="text-xs text-zinc-400 mb-2">Sostituzione vs Augmentation • Quadrante: <strong className="text-ifab-cyan">{data.impactMatrix?.quadrant}</strong></p>
              {data.impactMatrix && <ImpactMatrix data={data.impactMatrix} />}
            </div>
          </motion.div>

          {/* Comparison Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-ifab-cyan" /> Confronto Metriche AS-IS → TO-BE</h3>
            <div className="space-y-4">
              {data.comparisonChart?.categories.map((cat, i) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    <span>{cat}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 w-10">AS-IS</span>
                      <div className="flex-1 h-5 bg-[#f4f4f5] dark:bg-[#27272a] rounded-lg overflow-hidden">
                        <div className="h-full bg-[#f87171] rounded-lg" style={{ width: `${data.comparisonChart.asIsValues[i]}%` }} />
                      </div>
                      <span className="text-xs text-zinc-500 w-8">{data.comparisonChart.asIsValues[i]}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 w-10">TO-BE</span>
                      <div className="flex-1 h-5 bg-[#f4f4f5] dark:bg-[#27272a] rounded-lg overflow-hidden">
                        <div className="h-full bg-[#4ade80] rounded-lg" style={{ width: `${data.comparisonChart.toBeValues[i]}%` }} />
                      </div>
                      <span className="text-xs text-zinc-500 w-8">{data.comparisonChart.toBeValues[i]}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Risk Heatmap */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" /> Valutazione Rischi per Area</h3>
            {data.riskAssessment && <RiskHeatmap data={data.riskAssessment} />}
          </motion.div>

          {/* Risks & Mitigations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800"
          >
            <h3 className="text-lg font-bold mb-4">⚠️ Rischi e Mitigazioni</h3>
            <div className="space-y-3">
              {data.risks?.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${r.impact === "ALTO" ? "bg-red-100 text-red-700" : r.impact === "MEDIO" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {r.impact}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-zinc-700 dark:text-zinc-200">{r.risk}</p>
                    <p className="text-xs text-zinc-500 mt-1">💡 {r.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Roadmap */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-800"
          >
            <h3 className="text-lg font-bold mb-6">🗺️ Roadmap Implementazione</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-ifab-cyan/30" />
              <div className="space-y-6">
                {data.roadmap?.map((phase, i) => (
                  <div key={i} className="relative pl-10">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-ifab-cyan shadow" />
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-ifab-cyan">{phase.phase}</span>
                        <span className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full">{phase.duration}</span>
                        <span className="text-xs text-zinc-400 ml-auto">{phase.budget}</span>
                      </div>
                      <ul className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
                        {phase.activities.map((a, j) => (
                          <li key={j} className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="bg-gradient-to-br from-ifab-cyan/10 to-blue-600/10 rounded-2xl p-6 border border-ifab-cyan/20"
          >
            <h3 className="text-lg font-bold mb-4">🚀 Prossimi Passi</h3>
            <div className="space-y-2">
              {data.nextSteps?.map((step, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/60 dark:bg-zinc-800/60 rounded-xl p-3">
                  <span className="w-7 h-7 rounded-full bg-ifab-cyan text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-200">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer credit */}
          <div className="text-center text-xs text-zinc-400 pt-4 pb-2">
            IFAB Workshop · Agentic Architect · Powered by AI
          </div>
        </div>
      </div>

      {/* Export Footer */}
      <div className="flex-none p-4 bg-white/70 dark:bg-zinc-900/70 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-md no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Torna alla chat
          </button>
          <div className="flex gap-2">
            <button onClick={exportAsPdf}
              className="flex items-center gap-2 bg-gradient-to-r from-ifab-cyan to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Download className="w-5 h-5" /> Scarica PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
