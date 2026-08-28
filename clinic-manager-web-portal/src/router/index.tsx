import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { routes } from './routes';

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

/**
 * Create browser router with lazy-loaded routes
 */
const router = createBrowserRouter(routes);

/**
 * App router component with Suspense boundary
 */
export const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;
