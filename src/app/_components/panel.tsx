import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[2rem] border border-[#1f2329] bg-[var(--color-panel)] px-6 py-6 ${className}`.trim()}
    >
      {children}
    </section>
  );
}

