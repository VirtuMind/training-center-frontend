import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Auth utilities
export const AUTH_TOKEN_KEY = "centreFormation_accessToken";
export const AUTH_USER_KEY = "centreFormation_user";

export const setAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

export const removeAuthTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

export const setCurrentUser = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userJson = localStorage.getItem(AUTH_USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
