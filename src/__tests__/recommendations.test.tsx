import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecommendationsPage from "@/app/recommendations/page";
import { recommendCoaches } from "@/lib/api";
import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    recommendCoaches: vi.fn(),
  };
});

function renderWithClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    ),
  };
}

const recommendCoachesMock = vi.mocked(recommendCoaches);

describe("RecommendationsPage", () => {
  beforeEach(() => {
    recommendCoachesMock.mockReset();
    Object.defineProperty(window.navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn(),
      },
      configurable: true,
    });
  });

  it("submits manual coordinates and calls API with payload", async () => {
    recommendCoachesMock.mockResolvedValueOnce([]);
    const { user } = renderWithClient(<RecommendationsPage />);

    await user.click(screen.getByRole("button", { name: /enter coordinates/i }));

    await user.clear(screen.getByLabelText(/latitude/i));
    await user.type(screen.getByLabelText(/latitude/i), "24.7");
    await user.clear(screen.getByLabelText(/longitude/i));
    await user.type(screen.getByLabelText(/longitude/i), "46.7");
    await user.selectOptions(screen.getByLabelText(/goal/i), "WeightLoss");
    await user.clear(screen.getByLabelText(/max distance/i));
    await user.type(screen.getByLabelText(/max distance/i), "20");
    await user.type(screen.getByLabelText(/budget min/i), "100");
    await user.type(screen.getByLabelText(/budget max/i), "250");
    await user.clear(screen.getByLabelText(/results/i));
    await user.type(screen.getByLabelText(/results/i), "5");

    await user.click(screen.getByRole("button", { name: /show recommendations/i }));

    await waitFor(() => expect(recommendCoachesMock).toHaveBeenCalledTimes(1));
    expect(recommendCoachesMock).toHaveBeenCalledWith({
      goal: "WeightLoss",
      budgetMin: 100,
      budgetMax: 250,
      latitude: 24.7,
      longitude: 46.7,
      maxDistanceKm: 20,
      take: 5,
    });
  });

  it("shows error when no location is available in auto mode", async () => {
    recommendCoachesMock.mockResolvedValueOnce([]);
    const { user } = renderWithClient(<RecommendationsPage />);

    await user.click(screen.getByRole("button", { name: /show recommendations/i }));

    await waitFor(() =>
      expect(
        screen.getByText(
          /location not available\. allow automatic access or enter coordinates manually\./i,
        ),
      ).toBeInTheDocument(),
    );
    expect(recommendCoachesMock).not.toHaveBeenCalled();
  });
});

