import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth";
import QuizPage from "@/pages/quiz";
import HomePage from "@/pages/home";
import FindVibePage from "@/pages/find-vibe";
import AnonymousPage from "@/pages/anonymous";
import NotFound from "@/pages/not-found";
import { Skeleton } from "@/components/ui/skeleton";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <AuthPage />;
  }

  if (!user?.profileComplete) {
    return <QuizPage />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      <Route path="/quiz">
        <AuthGuard>
          <QuizPage />
        </AuthGuard>
      </Route>
      
      <Route path="/">
        <AuthGuard>
          <HomePage />
        </AuthGuard>
      </Route>
      
      <Route path="/find-vibe">
        <AuthGuard>
          <FindVibePage />
        </AuthGuard>
      </Route>
      
      <Route path="/anonymous">
        <AuthGuard>
          <AnonymousPage />
        </AuthGuard>
      </Route>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
