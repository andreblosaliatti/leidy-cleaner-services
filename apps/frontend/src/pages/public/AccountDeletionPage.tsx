import { useEffect } from 'react';

import { PublicButton } from '../../components/public/PublicButton';

const deletionRequestItems = [
  'Nome completo;',
  'E-mail cadastrado no app;',
  'Telefone cadastrado, se houver;',
  'Solicitação clara de exclusão da conta.',
];

export function AccountDeletionPage() {
  useEffect(() => {
    document.title = 'Exclusão de conta | Leidy Cleaner Services';
  }, []);

  return (
    <main className="px-4 py-8 sm:px-5 md:px-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.14),_transparent_45%),linear-gradient(135deg,_rgba(248,250,252,0.98),_rgba(240,249,255,0.96))] px-5 py-8 md:px-8 md:py-10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Página pública</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">Exclusão de conta</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              Solicite a exclusão da sua conta e dos dados associados ao app Leidy Cleaner Profissional.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PublicButton href="mailto:leidycleaner@gmail.com?subject=Exclus%C3%A3o%20de%20conta">
                Solicitar exclusão por e-mail
              </PublicButton>
            </div>
          </div>

          <div className="grid gap-8 px-5 py-8 md:px-8 md:py-10">
            <section className="grid gap-4">
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                A Leidy Cleaner Services permite que profissionais cadastradas solicitem a exclusão de sua conta e
                dos dados associados ao aplicativo Leidy Cleaner Profissional.
              </p>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                Para solicitar a exclusão, envie um e-mail para{' '}
                <a className="font-bold text-cyan-700 transition hover:text-cyan-800" href="mailto:leidycleaner@gmail.com">
                  leidycleaner@gmail.com
                </a>{' '}
                com o assunto &quot;Exclusão de conta&quot;.
              </p>
            </section>

            <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <h2 className="text-lg font-black text-slate-900">No corpo da mensagem, informe:</h2>
              <ul className="grid gap-3 text-sm leading-7 text-slate-600 md:text-base">
                {deletionRequestItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid gap-4">
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                Após o recebimento da solicitação, a Leidy Cleaner Services poderá confirmar a identidade da
                solicitante antes de executar a exclusão, para proteger a conta contra pedidos indevidos.
              </p>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                A exclusão da conta removerá ou anonimizará os dados associados ao cadastro, quando aplicável.
                Alguns dados poderão ser mantidos pelo período necessário para cumprimento de obrigações legais,
                fiscais, contratuais, operacionais, segurança, prevenção a fraude ou resolução de disputas.
              </p>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                A desativação temporária da conta não substitui a exclusão definitiva quando a exclusão for
                solicitada e aplicável.
              </p>
              <p className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm font-medium leading-7 text-cyan-900 md:text-base">
                Esta página é pública e não exige login para o envio da solicitação.
              </p>
            </section>

            <section className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">E-mail para solicitação</p>
                <a className="mt-2 inline-flex text-base font-bold text-cyan-700 transition hover:text-cyan-800" href="mailto:leidycleaner@gmail.com">
                  leidycleaner@gmail.com
                </a>
              </div>
              <PublicButton className="sm:min-w-[260px]" href="mailto:leidycleaner@gmail.com?subject=Exclus%C3%A3o%20de%20conta">
                Solicitar exclusão por e-mail
              </PublicButton>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
