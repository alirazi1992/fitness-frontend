import api from "./http";
import type {
  CoachSummary,
  CreatePortfolioPost,
  CreateReview,
  CreateTrainingPlan,
  GymSummary,
  PortfolioPost,
  RecommendationRequest,
  RecommendedCoachDto,
  Review,
  TrainingPlan,
} from "@/lib/types";

export const recommendCoaches = async (
  payload: RecommendationRequest,
): Promise<RecommendedCoachDto[]> => {
  const { data } = await api.post<RecommendedCoachDto[]>(
    "/api/Recommendations",
    payload,
  );
  return data;
};

export const getCoaches = async (): Promise<CoachSummary[]> => {
  const { data } = await api.get<CoachSummary[]>("/api/Coaches");
  return data;
};

export const getGyms = async (): Promise<GymSummary[]> => {
  const { data } = await api.get<GymSummary[]>("/api/Gyms");
  return data;
};

export const getPortfolioForCoach = async (
  coachId: number,
): Promise<PortfolioPost[]> => {
  const { data } = await api.get<PortfolioPost[]>(
    `/api/Portfolio/coach/${coachId}`,
  );
  return data;
};

export const createPortfolioPost = async (
  payload: CreatePortfolioPost,
): Promise<PortfolioPost> => {
  const { data } = await api.post<PortfolioPost>("/api/Portfolio", payload);
  return data;
};

export const getTrainingPlansForCoach = async (
  coachId: number,
): Promise<TrainingPlan[]> => {
  const { data } = await api.get<TrainingPlan[]>(
    `/api/TrainingPlans/coach/${coachId}`,
  );
  return data;
};

export const createTrainingPlan = async (
  payload: CreateTrainingPlan,
): Promise<TrainingPlan> => {
  const { data } = await api.post<TrainingPlan>(
    "/api/TrainingPlans",
    payload,
  );
  return data;
};

export const getReviewsForCoach = async (
  coachId: number,
): Promise<Review[]> => {
  const { data } = await api.get<Review[]>(`/api/Reviews/coach/${coachId}`);
  return data;
};

export const createReview = async (
  payload: CreateReview,
): Promise<Review> => {
  const { data } = await api.post<Review>("/api/Reviews", payload);
  return data;
};

export const getClients = async () => (await api.get("/api/Clients")).data;

export default api;

