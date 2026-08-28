import { useState } from "react";
import userService from "@/services/modules/user.service";
import { toast } from "@/utils/toast";

interface UseSuspendUserResult {
  suspendUser: (userId: string, duration: string, reason: string) => Promise<void>;
  suspending: boolean;
  error: string | null;
}

/**
 * Custom hook to handle user suspension
 */
export const useSuspendUser = (): UseSuspendUserResult => {
  const [suspending, setSuspending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suspendUser = async (userId: string, duration: string, reason: string) => {
    setSuspending(true);
    setError(null);

    try {
      await userService.suspendUser({
        userId,
        duration,
        reason,
      });

      toast.success("User suspended successfully");
    } catch (err: any) {
      console.error("Failed to suspend user", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to suspend user";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setSuspending(false);
    }
  };

  return {
    suspendUser,
    suspending,
    error,
  };
};
