import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type AdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function buildConfig(): AdminConfig {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase admin credentials. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.");
  }

  privateKey = privateKey.replace(/\\n/g, "\n");

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  const config = buildConfig();

  return initializeApp({
    credential: cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey,
    }),
  });
}

const adminApp = initializeFirebaseAdmin();
export const adminDb = getFirestore(adminApp);
