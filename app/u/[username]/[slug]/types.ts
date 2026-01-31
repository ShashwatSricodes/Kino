// types.ts - Shared types and constants

export type BlockType = "text" | "image" | "review" | "doodle" | "header" | "sticky" | "polaroid" | "washi-tape" | "sticker" | "checklist" | "quote" | "collage";

export type Block = {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  content: string; 
  rotation: number;
  zIndex: number;
  width?: number;
  height?: number;
  tapeColor?: string;
  fontFamily?: string;
  doodlePath?: string;
  stickerType?: string;
  borderStyle?: string;
};

export const TAPES = ["#E6B89C", "#9CAF88", "#D4A373", "#CCD5AE", "#E07A5F"]; 

export const FONTS = [
  { name: "Architects Daughter", value: "'Architects Daughter', cursive", label: "Handwritten" },
  { name: "Serif", value: "serif", label: "Classic" },
  { name: "Courier New", value: "'Courier New', monospace", label: "Typewriter" },
  { name: "Caveat", value: "'Caveat', cursive", label: "Casual" }
];

export const DOODLES = [
  { path: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z", label: "⭐ Star" },
  { path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", label: "❤️ Heart" },
  { path: "M2 12c2-4 6-4 8 0s6 4 8 0 6-4 8 0", label: "〰️ Wave" },
  { path: "M16 2 L20 6 L16 10 M20 6 L2 6", label: "→ Arrow" },
  { path: "M12 2C7 7 2 12 2 12s5 5 10 10 10-5 10-10S17 7 12 2zM12 22c0-5-5-10-5-10s5-5 10-10", label: "✨ Sparkle" },
  { path: "M4 12a8 8 0 0 1 16 0 8 8 0 0 1-8 8 8 8 0 0 1-8-8c0-2.21 1.79-4 4-4h.5", label: "☁️ Cloud" },
  { path: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z", label: "⭐ Big Star" },
  { path: "M3 12 Q12 3 21 12 Q12 21 3 12", label: "🌙 Moon" },
  { path: "M12 2 C6 6 6 18 12 22 C18 18 18 6 12 2", label: "🍃 Leaf" }
];

export const STICKERS = [
  { emoji: "☕", label: "Coffee", color: "#D4A373" },
  { emoji: "🌸", label: "Flower", color: "#E6B89C" },
  { emoji: "🎨", label: "Art", color: "#9CAF88" },
  { emoji: "📷", label: "Camera", color: "#CCD5AE" },
  { emoji: "✨", label: "Sparkle", color: "#E07A5F" },
  { emoji: "🌿", label: "Plant", color: "#9CAF88" },
  { emoji: "🎵", label: "Music", color: "#D4A373" },
  { emoji: "📖", label: "Book", color: "#E6B89C" },
  { emoji: "🌙", label: "Moon", color: "#CCD5AE" },
  { emoji: "☀️", label: "Sun", color: "#E07A5F" },
  { emoji: "🦋", label: "Butterfly", color: "#9CAF88" },
  { emoji: "🎀", label: "Ribbon", color: "#E6B89C" }
];

export const WASHI_PATTERNS = [
  { type: "dots", label: "Polka Dots" },
  { type: "stripes", label: "Stripes" },
  { type: "grid", label: "Grid" },
  { type: "floral", label: "Floral" },
  { type: "solid", label: "Solid" }
];