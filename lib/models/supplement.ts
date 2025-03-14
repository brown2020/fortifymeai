import { Timestamp } from "firebase/firestore";

export interface Supplement {
  id: string;
  name: string;
  brand?: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
  startDate?: Timestamp;
  imageUrl?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SupplementFormData {
  name: string;
  brand?: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
  startDate?: Date;
  imageUrl?: string;
}
