import Conversation from "@/components/Conversation";

export default function Home() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "hidden",
      }}
      className="bg-zinc-50 dark:bg-ifab-blue"
    >
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-ifab-cyan opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 opacity-20 blur-[120px] pointer-events-none" />

      {/* HEADER - row 1, auto height, never pushed out */}
      <header
        style={{ gridRow: "1", zIndex: 20 }}
        className="flex items-center p-4 md:px-8 md:py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-ifab-blue/70 backdrop-blur-md shadow-sm"
      >
        <div className="flex items-center gap-3 w-full max-w-5xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ifab-cyan to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-ifab-cyan to-blue-600">
              Agentic Architect
            </h1>
            <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400">
              Powered by IFAB Workshop
            </p>
          </div>
        </div>
      </header>

      {/* CHAT AREA - row 2, fills remaining space */}
      <section
        style={{ gridRow: "2", overflow: "hidden", position: "relative", zIndex: 10 }}
        className="flex flex-col"
      >
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
          <Conversation />
        </div>
      </section>
    </div>
  );
}
