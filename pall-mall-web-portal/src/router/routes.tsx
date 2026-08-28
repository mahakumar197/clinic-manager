import { Navigate, RouteObject } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { lazyWithRetry } from "../utils/lazyWithRetry";

/**
 * Lazy-loaded page components for code splitting
 * Uses lazyWithRetry to handle stale chunk errors after deployments
 */
const Home = lazyWithRetry(() => import("../pages/Home"));
const Login = lazyWithRetry(() => import("../pages/Auth/Login"));
// const Register = lazyWithRetry(() => import("../pages/Auth/Register"));
const Forgot = lazyWithRetry(() => import("../pages/Auth/ForgotPassword"));
const Otp = lazyWithRetry(() => import("../pages/Auth/EnterOtp"));
const Reset = lazyWithRetry(() => import("../pages/Auth/ResetPassword"));
const OAuthCallback = lazyWithRetry(() => import("../pages/Auth/OAuthCallback"));
const NotFound = lazyWithRetry(() => import("../pages/NotFound"));

// Page components for each menu item
const Messages = lazyWithRetry(() => import("../pages/Messages"));
const Tasks = lazyWithRetry(() => import("../pages/Tasks"));
const TasksDetail = lazyWithRetry(() => import("../pages/Tasks/admin/AdminTaskDetails"));
const ApprovalsQueue = lazyWithRetry(() => import("../pages/ApprovalsQueue"));
const ContentUpload = lazyWithRetry(() => import("../pages/ContentUpload"));
const ContentLibrary = lazyWithRetry(
  () => import("../pages/ContentUpload/ContentLibrary"),
);
const Analytics = lazyWithRetry(() => import("../pages/Analytics"));
const UserManagement = lazyWithRetry(() => import("../pages/UserManagement"));
const EditUser = lazyWithRetry(() => import("../pages/UserManagement/EditUser"));
const Notifications = lazyWithRetry(() => import("../pages/Notifications"));
const RuleNotifications = lazyWithRetry(() => import("../pages/Notifications/admin"));
const EditNotifications = lazyWithRetry(
  () => import("../pages/Notifications/admin/EditNotifications"),
);
// const PatientTracker = lazyWithRetry(
//   () => import("../pages/PatientTracker/PatientTracker"),
// );

/**
 * Application routes configuration
 * Each route is lazy-loaded for optimal performance
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  // {
  //   path: ROUTES.REGISTER,
  //   element: (
  //     <GuestRoute>
  //       <Register />
  //     </GuestRoute>
  //   ),
  // },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <GuestRoute>
        <Forgot />
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.OTP,
    element: (
      <GuestRoute>
        <Otp />
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: (
      <GuestRoute>
        <Reset />
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.GOOGLE_CALLBACK,
    element: <OAuthCallback />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // SHARED ROUTES
      {
        path: ROUTES.MESSAGES,
        element: <Messages />,
      },
      {
        path: ROUTES.TASKS,
        element: <Tasks />,
      },
      {
        path: ROUTES.APPROVALS,
        element: <ApprovalsQueue />,
      },
      {
        path: ROUTES.NOTIFICATIONS,
        element: <Notifications />,
      },
      {
        path: ROUTES.ANALYTICS,
        element: <Analytics />,
      },

      // ADMIN ROUTES

      {
        path: ROUTES.TASKS_DETAIL,
        element: (
          <ProtectedRoute requiredPermission="tasks">
            <TasksDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CONTENT_UPLOAD,
        element: (
          <ProtectedRoute requiredPermission="content_upload">
            <ContentUpload />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CONTENT_LIBRARY,
        element: (
          <ProtectedRoute requiredPermission="content_upload">
            <ContentLibrary />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.USERS,
        element: (
          <ProtectedRoute requiredPermission="user_management">
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: `${ROUTES.EDITUSER}/:userId`,
        element: (
          <ProtectedRoute requiredPermission="user_management">
            <EditUser />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.RULE_NOTIFICATIONS,
        element: (
          <ProtectedRoute requiredPermission="rule_notification">
            <RuleNotifications />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.EDIT_NOTIFICATIONS,
        element: (
          <ProtectedRoute requiredPermission="rule_notification">
            <EditNotifications />
          </ProtectedRoute>
        ),
      },

      {
        path: ROUTES.EDIT_ESCALATIONS,
        element: (
          <ProtectedRoute requiredPermission="rule_notification">
            <EditNotifications />
          </ProtectedRoute>
        ),
      },
      // {
      //   path: ROUTES.PATIENT_TRACKER,
      //   element: (
      //     <ProtectedRoute requiredPermission="patient_tracker">
      //       <PatientTracker />
      //     </ProtectedRoute>
      //   ),
      // },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
