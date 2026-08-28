import { ThemeProvider, CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./app/store";
import { lightTheme } from "./theme";
import { AppRouter } from "./router/index.tsx";
import config from "./config/env.ts";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LoadingSpinner } from "@/components/common";
import TokenHandler from "@/components/auth/TokenHandler";
import SocketManager from "@/components/common/SocketManager";
import ToastProvider from "./app/ToastProvider.tsx";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

/**
 * Root App component
 * Provides Redux store, MUI theme, and router to the application
 */

console.log(
  `%c Running in ENV: ${config.env}`,
  "color: white; background: green; padding: 4px; border-radius: 4px;"
);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <TokenHandler />
        <ThemeProvider theme={lightTheme}>
          <CssBaseline />
          <ToastProvider />
          <SocketManager />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <PermissionProvider>
              <NotificationProvider>
                <AppRouter />
              </NotificationProvider>
            </PermissionProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
