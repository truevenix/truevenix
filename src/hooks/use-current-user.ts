import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
    const session = useSession();

    return session.data?.user;
}

// Add a second hook for when you need loading state
export const useCurrentUserWithStatus = () => {
  const session = useSession();
  return {
    user: session.data?.user,
    status: session.status,          // "loading" | "authenticated" | "unauthenticated"
    isLoading: session.status === "loading",
    isAuthenticated: session.status === "authenticated",
  };
}