import Link from "next/link";
import { PageHeader } from "./_components/page-header";
import { Panel } from "./_components/panel";

const METRICS = [
  {
    label: "Active coaches",
    value: "42",
    helper: "Verified this week",
    accent: "text-[var(--color-accent-yellow)]",
  },
  {
    label: "Partner gyms",
    value: "68",
    helper: "Across 12 cities",
    accent: "text-[var(--color-accent-blue)]",
  },
  {
    label: "Average rating",
    value: "4.9",
    helper: "Based on client reviews",
    accent: "text-white",
  },
];

const QUICK_ACTIONS = [
  {
    title: "Find a coach",
    description:
      "Answer a few questions about your goals, budget, and schedule, then let the system recommend a perfect match.",
    href: "/recommendations",
  },
  {
    title: "Explore gyms",
    description:
      "Filter hubs by distance, equipment stack, and coaches on the floor so you can train where it makes sense.",
    href: "/gyms",
  },
  {
    title: "Coach workspace",
    description:
      "Invite your coaching team to upload plans, share history, and showcase progress with portfolio posts.",
    href: "/coaches",
  },
];

const TIMELINE = [
  {
    title: "Coach onboarding",
    detail: "Set up verification, connect gym locations, and publish portfolio posts.",
  },
  {
    title: "Client discovery",
    detail: "Clients filter by body goal, training style, budget, and travel radius to see personalised results.",
  },
  {
    title: "Feedback loop",
    detail: "Reviews and plan iterations stay visible to both sides so programmes evolve in real time.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col gap-8 bg-[var(--color-surface)] px-6 py-8 text-sm text-[color:var(--color-text-secondary)] lg:px-10 lg:py-12">
      <PageHeader
        eyebrow="Fitness network"
        title="The operating system for elite coaching"
        subtitle="Connect coaches, gyms, and clients with one adaptive workflow."
        actions={
          <>
            <PrimaryLink href="/recommendations">Match me now</PrimaryLink>
            <GhostLink href="/coaches">Invite a coach</GhostLink>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {METRICS.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Panel className="bg-[#16181d]">
        <div className="grid gap-6 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <article
              key={action.title}
              className="group flex h-full flex-col gap-4 rounded-[1.75rem] border border-[#1f2329] bg-[var(--color-panel)] px-6 py-6 transition hover:border-[var(--color-accent-blue)]"
            >
              <p className="text-base font-semibold text-white">{action.title}</p>
              <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                {action.description}
              </p>
              <Link
                href={action.href}
                className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-blue)] transition group-hover:translate-x-1"
              >
                Start now
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </article>
          ))}
        </div>
      </Panel>

      <Panel className="bg-[#16181d]">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">How the platform flows</h2>
            <ul className="space-y-4 text-sm leading-6">
              {TIMELINE.map((item) => (
                <li key={item.title} className="rounded-[1.5rem] border border-[#1f2329] bg-[var(--color-panel)] px-5 py-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-[color:var(--color-text-secondary)]">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[#1f2329] bg-[var(--color-panel)] px-6 py-6 text-xs text-[color:var(--color-text-secondary)]">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-accent-yellow)]">Roadmap</p>
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-white">Coach CRM</p>
              <p>Track plans, payments, and progress in one integrated workspace.</p>
            </div>
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-white">Client portal</p>
              <p>Clients review programmes, log feedback, and schedule gym sessions.</p>
            </div>
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-white">Insights</p>
              <p>Analytics dashboards highlight retention, load, and utilisation trends.</p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  accent: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-[#1f2329] bg-[#16181d] px-6 py-6">
      <p className="text-xs uppercase tracking-[0.45em] text-[color:var(--color-text-secondary)]">{label}</p>
      <p className={`mt-4 text-3xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">{helper}</p>
    </div>
  );
}

function PrimaryLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent-yellow)] px-5 py-3 text-sm font-semibold text-[#0f1012] transition hover:bg-[#e4f540]"
    >
      {children}
    </Link>
  );
}

function GhostLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-[var(--color-accent-blue)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-blue)] transition hover:bg-[var(--color-accent-blue)]/10"
    >
      {children}
    </Link>
  );
}

