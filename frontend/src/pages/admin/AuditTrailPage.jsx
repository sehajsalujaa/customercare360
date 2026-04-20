import { useEffect, useMemo, useState } from "react";
import { authApi } from "../../api/auth.api";
import toast from "react-hot-toast";
import { Sidebar, TopBar } from "../../components/Layout";
import { Badge, Empty, statusColor } from "../../styles/ui.jsx";

function Field({ label, value, onChange, type = "text", required, maxLength, placeholder }) {
  return (
    <div>
      <label style={P.label}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
      <input type={type} value={value} required={required} maxLength={maxLength}
        onChange={e => onChange(e.target.value)} style={P.input} placeholder={placeholder} />
    </div>
  );
}

const P = {
  page: { display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" },
  main: { marginLeft: "var(--app-sidebar-width)", flex: 1, background: "linear-gradient(145deg, #FBF9E7 0%, #f2fbff 60%, #fff8e8 100%)" },
  container: { padding: "24px 28px" },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 },
  title: { margin: 0, fontSize: 24, fontWeight: 900, color: "#1f2937", letterSpacing: -0.4 },
  subtitle: { margin: "6px 0 0", fontSize: 12, color: "#64748b" },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 14, padding: 18, boxShadow: "0 10px 28px rgba(130,200,229,0.18)" },
  label: { display: "block", fontSize: 11, color: "#3f4b5a", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  input: { width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  outlineBtn: { background: "#ffffff", color: "#1f2937", border: "1px solid #82C8E5", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  primaryBtn: { background: "#50C878", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  th: { padding: "11px 13px", fontSize: 10, color: "#64748b", fontWeight: 700, textAlign: "left", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #cfe8f4" },
  td: { padding: "12px 13px", fontSize: 12, color: "#334155", borderBottom: "1px solid #e3eff6" },
};

export default function AuditTrailPage() {
  const [active, setActive] = useState("audit");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [filters, setFilters] = useState({ email: "", from: "", to: "" });

  const normalizedLogs = useMemo(() => {
    return (logs || []).map((l, idx) => ({
      key: l.id || `${l.timestamp || "t"}-${idx}`,
      email: l.email || l.username || l.userEmail || "—",
      action: l.action || l.event || l.type || "—",
      status: l.status || "UNKNOWN",
      userId: l.userId || l.actorId || l.user?.id || "—",
      ip: l.ip || l.ipAddress || "—",
      details: l.details || l.message || l.description || "—",
      timestamp: l.timestamp || l.createdAt || l.time || "—",
    }));
  }, [logs]);

  const fetchLogs = async (e, forceAll = false) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const hasFilters = !forceAll && (filters.email || filters.from || filters.to);
      let res;
      if (hasFilters) {
        if ((filters.from && !filters.to) || (!filters.from && filters.to)) {
          toast.error("Please select both From Date and To Date");
          setLoading(false);
          return;
        }

        if (filters.from && filters.to && filters.from > filters.to) {
          toast.error("From Date cannot be after To Date");
          setLoading(false);
          return;
        }

        const startDateTime = filters.from ? `${filters.from}T00:00:00` : undefined;
        const endDateTime = filters.to ? `${filters.to}T23:59:59` : undefined;

        res = await authApi.filterAuditLogs({
          email: filters.email || undefined,
          start: startDateTime,
          end: endDateTime,
          from: startDateTime,
          to: endDateTime,
          startDate: startDateTime,
          endDate: endDateTime,
        });
      } else {
        res = await authApi.getAllAuditLogs();
      }
      setLogs(res.data?.content ?? res.data ?? []);
      setFetched(true);
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to fetch audit logs";
      toast.error(message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLogs(null, true);
  }, []);

  const exportCsv = () => {
    if (!normalizedLogs.length) { toast.error("No data to export"); return; }
    const csv = ["Email,Action,Status,Timestamp", ...normalizedLogs.map(l => `"${l.email}","${l.action}","${l.status}","${l.timestamp}"`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "auth_audit.csv";
    a.click();
  };

  const clearFilters = () => {
    setFilters({ email: "", from: "", to: "" });
    fetchLogs(null, true);
  };

  return (
    <div style={P.page}>
      <Sidebar active={active} setActive={setActive} />
      <div style={P.main}>
        <TopBar title="Admin Dashboard" />
        <div style={P.container}>
          <div style={P.head}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Auth Audit Trail</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Complete authentication logs with filter-based investigation</p>
            </div>
            <button onClick={exportCsv} style={P.outlineBtn}>⬇ Export CSV</button>
          </div>

          <div style={{ ...P.card, marginBottom: 16 }}>
            <form onSubmit={fetchLogs} className="rg-form" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr auto auto", gap: 12, alignItems: "end" }}>
              <Field label="Email" value={filters.email} onChange={v => setFilters({ ...filters, email: v })} placeholder="user@email.com" />
              <Field label="From Date" type="date" value={filters.from} onChange={v => setFilters({ ...filters, from: v })} />
              <Field label="To Date" type="date" value={filters.to} onChange={v => setFilters({ ...filters, to: v })} />
              <button type="submit" style={P.primaryBtn} disabled={loading}>{loading ? "Searching..." : "Apply Filters"}</button>
              <button type="button" style={P.outlineBtn} onClick={clearFilters}>Reset</button>
            </form>
          </div>

          <div style={P.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#1f2937", fontWeight: 700 }}>Detailed Logs</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{normalizedLogs.length} total records</div>
            </div>

            {!fetched || loading ? (
              <div style={{ textAlign: "center", padding: "26px 0", color: "#64748b", fontSize: 12 }}>⏳ Loading logs...</div>
            ) : normalizedLogs.length === 0 ? (
              <Empty msg="No audit logs found for selected filters" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Email", "Action", "Status", "Timestamp"].map((h) => (
                        <th key={h} style={P.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedLogs.map((log) => (
                      <tr key={log.key}>
                        <td style={{ ...P.td, color: "#1f2937", fontWeight: 600 }}>{log.email}</td>
                        <td style={P.td}>{log.action}</td>
                        <td style={P.td}><Badge text={log.status} color={statusColor(log.status)} /></td>
                        <td style={{ ...P.td, color: "#64748b" }}>{new Date(log.timestamp).toLocaleString ? new Date(log.timestamp).toLocaleString() : log.timestamp}</td>
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
  );
}