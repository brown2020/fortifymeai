import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

let adminDb: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;

try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERTS_URL,
  } as admin.ServiceAccount;

  if (!getApps().length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (e) {
  // Firebase admin init failed (e.g. missing credentials at build time)
  if (!getApps().length) {
    admin.initializeApp();
  }
}

adminDb = admin.firestore();
adminAuth = admin.auth();

export { adminDb, adminAuth };
