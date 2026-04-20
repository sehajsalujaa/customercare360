import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Sidebar, TopBar } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { agentApi } from "../../api/agent.api";
import { notificationsApi } from "../../api/notifications.api";

const card = { background: "linear-gradient(135deg, #FBF9E7 0%, #f4fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 18, boxShadow: "0 8px 20px rgba(130,200,229,0.16)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #bcdff0", background: "#ffffff", color: "#1f2937" };
const btn = { background: "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

// ────── Stat Card ──────
function StatCard({ label, value, icon, color = "#82C8E5" }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 20, boxShadow: "0 8px 20px rgba(130,200,229,0.12)", display: "grid", gridTemplateColumns: "auto 1fr", gap: 15, alignItems: "center" }}>
      <div style={{ width: 50, height: 50, borderRadius: 10, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
        {icon}
      </div>
      <div>
        <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ color: "#1f2937", fontSize: 28, fontWeight: 800 }}>{value}</div>
      </div>
    </div>
  );
}

// ────── Activity Item ──────
function ActivityItem({ icon, title, subtitle, priority, timestamp }) {
  const priorityColor = { HIGH: "#ef4444", MEDIUM: "#f97316", LOW: "#eab308", CRITICAL: "#dc2626" };
  return (
    <div style={{ padding: 12, border: "1px solid #d6eaf4", borderRadius: 8, background: "#ffffff", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "#1f2937", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        {priority && <span style={{ background: priorityColor[priority] || "#64748b", color: "#ffffff", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{priority}</span>}
        <span style={{ color: "#94a3b8", fontSize: 10 }}>{timestamp}</span>
      </div>
    </div>
  );
}

// ────── Main Component ──────
export default function AgentDashboardPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Real data from API
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingApprovals: 0,
    complaintsMonth: 0,
    openRequests: 0
  });

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("cc360_user") || "{}");
      return user?.userId || user?.id || user?.user?.userID || user?.user?.id;
    } catch {
      return null;
    }
  };

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      const [statsRes, complaintsRes, activitiesRes, notifRes, unreadRes] = await Promise.allSettled([
        agentApi.getStats(),
        agentApi.getRecentComplaints(5),
        agentApi.getRecentActivities(5),
        userId ? notificationsApi.getForUser(userId) : Promise.resolve({ data: [] }),
        userId ? notificationsApi.getUnreadCount(userId) : Promise.resolve({ data: 0 })
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value?.data || { totalCustomers: 0, pendingApprovals: 0, complaintsMonth: 0, openRequests: 0 });
      } else {
        throw new Error(statsRes.reason?.message || "Failed to fetch dashboard stats");
      }

      setRecentComplaints(complaintsRes.status === "fulfilled" ? (complaintsRes.value?.data || []) : []);
      setRecentActivities(activitiesRes.status === "fulfilled" ? (activitiesRes.value?.data || []) : []);
      setNotifications(notifRes.status === "fulfilled" ? (notifRes.value?.data || []) : []);
      setUnreadCount(unreadRes.status === "fulfilled" ? Number(unreadRes.value?.data || 0) : 0);
    } catch (error) {
      console.error("Dashboard load error:", error);
      toast.error(error?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const goToCustomerProfileSearch = () => {
    const term = customerSearch.trim();
    if (!term) {
      toast.error("Enter Customer ID or Name");
      return;
    }
    navigate(`/customers/profile?search=${encodeURIComponent(term)}`);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
        <Sidebar active={active} setActive={setActive} unreadCount={unreadCount} />
        <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <div style={{ color: "#1f2937", fontWeight: 700 }}>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
      <Sidebar active={active} setActive={setActive} unreadCount={unreadCount} />
      <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1 }}>
        <TopBar title="Agent Dashboard" notifications={notifications} />
        
        <div style={{ padding: "24px 28px", display: "grid", gap: 16 }}>
          
          {/* ────── Header ────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Dashboard Overview</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Manage customers, complaints and service accounts</p>
            </div>
            <button onClick={loadDashboardData} style={{ background: "#82C8E5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>↻ Refresh</button>
          </div>

          {/* ────── Stat Cards ────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <StatCard label="Total Customers" value={stats.totalCustomers} icon="👥" color="#82C8E5" />
            <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon="✅" color="#50C878" />
            <StatCard label="Complaints (Month)" value={stats.complaintsMonth} icon="⚖️" color="#f97316" />
            <StatCard label="Open Requests" value={stats.openRequests} icon="🔧" color="#FDB813" />
          </div>

          {/* ────── Quick Actions ────── */}
          <div style={card}>
            <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>⚡ Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              <button onClick={() => navigate("/customers/new")} style={{ ...btn, display: "flex", flexDirection: "column", gap: 8, height: 80, fontSize: 12, backgroundColor: "#50C878" }}>
                <span style={{ fontSize: 20 }}>➕</span>
                Create Customer
              </button>
              <button onClick={() => navigate("/customers/profile")} style={{ ...btn, display: "flex", flexDirection: "column", gap: 8, height: 80, fontSize: 12, backgroundColor: "#82C8E5" }}>
                <span style={{ fontSize: 20 }}>🔍</span>
                View Profile
              </button>
              <button onClick={() => navigate("/accounts")} style={{ ...btn, display: "flex", flexDirection: "column", gap: 8, height: 80, fontSize: 12, backgroundColor: "#FDB813" }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                Service Accts
              </button>
              <button onClick={() => navigate("/agent/complaints")} style={{ ...btn, display: "flex", flexDirection: "column", gap: 8, height: 80, fontSize: 12, backgroundColor: "#f97316" }}>
                <span style={{ fontSize: 20 }}>⚖️</span>
                Log Complaint
              </button>
            </div>
          </div>

          {/* ────── Recent Complaints ────── */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#1f2937", fontWeight: 800, margin: 0 }}>📝 Recent Complaints (Last 7 Days)</h3>
              <button onClick={() => navigate("/agent/complaints")} style={{ background: "transparent", color: "#82C8E5", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>View All →</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {recentComplaints.length ? (
                recentComplaints.map(c => (
                  <ActivityItem 
                    key={c.id} 
                    icon={c.icon || "⚖️"} 
                    title={c.title || c.complaintCategory} 
                    subtitle={c.subtitle || c.description} 
                    priority={c.priority || c.complaintStatus} 
                    timestamp={c.timestamp || new Date(c.createdAt).toLocaleDateString()}
                  />
                ))
              ) : (
                <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No complaints this week</div>
              )}
            </div>
          </div>

          {/* ────── Recent Activities ────── */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#1f2937", fontWeight: 800, margin: 0 }}>📊 Recent Activities</h3>
              <button onClick={loadDashboardData} style={{ background: "transparent", color: "#82C8E5", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Refresh →</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {recentActivities.length ? (
                recentActivities.map(a => (
                  <ActivityItem 
                    key={a.id} 
                    icon={a.icon || "📝"} 
                    title={a.title || "Activity"} 
                    subtitle={a.details || a.description} 
                    timestamp={a.timestamp || new Date(a.createdAt).toLocaleDateString()}
                  />
                ))
              ) : (
                <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No recent activities</div>
              )}
            </div>
          </div>

          {/* ────── Customer Search ────── */}
          <div style={card}>
            <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>🔍 Search Customer Profile</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
              <input
                placeholder="Enter Customer ID or Name"
                style={input}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToCustomerProfileSearch();
                }}
              />
              <button style={btn} onClick={goToCustomerProfileSearch}>Search</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
