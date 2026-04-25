import { CheckCircleIcon, SparkleIcon } from './PublicIcons';

export function HeroCleanerPlaceholder() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-bl-[80px] bg-[linear-gradient(135deg,#eef9ea_0%,#ffffff_42%,#eef7f5_100%)] md:min-h-[470px]">
      <div className="absolute left-6 top-14 hidden text-green-200 md:block">
        <SparkleIcon className="h-12 w-12" />
      </div>
      <div className="absolute left-20 top-28 hidden text-lime-200 md:block">
        <SparkleIcon className="h-9 w-9" />
      </div>
      <div className="absolute bottom-0 right-4 h-[88%] w-[76%] rounded-t-[48%] bg-white/75 shadow-[inset_0_0_80px_rgba(21,128,61,0.08)]" />
      <div className="absolute bottom-0 right-10 flex h-[92%] w-[68%] items-end justify-center">
        <div className="relative h-[92%] w-full max-w-[360px]">
          <div className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2 rounded-full bg-[#f4c7a1] shadow-[0_18px_32px_rgba(15,23,42,0.12)]">
            <div className="absolute left-5 top-9 h-2 w-2 rounded-full bg-slate-800" />
            <div className="absolute right-5 top-9 h-2 w-2 rounded-full bg-slate-800" />
            <div className="absolute bottom-6 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full border-b-2 border-slate-700" />
          </div>
          <div className="absolute left-1/2 top-0 h-20 w-32 -translate-x-1/2 rounded-t-full bg-[#3b2d27]" />
          <div className="absolute left-1/2 top-[7.2rem] h-52 w-52 -translate-x-1/2 rounded-t-[42%] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.12)]" />
          <div className="absolute left-1/2 top-36 h-48 w-44 -translate-x-1/2 rounded-t-3xl bg-green-700 shadow-[0_18px_42px_rgba(21,128,61,0.28)]">
            <div className="absolute left-1/2 top-12 h-16 w-24 -translate-x-1/2 rounded-lg border-2 border-white/70">
              <span className="absolute left-1/2 top-4 -translate-x-1/2 text-2xl font-black text-white">L</span>
              <span className="absolute bottom-3 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-lime-300" />
            </div>
          </div>
          <div className="absolute bottom-20 left-2 h-20 w-28 -rotate-12 rounded-full bg-lime-300" />
          <div className="absolute bottom-20 right-1 h-20 w-28 rotate-12 rounded-full bg-lime-300" />
          <div className="absolute bottom-14 right-5 flex h-28 w-40 items-end justify-center rounded-b-[36px] rounded-t-lg border-4 border-green-700 bg-lime-100">
            <div className="h-24 w-8 rounded-t-lg bg-white shadow-sm" />
            <div className="mx-2 h-32 w-9 rounded-t-lg bg-white shadow-sm">
              <div className="mx-auto mt-2 h-4 w-5 rounded bg-green-500" />
            </div>
            <div className="h-20 w-7 rounded-t-lg bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfessionalCtaPlaceholder() {
  return (
    <div className="relative h-28 w-32 overflow-hidden rounded-lg bg-green-50">
      <div className="absolute left-1/2 top-3 h-12 w-12 -translate-x-1/2 rounded-full bg-[#f4c7a1]" />
      <div className="absolute left-1/2 top-1 h-10 w-16 -translate-x-1/2 rounded-t-full bg-[#3b2d27]" />
      <div className="absolute bottom-0 left-1/2 h-16 w-24 -translate-x-1/2 rounded-t-3xl bg-green-700" />
      <div className="absolute bottom-8 left-6 h-6 w-12 -rotate-12 rounded-full bg-lime-300" />
      <div className="absolute bottom-8 right-6 h-6 w-12 rotate-12 rounded-full bg-lime-300" />
    </div>
  );
}

export function HomeSparkPlaceholder() {
  return (
    <div className="flex h-24 w-28 items-center justify-center rounded-lg bg-green-50 text-green-700">
      <div className="relative h-16 w-16">
        <div className="absolute bottom-0 left-1 h-9 w-14 rounded-b-lg border-2 border-current" />
        <div className="absolute left-2 top-3 h-10 w-10 rotate-45 border-l-2 border-t-2 border-current" />
        <div className="absolute bottom-0 left-7 h-5 w-4 rounded-t border-2 border-current bg-white" />
        <CheckCircleIcon className="absolute -right-2 -top-1 h-7 w-7 text-lime-500" />
      </div>
    </div>
  );
}
