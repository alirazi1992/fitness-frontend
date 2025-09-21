import Link from "next/link";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/coaches", label: "Coaches" },
  { href: "/gyms", label: "Gyms" },
  { href: "/recommendations", label: "Recommendations" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] px-4 py-8 md:px-10">
      <div className="relative flex w-full flex-col gap-6 rounded-[2.75rem] border border-[#9abfd7]/60 bg-[var(--color-shell)] p-6 text-[color:var(--color-text-primary)] shadow-[var(--shadow-shell)] md:flex-row md:p-10">
        <aside className="flex w-full flex-shrink-0 flex-col gap-8 rounded-[2.5rem] border border-[#1f2329] bg-[var(--color-surface)] px-6 py-9 md:w-64">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.55em] text-[var(--color-accent-yellow)]">
              Fit Space
            </p>
            <p className="text-xs text-[color:var(--color-text-secondary)]">
              Performance network
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm font-medium">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-transparent bg-transparent px-4 py-3 text-left text-[color:var(--color-text-secondary)] transition hover:border-[#1f2329] hover:bg-[var(--color-panel)] hover:text-[color:var(--color-text-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-3 text-xs text-[color:var(--color-text-secondary)]">
            <p>Settings</p>
            <button className="rounded-full border border-[#1f2329] bg-transparent px-4 py-2 text-left font-semibold text-[var(--color-accent-blue)] transition hover:bg-[var(--color-panel)]">
              Sign out
            </button>
          </div>
        </aside>
        <div className="flex-1 overflow-hidden rounded-[2.5rem] border border-[#1f2329] bg-[var(--color-surface)]">
          <main className="relative h-full w-full overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
