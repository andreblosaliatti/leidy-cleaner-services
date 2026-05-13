import { Link } from 'react-router-dom';

type ProfessionalMobilePlaceholderPageProps = {
  title: string;
  description: string;
  stageLabel: string;
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
};

export function ProfessionalMobilePlaceholderPage({
  title,
  description,
  stageLabel,
  primaryAction,
  secondaryAction,
}: ProfessionalMobilePlaceholderPageProps) {
  return (
    <div className="grid gap-4">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{stageLabel}</p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">Placeholder consciente</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Esta tela mobile existe para validar layout, navegacao e hierarquia visual. O fluxo operacional completo entra nas proximas milestones, sem mover regra de negocio para o frontend.
        </p>
        <div className="mt-5 grid gap-3">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-700 px-4 text-sm font-black text-white transition hover:bg-cyan-800"
            to={primaryAction.href}
          >
            {primaryAction.label}
          </Link>
          {secondaryAction && (
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              to={secondaryAction.href}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
