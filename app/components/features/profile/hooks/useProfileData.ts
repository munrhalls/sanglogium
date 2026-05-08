import { useState, useEffect } from "react";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { UserProfile } from "@/sanity-cms/lib/profiles/profileTypes";
import { useErrorHandler } from "./useErrorHandler";
interface UseProfileDataReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  user: unknown; 
}
export function useProfileData(): UseProfileDataReturn {
  const { profile, isLoading, error, isAuthenticated, user } = useUserProfile();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const { handleError: _handleError, clearError: _clearError } =
    useErrorHandler();
  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);
  return {
    profile: profileData,
    isLoading,
    error,
    isAuthenticated,
    user,
  };
}
