import { useState } from "react";
import userService from "@/services/modules/user.service";
import { toast } from "@/utils/toast";
import { CreateUserPayload } from "@/services";

interface UseCreateUserResult {
  createUser: (payload: CreateUserPayload) => Promise<void>;
  creating: boolean;
  error: string | null;
}

/**
 * Custom hook to handle user creation
 */
export const useCreateUser = (): UseCreateUserResult => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (payload: CreateUserPayload) => {
    setCreating(true);
    setError(null);

    try {
      const response = await userService.createUser(payload);
      
      // Check if API returned an error in the response
      if (response?.error?.message) {
        toast.error(response.error.message);
      } else {
        const successMessage = response?.message || "User created successfully";
        toast.success(successMessage);
      }
    } catch (err: any) {
      console.error("Failed to create user", err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to create user";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return {
    createUser,
    creating,
    error,
  };
};
