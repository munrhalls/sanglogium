"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { UserProfile } from "@/sanity-cms/lib/profiles/profileTypes";
import {
  fetchProfileByClerkIdAction,
  createUserProfileAction,
} from "@/app/actions/userProfileActions";
type ProfileState = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
};
export function useUserProfile() {
  const { user, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<ProfileState>({
    profile: null,
    isLoading: true,
    error: null,
  });
  useEffect(() => {
    if (!isClerkLoaded || !isSignedIn || !user) {
      setState((prev) => ({
        ...prev,
        isLoading: isClerkLoaded && !isSignedIn ? false : prev.isLoading,
      }));
      return;
    }
    async function loadOrCreateProfile() {
      try {
        const existingProfile = await fetchProfileByClerkIdAction(user!.id);
        if (existingProfile) {
          setState({
            profile: existingProfile,
            isLoading: false,
            error: null,
          });
          return;
        }
        console.log(
          "No profile found. Creating new Sanity profile for user:",
          user!.id
        );
        const newProfile = await createUserProfileAction({
          clerkId: user!.id,
          preferences: {
            receiveMarketingEmails: false,
            darkMode: false,
            savePaymentInfo: false,
          },
        });
        console.log("Created new Sanity profile:", newProfile);
        setState({
          profile: newProfile,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error loading or creating Sanity profile:", error);
        setState({
          profile: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }
    loadOrCreateProfile();
  }, [user, isClerkLoaded, isSignedIn]);
  return {
    ...state,
    isAuthenticated: isClerkLoaded && isSignedIn,
    user: isSignedIn ? user! : null,
  };
}
