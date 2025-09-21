import axios, { type AxiosRequestHeaders } from "axios";

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

let authToken: string | null = null;

const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  authToken = window.localStorage.getItem("fitspace.token");
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (!authToken && isBrowser) {
    authToken = window.localStorage.getItem("fitspace.token");
  }

  if (authToken) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${authToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        (error.response?.data as { message?: string })?.message ??
        error.message ??
        "Request failed";
      const details = error.response?.data;
      return Promise.reject(new ApiError(message, status, details));
    }

    return Promise.reject(error);
  },
);

export function setAuthToken(token: string | null) {
  authToken = token;
  if (!isBrowser) return;
  if (token) {
    window.localStorage.setItem("fitspace.token", token);
  } else {
    window.localStorage.removeItem("fitspace.token");
  }
}

export default api;


