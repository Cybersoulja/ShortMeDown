import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { TabBar } from "@/components/ui/tab-bar";
import { Header } from "@/components/ui/header";

import Home from "@/pages/home";
import Explore from "@/pages/explore";
import Create from "@/pages/create";
import Library from "@/pages/library";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import OAuthCallback from "@/pages/oauth-callback";

function Router() {
  return (
    <div className="flex flex-col h-screen">
      <Switch>
        <Route path="/oauth-callback" component={OAuthCallback} />
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/create" component={Create} />
        <Route path="/library" component={Library} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
      <TabBar />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
