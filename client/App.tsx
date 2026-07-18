import "@/global.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

import Index from "@/pages/Index";
import About from "@/pages/About";
import Menu from "@/pages/Menu";
import Gallery from "@/pages/Gallery";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import VerifyOTP from "@/pages/VerifyOTP";
import ResetPassword from "@/pages/ResetPassword";

import SlotSelection from "@/pages/SlotSelection";
import BookingForm from "@/pages/BookingForm";
import Payment from "@/pages/Payment";
import BookingSuccess from "@/pages/BookingSuccess";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import QRScanner from "@/pages/QRScanner";
import TicketVerification from "@/pages/TicketVerification";
import KitchenDashboard from "@/pages/KitchenDashboard";

import { AudioProvider } from "@/contexts/AudioContext";
import { CulturalParticles } from "@/components/landing/CulturalParticles";

const queryClient = new QueryClient();

export default function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AudioProvider>
        <CulturalParticles />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          <Route path="/organizers" element={<PlaceholderPage />} /> 
          <Route path="/events/:eventId" element={<PlaceholderPage />} />
          
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/gallery" element={<Gallery />} />
          
          {/* Authentication UI */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Booking Flow UI */}
          <Route path="/slots" element={<SlotSelection />} />
          <Route path="/booking-form" element={<BookingForm />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/success" element={<BookingSuccess />} />

          {/* Dashboards */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/scanner" element={<QRScanner />} />
          <Route path="/ticket/:id" element={<TicketVerification />} />
          
          <Route path="/contact" element={<PlaceholderPage />} />
          <Route path="/faq" element={<PlaceholderPage />} />
          <Route path="/help" element={<PlaceholderPage />} />
          <Route path="/terms" element={<PlaceholderPage />} />
          <Route path="/privacy" element={<PlaceholderPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AudioProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
}
