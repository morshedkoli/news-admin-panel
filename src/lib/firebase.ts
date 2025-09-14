// Firebase configuration for admin panel
// src/lib/firebase.ts

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app;

if (!getApps().length) {
  try {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase');
  }
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  NEWS: 'news',
  CATEGORIES: 'categories',
  FCM_TOKENS: 'fcm_tokens',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_DELIVERIES: 'notification_deliveries',
  USER_SESSIONS: 'user_sessions',
  USER_ACTIVITIES: 'user_activities',
  NEWS_ANALYTICS: 'news_analytics',
  USER_ENGAGEMENT: 'user_engagement'
} as const;

// Helper function to convert Firebase timestamp to Date
export const convertFirestoreTimestamp = (timestamp: FirebaseFirestore.Timestamp | Date | null): Date => {
  if (!timestamp) {
    return new Date();
  }
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // It's a Firestore timestamp
  if (typeof (timestamp as FirebaseFirestore.Timestamp).toDate === 'function') {
    return (timestamp as FirebaseFirestore.Timestamp).toDate();
  }
  
  // Fallback for timestamp-like objects
  if (typeof (timestamp as { seconds?: number }).seconds === 'number') {
    return new Date((timestamp as { seconds: number }).seconds * 1000);
  }
  
  return new Date();
};

// Helper function to create document with auto-generated ID
export const createDocumentId = () => {
  return db.collection('temp').doc().id;
};