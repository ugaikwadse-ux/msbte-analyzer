"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile, getUserProfile } from "@/lib/db";
import type { SubscriptionPlan } from "@/types";

interface AuthUser extends FirebaseUser {
  subscriptionPlan?: SubscriptionPlan;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  subscriptionPlan: SubscriptionPlan;
  isPremium: boolean;
  isInstitute: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>("free");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Master account – lifetime free institute access
        const MASTER_EMAIL = "master@msbteresult.online";
        if (firebaseUser.email === MASTER_EMAIL) {
          setSubscriptionPlan("institute");
          setUser({ ...firebaseUser, subscriptionPlan: "institute" });
          setLoading(false);
          return;
        }

        // Complimentary accounts – free institute access until expiry date
        const COMPLIMENTARY_ACCOUNTS: Record<string, string> = {
          "siddharthjath@gmail.com": "2026-07-19", // 1 month free – granted 2026-06-19
        };
        const email = firebaseUser.email || "";
        if (email in COMPLIMENTARY_ACCOUNTS) {
          const expiry = new Date(COMPLIMENTARY_ACCOUNTS[email]);
          if (new Date() < expiry) {
            setSubscriptionPlan("institute");
            setUser({ ...firebaseUser, subscriptionPlan: "institute" });
            setLoading(false);
            return;
          }
        }

        try {
          const profile = await getUserProfile(firebaseUser.uid);
          const plan = (profile?.subscription as SubscriptionPlan) || "free";
          setSubscriptionPlan(plan);
          setUser({ ...firebaseUser, subscriptionPlan: plan });
        } catch {
          setUser(firebaseUser);
          setSubscriptionPlan("free");
        }
      } else {
        setUser(null);
        setSubscriptionPlan("free");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName: name });
    await createUserProfile(newUser.uid, email, name);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOutUser,
        resetPassword,
        subscriptionPlan,
        isPremium: subscriptionPlan === "premium" || subscriptionPlan === "institute",
        isInstitute: subscriptionPlan === "institute",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
