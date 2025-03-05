import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import PlanSelection from "./pages/PlanSelection";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Onboarding from "./pages/Onboarding";
import AddTask from "./pages/AddTask";
import AddHome from "./pages/AddHome";
import HomeDetails from "./pages/HomeDetails";
import TaskDetail from "./pages/TaskDetail";
import { AuthProvider } from "./hooks/useAuth.tsx";
import { MaintenanceProvider } from "./contexts/MaintenanceContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MaintenanceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/plan-selection"
                element={
                  <ProtectedRoute>
                    <PlanSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homes/:homeId"
                element={
                  <ProtectedRoute>
                    <HomeDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homes/:homeId/edit"
                element={
                  <ProtectedRoute>
                    <AddHome isEditing={true} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homes/add"
                element={
                  <ProtectedRoute>
                    <AddHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homes/:homeId/tasks/add"
                element={
                  <ProtectedRoute>
                    <AddTask />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks/:taskId"
                element={
                  <ProtectedRoute>
                    <TaskDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MaintenanceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
