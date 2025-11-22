import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Supplement, SupplementFormData } from "../models/supplement";

const COLLECTION_NAME = "supplements";

/**
 * Get all supplements for a user
 */
export async function getUserSupplements(
  userId: string
): Promise<Supplement[]> {
  const supplementsQuery = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(supplementsQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Supplement[];
}

/**
 * Get a single supplement by ID
 */
export async function getSupplement(id: string): Promise<Supplement | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Supplement;
  }

  return null;
}

/**
 * Create a new supplement
 */
export async function createSupplement(
  userId: string,
  data: SupplementFormData
): Promise<string> {
  const supplementData = {
    ...data,
    userId,
    startDate: data.startDate ? Timestamp.fromDate(data.startDate) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), supplementData);
  return docRef.id;
}

/**
 * Update an existing supplement
 */
export async function updateSupplement(
  id: string,
  data: Partial<SupplementFormData>
): Promise<void> {
  const updateData = {
    ...data,
    startDate: data.startDate ? Timestamp.fromDate(data.startDate) : undefined,
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, updateData);
}

/**
 * Delete a supplement
 */
export async function deleteSupplement(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
