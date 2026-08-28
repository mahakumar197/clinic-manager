import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "10px",
          fontWeight: 500,
          padding: "12px 16px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
        },
        success: {
          duration: 3000,
        },
        error: {
          duration: 5000,
        },
      }}
    />
  );
};

export default ToastProvider;
