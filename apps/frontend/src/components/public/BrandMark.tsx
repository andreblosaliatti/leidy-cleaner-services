type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <a href="/" className="flex items-center gap-3" aria-label="Leidy Cleaner Services - início">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 shadow-[0_10px_30px_rgba(22,101,52,0.12)] ring-1 ring-green-100">
        <span className="text-3xl font-black leading-none">L</span>
        <span className="absolute bottom-2 h-1.5 w-8 rounded-full bg-lime-400" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-3xl font-black tracking-wide text-green-700">LEIDY</span>
          <span className="mt-1 block text-[0.65rem] font-black uppercase tracking-[0.28em] text-slate-600">
            Cleaner Services
          </span>
        </span>
      )}
    </a>
  );
}
