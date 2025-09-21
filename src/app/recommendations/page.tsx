"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { z } from "zod";
import { recommendCoaches } from "@/lib/api";
import type { FitnessGoal, RecommendedCoachDto } from "@/lib/types";
import { ApiError } from "@/lib/http";
import { PageHeader } from "../_components/page-header";
import { Panel } from "../_components/panel";

const GOAL_OPTIONS: ReadonlyArray<{ value: FitnessGoal; label: string }> = [
  { value: "GeneralFitness", label: "General fitness" },
  { value: "WeightLoss", label: "Weight loss" },
  { value: "MuscleGain", label: "Muscle gain" },
  { value: "Endurance", label: "Endurance" },
  { value: "Flexibility", label: "Flexibility" },
  { value: "Rehab", label: "Rehab" },
] as const;

const goalSchema = z
  .union([
    z.literal(""),
    z.enum(GOAL_OPTIONS.map((option) => option.value) as [string, ...string[]]),
    z.undefined(),
  ])
    .transform((value) => (value === "" || value === undefined ? undefined : (value as FitnessGoal)));

const optionalCurrency = z
  .union([z.literal(""), z.coerce.number().min(0, "Must be positive"), z.undefined()])
  .transform((value) => (value === "" || value === undefined ? undefined : value));

const coordinate = z
  .union([z.literal(""), z.coerce.number(), z.undefined()])
  .transform((value) => (value === "" || value === undefined ? undefined : value));

const discoverySchema = z
  .object({
    goal: goalSchema,
    budgetMin: optionalCurrency,
    budgetMax: optionalCurrency,
    maxDistanceKm: z.coerce.number().min(1).max(150).default(15),
    take: z.coerce.number().min(1).max(20).default(6),
    locationMode: z.enum(["auto", "manual"]).default("auto"),
    latitude: coordinate.refine(
      (value) => value === undefined || (value >= -90 && value <= 90),
      { message: "Latitude must be between -90 and 90" },
    ),
    longitude: coordinate.refine(
      (value) => value === undefined || (value >= -180 && value <= 180),
      { message: "Longitude must be between -180 and 180" },
    ),
  })
  .refine(
    (values) =>
      values.locationMode === "auto" ||
      (values.latitude !== undefined && values.longitude !== undefined),
    {
      message: "Provide latitude and longitude",
      path: ["latitude"],
    },
  )
  .refine(
    (values) =>
      values.budgetMin === undefined ||
      values.budgetMax === undefined ||
      values.budgetMin <= values.budgetMax,
    {
      message: "Budget min must be less than max",
      path: ["budgetMax"],
    },
  );

type DiscoveryFormValues = z.infer<typeof discoverySchema>;

type GeoStatus = "idle" | "loading" | "success" | "error";

export default function RecommendationsPage() {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoMessage, setGeoMessage] = useState<string>(
    "Use automatic location or enter coordinates.",
  );
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DiscoveryFormValues>({
    resolver: zodResolver(discoverySchema),
    defaultValues: {
      goal: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      maxDistanceKm: 15,
      take: 6,
      locationMode: "auto",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const locationMode = watch("locationMode");

  useEffect(() => {
    if (locationMode !== "auto") return;
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoMessage("Geolocation not supported. Switch to manual entry.");
      return;
    }
    setGeoStatus("loading");
    setGeoMessage("Locating...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setGeoStatus("success");
        setGeoMessage(
          `Location set (lat ${position.coords.latitude.toFixed(2)}, lon ${position.coords.longitude.toFixed(2)})`,
        );
      },
      () => {
        setCoords(null);
        setGeoStatus("error");
        setGeoMessage("We could not access your location. Enter coordinates manually.");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [locationMode]);

  const { mutate, data, isPending, error } = useMutation({
    mutationFn: async (values: DiscoveryFormValues) => {
      const location =
        values.locationMode === "manual"
          ? values.latitude !== undefined && values.longitude !== undefined
            ? { lat: values.latitude, lon: values.longitude }
            : null
          : coords;

      if (!location) {
        throw new ApiError(
          "Location not available. Allow automatic access or enter coordinates manually.",
        );
      }

      const payload = {
        goal: values.goal,
        budgetMin: values.budgetMin,
        budgetMax: values.budgetMax,
        latitude: location.lat,
        longitude: location.lon,
        maxDistanceKm: values.maxDistanceKm,
        take: values.take,
      };

      return recommendCoaches(payload);
    },
  });

  const handleSearch = (values: DiscoveryFormValues) => {
    setHasRequested(true);
    mutate(values);
  };

  const resultSummary = useMemo(() => {
    if (!data || !data.length) return null;
    const avgRating = (
      data.reduce((total, coach) => total + coach.avgRating, 0) / data.length
    ).toFixed(1);
    const avgPrice = (
      data.reduce((total, coach) => total + coach.minPlanPrice, 0) / data.length
    ).toFixed(0);
    return { avgRating, avgPrice };
  }, [data]);

  return (
    <div className="flex min-h-full flex-col gap-8 bg-[var(--color-surface)] px-6 py-8 text-sm text-[color:var(--color-text-secondary)] lg:px-10 lg:py-12">
      <PageHeader
        eyebrow="Discovery"
        title="Find the coach that fits your stack"
        subtitle="Filter by goals, budget, and distance. We will surface coaches ranked by fit and proximity."
        actions={
          <Link
            className="rounded-full border border-[var(--color-accent-blue)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-blue)] transition hover:bg-[var(--color-accent-blue)]/10"
            href="/coaches/workspace"
          >
            Coach workspace
          </Link>
        }
      />

      <Panel className="bg-[#16181d]">
        <form
          className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"
          onSubmit={handleSubmit(handleSearch)}
        >
          <section className="space-y-6">
            <fieldset className="rounded-[1.75rem] border border-[#1f2329] bg-[var(--color-panel)] px-5 py-5">
              <legend className="text-xs uppercase tracking-[0.4em] text-[var(--color-accent-blue)]">
                Location source
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setValue("locationMode", "auto", { shouldValidate: false })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    locationMode === "auto"
                      ? "bg-[var(--color-accent-yellow)] text-[#111]"
                      : "border border-[#1f2329] text-[color:var(--color-text-secondary)] hover:text-white"
                  }`}
                >
                  Use my location
                </button>
                <button
                  type="button"
                  onClick={() => setValue("locationMode", "manual", { shouldValidate: false })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    locationMode === "manual"
                      ? "bg-[var(--color-accent-yellow)] text-[#111]"
                      : "border border-[#1f2329] text-[color:var(--color-text-secondary)] hover:text-white"
                  }`}
                >
                  Enter coordinates
                </button>
              </div>
              <p
                className={`mt-4 text-xs ${
                  geoStatus === "error"
                    ? "text-[#ff9a9a]"
                    : geoStatus === "success"
                    ? "text-[var(--color-accent-blue)]"
                    : "text-[color:var(--color-text-secondary)]"
                }`}
              >
                {geoMessage}
              </p>
              {locationMode === "manual" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="text-xs uppercase tracking-[0.35em]"
                      htmlFor="latitude"
                    >
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      {...register("latitude")}
                      id="latitude"
                      className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                      placeholder="24.7136"
                    />
                    {errors.latitude ? <FieldError message={errors.latitude.message} /> : null}
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs uppercase tracking-[0.35em]"
                      htmlFor="longitude"
                    >
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      {...register("longitude")}
                      id="longitude"
                      className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                      placeholder="46.6753"
                    />
                    {errors.longitude ? <FieldError message={errors.longitude.message} /> : null}
                  </div>
                </div>
              ) : null}
            </fieldset>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  className="text-xs uppercase tracking-[0.35em]"
                  htmlFor="goal"
                >
                  Goal
                </label>
                <select
                  {...register("goal")}
                  id="goal"
                  className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                >
                  <option value="">Any focus</option>
                  {GOAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs uppercase tracking-[0.35em]"
                  htmlFor="maxDistanceKm"
                >
                  Max distance (km)
                </label>
                <input
                  type="number"
                  {...register("maxDistanceKm")}
                  id="maxDistanceKm"
                  className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs uppercase tracking-[0.35em]"
                  htmlFor="budgetMin"
                >
                  Budget min ($)
                </label>
                <input
                  type="number"
                  {...register("budgetMin")}
                  id="budgetMin"
                  className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                />
                {errors.budgetMin ? <FieldError message={errors.budgetMin.message} /> : null}
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs uppercase tracking-[0.35em]"
                  htmlFor="budgetMax"
                >
                  Budget max ($)
                </label>
                <input
                  type="number"
                  {...register("budgetMax")}
                  id="budgetMax"
                  className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                />
                {errors.budgetMax ? <FieldError message={errors.budgetMax.message} /> : null}
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs uppercase tracking-[0.35em]"
                  htmlFor="take"
                >
                  Results
                </label>
                <input
                  type="number"
                  {...register("take")}
                  id="take"
                  className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent-yellow)] px-6 py-3 text-sm font-semibold text-[#111] transition hover:bg-[#e4f540] disabled:opacity-60"
            >
              {isPending ? "Searching..." : "Show recommendations"}
            </button>
            {error ? <FieldError message={error.message} /> : null}
          </section>

          <aside className="flex flex-col gap-4 rounded-[1.75rem] border border-[#1f2329] bg-[var(--color-panel)] px-6 py-6 text-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-accent-yellow)]">
              Quick tips
            </p>
            <ul className="space-y-3 text-sm leading-6">
              <li>- Combine a primary goal with a budget band to narrow results.</li>
              <li>
                - If you train while travelling, enter manual coordinates for the city you are visiting.
              </li>
              <li>
                - Increase the results limit to explore more coaches or keep it tight for fast decisions.
              </li>
            </ul>
            <div className="rounded-2xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-xs text-[color:var(--color-text-secondary)]">
              We surface coaches with verified plans, strong reviews, and nearby gyms first.
            </div>
          </aside>
        </form>
      </Panel>

      <Panel className="bg-[#16181d]">
        {isPending ? (
          <LoadingResults />
        ) : data && data.length ? (
          <div className="space-y-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Top matches</h2>
                <p>Based on your filters and proximity.</p>
              </div>
              {resultSummary ? (
                <div className="flex gap-3 text-xs">
                  <Badge label={`Avg rating ${resultSummary.avgRating}`} />
                  <Badge label={`Plans from $${resultSummary.avgPrice}`} />
                </div>
              ) : null}
            </header>
            <ul className="grid gap-4 xl:grid-cols-2">
              {data.map((coach) => (
                <ResultCard key={`${coach.coachId}-${coach.gymId}`} coach={coach} />
              ))}
            </ul>
          </div>
        ) : hasRequested ? (
          <EmptyResults message="No coaches matched those filters. Try adjusting goal, distance, or budget." />
        ) : (
          <EmptyResults message="Run a search to view personalised recommendations." />
        )}
      </Panel>
    </div>
  );
}

function ResultCard({ coach }: { coach: RecommendedCoachDto }) {
  return (
    <li className="flex h-full flex-col justify-between rounded-[1.75rem] border border-[#1f2329] bg-[var(--color-panel)] px-6 py-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-white">{coach.coachName}</p>
            <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-secondary)]">
              {coach.specialization}
            </p>
          </div>
          <div className="text-right text-xs text-[color:var(--color-text-secondary)]">
            <p className="text-sm font-semibold text-[var(--color-accent-yellow)]">
              {coach.avgRating.toFixed(1)} / 5
            </p>
            <p>{coach.reviewsCount} reviews</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-xs">
          <p className="text-[color:var(--color-text-secondary)]">
            Training out of <span className="font-semibold text-white">{coach.gymName}</span> - {coach.distanceKm.toFixed(1)} km away - plans from
            <span className="font-semibold text-white"> ${coach.minPlanPrice.toFixed(0)}</span>
          </p>
          {coach.matchingPlanTitles?.length ? (
            <p className="mt-2 text-[color:var(--color-text-secondary)]">
              Matches: {coach.matchingPlanTitles.join(", ")}
            </p>
          ) : null}
        </div>
      </div>
      <Link
        href={`/coaches/${coach.coachId}`}
        className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-accent-blue)] px-5 py-2 text-sm font-semibold text-[#051923] transition hover:bg-[#4fcfff]"
      >
        View coach profile
        <span aria-hidden="true">-&gt;</span>
      </Link>
    </li>
  );
}

function EmptyResults({ message }: { message: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-[#1f2329] bg-[#121318] px-6 py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
      {message}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#1f2329] bg-[#101115] px-4 py-2 text-xs font-semibold text-[color:var(--color-text-secondary)]">
      {label}
    </span>
  );
}

function LoadingResults() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-48 animate-pulse rounded-[1.75rem] border border-[#1f2329] bg-[#121318]"
        />
      ))}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[#ff9a9a]">{message}</p>;
}

