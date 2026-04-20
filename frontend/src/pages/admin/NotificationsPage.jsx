import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Sidebar, TopBar } from "../../components/Layout.jsx";
import { notificationsApi } from "../../api/notifications.api.js";
import { Empty, Spinner, Stat } from "../../styles/ui.jsx";

// 🎨 Keyframe Animations
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 12px rgba(59,130,246,0.4); }
    50% { box-shadow: 0 0 24px rgba(59,130,246,0.8); }
  }
  .ani-fade-up { animation: fadeInUp 0.5s ease-out forwards; }
  .ani-fade-left { animation: fadeInLeft 0.5s ease-out forwards; }
  .ani-fade-right { animation: fadeInRight 0.5s ease-out forwards; }
  .ani-pulse { animation: pulse-glow 2.5s ease-in-out infinite; }
`;

if (typeof window !== "undefined" && !document.getElementById("notifications-animations")) {
  const styleEl = document.createElement("style");
  styleEl.id = "notifications-animations";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

// 🎨 Design System
const P = {
  container: { display: "flex", gap: 16 },
  main: { marginLeft: "var(--app-sidebar-width)", flex: 1, background: "linear-gradient(145deg, #FBF9E7 0%, #f2fbff 60%, #fff8e8 100%)", minHeight: "100vh", color: "#1f2937" },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 20, boxShadow: "0 8px 20px rgba(130,200,229,0.16)", marginBottom: 20, animation: "fadeInUp 0.5s ease-out" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 },
  stat: (color) => ({ background: "linear-gradient(135deg, #ffffff 0%, #f5fbff 100%)", border: `2px solid ${color}33`, borderRadius: 12, padding: 20, textAlign: "center", transition: "all 0.3s ease", cursor: "pointer" }),
  statValue: { fontSize: 32, fontWeight: 900, marginBottom: 8 },
  statLabel: { fontSize: 13, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  button: { background: "linear-gradient(135deg, #50C878 0%, #3fb967 100%)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease" },
  buttonSecondary: { background: "#ffffff", color: "#1f2937", border: "1px solid #82C8E5", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { background: "#ffffff", padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1px solid #d6eaf4", textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 },
  td: { padding: "12px 16px", borderBottom: "1px solid #e3eff6", color: "#334155" },
  badge: (bg, color) => ({ background: `${bg}22`, color: color, border: `1px solid ${bg}66`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, display: "inline-block", textTransform: "uppercase", letterSpacing: 0.3 }),
  notificationItem: { background: "linear-gradient(135deg, #ffffff 0%, #f5fbff 100%)", border: "1px solid #d6eaf4", borderRadius: 10, padding: 16, marginBottom: 12, transition: "all 0.3s ease", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
};

const getCategoryColor = (category) => {
  const colors = { BILLING: "#3b82f6", COMPLAINT: "#ef4444", ORDER: "#f59e0b", REQUEST: "#22c55e", APPROVAL: "#a78bfa" };
  return colors[category] || "#64748b";
};

const getStatusColor = (status) => {
  const colors = { UNREAD: "#ef4444", READ: "#22c55e" };
  return colors[status] || "#64748b";
};

export default function NotificationsPage() {
  const [active, setActive] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(false);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("cc360_user") || "{}");
    } catch {
      return {};
    }
  })();
  const roles = storedUser?.roles || [];
  const topBarTitle = roles.includes("ROLE_AGENT") ? "Agent Dashboard" : "Admin Dashboard";

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getMine();
      
      // Handle different response formats
      let notifList = [];
      if (Array.isArray(response)) {
        notifList = response;
      } else if (Array.isArray(response?.data)) {
        notifList = response.data;
      } else if (response?.data) {
        notifList = [response.data];
      }
      
      setNotifications(notifList);
    } catch (error) {
      console.error("Notifications fetch error:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsApi.getMyUnreadCount();
      const count = Number(response?.data ?? response ?? 0);
      setUnreadCount(Number.isFinite(count) ? count : 0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markMyRead();
      toast.success("All notifications marked as read");
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      toast.error("Failed to mark as read");
      console.error(error);
    }
  };

  const handleDismiss = async (notificationId) => {
    try {
      setDismissing(true);
      await notificationsApi.dismiss(notificationId);
      toast.success("Notification dismissed");
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      toast.error("Failed to dismiss notification");
      console.error(error);
    } finally {
      setDismissing(false);
    }
  };

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => n.status === "UNREAD").length;
    const read = notifications.filter(n => n.status === "READ").length;
    return { total, unread, read };
  }, [notifications]);

  return (
    <div style={P.container}>
      <Sidebar active={active} setActive={setActive} />
      <div style={P.main}>
        <TopBar title={topBarTitle} />

        <div style={{ padding: "24px 28px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Notifications</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>System alerts, approvals and activity updates</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* 📊 STAT CARDS */}
            <div style={P.statGrid}>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0s" }}>
                <Stat label="Total Notifications" value={stats.total} icon="🔔" color="#3b82f6" loading={loading} />
              </div>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0.1s" }}>
                <Stat label="Unread" value={stats.unread} icon="📩" color="#ef4444" loading={loading} />
              </div>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0.2s" }}>
                <Stat label="Read" value={stats.read} icon="✅" color="#22c55e" loading={loading} />
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button
                onClick={handleMarkAllRead}
                style={{ ...P.button, display: "flex", alignItems: "center", gap: 8 }}
              >
                ✅ Mark All as Read
              </button>
              <button
                onClick={loadNotifications}
                style={{ ...P.buttonSecondary, display: "flex", alignItems: "center", gap: 8 }}
              >
                🔄 Refresh
              </button>
            </div>

            {/* NOTIFICATIONS LIST */}
            <div style={P.card}>
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
                📬 Your Notifications
              </h3>

              {notifications.length > 0 ? (
                <div>
                  {notifications.map((notification, index) => (
                    <div
                      key={
                        notification.id ??
                        notification.notificationId ??
                        `${notification.createdAt || "na"}-${notification.message || "notification"}-${index}`
                      }
                      style={{
                        ...P.notificationItem,
                        opacity: notification.status === "READ" ? 0.7 : 1,
                        borderLeft: `4px solid ${getStatusColor(notification.status)}`,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={P.badge(getCategoryColor(notification.category || "APPROVAL"), getCategoryColor(notification.category || "APPROVAL"))}>
                            {notification.category || "NOTIFICATION"}
                          </span>
                          <span style={P.badge(getStatusColor(notification.status), getStatusColor(notification.status))}>
                            {notification.status || "READ"}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, color: "#1f2937", fontWeight: 500, marginBottom: 4 }}>
                          {notification.message || notification.title || "Notification"}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismiss(notification.id || notification.notificationId)}
                        disabled={dismissing}
                        style={{
                          ...P.buttonSecondary,
                          minWidth: 100,
                          opacity: dismissing ? 0.6 : 1,
                        }}
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <Empty message="No notifications yet" />
                  <div style={{ marginTop: 16, fontSize: 12, color: "#64748b", maxWidth: 400, margin: "16px auto 0" }}>
                    <p>Notifications will appear here when:</p>
                    <ul style={{ textAlign: "left", display: "inline-block" }}>
                      <li>Customer accounts are approved/rejected</li>
                      <li>Complaints are filed or resolved</li>
                      <li>Billing events occur</li>
                      <li>Service orders are created/completed</li>
                      <li>System alerts are triggered</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        </div>
      </div>
    </div>
  );
}
