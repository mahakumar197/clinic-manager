import { toast as hotToast, ToastOptions } from "react-hot-toast";

const baseStyle: ToastOptions["style"] = {
  borderRadius: "10px",
  fontWeight: 500,
};

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    hotToast.success(message, {
      style: baseStyle,
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    hotToast.error(message, {
      style: baseStyle,
      duration: 5000,
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      icon: "⚠️",
      style: baseStyle,
      duration: 4000,
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      icon: "ℹ️",
      style: baseStyle,
      ...options,
    }),

  loading: (message: string, options?: ToastOptions) =>
    hotToast.loading(message, {
      style: baseStyle,
      ...options,
    }),

  promise: <T,>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string },
    options?: ToastOptions
  ) =>
    hotToast.promise(promise, msgs, {
      style: baseStyle,
      ...options,
    }),

  dismiss: (toastId?: string) => hotToast.dismiss(toastId),
};
