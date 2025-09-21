export type FitnessGoal =
  | "GeneralFitness"
  | "WeightLoss"
  | "MuscleGain"
  | "Endurance"
  | "Flexibility"
  | "Rehab";

export interface CoachSummary {
  id: number;
  name: string;
  specialization: string;
}

export interface GymSummary {
  id: number;
  name: string;
  location: string;
}

export interface RecommendedCoachDto {
  coachId: number;
  coachName: string;
  specialization: string;
  distanceKm: number;
  gymId: number;
  gymName: string;
  minPlanPrice: number;
  avgRating: number;
  reviewsCount: number;
  matchingPlanTitles?: string[];
}

export interface RecommendationRequest {
  goal?: FitnessGoal;
  budgetMin?: number;
  budgetMax?: number;
  latitude: number;
  longitude: number;
  maxDistanceKm?: number;
  take?: number;
}

export interface PortfolioPost {
  id: number;
  coachId: number;
  title: string;
  description: string;
  mediaUrl?: string;
  createdAt?: string;
}

export interface CreatePortfolioPost {
  coachId: number;
  title: string;
  description: string;
  mediaUrl?: string;
}

export interface TrainingPlan {
  id: number;
  coachId: number;
  name: string;
  focus: string;
  price: number;
  durationWeeks: number;
  description?: string;
  createdAt?: string;
}

export interface CreateTrainingPlan {
  coachId: number;
  name: string;
  focus: string;
  price: number;
  durationWeeks: number;
  description?: string;
}

export interface Review {
  id: number;
  coachId: number;
  clientName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface CreateReview {
  coachId: number;
  clientId: number;
  rating: number;
  comment: string;
}

