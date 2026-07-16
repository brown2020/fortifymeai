import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  SideEffectEntry,
  SideEffectFormData,
} from "../models/side-effects";
import { format, subDays } from "date-fns";

/**
 * Get date ID in YYYY-MM-DD format
 */
function getDateId(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get recent side effects (last N days)
 */
export async function getRecentSideEffects(
  userId: string,
  days: number = 30
): Promise<SideEffectEntry[]> {
  const startDate = subDays(new Date(), days);

  const effectsQuery = query(
    collection(db, `users/${userId}/sideEffects`),
    where("date", ">=", Timestamp.fromDate(startDate)),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(effectsQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SideEffectEntry[];
}

/**
 * Log a new side effect
 */
export async function logSideEffect(
  userId: string,
  data: SideEffectFormData,
  supplementNames: string[]
): Promise<string> {
  const dateId = getDateId();

  const sideEffectData: Omit<SideEffectEntry, "id"> = {
    userId,
    date: Timestamp.fromDate(new Date()),
    dateId,
    supplementIds: data.supplementIds,
    supplementNames,
    symptom: data.symptom,
    category: data.category,
    severity: data.severity,
    startTime: data.startTime ? Timestamp.fromDate(data.startTime) : undefined,
    duration: data.duration,
    notes: data.notes,
    resolved: false,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(
    collection(db, `users/${userId}/sideEffects`),
    sideEffectData
  );

  return docRef.id;
}

/**
 * Mark a side effect as resolved
 */
export async function resolveSideEffect(
  userId: string,
  sideEffectId: string,
  resolution?: string
): Promise<void> {
  const docRef = doc(db, `users/${userId}/sideEffects`, sideEffectId);
  await updateDoc(docRef, {
    resolved: true,
    resolvedAt: serverTimestamp(),
    resolution,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a side effect entry
 */
export async function deleteSideEffect(
  userId: string,
  sideEffectId: string
): Promise<void> {
  const docRef = doc(db, `users/${userId}/sideEffects`, sideEffectId);
  await deleteDoc(docRef);
}
