import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const config = {
  // Firebase Web config is client-side project identification, not an Admin SDK secret.
  // Optional Vite variables can override these values for local/staging builds.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDZVNWkuE2AeaTqt9msBLYJQmzRLZAfMWk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'matjari-pro-57e6c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'matjari-pro-57e6c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'matjari-pro-57e6c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '630388055448',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:630388055448:web:e9c342677a43c43ad55fed',
}

const configured = Object.values(config).every(Boolean)
export const firebaseApp = configured
  ? (getApps()[0] ?? initializeApp(config))
  : null
export const auth = firebaseApp ? getAuth(firebaseApp) : null
