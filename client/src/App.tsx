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
import LogsPage from "@/pages/LogsPage";
import AdminDashboard from "@/pages/AdminDashboard";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import { SummaPreloader } from "@/components/SummaPreloader";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SummaPreloader />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/sign-in" />;
  }

  return <Component />;
}

function PublicAuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SummaPreloader />;
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function IndexRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SummaPreloader />;
  }

  if (isAuthenticated) {
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
      <Route path="/forgot-password">
        {() => <PublicAuthRoute component={ForgotPassword} />}
      </Route>
      <Route path="/reset-password">
        {() => <PublicAuthRoute component={ResetPassword} />}
      </Route>

      <Route path="/welcome" component={LandingPage} />

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
      <Route path="/logs" component={LogsPage} />
      <Route path="/__manus__/logs" component={LogsPage} />
      <Route path="/admin" component={AdminDashboard} />

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
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
