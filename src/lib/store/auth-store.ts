import { create } from 'zustand';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase';
import { API_ROUTES } from '../constants';

type SessionResponse =
  | { status: "success"; uid: string }
  | { error: string };

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const createSession = async (userCredential: UserCredential) => {
  const idToken = await userCredential.user.getIdToken();
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
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  signIn: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createSession(userCredential);
  },
  signUp: async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createSession(userCredential);
  },
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await createSession(userCredential);
  },
  logout: async () => {
    try {
      // 1. Delete server session cookie BEFORE Firebase sign-out.
      //    signOut(auth) triggers onAuthStateChanged which may navigate
      //    before the cookie delete completes, leaving a ghost session.
      await fetch(API_ROUTES.auth.session, { method: "DELETE" });

      // 2. Sign out of Firebase.
      await signOut(auth);

      // 3. Clear store state.
      set({ user: null });

      // 4. Clear browser storage.
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
    } catch {
      // Best-effort cleanup even on error
      set({ user: null });
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
    }
  },
}));
