"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Type, StickyNote } from "lucide-react";

// --- Types ---
type BlockType = "text" | "image";

type Block = {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  content: string;
  rotation: number;
  zIndex: number;
  // Styling props
  variant?: "polaroid" | "torn-paper" | "kraft" | "grid"; 
  tapeColor?: string;
  fontFamily?: string;
};

// --- Asset & Style Constants ---
// Colors matched to Page 2
const TAPES = ["#E6B89C", "#9CAF88", "#D4A373", "#CCD5AE"]; 
// Updated Fonts to match Page 2's vibe
const FONTS = ["'Architects Daughter', cursive", "serif"];

export default function CozyScrapbook() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [highestZ, setHighestZ] = useState(1);
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- Actions ---

  const addBlock = (type: BlockType, content: string, variant: Block["variant"] = "torn-paper") => {
    setHighestZ((z) => z + 1);
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        x: 100 + Math.random() * 50,
        y: 100 + Math.random() * 50,
        rotation: Math.random() * 6 - 3, // Slightly subtler rotation like Page 2
        zIndex: highestZ + 1,
        content,
        variant,
        tapeColor: TAPES[Math.floor(Math.random() * TAPES.length)],
        fontFamily: FONTS[Math.floor(Math.random() * FONTS.length)],
      },
    ]);
  };

  const bringToFront = (id: string) => {
    setHighestZ((z) => z + 1);
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, zIndex: highestZ + 1 } : b))
    );
  };

  // --- Drag Logic ---

  const onMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
    e.stopPropagation();
    bringToFront(id);
    setDraggingId(id);
    dragOffset.current = { x: e.clientX - x, y: e.clientY - y };
  };

  const onMouseUp = () => setDraggingId(null);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    e.preventDefault();
    
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === draggingId
          ? { ...b, x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }
          : b
      )
    );
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden selection:bg-[#ccbfa3] selection:text-[#3A332A]"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        backgroundColor: "#F0E6D2", // Matches Page 2
      }}
    >
      {/* Inject Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap');
        
        .texture-grid {
          background-size: 20px 20px;
          background-image:
            linear-gradient(to right, rgba(140, 123, 102, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(140, 123, 102, 0.1) 1px, transparent 1px);
        }
      `}</style>

      {/* Background Noise (Matched to Page 2) */}
      <div
        className="fixed inset-0 opacity-50 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* --- Toolbar (Styled like Page 2's Form Container) --- */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999]">
        <div className="bg-[#FFFDF5] border border-[#8C7B66]/40 shadow-[2px_4px_12px_rgba(0,0,0,0.15)] rounded-full px-8 py-3 flex gap-8 items-center backdrop-blur-sm bg-opacity-95">
          <ToolbarButton 
            icon={<Type size={18} />} 
            label="Note" 
            onClick={() => addBlock("text", "Archive note...", "torn-paper")} 
          />
          <ToolbarButton 
            icon={<StickyNote size={18} />} 
            label="Grid" 
            onClick={() => addBlock("text", "List entry...", "grid")} 
          />
          <ToolbarButton 
            icon={<ImageIcon size={18} />} 
            label="Photo" 
            onClick={() => addBlock("image", "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800", "polaroid")} 
          />
        </div>
      </div>

      {/* --- Canvas --- */}
      <div className="absolute inset-0">
        {blocks.map((block) => (
          <div
            key={block.id}
            onMouseDown={(e) => onMouseDown(e, block.id, block.x, block.y)}
            className="absolute group"
            style={{
              left: block.x,
              top: block.y,
              transform: `rotate(${block.rotation}deg)`,
              zIndex: block.zIndex,
              cursor: draggingId === block.id ? "grabbing" : "grab",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Washi Tape */}
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 opacity-90 shadow-sm z-20 pointer-events-none mix-blend-multiply"
              style={{ 
                backgroundColor: block.tapeColor,
                transform: `rotate(${Math.random() * 4 - 2}deg)`,
                clipPath: "polygon(2% 0, 100% 0, 99% 100%, 1% 100%)"
              }}
            />

            {/* --- Block Content --- */}
            
            {/* 1. TEXT BLOCKS */}
            {block.type === "text" && (
              <div 
                className={`
                  relative p-6 min-w-[220px] max-w-[320px] shadow-[2px_4px_12px_rgba(0,0,0,0.1)]
                  ${block.variant === 'grid' ? 'bg-[#FFFDF5] texture-grid border border-[#8C7B66]/20' : ''}
                  ${block.variant === 'kraft' ? 'bg-[#D4A373] border border-[#8C7B66]' : ''}
                  ${block.variant === 'torn-paper' ? 'bg-[#FFFDF5] border border-[#8C7B66]/40' : ''}
                `}
              >
                {/* Noise Texture Overlay for paper feel */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.5'/%3E%3C/svg%3E")`
                  }}
                />

                <textarea
                  value={block.content}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBlocks(b => b.map(bl => bl.id === block.id ? { ...bl, content: val } : bl));
                  }}
                  style={{ fontFamily: block.fontFamily }}
                  className="relative z-10 w-full h-full bg-transparent resize-none outline-none text-[#3A332A] text-lg leading-relaxed overflow-hidden"
                  rows={4}
                  spellCheck={false}
                />
              </div>
            )}

            {/* 2. IMAGE BLOCKS */}
            {block.type === "image" && (
              <div className="bg-[#FFFDF5] p-3 pb-10 shadow-[2px_4px_15px_rgba(0,0,0,0.15)] border border-[#8C7B66]/20">
                <div className="relative overflow-hidden sepia-[0.2] contrast-[1.05]">
                  <img
                    src={block.content}
                    className="w-56 h-auto object-cover pointer-events-none grayscale-[0.2]"
                    alt="archive item"
                  />
                  {/* Dust Overlay */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-20 mix-blend-overlay"></div>
                </div>
                {/* Caption */}
                <div className="absolute bottom-3 left-3 right-3 text-center border-t border-[#8C7B66]/20 pt-2">
                  <p className="text-[#6A5F52] text-xs font-[Architects_Daughter] tracking-wider">fig. 1</p>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* --- Empty State --- */}
      {blocks.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#5C5043] pointer-events-none select-none">
          <h2 className="font-serif text-3xl tracking-[0.2em] uppercase text-[#3A332A] mb-3 opacity-80">
            The Archive
          </h2>
          <p className="font-[Architects_Daughter] italic opacity-60">
            collection of thoughts & fragments
          </p>
        </div>
      )}
    </main>
  );
}

// Sub-component for buttons
function ToolbarButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-[#5C5043] hover:text-[#2c241b] transition-colors group"
    >
      <div className="p-2 rounded-full group-hover:bg-[#F0E6D2] transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-serif uppercase tracking-widest">{label}</span>
    </button>
  );
}