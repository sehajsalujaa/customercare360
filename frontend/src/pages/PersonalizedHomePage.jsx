import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, TopBar } from "../components/Layout";

const G = {
  bg: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 55%, #fff8dc 100%)",
  text: "#1f2937",
  light: "#64748b",
  muted: "#94a3b8",
  border: "#d6eaf4",
  green: "#50C878",
  blue: "#82C8E5",
  gold: "#FDB813",
  red: "#ef4444",
  purple: "#8b5cf6",
};

function getUser() {
  try { return JSON.parse(localStorage.getItem("cc360_user") || "{}"); } catch { return {}; }
}

function getRole(roles) {
  if (roles?.includes("ROLE_ADMIN")) return "ROLE_ADMIN";
  if (roles?.includes("ROLE_AGENT")) return "ROLE_AGENT";
  if (roles?.includes("ROLE_BILLING_ANALYST")) return "ROLE_BILLING_ANALYST";
  if (roles?.includes("ROLE_FIELD_COORDINATOR")) return "ROLE_FIELD_COORDINATOR";
  if (roles?.includes("ROLE_CUSTOMER")) return "ROLE_CUSTOMER";
  return "UNKNOWN";
}

function getWelcomeMessage(role, name) {
  const greetings = {
    ROLE_ADMIN: `Welcome back, ${name}! 👑 Ready to oversee the system?`,
    ROLE_AGENT: `Welcome, ${name}! 👤 Let's manage customer accounts today.`,
    ROLE_BILLING_ANALYST: `Welcome, ${name}! 📊 Time to process billing operations.`,
    ROLE_FIELD_COORDINATOR: `Welcome, ${name}! 🔧 Let's coordinate field operations.`,
    ROLE_CUSTOMER: `Welcome home, ${name}! 🏠 Check your utilities in one place.`,
  };
  return greetings[role] || `Welcome, ${name}!`;
}

function getQuickStats(role) {
  const stats = {
    ROLE_ADMIN: [
      { icon: "📊", label: "Total Bills", action: "/admin/bills" },
      { icon: "⏳", label: "Pending Approvals", action: "/admin/approvals" },
      { icon: "📋", label: "All Complaints", action: "/admin/complaints" },
      { icon: "🔐", label: "System Settings", action: "/admin/roles" },
    ],
    ROLE_AGENT: [
      { icon: "👥", label: "Customers", action: "/customers/profile" },
      { icon: "💳", label: "Service Accounts", action: "/accounts" },
      { icon: "📣", label: "Complaints", action: "/agent/complaints" },
      { icon: "🔔", label: "Notifications", action: "/agent/notifications" },
    ],
    ROLE_BILLING_ANALYST: [
      { icon: "🧾", label: "Bills Dashboard", action: "/billing/dashboard" },
      { icon: "💳", label: "Billing Cycles", action: "/billing/dashboard" },
      { icon: "⚖️", label: "Dispute Resolution", action: "/billing/dashboard" },
      { icon: "📈", label: "Reports", action: "/admin/reports" },
    ],
    ROLE_FIELD_COORDINATOR: [
      { icon: "🔧", label: "Service Orders", action: "/field/dashboard" },
      { icon: "📊", label: "Meter Readings", action: "/field/dashboard" },
      { icon: "🗺️", label: "Premises Mapping", action: "/field/dashboard" },
      { icon: "📩", label: "Notifications", action: "/field/dashboard" },
    ],
    ROLE_CUSTOMER: [
      { icon: "💳", label: "My Bills", action: "/customer/dashboard" },
      { icon: "🔧", label: "Service Requests", action: "/customer/dashboard" },
      { icon: "⚖️", label: "Disputes & Complaints", action: "/customer/dashboard" },
      { icon: "📩", label: "Notifications", action: "/customer/dashboard" },
    ],
  };
  return stats[role] || [];
}

function getFeatures(role) {
  const features = {
    ROLE_ADMIN: [
      { icon: "🏢", title: "System Oversight", desc: "Monitor all billing cycles, customer approvals, and system health in real-time." },
      { icon: "⚙️", title: "Role Management", desc: "Configure user roles, permissions, and access levels across the entire platform." },
      { icon: "📋", title: "Audit Trail", desc: "Track all system changes and user actions for compliance and security." },
      { icon: "📊", title: "Analytics Dashboard", desc: "View detailed reports on billing accuracy, collection rates, and system performance." },
    ],
    ROLE_AGENT: [
      { icon: "👥", title: "Customer Management", desc: "Onboard new customers, link service accounts, and track their complete profile." },
      { icon: "🔗", title: "Account Linking", desc: "Connect customers to their service accounts for seamless billing." },
      { icon: "🎯", title: "Complaint Tracking", desc: "Receive and manage customer complaints with priority-based workflows." },
      { icon: "📞", title: "Customer Support", desc: "Provide first-line support with access to full customer history and services." },
    ],
    ROLE_BILLING_ANALYST: [
      { icon: "📅", title: "Billing Cycles", desc: "Create and manage billing cycles, generate bills, and process transactions." },
      { icon: "💰", title: "Tariff Management", desc: "Set up and maintain tariff slabs, taxes, duties, and subsidies." },
      { icon: "⚖️", title: "Dispute Resolution", desc: "Review and approve billing disputes with detailed justification tracking." },
      { icon: "❌", title: "Exception Handling", desc: "Identify and retry failed billing operations to ensure accuracy." },
    ],
    ROLE_FIELD_COORDINATOR: [
      { icon: "🔧", title: "Service Orders", desc: "Create and manage field service orders with technician assignments." },
      { icon: "📍", title: "Premise Management", desc: "Link meters to premises and track service account locations." },
      { icon: "📊", title: "Meter Readings", desc: "Submit and validate meter readings for billing cycle operations." },
      { icon: "✅", title: "Quality Control", desc: "Validate meter data and ensure billing-ready accuracy." },
    ],
    ROLE_CUSTOMER: [
      { icon: "💳", title: "View & Pay Bills", desc: "See your current and past bills, download invoices, and pay online." },
      { icon: "📊", title: "Usage Tracking", desc: "Monitor your monthly energy, gas, or water consumption patterns." },
      { icon: "⚖️", title: "Dispute Billing", desc: "Challenge incorrect charges and track resolution status." },
      { icon: "🔧", title: "Request Services", desc: "Request new connections, meter checks, or other support services." },
    ],
  };
  return features[role] || [];
}

function getRoleColor(role) {
  const colors = {
    ROLE_ADMIN: { bg: "#a78bfa33", border: "#a78bfa", text: "#7c3aed" },
    ROLE_AGENT: { bg: "#3b82f633", border: "#3b82f6", text: "#1d4ed8" },
    ROLE_BILLING_ANALYST: { bg: "#f59e0b33", border: "#f59e0b", text: "#d97706" },
    ROLE_FIELD_COORDINATOR: { bg: "#ec406933", border: "#ec4067", text: "#c41e3a" },
    ROLE_CUSTOMER: { bg: "#10b98133", border: "#10b981", text: "#047857" },
  };
  return colors[role] || { bg: "#e5e7eb33", border: "#e5e7eb", text: "#6b7280" };
}

export default function PersonalizedHomePage() {
  const navigate = useNavigate();
  const user = getUser();
  const role = getRole(user.roles);
  const name = user.name || user.email?.split("@")[0] || "User";
  const [active, setActive] = useState("home");

  const roleColor = getRoleColor(role);
  const quickStats = getQuickStats(role);
  const features = getFeatures(role);

  const handleStatClick = (action) => {
    navigate(action);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: G.bg }}>
      <Sidebar active={active} setActive={setActive} />

      <div className="page-content" style={{ marginLeft: "var(--app-sidebar-width)", flex: 1 }}>
        <TopBar title="Home" />

        <div style={{ padding: "24px 28px", display: "grid", gap: 24 }}>
          {/* ── Welcome Banner ── */}
          <div
            style={{
              background: `linear-gradient(135deg, ${roleColor.bg}, rgba(130,200,229,0.1))`,
              border: `2px solid ${roleColor.border}`,
              borderRadius: 16,
              padding: 32,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: `${roleColor.border}11`, borderRadius: "50%" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: roleColor.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                {role === "ROLE_ADMIN"
                  ? "👑 Administrator"
                  : role === "ROLE_AGENT"
                  ? "👤 Customer Agent"
                  : role === "ROLE_BILLING_ANALYST"
                  ? "📊 Billing Analyst"
                  : role === "ROLE_FIELD_COORDINATOR"
                  ? "🔧 Field Coordinator"
                  : "🏠 Customer"}
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: G.text, margin: 0, marginBottom: 12 }}>
                {getWelcomeMessage(role, name)}
              </h1>
              <p style={{ fontSize: 14, color: G.light, lineHeight: 1.6, margin: 0, maxWidth: 600 }}>
                {role === "ROLE_ADMIN"
                  ? "Oversee all system operations, manage users, and monitor billing cycles and approvals."
                  : role === "ROLE_AGENT"
                  ? "Onboard customers, manage service accounts, and provide customer support."
                  : role === "ROLE_BILLING_ANALYST"
                  ? "Process billing cycles, manage tariffs, and resolve billing disputes."
                  : role === "ROLE_FIELD_COORDINATOR"
                  ? "Create service orders, manage premises, and process meter readings."
                  : "Manage all your utility services in one convenient place."}
              </p>
            </div>
          </div>

          {/* ── Quick Stats ── */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: G.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              ⚡ Quick Access
            </h3>
            <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {quickStats.map((stat, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStatClick(stat.action)}
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f5fbff 100%)",
                    border: "1px solid #cde8f4",
                    borderRadius: 12,
                    padding: 18,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textAlign: "center",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(130,200,229,0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{stat.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Key Features ── */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: G.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              🎯 Your Role Features
            </h3>
            <div className="rg-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f5fbff 100%)",
                    border: "1px solid #cde8f4",
                    borderRadius: 14,
                    padding: 20,
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = roleColor.border;
                    e.currentTarget.style.boxShadow = `0 8px 24px ${roleColor.bg}`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#cde8f4";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ fontSize: 28 }}>{feature.icon}</div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: G.text, margin: "0 0 6px" }}>{feature.title}</h4>
                      <p style={{ fontSize: 12, color: G.light, lineHeight: 1.5, margin: 0 }}>{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div
            style={{
              background: `linear-gradient(135deg, ${roleColor.border}22, ${roleColor.border}11)`,
              border: `1px solid ${roleColor.border}`,
              borderRadius: 14,
              padding: 28,
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: G.text, margin: "0 0 10px" }}>Ready to Get Started?</h3>
            <p style={{ fontSize: 13, color: G.light, margin: "0 0 16px" }}>
              Access your full dashboard and start managing your responsibilities.
            </p>
            <button
              onClick={() => {
                if (role === "ROLE_ADMIN") navigate("/admin/dashboard");
                else if (role === "ROLE_AGENT") navigate("/agent/dashboard");
                else if (role === "ROLE_BILLING_ANALYST") navigate("/billing/dashboard");
                else if (role === "ROLE_FIELD_COORDINATOR") navigate("/field/dashboard");
                else navigate("/customer/dashboard");
              }}
              style={{
                background: `linear-gradient(135deg, ${roleColor.border}, ${roleColor.text}cc)`,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 32px",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 14,
                boxShadow: `0 8px 20px ${roleColor.bg}`,
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 12px 28px ${roleColor.bg}`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 8px 20px ${roleColor.bg}`;
              }}
            >
              🚀 Go to Full Dashboard →
            </button>
          </div>

          {/* ── Security & Account ── */}
          <div
            style={{
              background: `linear-gradient(135deg, #ef444422, #dc262622)`,
              border: `1px solid #ef4444`,
              borderRadius: 14,
              padding: 28,
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: G.text, margin: "0 0 10px" }}>🔒 Account Security</h3>
            <p style={{ fontSize: 13, color: G.light, margin: "0 0 16px" }}>
              Logout from all devices to secure your account from unauthorized access.
            </p>
            <button
              onClick={() => navigate("/logout-all")}
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 32px",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 14,
                boxShadow: "0 8px 20px rgba(239, 68, 68, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(239, 68, 68, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(239, 68, 68, 0.3)";
              }}
            >
              🔒 Logout from All Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
