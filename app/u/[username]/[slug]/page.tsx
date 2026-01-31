"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";


import { 
  Image as ImageIcon, 
  Type, 
  AlignLeft, 
  Star, 
  Loader2, 
  StickyNote, 
  PenTool, 
  ArrowLeft,
  Save,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Block, BlockType, TAPES, FONTS, DOODLES } from "./types";
import ScrapbookBlock from "./ScrapbookBlock";
import PreviewModals from "./PreviewModals";

type CozyScrapbookProps = {
  params: Promise<{ username: string; slug: string }>;
};

export default function CozyScrapbook({ params }: CozyScrapbookProps) {
  const { username, slug: collectionSlug } = use(params);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- State ---
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [highestZ, setHighestZ] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [showFontPreview, setShowFontPreview] = useState(false);
  const [showDoodlePreview, setShowDoodlePreview] = useState(false);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedDoodle, setSelectedDoodle] = useState(DOODLES[0]);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, x: 0 });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blocksRef = useRef<Block[]>([]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    loadData();
  }, [collectionSlug]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("❌ Auth error:", authError);
        return;
      }
      
      if (user) {
        setUserId(user.id);
        
        const { data, error } = await supabase
          .from("scrapbook_pages")
          .select("blocks")
          .eq("user_id", user.id)
          .eq("collection_slug", collectionSlug)
          .maybeSingle();

        if (error) {
          console.error("❌ Error loading data:", error);
          setSaveError(`Load error: ${error.message}`);
        } else if (data?.blocks) {
          setBlocks(data.blocks);
          const maxZ = data.blocks.reduce((max: number, b: Block) => Math.max(max, b.zIndex), 0);
          setHighestZ(maxZ);
        }
      }
    } catch (error) {
      console.error("❌ Exception during load:", error);
      setSaveError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const triggerSave = useCallback(async (currentBlocks: Block[]) => {
    if (!userId) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      const saveData = {
        user_id: userId,
        collection_slug: collectionSlug,
        blocks: currentBlocks,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("scrapbook_pages")
        .upsert(saveData, {
          onConflict: 'user_id,collection_slug',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error("❌ Save error:", error);
        setSaveError(error.message);
        
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from("scrapbook_pages")
            .update({ blocks: currentBlocks, updated_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("collection_slug", collectionSlug);
          
          if (!updateError) {
            setLastSaved(new Date());
            setSaveError(null);
          } else {
            setSaveError(updateError.message);
          }
        }
      } else {
        setLastSaved(new Date());
        setSaveError(null);
      }
    } catch (err) {
      console.error("❌ Exception during save:", err);
      setSaveError("Network error during save");
    } finally {
      setSaving(false);
    }
  }, [userId, collectionSlug, supabase]);

  const scheduleSave = useCallback((newBlocks: Block[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      triggerSave(newBlocks);
    }, 800);
  }, [triggerSave]);

  const addBlock = (type: BlockType, content: string = "", doodlePath?: string) => {
    setHighestZ((z) => z + 1);
    
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const startY = scrollY + (typeof window !== 'undefined' ? window.innerHeight / 3 : 200);
    const startX = typeof window !== 'undefined' && window.innerWidth < 768 
        ? window.innerWidth / 2 - 150
        : 100 + Math.random() * 200;

    const shouldRotate = type !== 'text' && type !== 'header';
    const rotation = shouldRotate ? Math.random() * 6 - 3 : 0;

    const newBlock: Block = {
        id: crypto.randomUUID(),
        type,
        x: startX,
        y: startY,
        rotation,
        zIndex: highestZ + 1,
        content,
        width: type === 'text' ? 300 : undefined,
        tapeColor: TAPES[Math.floor(Math.random() * TAPES.length)],
        fontFamily: type === 'text' ? selectedFont.value : FONTS[Math.floor(Math.random() * FONTS.length)].value,
        doodlePath: doodlePath || undefined
    };

    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    scheduleSave(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBlocks(newBlocks);
    scheduleSave(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(newBlocks);
    scheduleSave(newBlocks);
  };

  const handleImageUpload = async (file: File, blockId: string) => {
    if (!userId) return;
    try {
      setUploadingId(blockId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("scrapbook-images")
        .upload(fileName, file);
      
      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        alert("Upload failed: " + uploadError.message);
        return;
      }
      
      const { data } = supabase.storage
        .from("scrapbook-images")
        .getPublicUrl(fileName);
      
      updateBlock(blockId, { content: data.publicUrl });
    } catch (e) {
      console.error("❌ Upload exception:", e);
      alert("Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].pageX, y: e.touches[0].pageY };
    }
    return { x: (e as React.MouseEvent).pageX, y: (e as React.MouseEvent).pageY };
  };

  const handleDragStart = (id: string, pageX: number, pageY: number, blockX: number, blockY: number) => {
    setHighestZ(z => z + 1);
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, zIndex: highestZ + 1 } : b));
    setDraggingId(id);
    dragOffset.current = { x: pageX - blockX, y: pageY - blockY };
  };

  const onHandleDown = (e: React.MouseEvent | React.TouchEvent, id: string, x: number, y: number) => {
    e.stopPropagation();
    const { x: pageX, y: pageY } = getCoordinates(e);
    handleDragStart(id, pageX, pageY, x, y);
  };

  const onBodyDown = (e: React.MouseEvent | React.TouchEvent, id: string, x: number, y: number, type: BlockType) => {
    // All blocks are now draggable via their body
    e.stopPropagation();
    const { x: pageX, y: pageY } = getCoordinates(e);
    handleDragStart(id, pageX, pageY, x, y);
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingId) {
      e.preventDefault(); // Prevent scrolling while dragging
      const { x: pageX, y: pageY } = getCoordinates(e);
      const newBlocks = blocks.map((b) =>
        b.id === draggingId
          ? { ...b, x: pageX - dragOffset.current.x, y: pageY - dragOffset.current.y }
          : b
      );
      setBlocks(newBlocks);
    } else if (resizingId) {
      e.preventDefault(); // Prevent scrolling while resizing
      const { x: pageX } = getCoordinates(e);
      const delta = pageX - resizeStart.current.x;
      const newWidth = Math.max(200, resizeStart.current.width + delta);
      
      const newBlocks = blocks.map((b) =>
        b.id === resizingId ? { ...b, width: newWidth } : b
      );
      setBlocks(newBlocks);
    }
  };

  const onEnd = () => {
    if (draggingId || resizingId) {
        scheduleSave(blocksRef.current);
    }
    setDraggingId(null);
    setResizingId(null);
  };

  const onResizeStart = (e: React.MouseEvent | React.TouchEvent, id: string, currentWidth: number) => {
    e.stopPropagation();
    const { x: pageX } = getCoordinates(e);
    setResizingId(id);
    resizeStart.current = { width: currentWidth, x: pageX };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0E6D2]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3A332A]" />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen relative bg-[#F0E6D2] pb-[1000vh] overflow-x-hidden" 
      onMouseMove={onMove}
      onTouchMove={onMove}
      onMouseUp={onEnd}
      onTouchEnd={onEnd}
      onMouseLeave={onEnd}
      onTouchCancel={onEnd}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&family=Abril+Fatface&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .doodle-ink { mix-blend-mode: multiply; stroke-linecap: round; stroke-linejoin: round; }
        
        html, body {
          overflow-x: hidden;
          overscroll-behavior: none;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* Background */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none mix-blend-multiply z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Nav */}
      <button
        onClick={() => router.push(`/u/${username}`)}
        className="fixed top-4 left-4 z-[9999] flex items-center gap-2 font-[Architects_Daughter] text-[#3A332A] bg-[#FFFDF5]/80 border border-[#8C7B66]/40 px-3 py-2 rounded-full shadow-sm hover:bg-[#F0E6D2] transition-colors backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden md:inline text-sm">Back</span>
      </button>

      {/* Save Status */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 font-[Architects_Daughter] text-xs text-[#5C5043] bg-[#FFFDF5]/90 border border-[#8C7B66]/40 px-3 py-2 rounded-full backdrop-blur-sm transition-all">
            {saving ? (
               <>
                 <Loader2 className="w-3 h-3 animate-spin" />
                 <span>Saving...</span>
               </>
            ) : saveError ? (
               <>
                 <AlertCircle className="w-3 h-3 text-red-500" />
                 <span className="text-red-600">Error</span>
               </>
            ) : (
               <>
                 <Save className="w-3 h-3 opacity-50" />
                 <span>{lastSaved ? "Saved" : "Ready"}</span>
               </>
            )}
          </div>
          
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-[Architects_Daughter] max-w-xs">
              {saveError}
            </div>
          )}
      </div>

      {/* Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-2xl touch-manipulation">
        <div className="bg-[#FFFDF5]/95 border border-[#8C7B66]/40 shadow-[2px_4px_20px_rgba(0,0,0,0.1)] rounded-2xl px-2 py-3 backdrop-blur-md">
            <div className="flex gap-1 sm:gap-2 items-center overflow-x-auto no-scrollbar px-2 w-full justify-between md:justify-center">
            
            <ToolbarButton 
              icon={<Type size={20} />} 
              label="Text" 
              onClick={() => setShowFontPreview(true)} 
            />
            <ToolbarButton icon={<AlignLeft size={20} />} label="Header" onClick={() => addBlock("header", "Title Here")} />
            <div className="w-px h-8 bg-[#8C7B66]/20 flex-shrink-0" />
            
            <ToolbarButton icon={<ImageIcon size={20} />} label="Photo" onClick={() => addBlock("image", "", "polaroid")} />
            <ToolbarButton icon={<Star size={20} />} label="Review" onClick={() => addBlock("review", JSON.stringify({ rating: 0, text: "" }))} />
            <ToolbarButton icon={<StickyNote size={20} />} label="Sticky" onClick={() => addBlock("sticky", "A note...")} />
            
            <div className="w-px h-8 bg-[#8C7B66]/20 flex-shrink-0" />

            <ToolbarButton 
              icon={<PenTool size={20} />} 
              label="Doodle" 
              onClick={() => setShowDoodlePreview(true)} 
            />
          </div>
        </div>
      </div>

      {/* Preview Modals */}
      <PreviewModals
        showFontPreview={showFontPreview}
        showDoodlePreview={showDoodlePreview}
        onCloseFontPreview={() => setShowFontPreview(false)}
        onCloseDoodlePreview={() => setShowDoodlePreview(false)}
        onSelectFont={(font) => {
          setSelectedFont(font);
          addBlock("text", "Start typing here...");
          setShowFontPreview(false);
        }}
        onSelectDoodle={(doodle) => {
          setSelectedDoodle(doodle);
          addBlock("doodle", "sketch", doodle.path);
          setShowDoodlePreview(false);
        }}
      />

      {/* Canvas */}
      <div className="absolute top-0 left-0 w-full" style={{ minHeight: '1000vh' }}>
        {blocks.map((block) => (
          <ScrapbookBlock
            key={block.id}
            block={block}
            draggingId={draggingId}
            resizingId={resizingId}
            uploadingId={uploadingId}
            onBodyDown={onBodyDown}
            onHandleDown={onHandleDown}
            onResizeStart={onResizeStart}
            updateBlock={updateBlock}
            deleteBlock={deleteBlock}
            handleImageUpload={handleImageUpload}
          />
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#5C5043] pointer-events-none select-none p-4 text-center">
          <h2 className="font-['Abril_Fatface'] text-4xl tracking-widest text-[#3A332A] mb-2 opacity-60">SCRAPBOOK</h2>
          <p className="font-[Architects_Daughter] text-lg opacity-50 mb-1">Add items from the toolbar below</p>
          <p className="font-[Architects_Daughter] text-sm opacity-40">Use the drag handle (↔) on each item to move it around</p>
          <p className="font-[Architects_Daughter] text-sm opacity-40">Scroll down for infinite space!</p>
        </div>
      )}
    </main>
  );
}

function ToolbarButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center gap-1 min-w-[56px] sm:min-w-[60px] text-[#5C5043] hover:text-[#2c241b] active:scale-95 transition-all touch-manipulation"
    >
      <div className="p-2.5 sm:p-3 bg-[#F0E6D2]/50 rounded-xl hover:bg-[#E6B89C]/30 transition-colors">{icon}</div>
      <span className="text-[9px] sm:text-[10px] font-bold font-sans uppercase tracking-widest opacity-70">{label}</span>
    </button>
  );
}