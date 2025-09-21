import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#1f1f1f] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--color-accent-blue)]">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-[color:var(--color-text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-shrink-0 gap-3">{actions}</div> : null}
    </header>
  );
}

