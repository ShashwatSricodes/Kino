"use client";

import { FONTS, DOODLES } from "./types";

type PreviewModalsProps = {
  showFontPreview: boolean;
  showDoodlePreview: boolean;
  onCloseFontPreview: () => void;
  onCloseDoodlePreview: () => void;
  onSelectFont: (font: typeof FONTS[0]) => void;
  onSelectDoodle: (doodle: typeof DOODLES[0]) => void;
};

export default function PreviewModals({
  showFontPreview,
  showDoodlePreview,
  onCloseFontPreview,
  onCloseDoodlePreview,
  onSelectFont,
  onSelectDoodle,
}: PreviewModalsProps) {
  return (
    <>
      {/* Font Preview Modal */}
      {showFontPreview && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" 
          onClick={onCloseFontPreview}
        >
          <div 
            className="bg-[#FFFDF5] rounded-2xl p-6 max-w-md w-[90%] shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-['Abril_Fatface'] text-2xl text-[#3A332A] mb-4 text-center">
              Choose Font Style
            </h3>
            <div className="space-y-3">
              {FONTS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => onSelectFont(font)}
                  className="w-full p-4 bg-[#F0E6D2] hover:bg-[#E6B89C] rounded-lg transition-colors text-left border-2 border-transparent hover:border-[#8C7B66]"
                  style={{ fontFamily: font.value }}
                >
                  <div className="text-xs text-[#8C7B66] mb-1">{font.label}</div>
                  <div className="text-lg text-[#2A231A]">
                    The quick brown fox jumps over the lazy dog
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={onCloseFontPreview}
              className="mt-4 w-full py-2 bg-[#8C7B66] text-white rounded-lg hover:bg-[#6b5d4d] transition-colors font-[Architects_Daughter]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Doodle Preview Modal */}
      {showDoodlePreview && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" 
          onClick={onCloseDoodlePreview}
        >
          <div 
            className="bg-[#FFFDF5] rounded-2xl p-6 max-w-md w-[90%] shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-['Abril_Fatface'] text-2xl text-[#3A332A] mb-4 text-center">
              Choose Doodle
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {DOODLES.map((doodle, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectDoodle(doodle)}
                  className="p-4 bg-[#F0E6D2] hover:bg-[#E6B89C] rounded-lg transition-colors border-2 border-transparent hover:border-[#8C7B66] flex flex-col items-center gap-2"
                >
                  <svg 
                    width="60" 
                    height="60" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#5C5043" 
                    strokeWidth="1.2" 
                    className="doodle-ink"
                  >
                    <path d={doodle.path} />
                  </svg>
                  <div className="text-xs text-[#8C7B66] text-center">{doodle.label}</div>
                </button>
              ))}
            </div>
            <button
              onClick={onCloseDoodlePreview}
              className="mt-4 w-full py-2 bg-[#8C7B66] text-white rounded-lg hover:bg-[#6b5d4d] transition-colors font-[Architects_Daughter]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}