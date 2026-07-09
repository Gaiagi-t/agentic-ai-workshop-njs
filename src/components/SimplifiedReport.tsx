"use client";

import { motion } from "framer-motion";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type AnalysisData = {
  useCase: string;
  summary: string;
  asIs: {
    actors: string;
    tools: string;
    duration: string;
    painPoints: string[];
  };
  toBe: {
    vision: string;
    benefits: string[];
    autonomyLevel: string;
    approach: string;
  };
  agentConfig: {
    name: string;
    description: string;
    role: string;
    primaryGoal: string;
    requiredDataSources: string[];
    requiredTools: string[];
    decisionFramework: string;
    humanOversight: string;
  };
  expectedImpact: {
    timeReduction: string;
    qualityImprovement: string;
    costSavings: string;
    priority: string;
  };
  copilotEvaluation?: {
    chatLevel?: {
      feasibility: string;
      score: number;
      description: string;
      connectorSupport: string;
      limitations: string[];
      timeToImplement: string;
    };
    studioLevel?: {
      feasibility: string;
      score: number;
      description: string;
      connectorSupport: string;
      advantages: string[];
      costs: string;
      timeToImplement: string;
    };
    otherPlatforms?: {
      recommendation: string;
      whenConsider: string[];
      timeToImplement: string;
    };
  };
  copilotConfigurationGuide?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    customInstructionsTemplate: string;
  };
  roadmap: Array<{
    phase: string;
    duration: string;
    focus: string;
  }>;
  nextSteps: string[];
};

export default function SimplifiedReport({
  data,
  onClose,
}: {
  data: AnalysisData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleExportPDF = async () => {
    const element = document.getElementById("report-content");
    if (!element) {
      alert("Errore: non trovo il report. Ricarica la pagina.");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${data.useCase.replace(/\s+/g, "-").toLowerCase()}-agente-config.pdf`);
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Errore durante il download del PDF. Prova di nuovo.");
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.useCase}-agente-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyConfig = () => {
    const configText = `
Agent: ${data.agentConfig.name}
Role: ${data.agentConfig.role}
Goal: ${data.agentConfig.primaryGoal}

Description: ${data.agentConfig.description}

Decision Framework: ${data.agentConfig.decisionFramework}
Human Oversight: ${data.agentConfig.humanOversight}

Required Data Sources:
${data.agentConfig.requiredDataSources.map((s) => `- ${s}`).join("\n")}

Required Tools:
${data.agentConfig.requiredTools.map((t) => `- ${t}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(configText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg max-h-[90vh] overflow-y-auto w-full max-w-4xl shadow-2xl"
      >
        <div id="report-content" className="p-8 bg-white">
          {/* Header */}
          <div className="mb-8 pb-6 border-b-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {data.useCase}
            </h1>
            <p className="text-lg text-gray-600">{data.summary}</p>
          </div>

          {/* AS-IS Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 bg-blue-50 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📌 Come funziona oggi (AS-IS)</h2>
            <div className="space-y-3">
              <p>
                <strong>Chi lo fa:</strong> {data.asIs.actors}
              </p>
              <p>
                <strong>Strumenti usati:</strong> {data.asIs.tools}
              </p>
              <p>
                <strong>Tempo richiesto:</strong> {data.asIs.duration}
              </p>
              <div>
                <strong>Problemi principali:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {data.asIs.painPoints.map((point, i) => (
                    <li key={i} className="text-gray-700">{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* TO-BE Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 bg-green-50 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 La visione con l'agente (TO-BE)</h2>
            <div className="space-y-3">
              <p>
                <strong>Visione:</strong> {data.toBe.vision}
              </p>
              <p>
                <strong>Approccio:</strong> {data.toBe.approach} {data.toBe.autonomyLevel && `(${data.toBe.autonomyLevel})`}
              </p>
              <div>
                <strong>Benefici attesi:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {data.toBe.benefits.map((benefit, i) => (
                    <li key={i} className="text-gray-700">{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Agent Configuration */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-6 bg-purple-50 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🤖 Configurazione dell'Agente</h2>
            <div className="space-y-3 mb-4">
              <p>
                <strong>Nome:</strong> {data.agentConfig.name}
              </p>
              <p>
                <strong>Ruolo:</strong> {data.agentConfig.role}
              </p>
              <p>
                <strong>Obiettivo principale:</strong> {data.agentConfig.primaryGoal}
              </p>
              <p>
                <strong>Descrizione:</strong> {data.agentConfig.description}
              </p>
              <p>
                <strong>Come decide:</strong> {data.agentConfig.decisionFramework}
              </p>
              <p>
                <strong>Supervisione umana:</strong> {data.agentConfig.humanOversight}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <strong>Fonti dati richieste:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {data.agentConfig.requiredDataSources.map((source, i) => (
                      <li key={i} className="text-sm text-gray-700">{source}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Tool richiesti:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {data.agentConfig.requiredTools.map((tool, i) => (
                      <li key={i} className="text-sm text-gray-700">{tool}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Expected Impact */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-6 bg-yellow-50 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Impatto atteso</h2>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Riduzione tempo:</strong> {data.expectedImpact.timeReduction}
              </p>
              <p>
                <strong>Miglioramenti:</strong> {data.expectedImpact.qualityImprovement}
              </p>
              <p>
                <strong>Risparmi:</strong> {data.expectedImpact.costSavings}
              </p>
              <p>
                <strong>Priorità:</strong> {data.expectedImpact.priority}
              </p>
            </div>
          </motion.div>

          {/* Roadmap */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8 p-6 bg-indigo-50 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 Roadmap di implementazione</h2>
            <div className="space-y-3">
              {data.roadmap.map((phase, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-3 bg-white rounded border-l-4 border-indigo-500"
                >
                  <div>
                    <p className="font-bold text-gray-900">{phase.phase}</p>
                    <p className="text-sm text-gray-600">{phase.duration}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{phase.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8 p-6 bg-gray-50 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Prossimi passi</h2>
            <ol className="list-decimal list-inside space-y-2">
              {data.nextSteps.map((step, i) => (
                <li key={i} className="text-gray-700">{step}</li>
              ))}
            </ol>
          </motion.div>

          {/* Copilot Evaluation - 3 Levels */}
          {data.copilotEvaluation && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-300"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Valutazione Fattibilità Copilot</h2>
              <p className="text-sm text-gray-700 mb-4 italic">Tre livelli di implementazione con costi e complessità diversi</p>

              {/* Level 1: Copilot Chat */}
              {data.copilotEvaluation.chatLevel && (
                <div className="mb-4 p-4 bg-white rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">1️⃣ Copilot Chat (Gratuito con M365)</h3>
                    <div className="text-2xl font-bold text-orange-600">{data.copilotEvaluation.chatLevel.score}/10</div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{data.copilotEvaluation.chatLevel.description}</p>
                  <p className="text-sm"><strong>Supporto connectors:</strong> {data.copilotEvaluation.chatLevel.connectorSupport}</p>
                  <p className="text-sm mt-2"><strong>Limitazioni:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    {data.copilotEvaluation.chatLevel.limitations.map((limit, i) => (
                      <li key={i} className="text-xs text-red-700">{limit}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-600 mt-2">⏱️ Tempo setup: {data.copilotEvaluation.chatLevel.timeToImplement}</p>
                </div>
              )}

              {/* Level 2: Copilot Studio */}
              {data.copilotEvaluation.studioLevel && (
                <div className="mb-4 p-4 bg-white rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">2️⃣ Copilot Studio (Power Platform)</h3>
                    <div className="text-2xl font-bold text-blue-600">{data.copilotEvaluation.studioLevel.score}/10</div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{data.copilotEvaluation.studioLevel.description}</p>
                  <p className="text-sm"><strong>Supporto connectors:</strong> {data.copilotEvaluation.studioLevel.connectorSupport}</p>
                  <p className="text-sm mt-2"><strong>Vantaggi:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    {data.copilotEvaluation.studioLevel.advantages.map((adv, i) => (
                      <li key={i} className="text-xs text-green-700">{adv}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-600 mt-2">💰 {data.copilotEvaluation.studioLevel.costs}</p>
                  <p className="text-xs text-gray-600">⏱️ Tempo setup: {data.copilotEvaluation.studioLevel.timeToImplement}</p>
                </div>
              )}

              {/* Level 3: Other Platforms */}
              {data.copilotEvaluation.otherPlatforms && (
                <div className="p-4 bg-white rounded-lg border-l-4 border-gray-400">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">3️⃣ Altre Piattaforme (n8n, Make, Zapier)</h3>
                  <p className="text-sm text-gray-700 mb-2">{data.copilotEvaluation.otherPlatforms.recommendation}</p>
                  <p className="text-sm"><strong>Considera se:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    {data.copilotEvaluation.otherPlatforms.whenConsider.map((when, i) => (
                      <li key={i} className="text-xs text-gray-700">{when}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-600 mt-2">⏱️ Tempo setup: {data.copilotEvaluation.otherPlatforms.timeToImplement}</p>
                </div>
              )}

              <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-400">
                <p className="text-xs text-yellow-900"><strong>💡 Consiglio:</strong> Inizia sempre da Copilot Chat (gratuito). Passa a Studio solo se hai esigenze di write operations o API custom.</p>
              </div>
            </motion.div>
          )}

          {/* Copilot Configuration Guide */}
          {data.copilotConfigurationGuide && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-8 p-6 bg-cyan-50 rounded-lg border-2 border-cyan-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📖 Mini-Guida Configurazione Copilot</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: "Step 1: Setup Iniziale", desc: data.copilotConfigurationGuide.step1 },
                    { title: "Step 2: Configurazione Agente", desc: data.copilotConfigurationGuide.step2 },
                    { title: "Step 3: Integrazione Dati", desc: data.copilotConfigurationGuide.step3 },
                    { title: "Step 4: Test e Deploy", desc: data.copilotConfigurationGuide.step4 },
                  ].map((step, i) => (
                    <div key={i} className="p-4 bg-white rounded border-l-4 border-cyan-500">
                      <p className="font-bold text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-700 mt-2">{step.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-white rounded border border-dashed border-cyan-400">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Template Istruzioni Personalizzate:</p>
                  <code className="text-xs bg-gray-50 p-3 rounded block whitespace-pre-wrap break-words">
                    {data.copilotConfigurationGuide.customInstructionsTemplate}
                  </code>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2 justify-end">
          <button
            onClick={handleCopyConfig}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copiato!" : "Copia Config"}
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
          >
            <Download size={18} />
            JSON
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
          >
            <Download size={18} />
            PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Chiudi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
