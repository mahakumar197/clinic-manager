import { useState } from "react";
import userService from "@/services/modules/user.service";
import { toast } from "@/utils/toast";
import { UpdateUserPayload } from "@/services";

interface UseUpdateUserResult {
  updateUser: (payload: UpdateUserPayload) => Promise<void>;
  updating: boolean;
  error: string | null;
}

/**
 * Custom hook to handle user update
 */
export const useUpdateUser = (): UseUpdateUserResult => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (payload: UpdateUserPayload) => {
    setUpdating(true);
    setError(null);

    try {
      await userService.updateUser(payload);
      toast.success("User updated successfully");
    } catch (err: any) {
      console.error("Failed to update user", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateUser,
    updating,
    error,
  };
};
