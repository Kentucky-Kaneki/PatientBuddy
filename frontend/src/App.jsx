import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import UploadReport from "./pages/uploadreport";
import PrescriptionAnalyzer from "./pages/PrescriptionAnalyzer";
import ReportView from "./pages/reportview";
import PrescriptionView from "./pages/prescriptionview";
import Chat from "./pages/chat";
import History from "./pages/history";
import NotFound from "./pages/notfound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload/report" element={<UploadReport />} />
          <Route path="/upload/prescription" element={<PrescriptionAnalyzer />} />
          <Route path="/report/:id" element={<ReportView />} />
          <Route path="/prescription/:id" element={<PrescriptionView />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;