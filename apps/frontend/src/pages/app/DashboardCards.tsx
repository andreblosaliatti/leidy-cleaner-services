import { Link } from 'react-router-dom';

type DashboardCard = {
  title: string;
  description: string;
  href?: string;
};

type DashboardCardsProps = {
  items: DashboardCard[];
};

export function DashboardCards({ items }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <DashboardCardItem key={item.title} item={item} />
      ))}
    </div>
  );
}

function DashboardCardItem({ item }: { item: DashboardCard }) {
  const content = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-lg font-black text-green-700">
        {item.title.charAt(0)}
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
    </>
  );

  if (item.href) {
    return (
      <Link
        className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition hover:border-green-100 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
        to={item.href}
      >
        {content}
      </Link>
    );
  }

  return <article className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">{content}</article>;
}

export function DashboardHeader({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-lg border border-green-100 bg-white p-5 shadow-sm md:p-7">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">Resumo</p>
      <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-900 md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
    </section>
  );
}
