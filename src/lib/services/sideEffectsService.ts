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
  SideEffectCategory,
  SideEffectSeverity,
} from "../models/side-effects";
import { format, subDays } from "date-fns";

/**
 * Get date ID in YYYY-MM-DD format
 */
function getDateId(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get all side effects for a user
 */
export async function getUserSideEffects(
  userId: string
): Promise<SideEffectEntry[]> {
  const effectsQuery = query(
    collection(db, `users/${userId}/sideEffects`),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(effectsQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SideEffectEntry[];
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
 * Get side effects for a specific supplement
 */
export async function getSupplementSideEffects(
  userId: string,
  supplementId: string
): Promise<SideEffectEntry[]> {
  const effectsQuery = query(
    collection(db, `users/${userId}/sideEffects`),
    where("supplementIds", "array-contains", supplementId),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(effectsQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SideEffectEntry[];
}

/**
 * Get unresolved side effects
 */
export async function getUnresolvedSideEffects(
  userId: string
): Promise<SideEffectEntry[]> {
  const effectsQuery = query(
    collection(db, `users/${userId}/sideEffects`),
    where("resolved", "==", false),
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
 * Update a side effect entry
 */
export async function updateSideEffect(
  userId: string,
  sideEffectId: string,
  data: Partial<SideEffectEntry>
): Promise<void> {
  const docRef = doc(db, `users/${userId}/sideEffects`, sideEffectId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
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

/**
 * Get side effect statistics
 */
export async function getSideEffectStats(
  userId: string
): Promise<{
  total: number;
  unresolved: number;
  byCategory: Record<SideEffectCategory, number>;
  bySeverity: Record<SideEffectSeverity, number>;
}> {
  const effects = await getUserSideEffects(userId);

  const stats = {
    total: effects.length,
    unresolved: effects.filter((e) => !e.resolved).length,
    byCategory: {} as Record<SideEffectCategory, number>,
    bySeverity: {} as Record<SideEffectSeverity, number>,
  };

  effects.forEach((effect) => {
    stats.byCategory[effect.category] = (stats.byCategory[effect.category] || 0) + 1;
    stats.bySeverity[effect.severity] = (stats.bySeverity[effect.severity] || 0) + 1;
  });

  return stats;
}

/**
 * Check if a supplement has recent side effects (last 7 days)
 */
export async function hasRecentSideEffects(
  userId: string,
  supplementId: string
): Promise<boolean> {
  const effects = await getRecentSideEffects(userId, 7);
  return effects.some((e) => e.supplementIds.includes(supplementId));
}
