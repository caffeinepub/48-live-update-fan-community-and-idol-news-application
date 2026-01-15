import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import RumorsPage from './pages/RumorsPage';
import DiscussPage from './pages/DiscussPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import AdminPage from './pages/AdminPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import RumorDetailPage from './pages/RumorDetailPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news',
  component: NewsPage,
});

const newsDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news/$articleId',
  component: ArticleDetailPage,
});

const rumorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rumors',
  component: RumorsPage,
});

const rumorDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rumors/$rumorId',
  component: RumorDetailPage,
});

const discussRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discuss',
  component: DiscussPage,
});

const discussionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discuss/$discussionId',
  component: DiscussionDetailPage,
});

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups',
  component: GroupsPage,
});

const groupDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups/$groupName',
  component: GroupDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  newsRoute,
  newsDetailRoute,
  rumorsRoute,
  rumorDetailRoute,
  discussRoute,
  discussionDetailRoute,
  groupsRoute,
  groupDetailRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </ThemeProvider>
  );
}
