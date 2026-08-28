import { useAppSelector } from "@/app/store";

/**
 * Returns the current authenticated user's role.
 * Always returns a valid role string.
 */
export const useAuthRole = () => {
  const role = useAppSelector((state) => state.auth.user?.role);

  // Fallback role to avoid crashes during hydration
  return role ?? "doctor";
};
