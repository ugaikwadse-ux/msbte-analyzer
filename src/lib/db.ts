import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Department, Analysis, Subscription } from "@/types";

// ─── Departments ──────────────────────────────────────────────────────────────

const SEMESTERS = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `sem-${n}`,
  number: n,
  label: `Semester ${n}`,
}));

export async function getDepartments(userId: string): Promise<Department[]> {
  try {
    const q = query(
      collection(db, "departments"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      semesters: SEMESTERS,
      createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
    })) as Department[];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function createDepartment(
  userId: string,
  name: string,
  code?: string
): Promise<Department> {
  const ref = await addDoc(collection(db, "departments"), {
    userId,
    name,
    code: code || "",
    createdAt: serverTimestamp(),
  });

  return {
    id: ref.id,
    userId,
    name,
    code: code || "",
    createdAt: new Date(),
    semesters: SEMESTERS,
  };
}

export async function deleteDepartment(id: string): Promise<void> {
  await deleteDoc(doc(db, "departments", id));
}

// ─── Analyses ─────────────────────────────────────────────────────────────────

export async function getAnalyses(userId: string): Promise<Analysis[]> {
  try {
    const q = query(
      collection(db, "analyses"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
    })) as Analysis[];
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return [];
  }
}

export async function getAnalysis(id: string): Promise<Analysis | null> {
  try {
    const snap = await getDoc(doc(db, "analyses", id));
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      ...snap.data(),
      createdAt: (snap.data().createdAt as Timestamp)?.toDate() || new Date(),
    } as Analysis;
  } catch {
    return null;
  }
}

export async function saveAnalysis(analysis: Omit<Analysis, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "analyses"), {
    ...analysis,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAnalysis(
  id: string,
  data: Partial<Analysis>
): Promise<void> {
  await updateDoc(doc(db, "analyses", id), data);
}

export async function deleteAnalysis(id: string): Promise<void> {
  await deleteDoc(doc(db, "analyses", id));
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  email: string,
  displayName?: string
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      uid,
      email,
      displayName: displayName || "",
      subscription: "free",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const userData = snap.data();

  if (userData.subscription && userData.subscription !== "free") {
    try {
      const q = query(
        collection(db, "subscriptions"),
        where("userId", "==", uid),
        where("status", "==", "active")
      );
      const snapSubs = await getDocs(q);
      if (snapSubs.empty) {
        await updateDoc(doc(db, "users", uid), {
          subscription: "free",
        });
        userData.subscription = "free";
      } else {
        const d = snapSubs.docs[0];
        const startDate = (d.data().startDate as Timestamp)?.toDate() || new Date();
        const now = new Date();
        
        // Auto-expire after 30 days (1 month)
        const diffTimeMs = now.getTime() - startDate.getTime();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (diffTimeMs > thirtyDaysMs) {
          await updateDoc(doc(db, "subscriptions", d.id), {
            status: "expired",
            endDate: serverTimestamp(),
          });
          await updateDoc(doc(db, "users", uid), {
            subscription: "free",
          });
          userData.subscription = "free";
        }
      }
    } catch (error) {
      console.error("Error verifying subscription expiration status:", error);
    }
  }

  return userData;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const q = query(
      collection(db, "subscriptions"),
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return {
      id: d.id,
      ...d.data(),
      startDate: (d.data().startDate as Timestamp)?.toDate() || new Date(),
    } as Subscription;
  } catch {
    return null;
  }
}

export async function saveSubscription(sub: Omit<Subscription, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "subscriptions"), {
    ...sub,
    createdAt: serverTimestamp(),
    startDate: serverTimestamp(),
  });
  // Update user's subscription plan
  await updateDoc(doc(db, "users", sub.userId), {
    subscription: sub.plan,
  });
  return ref.id;
}
