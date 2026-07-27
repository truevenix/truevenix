// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg7C4NQhwn5kh2WQqwujBQ3WDOejsxT-s",
  authDomain: "myproject-d1128.firebaseapp.com",
  projectId: "myproject-d1128",
  storageBucket: "myproject-d1128.firebasestorage.app",
  messagingSenderId: "86654026088",
  appId: "1:86654026088:web:de309d266435f7c374d6dd"
};

// Initialize Firebase (only if it hasn't been initialized already)
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Cloud Messaging
const messaging = async () => {
  // Ensure FCM is supported in the current environment (browser)
  const supported = await isSupported();
  return supported ? getMessaging(firebaseApp) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY, // Your public VAPID key
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export default firebaseApp;


