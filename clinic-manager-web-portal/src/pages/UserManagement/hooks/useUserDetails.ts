import { useState, useEffect } from "react";
import userService from "@/services/modules/user.service";
import { UserDetails } from "@/services";

interface UseUserDetailsResult {
  user: UserDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch user details by ID
 */
export const useUserDetails = (userId: string | undefined): UseUserDetailsResult => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // const data = await userService.getUserById(userId);
      // setUser(data);
      const data: any = await userService.getUserById(userId);

      const formattedUser: UserDetails = {
        ...data,
        twoFaEnabled: data.twoFaEnabled ?? data.two_fa_enabled ?? false,
      };
      
      setUser(formattedUser);
    } catch (err: any) {
      console.error("Failed to fetch user details", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch user details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};
