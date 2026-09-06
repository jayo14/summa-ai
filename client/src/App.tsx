import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import ResetPassword from "@/pages/ResetPassword";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import VerifyEmail from "@/pages/VerifyEmail";
import Callback from "@/pages/Callback";
import AdminDashboard from "@/pages/AdminDashboard";
import { AdminRoute } from "@/components/AdminRoute";
import { UserRole } from "@/types/roles";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import { SummaPreloader } from "@/components/SummaPreloader";
import { ServerWarmupBanner } from "@/components/ServerWarmupBanner";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SummaPreloader />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/sign-in" />;
  }

  if (user && user.email_verified === false) {
    return <Redirect to={`/verify-email?email=${encodeURIComponent(user.email)}`} />;
  }

  if (user?.role === UserRole.ADMIN) {
    return <Redirect to="/admin" />;
  }

  return <Component />;
}

function PublicAuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SummaPreloader />;
  }

  if (isAuthenticated && user?.email_verified !== false) {
    if (user?.role === UserRole.ADMIN) {
      return <Redirect to="/admin" />;
    }
    return <Redirect to="/" />;
  }

  return <Component />;
}

function IndexRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SummaPreloader />;
  }

  if (isAuthenticated) {
    if (user?.email_verified === false) {
      return <Redirect to={`/verify-email?email=${encodeURIComponent(user.email)}`} />;
    }
    if (user?.role === UserRole.ADMIN) {
      return <Redirect to="/admin" />;
    }
    return <Home />;
  }

  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/sign-in">
        {() => <PublicAuthRoute component={SignIn} />}
      </Route>
      <Route path="/sign-up">
        {() => <PublicAuthRoute component={SignUp} />}
      </Route>
      <Route path="/verify-email">
        {() => <VerifyEmail />}
      </Route>
      <Route path="/callback">
        {() => <Callback />}
      </Route>
      <Route path="/forgot-password">
        {() => <PublicAuthRoute component={ForgotPassword} />}
      </Route>
      <Route path="/reset-password">
        {() => <PublicAuthRoute component={ResetPassword} />}
      </Route>

      <Route path="/welcome" component={LandingPage} />

      <Route path="/c/:id">
        {() => <ProtectedRoute component={Home} />}
      </Route>
      <Route path="/learning">
        {() => <ProtectedRoute component={Home} />}
      </Route>
      <Route path="/activities">
        {() => <ProtectedRoute component={Home} />}
      </Route>
      <Route path="/progress">
        {() => <ProtectedRoute component={Home} />}
      </Route>
      <Route path="/sources">
        {() => <ProtectedRoute component={Home} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Home} />}
      </Route>
      
      <Route path="/admin">
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/:tab">
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>

      <Route path="/" component={IndexRoute} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <ServerWarmupBanner />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
