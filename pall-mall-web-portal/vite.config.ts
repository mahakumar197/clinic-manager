import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@theme": path.resolve(__dirname, "./src/theme"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@router": path.resolve(__dirname, "./src/router"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  // Server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // Build optimizations
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          // Redux chunk
          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],

          // MUI chunk
          "mui-vendor": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],

          // Utilities chunk
          "utils-vendor": ["axios", "lodash-es", "date-fns", "clsx"],
        },
        // Asset file naming
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "@mui/material",
      "@mui/icons-material",
      "axios",
    ],
  },

  // Preview server configuration
  preview: {
    port: 4173,
    open: true,
  },
});
