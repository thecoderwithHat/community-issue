import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function assertFirebaseConfig(
  config: typeof firebaseConfig
): asserts config is {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
} {
  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length) {
    throw new Error(
      `Missing Firebase config values: ${missingKeys.join(", ")}. Check your NEXT_PUBLIC_FIREBASE_* env vars.`
    );
  }
}

assertFirebaseConfig(firebaseConfig);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
