import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-[980px] px-5 py-16 text-center md:px-8">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-700">Página não encontrada</p>
      <h1 className="mt-4 text-4xl font-black tracking-normal text-slate-900">Não encontramos esse caminho.</h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
        Volte para o início ou acesse sua conta para continuar dentro da plataforma.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link className="rounded-lg bg-cyan-700 px-6 py-3 text-sm font-black text-white hover:bg-cyan-800" to="/">
          Ir para o início
        </Link>
        <Link className="rounded-lg border border-cyan-700 px-6 py-3 text-sm font-black text-cyan-700 hover:bg-cyan-50" to="/entrar">
          Entrar
        </Link>
      </div>
    </main>
  );
}
