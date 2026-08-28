/**
 * Environment configuration
 * Type-safe access to environment variables
 */

interface EnvConfig {
  apiBaseUrl: string;
  appName: string;
  enableAnalytics: boolean;
  enableLogging: boolean;
  env: string;
  isStage: boolean;
  isPreprod: boolean;
  isProduction: boolean;
}

const config: EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING === "true",
  env: import.meta.env.VITE_ENV,

  // Helper flags
  isStage: import.meta.env.VITE_ENV === "stage",
  isPreprod: import.meta.env.VITE_ENV === "preprod",
  isProduction: import.meta.env.VITE_ENV === "prod",
};

export default config;
