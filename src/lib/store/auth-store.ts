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
    await signOut(auth);
    await fetch(API_ROUTES.auth.session, { method: "DELETE" });
    set({ user: null });
  },
}));
