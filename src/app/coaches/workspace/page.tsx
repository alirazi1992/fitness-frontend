"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  createPortfolioPost,
  createReview,
  createTrainingPlan,
  getPortfolioForCoach,
  getReviewsForCoach,
  getTrainingPlansForCoach,
} from "@/lib/api";
import type {
  PortfolioPost,
  Review,
  TrainingPlan,
} from "@/lib/types";
import { PageHeader } from "../../_components/page-header";
import { Panel } from "../../_components/panel";

const WORKSPACE_TABS = [
  { key: "portfolio", label: "Portfolio" },
  { key: "plans", label: "Training plans" },
  { key: "reviews", label: "Reviews" },
] as const;

const coachId = Number(process.env.NEXT_PUBLIC_COACH_ID ?? 1);

const portfolioSchema = z.object({
  title: z.string().min(3, "Add a descriptive title"),
  description: z
    .string()
    .min(10, "Share at least a sentence about the result or session."),
  mediaUrl: z
    .string()
    .url("Include a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

type PortfolioFormValues = z.infer<typeof portfolioSchema>;

const planSchema = z.object({
  name: z.string().min(3, "Give the plan a name"),
  focus: z.string().min(3, "Describe the focus"),
  price: z.coerce.number().min(0, "Set a non-negative price"),
  durationWeeks: z.coerce
    .number()
    .min(1, "Duration must be at least 1 week")
    .max(52, "Cap at 52 weeks"),
  description: z.string().optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

const reviewSchema = z.object({
  clientId: z.coerce.number().min(1, "Client ID required"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(5, "Add a short summary"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function CoachWorkspacePage() {
  const [activeTab, setActiveTab] = useState<(typeof WORKSPACE_TABS)[number]["key"]>(
    "portfolio",
  );

  return (
    <div className="flex min-h-full flex-col gap-8 bg-[var(--color-surface)] px-6 py-8 text-sm text-[color:var(--color-text-secondary)] lg:px-10 lg:py-12">
      <PageHeader
        eyebrow="Coach workspace"
        title="Publish wins, plans, and client feedback"
        subtitle="Manage everything your clients see in one operational console."
      />

      <nav className="flex flex-wrap gap-2 text-sm font-semibold">
        {WORKSPACE_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-5 py-2 transition ${
                isActive
                  ? "bg-[var(--color-accent-yellow)] text-[#111]"
                  : "border border-[#1f2329] bg-[var(--color-panel)] text-[color:var(--color-text-secondary)] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "portfolio" ? (
        <PortfolioTab />
      ) : activeTab === "plans" ? (
        <PlansTab />
      ) : (
        <ReviewsTab />
      )}
    </div>
  );
}

function PortfolioTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["portfolio", coachId],
    queryFn: () => getPortfolioForCoach(coachId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
  });

  const createMutation = useMutation({
    mutationFn: (values: PortfolioFormValues) =>
      createPortfolioPost({ coachId, ...values }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["portfolio", coachId] });
    },
  });

  return (
    <Panel className="bg-[#16181d]">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Recent portfolio drops</h2>
            <p>Showcase stand-out sessions, client transformations, and facility tours.</p>
          </div>
          {isLoading ? (
            <p>Loading portfolio...</p>
          ) : error ? (
            <ErrorMessage error={error} />
          ) : data && data.length ? (
            <ul className="space-y-4">
              {data.map((post: PortfolioPost) => (
                <li
                  key={post.id}
                  className="rounded-[1.5rem] border border-[#1f2329] bg-[var(--color-panel)] px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-white">{post.title}</p>
                      <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                        {post.description}
                      </p>
                      {post.mediaUrl ? (
                        <LinkOut href={post.mediaUrl}>View media</LinkOut>
                      ) : null}
                    </div>
                    <time className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-secondary)]">
                      {formatDate(post.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="No portfolio entries yet. Publish a story to get started." />
          )}
        </section>

        <section className="space-y-5 rounded-[1.75rem] border border-[#1f2329] bg-[var(--color-panel)] px-6 py-6">
          <div>
            <h3 className="text-base font-semibold text-white">Publish a new highlight</h3>
            <p className="text-xs text-[color:var(--color-text-secondary)]">
              Keep it short and link to deeper media when available.
            </p>
          </div>
          <form
            className="space-y-4 text-sm"
            onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          >
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.35em]">Title</label>
              <input
                type="text"
                {...register("title")}
                className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                placeholder="Hybrid strength + recovery"
              />
              {errors.title ? <FieldError message={errors.title.message} /> : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.35em]">Story</label>
              <textarea
                rows={4}
                {...register("description")}
                className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                placeholder="What was the goal? What did you unlock?"
              />
              {errors.description ? (
                <FieldError message={errors.description.message} />
              ) : null}
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.35em]">Media URL</label>
              <input
                type="url"
                {...register("mediaUrl")}
                className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                placeholder="https://..."
              />
              {errors.mediaUrl ? <FieldError message={errors.mediaUrl.message} /> : null}
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent-yellow)] px-5 py-3 text-sm font-semibold text-[#111] transition hover:bg-[#e4f540] disabled:opacity-60"
            >
              {createMutation.isPending ? "Publishing..." : "Publish highlight"}
            </button>
            {createMutation.isError ? (
              <FieldError message="Could not publish. Try again." />
            ) : null}
          </form>
        </section>
      </div>
    </Panel>
  );
}

function PlansTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["plans", coachId],
    queryFn: () => getTrainingPlansForCoach(coachId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: { durationWeeks: 8, price: 0 },
  });

  const createMutation = useMutation({
    mutationFn: (values: PlanFormValues) =>
      createTrainingPlan({ coachId, ...values }),
    onSuccess: () => {
      reset({ durationWeeks: 8, price: 0 });
      queryClient.invalidateQueries({ queryKey: ["plans", coachId] });
    },
  });

  return (
    <Panel className="bg-[#16181d]">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Live training plans</h2>
            <p>Outline deliverables, cadence, and pricing so clients understand the stack.</p>
          </div>
          {isLoading ? (
            <p>Loading plans...</p>
          ) : error ? (
            <ErrorMessage error={error} />
          ) : data && data.length ? (
            <ul className="space-y-4">
              {data.map((plan: TrainingPlan) => (
                <li
                  key={plan.id}
                  className="rounded-[1.5rem] border border-[#1f2329] bg-[var(--color-panel)] px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-white">{plan.name}</p>
                      <p className="text-sm text-[color:var(--color-text-secondary)]">
                        Focus: {plan.focus}
                      </p>
                      {plan.description ? (
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                          {plan.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right text-xs text-[color:var(--color-text-secondary)]">
                      <p className="text-sm font-semibold text-[var(--color-accent-blue)]">
                        ${plan.price.toFixed(2)}
                      </p>
                      <p>{plan.durationWeeks} weeks</p>
                      <p>{formatDate(plan.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="No plans published yet." />
          )}
        </section>

        <section className="space-y-5 rounded-[1.75rem] border border-[#1f2329] bg-[var(--color-panel)] px-6 py-6">
          <div>
            <h3 className="text-base font-semibold text-white">Add a plan</h3>
            <p className="text-xs text-[color:var(--color-text-secondary)]">
              Outline deliverables, duration, and price.
            </p>
          </div>
          <form
            className="space-y-4 text-sm"
            onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          >
            <Field
              label="Plan name"
              error={errors.name?.message}
              inputProps={{
                type: "text",
                placeholder: "Hybrid strength / 12-week",
                ...register("name"),
              }}
            />
            <Field
              label="Focus"
              error={errors.focus?.message}
              inputProps={{
                type: "text",
                placeholder: "Strength + mobility",
                ...register("focus"),
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Price"
                error={errors.price?.message}
                inputProps={{
                  type: "number",
                  step: "0.01",
                  ...register("price"),
                }}
              />
              <Field
                label="Duration (weeks)"
                error={errors.durationWeeks?.message}
                inputProps={{
                  type: "number",
                  ...register("durationWeeks"),
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.35em]">Description</label>
              <textarea
                rows={4}
                {...register("description")}
                className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                placeholder="Explain what clients receive each week."
              />
              {errors.description ? (
                <FieldError message={errors.description.message} />
              ) : null}
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent-yellow)] px-5 py-3 text-sm font-semibold text-[#111] transition hover:bg-[#e4f540] disabled:opacity-60"
            >
              {createMutation.isPending ? "Saving..." : "Publish plan"}
            </button>
            {createMutation.isError ? (
              <FieldError message="Could not save plan. Try again." />
            ) : null}
          </form>
        </section>
      </div>
    </Panel>
  );
}

function ReviewsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews", coachId],
    queryFn: () => getReviewsForCoach(coachId),
  });

  const averageRating = useMemo(() => {
    if (!data || !data.length) return null;
    const sum = data.reduce((total, review) => total + review.rating, 0);
    return (sum / data.length).toFixed(1);
  }, [data]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({ resolver: zodResolver(reviewSchema) });

  const createMutation = useMutation({
    mutationFn: (values: ReviewFormValues) =>
      createReview({ coachId, ...values }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["reviews", coachId] });
    },
  });

  return (
    <Panel className="bg-[#16181d]">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Client reviews</h2>
              <p>Keep an eye on sentiment, spot themes, and follow up quickly.</p>
            </div>
            {averageRating ? (
              <div className="rounded-2xl border border-[#1f2329] bg-[var(--color-panel)] px-4 py-3 text-right text-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-secondary)]">
                  Avg rating
                </p>
                <p className="text-2xl font-semibold text-[var(--color-accent-blue)]">{averageRating}</p>
              </div>
            ) : null}
          </div>
          {isLoading ? (
            <p>Loading reviews...</p>
          ) : error ? (
            <ErrorMessage error={error} />
          ) : data && data.length ? (
            <ul className="space-y-4">
              {data.map((review: Review) => (
                <li
                  key={review.id}
                  className="rounded-[1.5rem] border border-[#1f2329] bg-[var(--color-panel)] px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {review.clientName ?? "Client"}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                        {review.comment}
                      </p>
                    </div>
                    <div className="text-right text-xs text-[color:var(--color-text-secondary)]">
                      <p className="text-lg font-semibold text-[var(--color-accent-yellow)]">
                        {review.rating.toFixed(1)}
                      </p>
                      <p>{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="No feedback collected yet." />
          )}
        </section>

        <section className="space-y-5 rounded-[1.75rem] border border-[#1f2329] bg-[var(--color-panel)] px-6 py-6">
          <div>
            <h3 className="text-base font-semibold text-white">Log external feedback</h3>
            <p className="text-xs text-[color:var(--color-text-secondary)]">
              If you collect reviews manually, add them here to keep a single source of truth.
            </p>
          </div>
          <form
            className="space-y-4 text-sm"
            onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          >
            <Field
              label="Client ID"
              error={errors.clientId?.message}
              inputProps={{
                type: "number",
                placeholder: "123",
                ...register("clientId"),
              }}
            />
            <Field
              label="Rating"
              error={errors.rating?.message}
              inputProps={{
                type: "number",
                min: "1",
                max: "5",
                step: "1",
                ...register("rating"),
              }}
            />
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.35em]">Comment</label>
              <textarea
                rows={4}
                {...register("comment")}
                className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
                placeholder="Share the highlight from this client"
              />
              {errors.comment ? <FieldError message={errors.comment.message} /> : null}
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent-yellow)] px-5 py-3 text-sm font-semibold text-[#111] transition hover:bg-[#e4f540] disabled:opacity-60"
            >
              {createMutation.isPending ? "Saving..." : "Add feedback"}
            </button>
            {createMutation.isError ? (
              <FieldError message="Could not save review. Try again." />
            ) : null}
          </form>
        </section>
      </div>
    </Panel>
  );
}

function Field({
  label,
  error,
  inputProps,
}: {
  label: string;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-[0.35em]">{label}</label>
      <input
        {...inputProps}
        className="w-full rounded-xl border border-[#1f2329] bg-[#101115] px-4 py-3 text-white focus:border-[var(--color-accent-blue)] focus:outline-none"
      />
      {error ? <FieldError message={error} /> : null}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[#ff9a9a]">{message}</p>;
}

function ErrorMessage({ error }: { error: unknown }) {
  console.error(error);
  return (
    <p className="text-xs text-[#ff9a9a]">
      Something went wrong while fetching data. Refresh to retry.
    </p>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[#1f2329] bg-[#121318] px-6 py-8 text-center text-sm text-[color:var(--color-text-secondary)]">
      {message}
    </div>
  );
}

function LinkOut({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-blue)]"
    >
      {children}
      <span aria-hidden="true">-&gt;</span>
    </a>
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

