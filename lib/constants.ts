// Application metadata
export const APP_NAME = "Fortify.me";
export const APP_DESCRIPTION =
  "AI-powered platform for tracking and managing dietary supplements";

// Color themes
export const COLORS = {
  primary: {
    light: "bg-blue-50 text-blue-600",
    main: "bg-blue-600 text-white",
    dark: "bg-blue-700 text-white",
    hover: "hover:bg-blue-700",
    border: "border-blue-200",
    accent: "bg-blue-600",
  },
  secondary: {
    light: "bg-purple-50 text-purple-600",
    main: "bg-purple-600 text-white",
    dark: "bg-purple-700 text-white",
    hover: "hover:bg-purple-700",
    border: "border-purple-200",
    accent: "bg-purple-600",
  },
  success: {
    light: "bg-green-50 text-green-600",
    main: "bg-green-600 text-white",
    dark: "bg-green-700 text-white",
    hover: "hover:bg-green-700",
    border: "border-green-200",
    accent: "bg-green-600",
  },
};

// Navigation
export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  supplements: "/supplements",
  research: "/research",
  profile: "/profile",
  login: "/login",
  signup: "/signup",
};

// API endpoints
export const API_ROUTES = {
  auth: {
    session: "/api/auth/session",
  },
  research: "/api/research",
};

// Session
export const SESSION_COOKIE_NAME = "__session";
export const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 days
