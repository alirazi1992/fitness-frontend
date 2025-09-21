"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCoaches } from "@/lib/api";
import type { CoachSummary } from "@/lib/types";

const NAV_ITEMS = [
  "Dashboard",
  "Clients",
  "Groups",
  "Templates",
  "Calendar",
  "Chats",
  "Help",
];

const loadingRows = Array.from({ length: 5 });

export default function CoachesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: getCoaches,
  });

  const coaches = useMemo(() => data ?? [], [data]);
  const rosterSize = coaches.length;
  const uniqueSpecializations = useMemo(() => {
    const set = new Set<string>();
    coaches.forEach((coach) => set.add(coach.specialization));
    return set.size;
  }, [coaches]);

  const statBlocks = useMemo(
    () => [
      {
        label: "Revenue",
        value: "$876.00",
        helper: "+17% week",
        accent: "bg-[#f3ff47] text-[#1f1f1f]",
      },
      {
        label: "Service revenue",
        value: "$435.00",
        helper: "$355.00 + $80.00",
        accent: "bg-[#1f1f1f] text-slate-100 border border-[#2a2a2a]",
      },
      {
        label: "Earned today",
        value: "$344.00",
        helper: "+27% vs prev",
        accent: "bg-[#141414] text-slate-100 border border-[#2a2a2a]",
      },
    ],
    []
  );

  return (
    <div className="relative -mx-4 -mt-4 min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 pb-10 pt-8 md:-mx-8 md:px-8">
      <AmbientBackdrop />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 font-[\'Satoshi\',\'Inter\',sans-serif] text-slate-100">
        <div className="flex flex-1 flex-col gap-6 rounded-[2.75rem] border border-[#9abfd7]/60 bg-[#0f0f0f] shadow-[0_40px_120px_-60px_rgba(10,10,10,0.85)] md:flex-row">
          <Sidebar />
          <section className="flex-1 rounded-[2.75rem] rounded-l-none bg-[#131313] px-6 py-8 md:px-10">
            <TopBar
              rosterSize={rosterSize}
              uniqueSpecializations={uniqueSpecializations}
            />
            <KpiRow stats={statBlocks} />
            <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_320px]">
              <RosterBoard isLoading={isLoading} coaches={coaches} />
              <ActivityPanel />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="flex w-full flex-col gap-10 rounded-[2.75rem] rounded-r-none bg-[#101010] px-6 py-10 md:w-64">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.5em] text-[#f3ff47]">
          Fit Space
        </p>
        <p className="text-xs text-slate-400">Performance OS</p>
      </div>
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item, index) => (
          <button
            key={item}
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
              index === 1
                ? "bg-[#1f1f1f] text-slate-100 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)]"
                : "text-slate-400 hover:bg-[#191919] hover:text-slate-100"
            }`}
          >
            <span>{item}</span>
            <span className="text-xs text-slate-500">-</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-2 text-xs text-slate-500">
        <p>Settings</p>
        <button className="text-[#59d7ff]">Log out</button>
      </div>
    </aside>
  );
}

function TopBar({
  rosterSize,
  uniqueSpecializations,
}: {
  rosterSize: number;
  uniqueSpecializations: number;
}) {
  return (
    <header className="flex flex-col gap-6 border-b border-[#1f1f1f] pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          Income report
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          {rosterSize.toString().padStart(2, "0")} active coaches -{" "}
          {uniqueSpecializations} specialties
        </p>
      </div>
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
        <div className="relative flex w-full items-center sm:w-64">
          <input
            aria-label="Search"
            className="w-full rounded-full border border-[#222222] bg-[#181818] px-5 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-[#59d7ff] focus:outline-none"
            defaultValue="Search"
            readOnly
          />
          <span className="pointer-events-none absolute right-4 text-xs text-slate-500">
            ?
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-[#1f1f1f] bg-[#181818] px-3 py-2 text-xs text-slate-300">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#59d7ff] to-[#1f1f1f]" />
          <div>
            <p className="text-sm font-semibold text-slate-100">Mike Wilson</p>
            <p className="text-[11px] text-slate-500">Coach success lead</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function KpiRow({
  stats,
}: {
  stats: Array<{
    label: string;
    value: string;
    helper: string;
    accent: string;
  }>;
}) {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value, helper, accent }) => (
        <div
          key={label}
          className={`flex flex-col justify-between rounded-2xl px-6 py-5 text-sm shadow-[0_24px_50px_-30px_rgba(0,0,0,0.8)] ${accent}`}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em]">
            <span>{label}</span>
            <span className="rounded-full border border-black/10 bg-black/10 px-2 py-0.5 text-[10px]">
              +17%
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-3 text-xs opacity-70">{helper}</p>
        </div>
      ))}
    </section>
  );
}

function RosterBoard({
  isLoading,
  coaches,
}: {
  isLoading: boolean;
  coaches: CoachSummary[];
}) {
  return (
    <section className="rounded-3xl border border-[#1f1f1f] bg-[#141414] p-6 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <h2 className="text-lg font-semibold text-slate-100">Schedule</h2>
        <span className="rounded-full border border-[#2a2a2a] bg-[#181818] px-3 py-1 text-xs text-slate-500">
          This week
        </span>
      </div>
      <div className="mt-6 divide-y divide-[#1f1f1f]">
        {isLoading
          ? loadingRows.map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4"
              >
                <div className="h-9 w-9 rounded-2xl bg-[#1f1f1f]" />
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded-full bg-[#1d1d1d]" />
                  <div className="h-3 w-32 rounded-full bg-[#1a1a1a]" />
                </div>
                <div className="h-6 w-20 rounded-full bg-[#1d1d1d]" />
              </div>
            ))
          : coaches.map((coach) => (
              <div
                key={coach.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 text-sm text-slate-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1f1f1f] text-xs font-semibold text-[#f3ff47]">
                  {coach.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {coach.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {coach.specialization}
                  </p>
                </div>
                <a
                  className="rounded-full bg-[#181818] px-4 py-2 text-xs font-semibold text-[#59d7ff] transition hover:bg-[#202020]"
                  href={`/coaches/${coach.id}`}
                >
                  View
                </a>
              </div>
            ))}
      </div>
    </section>
  );
}

function ActivityPanel() {
  return (
    <aside className="flex h-full flex-col gap-4 rounded-3xl border border-[#1f1f1f] bg-[#141414] p-6 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100">
          Clients activity
        </h3>
        <span className="rounded-full border border-[#2a2a2a] bg-[#181818] px-3 py-1 text-[11px] text-slate-500">
          All
        </span>
      </div>
      <div className="space-y-4 text-sm text-slate-300">
        {[
          {
            name: "Mark Smith",
            activity: "Added 2 photos in Food Diary",
            time: "15 min",
          },
          {
            name: "Sarah Perry",
            activity: "Shared 4 progress photos",
            time: "1 h",
          },
          {
            name: "Lukas Tapia",
            activity: "Uploaded a new video",
            time: "2 h",
          },
        ].map(({ name, activity, time }) => (
          <div key={name} className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#59d7ff] to-[#181818]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-100">{name}</p>
              <p className="text-xs text-slate-500">{activity}</p>
            </div>
            <span className="text-[11px] text-slate-500">{time}</span>
          </div>
        ))}
      </div>
      <button className="mt-auto inline-flex items-center justify-center rounded-full bg-[#f3ff47] px-4 py-2 text-xs font-semibold text-[#1f1f1f] transition hover:bg-[#e4f53c]">
        View all
      </button>
      <div className="mt-4 rounded-3xl border border-[#1f1f1f] bg-[#181818] p-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          Task completion
        </p>
        <div className="mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-[#59d7ff]/60 text-2xl font-semibold text-[#59d7ff]">
          71%
        </div>
        <button className="mt-5 inline-flex items-center justify-center rounded-full bg-[#1f1f1f] px-4 py-2 text-xs font-semibold text-[#59d7ff] transition hover:bg-[#252525]">
          View breakdown
        </button>
      </div>
    </aside>
  );
}

function AmbientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.2),transparent_45%)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.12)_2px,transparent_2px,transparent_40px)] opacity-10" />
    </div>
  );
}
