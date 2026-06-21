import { create } from 'zustand';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../firebase';
import { API_ROUTES, ROUTES } from '../constants';

type SessionResponse =
  | { status: "success"; uid: string }
  | { error: string };

export const EMAIL_LINK_STORAGE_KEY = "fortify_email_for_sign_in";
export const AUTH_EVENT_STORAGE_KEY = "fortify_auth_event";
const AUTH_BROADCAST_CHANNEL = "fortify-auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailSignInLink: (email: string) => Promise<void>;
  completeEmailLinkSignIn: (email: string, link: string) => Promise<User>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

function getActionCodeSettings() {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    url: `${origin}${ROUTES.authAction}`,
    handleCodeInApp: true,
  };
}

export async function createServerSession(user: User) {
  const idToken = await user.getIdToken(true);
  const res = await fetch(API_ROUTES.auth.session, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    let message = "Failed to create server session.";
    try {
      const data = (await res.json()) as SessionResponse;
      if ("error" in data && typeof data.error === "string") {
        message = data.error;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

export async function clearServerSession() {
  await fetch(API_ROUTES.auth.session, { method: "DELETE" });
}

function clearAuthStorage() {
  if (typeof window === "undefined") return;

  sessionStorage.clear();

  for (const key of Object.keys(localStorage)) {
    const lower = key.toLowerCase();
    if (
      lower.includes("firebase") ||
      lower.includes("auth") ||
      lower.includes("session") ||
      key === EMAIL_LINK_STORAGE_KEY
    ) {
      localStorage.removeItem(key);
    }
  }

  localStorage.setItem(AUTH_EVENT_STORAGE_KEY, String(Date.now()));
}

function broadcastAuthEvent(type: "logout") {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }

  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  channel.postMessage({ type, at: Date.now() });
  channel.close();
}

export function subscribeToAuthBroadcast(onLogout: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTH_EVENT_STORAGE_KEY) {
      onLogout();
    }
  };

  window.addEventListener("storage", handleStorage);

  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.type === "logout") {
        onLogout();
      }
    };
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    channel?.close();
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  signIn: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createServerSession(userCredential.user);
    return userCredential.user;
  },
  signUp: async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createServerSession(userCredential.user);
    try {
      await sendEmailVerification(userCredential.user, getActionCodeSettings());
    } catch {
      // The verify-email page can retry if provider/action settings are not ready.
    }
    return userCredential.user;
  },
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await createServerSession(userCredential.user);
    return userCredential.user;
  },
  sendPasswordReset: async (email) => {
    await sendPasswordResetEmail(auth, email, getActionCodeSettings());
  },
  sendEmailSignInLink: async (email) => {
    await sendSignInLinkToEmail(auth, email, getActionCodeSettings());
    if (typeof window !== "undefined") {
      localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
    }
  },
  completeEmailLinkSignIn: async (email, link) => {
    const userCredential = await signInWithEmailLink(auth, email, link);
    if (typeof window !== "undefined") {
      localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
    }
    await createServerSession(userCredential.user);
    return userCredential.user;
  },
  sendVerificationEmail: async () => {
    if (!auth.currentUser) {
      throw new Error("Please sign in before requesting a verification email.");
    }
    await sendEmailVerification(auth.currentUser, getActionCodeSettings());
  },
  refreshUser: async () => {
    if (!auth.currentUser) {
      set({ user: null });
      return null;
    }
    await auth.currentUser.reload();
    set({ user: auth.currentUser });
    return auth.currentUser;
  },
  logout: async () => {
    await clearServerSession().catch(() => undefined);
    await signOut(auth).catch(() => undefined);

    try {
      set({ user: null, loading: false });
      clearAuthStorage();
      broadcastAuthEvent("logout");
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
