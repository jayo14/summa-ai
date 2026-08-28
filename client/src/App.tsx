import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import ResetPassword from "@/pages/ResetPassword";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Summa AI...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/sign-in" />;
  }

  return <Component />;
}

function PublicAuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
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

      <Route path="/">
        {() => <ProtectedRoute component={Home} />}
      </Route>

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
