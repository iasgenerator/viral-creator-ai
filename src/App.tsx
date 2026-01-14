import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Create from "./pages/Create";
import Auth from "./pages/Auth";
import Connections from "./pages/Connections";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    // Clear corrupted auth session on startup
    const clearCorruptedSession = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error && (error.message?.includes("Failed to fetch") || error.message?.includes("Invalid Refresh Token"))) {
          console.log("Clearing corrupted auth session...");
          await supabase.auth.signOut();
          localStorage.removeItem('sb-wneybyzkwgvscclpbxml-auth-token');
        }
      } catch (e) {
        console.log("Clearing auth session due to error:", e);
        await supabase.auth.signOut();
        localStorage.removeItem('sb-wneybyzkwgvscclpbxml-auth-token');
      }
    };

    clearCorruptedSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<Create />} />
        <Route path="/connections" element={<Connections />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
