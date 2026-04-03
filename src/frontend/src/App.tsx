import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { Toaster } from "./components/ui/sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsCallerAdmin } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import DiscussPage from "./pages/DiscussPage";
import DiscussionDetailPage from "./pages/DiscussionDetailPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import GroupsPage from "./pages/GroupsPage";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import RumorDetailPage from "./pages/RumorDetailPage";
import RumorsPage from "./pages/RumorsPage";

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
  path: "/",
  component: HomePage,
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/news",
  component: NewsPage,
});

const newsDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/news/$articleId",
  component: ArticleDetailPage,
});

const rumorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rumors",
  component: RumorsPage,
});

const rumorDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rumors/$rumorId",
  component: RumorDetailPage,
});

const discussRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discuss",
  component: DiscussPage,
});

const discussionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discuss/$discussionId",
  component: DiscussionDetailPage,
});

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups",
  component: GroupsPage,
});

const groupDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups/$groupName",
  component: GroupDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
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

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </ThemeProvider>
  );
}
