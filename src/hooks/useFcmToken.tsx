"use client";

import { useEffect, useRef, useState } from "react";
import { fetchToken } from "@/lib/firebase"; 
import { useCurrentUser } from "@/hooks/use-current-user"; 

async function getNotificationPermissionAndToken() {
  // Check if Notifications are supported in the browser.
  if (!("Notification" in window)) {
    console.info("This browser does not support desktop notification");
    return null;
  }

  // Check if permission is already granted.
  if (Notification.permission === "granted") {
    return await fetchToken();
   
  }

  // If permission is not denied, request permission from the user.
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return await fetchToken();
    }
  }

  console.log("Notification permission not granted.");
  return null;
}


const useFcmToken = () => {
  const currentUser = useCurrentUser(); // Use the current user from the session
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null);
  const [token, setToken] = useState<string | null>(null); // Store the FCM token.
  const retryLoadToken = useRef(0);
  const isLoading = useRef(false); // Prevent multiple fetches in progress.

  const loadToken = async () => {
    if (isLoading.current) return;

    isLoading.current = true; // Mark loading as in progress.
    const token = await getNotificationPermissionAndToken(); // Fetch the token.
    console.log(token);
    if (Notification.permission === "denied") {
      setNotificationPermissionStatus("denied");
      isLoading.current = false;
      return;
    }

    // Retry fetching the token if necessary. (Up to 3 retries)
    if (!token) {
      if (retryLoadToken.current >= 3) {
       // alert("Unable to load token, refresh the browser");
        isLoading.current = false;
        return;
      }

      retryLoadToken.current += 1;
      isLoading.current = false;
      await loadToken();
      return;
    }

    // Set the token and mark as fetched.
    setNotificationPermissionStatus(Notification.permission);
    setToken(token);
    isLoading.current = false;
  };

  useEffect(() => {
    if ("Notification" in window) {
      loadToken();
    }
  }, []);

  // Send the FCM token to the backend when it's available and the current user is logged in
  useEffect(() => {
    const sendTokenToServer = async (fcmToken: string) => {
      if (!currentUser) return; // Do nothing if no user is logged in

      try {
        const response = await fetch("/api/save-fcm-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fcmToken, userId: currentUser.id }), // Use the current user's ID here
        });

        if (!response.ok) {
          console.error("Failed to save FCM token to the server.");
        }
      } catch (error) {
        console.error("Error sending FCM token to the server:", error);
      }
    };

    if (token && currentUser) {
      sendTokenToServer(token); // Only send the token if the user is logged in and token is available
    }
  }, [token, currentUser]);

  return { token, notificationPermissionStatus }; // Return token and permission status.
};

export default useFcmToken;
