"use client";

import { Star, Upload, Loader2, Move, X, GripVertical } from "lucide-react";
import { Block, BlockType } from "./types";

type ScrapbookBlockProps = {
  block: Block;
  draggingId: string | null;
  resizingId: string | null;
  uploadingId: string | null;
  onBodyDown: (e: React.MouseEvent | React.TouchEvent, id: string, x: number, y: number, type: BlockType) => void;
  onHandleDown: (e: React.MouseEvent | React.TouchEvent, id: string, x: number, y: number) => void;
  onResizeStart: (e: React.MouseEvent | React.TouchEvent, id: string, currentWidth: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  handleImageUpload: (file: File, blockId: string) => void;
};

export default function ScrapbookBlock({
  block,
  draggingId,
  resizingId,
  uploadingId,
  onBodyDown,
  onHandleDown,
  onResizeStart,
  updateBlock,
  deleteBlock,
  handleImageUpload,
}: ScrapbookBlockProps) {
  return (
    <div
      onMouseDown={(e) => {
        // Don't trigger drag if clicking on an input element
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
        onBodyDown(e, block.id, block.x, block.y, block.type);
      }}
      onTouchStart={(e) => {
        // Don't trigger drag if touching an input element
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
        onBodyDown(e, block.id, block.x, block.y, block.type);
      }}
      className="absolute group"
      style={{
        left: block.x,
        top: block.y,
        transform: `rotate(${block.rotation}deg)`,
        zIndex: block.zIndex,
        cursor: draggingId === block.id ? "grabbing" : "default",
        transition: draggingId === block.id || resizingId === block.id ? "none" : "transform 0.1s linear",
      }}
    >
      {/* Controls */}
      <div className="absolute -top-8 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto">
        <button
          className="p-1.5 bg-[#8C7B66] text-white rounded-full shadow-md cursor-grab active:cursor-grabbing hover:bg-[#6b5d4d] touch-manipulation"
          onMouseDown={(e) => onHandleDown(e, block.id, block.x, block.y)}
          onTouchStart={(e) => onHandleDown(e, block.id, block.x, block.y)}
        >
          <Move size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
          className="p-1.5 bg-[#E07A5F] text-white rounded-full shadow-md hover:bg-[#c46b53] touch-manipulation"
        >
          <X size={12} />
        </button>
      </div>

      {/* Text Block */}
      {block.type === "text" && (
        <div 
          className="relative bg-[#FFFDF5]/80 p-4 rounded-sm border border-[#8C7B66]/30 shadow-sm"
          style={{ width: block.width || 300 }}
        >
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            style={{ fontFamily: block.fontFamily }}
            className="w-full bg-transparent border-none outline-none resize-none text-[#2A231A] text-base leading-relaxed overflow-hidden placeholder-[#2A231A]/30"
            rows={1}
            placeholder="Start typing..."
            spellCheck={false}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          {/* Resize Handle */}
          <div
            className="absolute -right-1 top-0 bottom-0 w-3 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center touch-manipulation"
            onMouseDown={(e) => onResizeStart(e, block.id, block.width || 300)}
            onTouchStart={(e) => onResizeStart(e, block.id, block.width || 300)}
          >
            <GripVertical size={16} className="text-[#8C7B66]" />
          </div>
        </div>
      )}

      {/* Header Block */}
      {block.type === "header" && (
        <div className="min-w-[250px]">
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full h-auto bg-transparent border-none outline-none resize-none text-[#E07A5F] text-5xl md:text-7xl font-['Abril_Fatface'] uppercase tracking-tighter overflow-hidden p-2 text-center placeholder-[#E07A5F]/30"
            rows={1}
            placeholder="TITLE"
            spellCheck={false}
          />
        </div>
      )}

      {/* Sticky Note Block */}
      {block.type === "sticky" && (
        <div className="w-[240px] bg-[#FFFDF5] p-6 shadow-[2px_4px_15px_rgba(0,0,0,0.1)] rounded-sm border border-[#E6B89C]/30 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 opacity-80 mix-blend-multiply" style={{ backgroundColor: "#CCD5AE", transform: "rotate(1deg)", clipPath: "polygon(2% 0, 100% 0, 98% 100%, 0% 100%)" }} />
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            style={{ fontFamily: block.fontFamily }}
            className="w-full bg-transparent resize-none outline-none text-[#5C5043] text-lg leading-relaxed h-32"
            placeholder="Note..."
          />
        </div>
      )}

      {/* Review Block */}
      {block.type === "review" && (
        <div className="w-[280px] bg-[#FFFDF5] p-5 shadow-[3px_5px_15px_rgba(0,0,0,0.15)] rounded-sm border border-[#E6B89C]/50">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 opacity-80 mix-blend-multiply" style={{ backgroundColor: "#E07A5F", transform: "rotate(-2deg)" }} />
          <div className="text-center mb-3">
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const data = JSON.parse(block.content || '{"rating":0, "text":""}');
                return (
                  <button 
                    key={star}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={() => {
                      const newData = { ...data, rating: star };
                      updateBlock(block.id, { content: JSON.stringify(newData) });
                    }}
                    className="touch-manipulation"
                  >
                    <Star size={20} className={`${star <= data.rating ? "fill-[#D4A373] text-[#D4A373]" : "text-[#D6D0C4]"}`} />
                  </button>
                );
              })}
            </div>
            <div className="h-px w-16 bg-[#D6D0C4] mx-auto mb-3" />
          </div>
          <textarea
            value={JSON.parse(block.content || '{"rating":0, "text":""}').text}
            onChange={(e) => {
              const data = JSON.parse(block.content || '{"rating":0, "text":""}');
              updateBlock(block.id, { content: JSON.stringify({ ...data, text: e.target.value }) });
            }}
            className="w-full bg-transparent resize-none outline-none text-[#5C5043] text-sm font-serif italic text-center"
            rows={3}
            placeholder="Write your review..."
          />
        </div>
      )}

      {/* Image Block */}
      {block.type === "image" && (
        <div className="bg-white p-3 pb-10 shadow-[2px_4px_15px_rgba(0,0,0,0.15)] transition-shadow">
          {block.content ? (
            <div className="relative pointer-events-none">
              <img src={block.content} className="w-48 md:w-64 h-auto object-cover grayscale-[0.1] sepia-[0.2]" alt="memory" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#8C7B66]/20 to-transparent mix-blend-overlay"></div>
            </div>
          ) : (
            <label className="w-48 h-48 flex flex-col items-center justify-center border-2 border-dashed border-[#E6B89C] cursor-pointer bg-[#FFFDF5] hover:bg-[#FDF6E3] transition-colors touch-manipulation">
              {uploadingId === block.id ? (
                <Loader2 className="w-8 h-8 animate-spin text-[#D4A373]" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#D4A373] mb-2" />
                  <span className="text-xs text-[#8C7B66] font-[Architects_Daughter]">Tap to Upload</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], block.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              )}
            </label>
          )}
        </div>
      )}

      {/* Doodle Block */}
      {block.type === "doodle" && block.doodlePath && (
        <div className="pointer-events-none">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#5C5043" strokeWidth="1.2" className="doodle-ink drop-shadow-sm">
            <path d={block.doodlePath} />
          </svg>
        </div>
      )}
    </div>
  );
}