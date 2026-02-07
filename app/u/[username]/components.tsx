/**
 * Shared UI Components for User Dashboard
 * 
 * Reusable visual elements used across the dashboard pages.
 */

export const Postmark = ({ date = "FEB 26", location = "KINO" }) => (
  <div className="absolute -right-5 -top-5 z-20 h-24 w-24 opacity-60 pointer-events-none mix-blend-multiply rotate-[25deg] overflow-hidden">
    <div className="absolute inset-0 rounded-full border-[2px] border-slate-800/60" />
    <div className="absolute inset-1 rounded-full border border-slate-800/40" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
      <div className="text-[6px] font-bold uppercase tracking-widest text-slate-800/70 font-serif">
        {location} ARCHIVE
      </div>
      <div className="text-[10px] font-bold text-slate-900/80 leading-tight">
        {date}
      </div>
    </div>
    <div className="absolute top-1/2 -left-4 w-32 border-t border-slate-800/50 rotate-[-15deg]" />
    <div className="absolute top-1/2 -left-4 w-32 border-t border-slate-800/50 rotate-[-15deg] mt-1.5" />
  </div>
);

export const PaperTexture = () => (
  <div
    className="absolute inset-0 opacity-30 pointer-events-none z-10 mix-blend-multiply"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
    }}
  />
);