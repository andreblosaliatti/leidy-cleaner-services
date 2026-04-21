import { apiBaseUrl } from '../lib/env';

export function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
        <p className="text-sm font-semibold uppercase text-emerald-700">
          Fundacao tecnica
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Leidy Cleaner Services
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
          Plataforma operacional para intermediacao de servicos de limpeza residencial.
        </p>
        <div className="mt-8 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">API configurada</p>
          <p className="mt-2 break-all font-mono text-sm text-slate-900">{apiBaseUrl}</p>
        </div>
      </section>
    </main>
  );
}
