import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import PersonalizedHomePage from "../pages/PersonalizedHomePage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import LogoutAllPage from "../pages/auth/LogoutAllPage";

import AdminDashboardPage from "../pages/dashboard/AdminDashboardPage";
import AdminApprovalPage from "../pages/dashboard/AdminApprovalPage";
import AdminBillsPage from "../pages/dashboard/AdminBillsPage";
import AgentDashboardPage from "../pages/dashboard/AgentDashboardPage";
import BillingDashboardPage from "../pages/dashboard/BillingDashboardPage";
import FieldDashboardPage from "../pages/dashboard/FieldDashboardPage";
import CustomerDashboardPage from "../pages/dashboard/CustomerDashboardPage";

import AuditTrailPage from "../pages/admin/AuditTrailPage";
import RBACPage from "../pages/admin/RBACPage";
import CreateAgentPage from "../pages/admin/CreateAgentPage";
import NotificationsPage from "../pages/admin/NotificationsPage";

import ReportsPage from "../pages/dashboard/ReportsPage";

import CreateCustomerPage from "../pages/customers/CreateCustomerPage";
import EditCustomerPage from "../pages/customers/EditCustomerPage";
import Customer360Page from "../pages/customers/Customer360Page";
import ServiceAccountPage from "../pages/agent/ServiceAccountsPage";
import ComplaintsPage from "../pages/complaints/ComplaintsPage";
import AgentComplaintsPage from "../pages/agent/ComplaintsPage";

function isLoggedIn() {
  return !!localStorage.getItem("cc360_access_token");
}

function getRoles() {
  try {
    const user = JSON.parse(localStorage.getItem("cc360_user") || "{}");
    return user.roles || [];
  } catch {
    return [];
  }
}

function getHomePath() {
  const roles = getRoles();
  if (roles.includes("ROLE_ADMIN")) return "/admin/dashboard";
  if (roles.includes("ROLE_AGENT")) return "/agent/dashboard";
  if (roles.includes("ROLE_BILLING_ANALYST")) return "/billing/dashboard";
  if (roles.includes("ROLE_FIELD_COORDINATOR")) return "/field/dashboard";
  return "/customer/dashboard";
}

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function HomeRoute() {
  return isLoggedIn() ? <PersonalizedHomePage /> : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const userRoles = getRoles();
  const allowed = roles.some((r) => userRoles.includes(r));
  return allowed ? children : <Navigate to={getHomePath()} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn() ? <Navigate to="/home" replace /> : <LandingPage />} />
        <Route path="/home" element={<HomeRoute />} />
        <Route path="/dashboard" element={<Navigate to={isLoggedIn() ? "/home" : "/login"} replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/logout-all" element={<LogoutAllPage />} />

        <Route path="/admin/dashboard" element={<RoleRoute roles={["ROLE_ADMIN"]}><AdminDashboardPage /></RoleRoute>} />
        <Route path="/admin/bills" element={<RoleRoute roles={["ROLE_ADMIN"]}><AdminBillsPage /></RoleRoute>} />
        <Route path="/admin/approvals" element={<RoleRoute roles={["ROLE_ADMIN"]}><AdminApprovalPage /></RoleRoute>} />
        <Route path="/admin/complaints" element={<RoleRoute roles={["ROLE_ADMIN"]}><ComplaintsPage /></RoleRoute>} />
        <Route path="/admin/reports" element={<RoleRoute roles={["ROLE_ADMIN"]}><ReportsPage /></RoleRoute>} />
        <Route path="/admin/notifications" element={<RoleRoute roles={["ROLE_ADMIN"]}><NotificationsPage /></RoleRoute>} />
        <Route path="/admin/create-agent" element={<RoleRoute roles={["ROLE_ADMIN"]}><CreateAgentPage /></RoleRoute>} />
        <Route path="/admin/roles" element={<RoleRoute roles={["ROLE_ADMIN"]}><RBACPage /></RoleRoute>} />
        <Route path="/admin/audit" element={<RoleRoute roles={["ROLE_ADMIN"]}><AuditTrailPage /></RoleRoute>} />

        <Route path="/agent/dashboard" element={<RoleRoute roles={["ROLE_AGENT", "ROLE_ADMIN"]}><AgentDashboardPage /></RoleRoute>} />
        <Route path="/customers/profile" element={<RoleRoute roles={["ROLE_AGENT", "ROLE_ADMIN"]}><Customer360Page /></RoleRoute>} />
        <Route path="/agent/complaints" element={<RoleRoute roles={["ROLE_AGENT", "ROLE_ADMIN"]}><AgentComplaintsPage /></RoleRoute>} />
        <Route path="/agent/notifications" element={<RoleRoute roles={["ROLE_AGENT", "ROLE_ADMIN"]}><NotificationsPage /></RoleRoute>} />
        <Route path="/billing/dashboard" element={<RoleRoute roles={["ROLE_BILLING_ANALYST", "ROLE_ADMIN"]}><BillingDashboardPage /></RoleRoute>} />
        <Route path="/field/dashboard" element={<RoleRoute roles={["ROLE_FIELD_COORDINATOR", "ROLE_ADMIN"]}><FieldDashboardPage /></RoleRoute>} />
        <Route path="/customer/dashboard" element={<RoleRoute roles={["ROLE_CUSTOMER", "ROLE_ADMIN"]}><CustomerDashboardPage /></RoleRoute>} />

        <Route path="/customers/new" element={<RoleRoute roles={["ROLE_AGENT", "ROLE_ADMIN"]}><CreateCustomerPage /></RoleRoute>} />
        <Route path="/customers/:id" element={<PrivateRoute><Customer360Page /></PrivateRoute>} />
        <Route path="/customers/:id/edit" element={<PrivateRoute><EditCustomerPage /></PrivateRoute>} />
        <Route path="/accounts" element={<RoleRoute roles={["ROLE_AGENT", "ROLE_ADMIN"]}><ServiceAccountPage /></RoleRoute>} />

        <Route path="*" element={<Navigate to={isLoggedIn() ? getHomePath() : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
