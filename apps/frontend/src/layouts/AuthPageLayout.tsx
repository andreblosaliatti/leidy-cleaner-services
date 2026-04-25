import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { BrandMark } from '../components/public/BrandMark';

type AuthPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthPageLayout({ eyebrow, title, description, children }: AuthPageLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f6f7f4] px-5 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 md:px-8">
          <BrandMark />
          <Link className="text-sm font-bold text-green-700 transition hover:text-green-800" to="/">
            Voltar ao início
          </Link>
        </header>

        <div className="grid flex-1 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-center bg-green-700 px-6 py-10 text-white md:px-10">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-green-100">{eyebrow}</p>
            <h1 className="mt-5 max-w-xl text-4xl font-black leading-tight tracking-normal md:text-5xl">{title}</h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-green-50">{description}</p>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-green-50">
              <span className="rounded-lg bg-white/10 px-4 py-3">Profissionais verificadas e fluxo acompanhado</span>
              <span className="rounded-lg bg-white/10 px-4 py-3">Contratação organizada com segurança operacional</span>
              <span className="rounded-lg bg-white/10 px-4 py-3">Dados protegidos em cada etapa da jornada</span>
            </div>
          </section>

          <section className="flex items-center justify-center px-5 py-8 md:px-10">
            <div className="w-full max-w-xl">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
