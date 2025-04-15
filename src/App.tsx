
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeLeaves from "./pages/employee/EmployeeLeaves";
import LeaveDetail from "./pages/employee/LeaveDetail";
import NewLeaveRequest from "./pages/employee/NewLeaveRequest";
import UserProfile from "./pages/employee/UserProfile";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import TeamCalendar from "./pages/manager/TeamCalendar";
import TeamMembers from "./pages/manager/TeamMembers";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeaves from "./pages/admin/AdminLeaves";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLeaveDetail from "./pages/admin/LeaveDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/leaves" element={<EmployeeLeaves />} />
          <Route path="/employee/leaves/:id" element={<LeaveDetail />} />
          <Route path="/employee/new-leave" element={<NewLeaveRequest />} />
          <Route path="/employee/profile" element={<UserProfile />} />
          
          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/calendar" element={<TeamCalendar />} />
          <Route path="/manager/team" element={<TeamMembers />} />
          <Route path="/manager/profile" element={<UserProfile />} />
          <Route path="/manager/leaves" element={<EmployeeLeaves />} />
          <Route path="/manager/leaves/:id" element={<LeaveDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/leaves" element={<AdminLeaves />} />
          <Route path="/admin/leaves/:id" element={<AdminLeaveDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/profile" element={<UserProfile />} />
          
          {/* Redirects */}
          <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
