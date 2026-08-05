import "@/global.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Organizers from "@/pages/Organizers";
import EventDetails from "@/pages/EventDetails";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";

import Index from "@/pages/Index";
import About from "@/pages/About";
import Menu from "@/pages/Menu";
import Gallery from "@/pages/Gallery";
import Login from "@/pages/Login";


import AdminDashboard from "@/pages/AdminDashboard";
import Scanner from "@/pages/Scanner";
import { AudioProvider } from "@/contexts/AudioContext";
import { AuraCursor } from "@/components/shared/AuraCursor";

import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

export default function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AudioProvider>
        <AuraCursor />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
          <Route path="/organizers" element={<Organizers />} /> 
          <Route path="/events/:eventId" element={<EventDetails />} />
          
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          
          {/* Authentication UI */}
          <Route path="/login" element={<Login />} />

          {/* Booking flow is now strictly manual via Admin Portal */}

          {/* Dashboards */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AudioProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
}
