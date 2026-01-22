import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import ProfilesPage from '@/components/pages/ProfilesPage';
import ProfileDetailPage from '@/components/pages/ProfileDetailPage';
import MyProfilePage from '@/components/pages/MyProfilePage';
import IncomingSwapRequestsPage from '@/components/pages/IncomingSwapRequestsPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "profiles",
        element: <ProfilesPage />,
        routeMetadata: {
          pageIdentifier: 'profiles',
        },
      },
      {
        path: "profiles/:id",
        element: <ProfileDetailPage />,
        routeMetadata: {
          pageIdentifier: 'profile-detail',
        },
      },
      {
        path: "my-profile",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to view and manage your profile">
            <MyProfilePage />
          </MemberProtectedRoute>
        ),
        routeMetadata: {
          pageIdentifier: 'my-profile',
        },
      },
      {
        path: "incoming-requests",
        element: (
          <MemberProtectedRoute messageToSignIn="Sign in to view your incoming swap requests">
            <IncomingSwapRequestsPage />
          </MemberProtectedRoute>
        ),
        routeMetadata: {
          pageIdentifier: 'incoming-requests',
        },
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
