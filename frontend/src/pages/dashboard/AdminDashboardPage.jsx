import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  card,
  h3s,
  TH,
  TD,
  btn,
  Stat,
  Badge,
  Spinner,
  Empty,
  statusColor,
} from "../../styles/ui.jsx";
import { Sidebar, TopBar } from "../../components/Layout.jsx";
import { reportsApi } from "../../api/reports.api";
import { authApi } from "../../api/auth.api";
import { adminApi } from "../../api/admin.api";
import { complaintsApi } from "../../api/complaints.api";

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
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 12px rgba(59,130,246,0.4); }
    50% { box-shadow: 0 0 24px rgba(59,130,246,0.8); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  @keyframes spin-subtle {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .ani-fade-up { animation: fadeInUp 0.5s ease-out forwards; }
  .ani-fade-left { animation: fadeInLeft 0.5s ease-out forwards; }
  .ani-fade-right { animation: fadeInRight 0.5s ease-out forwards; }
  .ani-slide-down { animation: slideDown 0.4s ease-out forwards; }
  .ani-pulse { animation: pulse-glow 2.5s ease-in-out infinite; }
  .ani-float { animation: float 3s ease-in-out infinite; }
  .ani-spin { animation: spin-subtle 1s linear infinite; }
`;

// Inject styles
if (typeof window !== "undefined" && !document.getElementById("dashboard-animations")) {
  const styleEl = document.createElement("style");
  styleEl.id = "dashboard-animations";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

export default function AdminDashboard() {
  const AUDIT_PAGE_SIZE = 10;
  const navigate = useNavigate();
  // ✅ ROLE FIX (from localStorage)
  const stored = JSON.parse(localStorage.getItem("cc360_user") || "{}");
  const role = stored?.roles?.[0] || "";
  const [active, setActive] = useState("dashboard");
  const [dash, setDash] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [complaints, setComplaints] = useState([]);
  const [complaintStats, setComplaintStats] = useState({ total: 0, resolved: 0, pending: 0, avgTime: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  // ✅ NEW STATES
  const [pendingList, setPendingList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    if (role.includes("ADMIN")) {
      fetchDashboard();
      fetchAudit();
    }
  }, [role]);
  if (!role.includes("ADMIN"))
    return <div>Not authorized</div>;

  // ================= FETCH DASHBOARD =================
  const fetchDashboard = async () => {
    try {
      const res = await reportsApi.getDashboard();
      const data = res.data;
      setDash(data);
      const formatted = Object.entries(data.adjustmentsTrend || {}).map(
        ([month, val]) => ({
          month,
          adjustments: val,
        })
      );
      setChartData(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  // ================= FETCH AUDIT =================
  const fetchAudit = async () => {
    try {
      const res = await authApi.getAllAuditLogs();
      setAuditLogs(res.data);
      setAuditPage(1);
    } catch (e) {
      console.error(e);
    }
  };
  // ================= FETCH COMPLAINTS =================
  const fetchComplaints = async () => {
    if (!complaintsApi.getAll) {
      setComplaints([]);
      setComplaintStats({ total: 0, resolved: 0, pending: 0, avgTime: 0 });
      return;
    }

    try {
      const res = await complaintsApi.getAll();
      const list = res.data || [];
      setComplaints(list);
      const resolved = list.filter((c) => c.complaintStatus === "RESOLVED").length;
      const pending = list.filter((c) => c.complaintStatus === "PENDING" || c.complaintStatus === "OPEN").length;
      const resolvedComplaints = list.filter((c) => c.complaintStatus === "RESOLVED" && c.updatedAt && c.createdAt);
      const avgTime = resolvedComplaints.length > 0
        ? Math.round(
            resolvedComplaints.reduce((sum, c) => {
              const created = new Date(c.createdAt);
              const updated = new Date(c.updatedAt);
              return sum + (updated - created) / (1000 * 60 * 60);
            }, 0) / resolvedComplaints.length
          )
        : 0;

      setComplaintStats({ total: list.length, resolved, pending, avgTime });
    } catch (e) {
      console.error("Complaints fetch error", e);
    }
  };
  const fetchPendingApprovals = async () => {
    try {
      const res = await adminApi.getPendingCustomers();
      const list = res.data || [];
      setPendingList(list);
      // ✅ safer update
      setDash((prev) => ({
        ...prev,
        pendingApprovals: list.length,
      }));
    } catch (e) {
      console.error("Pending fetch error", e);
    }
  };
  // ================= EFFECT =================
  useEffect(() => {
    fetchDashboard();
    fetchAudit();
    fetchComplaints();
    fetchPendingApprovals();
  }, []);
  // ================= AUTO REFRESH =================
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingApprovals();
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  // ================= NOTIFICATIONS =================
  useEffect(() => {
    const formatted = pendingList.map((c) => ({
      id: c.id,
      message: `${c.name} (${c.user?.email}) is waiting for approval`,
    }));
    setNotifications(formatted);
  }, [pendingList]);

  const totalAuditPages = Math.max(1, Math.ceil((auditLogs?.length || 0) / AUDIT_PAGE_SIZE));
  const safeAuditPage = Math.min(auditPage, totalAuditPages);
  const auditStart = (safeAuditPage - 1) * AUDIT_PAGE_SIZE;
  const paginatedAuditLogs = (auditLogs || []).slice(auditStart, auditStart + AUDIT_PAGE_SIZE);

  useEffect(() => {
    if (auditPage > totalAuditPages) {
      setAuditPage(totalAuditPages);
    }
  }, [auditPage, totalAuditPages]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
      <Sidebar active={active} setActive={setActive} pendingCount={dash.pendingApprovals || 0} />

        <div className="page-content" style={{ marginLeft: "var(--app-sidebar-width)", flex: 1, background: "linear-gradient(145deg, #FBF9E7 0%, #f2fbff 60%, #fff8e8 100%)", position: "relative", overflow: "hidden" }}>
        {/* Background gradient accent */}
        <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(80,200,120,0.08) 0%, transparent 70%)", pointerEvents: "none", animation: "float 8s ease-in-out infinite" }} />

        <TopBar title="Admin Dashboard" notifications={notifications} />

        <div style={{ padding: "24px 28px", display: "grid", gap: 16, position: "relative", zIndex: 1 }}>

          {/* ── Page Header ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Dashboard Overview</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Monitor billing, approvals, complaints and system activity</p>
            </div>
            <button
              onClick={() => { fetchDashboard(); fetchAudit(); fetchPendingApprovals(); }}
              style={{ background: "linear-gradient(135deg, #50C878 0%, #3fb967 100%)", color: "#ffffff", border: "1px solid #6fd597", borderRadius: 10, padding: "10px 18px", fontSize: 12, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", boxShadow: "0 4px 12px rgba(80,200,120,0.2)" }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = "0 8px 20px rgba(80,200,120,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(80,200,120,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span className="ani-spin" style={{ display: "inline-block" }}>↻</span> Refresh
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {/* Total Bills */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.1s backwards" }}>
              <div
                onClick={() => navigate("/admin/bills")}
                style={{ cursor: "pointer", transition: "transform 0.25s ease, filter 0.25s ease" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
              >
                <Stat label="Total Bills" value={dash.totalBills} icon="🧾" color="#3b82f6" loading={loading} />
              </div>
            </div>

            {/* Adjusted Bills */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.2s backwards" }}>
              <div
                style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
              >
                <Stat label="Adjusted Bills" value={dash.adjustedBills} icon="⚙️" color="#f59e0b" loading={loading} />
              </div>
            </div>

            {/* Accuracy */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.3s backwards" }}>
              <div
                style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
              >
                <Stat label="Accuracy Rate" value={`${(dash.accuracyRate || 0).toFixed(2)}%`} icon="✅" color="#22c55e" loading={loading} />
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.4s backwards" }}>
              <div
                onClick={() => navigate("/admin/approvals")}
                style={{ cursor: "pointer", transition: "transform 0.25s ease, filter 0.25s ease" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
              >
                <Stat label="Pending Approvals" value={pendingList.length} icon="🕐" color="#ef4444" loading={loading} />
              </div>
            </div>
          </div>

          {/* ── Chart + System Status ── */}
          <div className="rg-main" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            {/* CHART */}
            <div className="ani-fade-left" style={{ animation: "fadeInLeft 0.6s ease-out 0.3s backwards", background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: "22px 24px", boxShadow: "0 12px 32px rgba(130,200,229,0.15)", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1f2937", letterSpacing: -0.3 }}>Billing Trend</h3>
                  <p style={{ margin: "5px 0 0", fontSize: 11, color: "#64748b" }}>Monthly adjustment volume</p>
                </div>
                <span style={{ background: "linear-gradient(135deg, #f59e0b22, #f5a60b11)", color: "#f59e0b", border: "1px solid #f59e0b33", borderRadius: 8, padding: "5px 12px", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
                  MONTHLY
                </span>
              </div>
              {chartData.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 10, fontSize: 12, color: "#1f2937", boxShadow: "0 8px 24px rgba(130,200,229,0.15)" }}
                      cursor={{ fill: "#1e2d4a55" }}
                    />
                    <Bar dataKey="adjustments" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty msg="No billing data yet" />
              )}
            </div>

            {/* SYSTEM STATUS */}
            <div className="ani-fade-right" style={{ animation: "fadeInRight 0.6s ease-out 0.3s backwards", background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: "22px 24px", boxShadow: "0 12px 32px rgba(130,200,229,0.15)" }}>
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1f2937", letterSpacing: -0.3 }}>System Status</h3>
                <p style={{ margin: "5px 0 0", fontSize: 11, color: "#64748b" }}>Live service health</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Backend API", status: "ACTIVE", icon: "⚡" },
                  { label: "Database", status: "ACTIVE", icon: "🗄️" },
                  { label: "JWT Auth", status: "ACTIVE", icon: "🔐" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", borderRadius: 11, padding: "13px 15px", border: "1px solid #d6eaf4", transition: "all 0.3s ease", cursor: "pointer" }}
                    onMouseOver={e => { e.currentTarget.style.background = "#eef8ff"; e.currentTarget.style.borderColor = "#82C8E5"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#d6eaf4"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <span style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55eaa", animation: "pulse-glow 2s ease-in-out infinite" }} className="ani-pulse" />
                      <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, letterSpacing: 0.5 }}>ONLINE</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Audit Logs ── */}
          <div className="ani-fade-up" style={{ animation: "fadeInUp 0.6s ease-out 0.5s backwards", background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: "22px 24px", boxShadow: "0 12px 32px rgba(130,200,229,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1f2937", letterSpacing: -0.3 }}>Auth Audit Logs</h3>
                <p style={{ margin: "5px 0 0", fontSize: 11, color: "#64748b" }}>
                  {auditLogs.length} recent event{auditLogs.length !== 1 ? "s" : ""} • showing {auditLogs.length ? auditStart + 1 : 0}-{Math.min(auditStart + AUDIT_PAGE_SIZE, auditLogs.length)}
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/audit")}
                style={{ background: "linear-gradient(135deg, #1e3a6e 0%, #1a2a4f 100%)", color: "#93c5fd", border: "1px solid #2d4f8e", borderRadius: 8, padding: "6px 14px", fontSize: 11, cursor: "pointer", fontWeight: 700, transition: "all 0.3s ease" }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = "0 6px 16px rgba(29, 78, 216, 0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                View All →
              </button>
            </div>
            {auditLogs.length === 0 ? (
              <Empty msg="No audit logs found" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f5fbff" }}>
                      <th style={TH}>Email</th>
                      <th style={TH}>Action</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAuditLogs.map((log, i) => (
                      <tr
                        key={`${log.timestamp}-${i}`}
                        style={{ borderBottom: "1px solid #e3eff6", transition: "all 0.2s ease" }}
                        onMouseOver={e => { e.currentTarget.style.background = "#eef8ff"; }}
                        onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={TD}>{log.email}</td>
                        <td style={{ ...TD, color: "#1f2937", fontWeight: 700 }}>{log.action}</td>
                        <td style={TD}>
                          <Badge text={log.status} color={statusColor(log.status)} />
                        </td>
                        <td style={{ ...TD, color: "#475569", fontSize: 11 }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {auditLogs.length > AUDIT_PAGE_SIZE && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 10, borderTop: "1px solid #d6eaf4" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Page {safeAuditPage} of {totalAuditPages}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={safeAuditPage === 1}
                        style={{ background: safeAuditPage === 1 ? "#e2e8f0" : "#82C8E5", color: safeAuditPage === 1 ? "#64748b" : "#ffffff", border: "1px solid #bcdff0", borderRadius: 7, padding: "5px 11px", fontSize: 11, cursor: safeAuditPage === 1 ? "not-allowed" : "pointer", fontWeight: 700 }}
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setAuditPage((p) => Math.min(totalAuditPages, p + 1))}
                        disabled={safeAuditPage === totalAuditPages}
                        style={{ background: safeAuditPage === totalAuditPages ? "#e2e8f0" : "#82C8E5", color: safeAuditPage === totalAuditPages ? "#64748b" : "#ffffff", border: "1px solid #bcdff0", borderRadius: 7, padding: "5px 11px", fontSize: 11, cursor: safeAuditPage === totalAuditPages ? "not-allowed" : "pointer", fontWeight: 700 }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Complaints Section ── */}
          <div>
            {/* Complaint Stats */}
            <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              {/* Total Complaints */}
              <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.1s backwards" }}>
                <div
                  style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
                >
                  <Stat label="Total Complaints" value={complaintStats.total} icon="📋" color="#8b5cf6" loading={loading} />
                </div>
              </div>

              {/* Resolved */}
              <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.2s backwards" }}>
                <div
                  style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
                >
                  <Stat label="Resolved" value={complaintStats.resolved} icon="✓" color="#10b981" loading={loading} />
                </div>
              </div>

              {/* Pending */}
              <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.3s backwards" }}>
                <div
                  style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
                >
                  <Stat label="Pending" value={complaintStats.pending} icon="🕐" color="#f97316" loading={loading} />
                </div>
              </div>

              {/* Avg Resolution Time */}
              <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.4s backwards" }}>
                <div
                  style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
                >
                  <Stat label="Avg Resolution" value={`${complaintStats.avgTime}h`} icon="⏱️" color="#06b6d4" loading={loading} />
                </div>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.6s ease-out 0.5s backwards", background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: "22px 24px", boxShadow: "0 12px 32px rgba(130,200,229,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1f2937", letterSpacing: -0.3 }}>Customer Complaints</h3>
                  <p style={{ margin: "5px 0 0", fontSize: 11, color: "#64748b" }}>
                    {complaints.length} total complaint{complaints.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => fetchComplaints()}
                  style={{ background: "#82C8E5", color: "#ffffff", border: "1px solid #82C8E5", borderRadius: 8, padding: "6px 14px", fontSize: 11, cursor: "pointer", fontWeight: 700, transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: 6 }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = "0 6px 16px rgba(29, 78, 216, 0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span className="ani-spin" style={{ display: "inline-block" }}>↻</span> Refresh
                </button>
              </div>
              {complaints.length === 0 ? (
                <Empty msg="No complaints found ✨" />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f5fbff" }}>
                        <th style={TH}>Complaint ID</th>
                        <th style={TH}>Customer</th>
                        <th style={TH}>Category</th>
                        <th style={TH}>Description</th>
                        <th style={TH}>Status</th>
                        <th style={TH}>Resolved By</th>
                        <th style={TH}>Created</th>
                        <th style={TH}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((complaint, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid #e3eff6", transition: "all 0.2s ease", animation: `fadeInUp 0.4s ease-out ${0.05 + i * 0.05}s backwards` }}
                          onMouseOver={e => { e.currentTarget.style.background = "#eef8ff"; }}
                          onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <td style={{ ...TD, fontFamily: "monospace", fontSize: 10, color: "#475569" }}>{complaint.id?.substring(0, 8)}...</td>
                          <td style={TD}>{complaint.user?.name || complaint.user?.username || "Unknown"}</td>
                          <td style={{ ...TD, color: "#1f2937", fontWeight: 600 }}>{complaint.complaintCategory || "General"}</td>
                          <td style={{ ...TD, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#475569", fontSize: 12 }}>{complaint.description}</td>
                          <td style={TD}>
                            <Badge 
                              text={complaint.complaintStatus} 
                              color={complaint.complaintStatus === "RESOLVED" ? "#22c55e" : complaint.complaintStatus === "PENDING" ? "#f97316" : "#ef4444"} 
                            />
                          </td>
                          <td style={{ ...TD, color: "#334155", fontSize: 12 }}>{complaint.resolvedBy || "—"}</td>
                          <td style={{ ...TD, color: "#475569", fontSize: 11 }}>
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </td>
                          <td style={TD}>
                            <button
                              onClick={() => setSelectedComplaint(complaint)}
                              style={{ background: "#82C8E5", color: "#ffffff", border: "1px solid #82C8E5", borderRadius: 6, padding: "5px 11px", fontSize: 11, cursor: "pointer", fontWeight: 700, transition: "all 0.2s ease" }}
                              onMouseOver={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(29, 78, 216, 0.3)"; e.currentTarget.style.transform = "scale(1.05)"; }}
                              onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(3px)",
            animation: "fadeInUp 0.3s ease-out"
          }}
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)",
              border: "1px solid #cde8f4",
              borderRadius: 20,
              width: "90%",
              maxWidth: 600,
              maxHeight: "85vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(130,200,229,0.2)",
              animation: "slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: `linear-gradient(135deg, #e0f2fe 0%, #f5fbff 100%)`,
              borderBottom: "1px solid #cde8f4",
              padding: "22px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "20px 20px 0 0"
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#1f2937" }}>
                  📋 Complaint Details
                </h2>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>
                  ID: {selectedComplaint.id?.substring(0, 12)}...
                </p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b", padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px 24px" }}>
              {/* Status & Category Row */}
              <div className="rg-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ background: "#ffffff", borderRadius: 12, padding: "15px 16px", border: "1px solid #d6eaf4" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: selectedComplaint.complaintStatus === "RESOLVED" ? "#22c55e" : selectedComplaint.complaintStatus === "PENDING" ? "#f97316" : "#ef4444",
                      display: "inline-block",
                      boxShadow: `0 0 8px ${selectedComplaint.complaintStatus === "RESOLVED" ? "#22c55e" : selectedComplaint.complaintStatus === "PENDING" ? "#f97316" : "#ef4444"}aa`
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>
                      {selectedComplaint.complaintStatus}
                    </span>
                  </div>
                </div>
                <div style={{ background: "#ffffff", borderRadius: 12, padding: "15px 16px", border: "1px solid #d6eaf4" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Category</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{selectedComplaint.complaintCategory}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ background: "#ffffff", borderRadius: 12, padding: "15px 16px", border: "1px solid #d6eaf4", marginBottom: 20 }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Customer</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {(selectedComplaint.user?.name || selectedComplaint.user?.username || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{selectedComplaint.user?.name || selectedComplaint.user?.username}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>{selectedComplaint.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ background: "#ffffff", borderRadius: 12, padding: "15px 16px", border: "1px solid #d6eaf4", marginBottom: 20 }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Description</p>
                <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{selectedComplaint.description}</p>
              </div>

              {/* Resolution Details (if resolved) */}
              {selectedComplaint.complaintStatus === "RESOLVED" && (
                <>
                  {selectedComplaint.resolutionNotes && (
                    <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "15px 16px", border: "1px solid #86efac", marginBottom: 20 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 0.5 }}>Resolution Notes</p>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{selectedComplaint.resolutionNotes}</p>
                    </div>
                  )}
                  {selectedComplaint.resolvedBy && (
                    <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "15px 16px", border: "1px solid #86efac", marginBottom: 20 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 0.5 }}>Resolved By</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1f2937" }}>👨‍💼 {selectedComplaint.resolvedBy}</p>
                    </div>
                  )}
                </>
              )}

              {/* Timestamps */}
              <div style={{ background: "#ffffff", borderRadius: 12, padding: "15px 16px", border: "1px solid #d6eaf4" }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Timestamps</p>
                <div className="rg-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>Created</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600, color: "#334155" }}>
                      {new Date(selectedComplaint.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>Updated</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600, color: "#334155" }}>
                      {new Date(selectedComplaint.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              background: "#f5fbff",
              borderTop: "1px solid #d6eaf4",
              padding: "16px 24px",
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              borderRadius: "0 0 20px 20px"
            }}>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={{
                  background: "#82C8E5",
                  color: "#ffffff",
                  border: "1px solid #82C8E5",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 700,
                  transition: "all 0.2s ease"
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(29, 78, 216, 0.3)"; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}