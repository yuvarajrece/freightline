import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-ink-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
      <p className="font-display text-xl font-semibold text-ink-900">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-ink-600">{description}</p> : null}
    </div>
  );
}
