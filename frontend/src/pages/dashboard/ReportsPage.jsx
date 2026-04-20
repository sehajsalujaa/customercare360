import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import { Sidebar, TopBar } from "../../components/Layout.jsx";
import { reportsApi } from "../../api/reports.api.js";
import { Stat, Badge, Spinner, Empty } from "../../styles/ui.jsx";

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

if (typeof window !== "undefined" && !document.getElementById("reports-animations")) {
  const styleEl = document.createElement("style");
  styleEl.id = "reports-animations";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

// 🎨 Design System
const P = {
  container: {
    display: "flex",
    gap: 16,
  },
  main: {
    marginLeft: "var(--app-sidebar-width)",
    flex: 1,
    background: "linear-gradient(145deg, #FBF9E7 0%, #f2fbff 60%, #fff8e8 100%)",
    minHeight: "100vh",
    color: "#1f2937",
  },
  card: {
    background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)",
    border: "1px solid #cde8f4",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 8px 20px rgba(130,200,229,0.16)",
    marginBottom: 20,
    animation: "fadeInUp 0.5s ease-out",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  stat: (color) => ({
    background: "linear-gradient(135deg, #ffffff 0%, #f5fbff 100%)",
    border: `2px solid ${color}33`,
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
  }),
  statValue: {
    fontSize: 32,
    fontWeight: 900,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
    padding: 20,
    background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)",
    border: "1px solid #cde8f4",
    borderRadius: 12,
  },
  input: {
    background: "#ffffff",
    border: "1px solid #bcdff0",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#1f2937",
    fontSize: 13,
    fontFamily: "inherit",
    width: "100%",
  },
  button: {
    background: "linear-gradient(135deg, #50C878 0%, #3fb967 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  buttonSecondary: {
    background: "#ffffff",
    color: "#1f2937",
    border: "1px solid #82C8E5",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  chartSection: {
    background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)",
    border: "1px solid #cde8f4",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 8px 20px rgba(130,200,229,0.16)",
    marginBottom: 20,
    animation: "fadeInUp 0.5s ease-out",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    background: "#ffffff",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 700,
    color: "#475569",
    borderBottom: "1px solid #d6eaf4",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #e3eff6",
    color: "#334155",
  },
  badge: (bg, color) => ({
    background: `${bg}22`,
    color: color,
    border: `1px solid ${bg}66`,
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-block",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  }),
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeInUp 0.3s ease-out",
  },
  modalContent: {
    background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)",
    border: "1px solid #cde8f4",
    borderRadius: 12,
    padding: 32,
    maxWidth: 500,
    width: "90%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
};

export default function ReportsPage() {
  const [active, setActive] = useState("reports");
  const [dashboard, setDashboard] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState(null);

  // Form states
  const [serviceType, setServiceType] = useState("");
  const [startDate, setStartDate] = useState(getDateDaysAgo(30));
  const [endDate, setEndDate] = useState(getTodayDate());
  const [reportScope, setReportScope] = useState("OVERALL");
  const [reportStartDate, setReportStartDate] = useState(getDateDaysAgo(7));
  const [reportEndDate, setReportEndDate] = useState(getTodayDate());
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // KPI Thresholds
  const [slaThreshold, setSlaThreshold] = useState(2);
  const [adjustmentThreshold, setAdjustmentThreshold] = useState(5);
  const [complaintThreshold, setComplaintThreshold] = useState(10);
  const [savingKpi, setSavingKpi] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadReports();
  }, [serviceType, startDate, endDate]);

  const loadReports = async () => {
    try {
      const res = await reportsApi.getReports();
      const list = Array.isArray(res?.data) ? res.data : [];
      setRecentReports(list);
    } catch (err) {
      console.error("Failed to load reports", err);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getDashboard(serviceType, startDate, endDate);
      setDashboard(data?.data ?? data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      await reportsApi.generate({
        scope: reportScope,
        startDate: reportStartDate,
        endDate: reportEndDate,
      });
      toast.success("Report generated successfully!");
      await loadReports();
      setShowGenerateModal(false);
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExportReport = async (reportId, reportScope) => {
    try {
      setExportingId(reportId);
      const response = await reportsApi.exportReport(reportId);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportScope || "export"}_${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Report downloaded!");
    } catch (error) {
      toast.error("Failed to export report");
      console.error(error);
    } finally {
      setExportingId(null);
    }
  };

  const handleSaveKpi = async () => {
    try {
      setSavingKpi(true);
      await reportsApi.saveKpiThreshold({
        slaThreshold,
        adjustmentThreshold,
        complaintThreshold,
      });
      toast.success("KPI thresholds saved successfully!");
    } catch (error) {
      toast.error("Failed to save KPI thresholds");
      console.error(error);
    } finally {
      setSavingKpi(false);
    }
  };

  // Build chart data from real trends
  const chartData = useMemo(() => {
    const billingTrend = dashboard?.billingTrend || {};
    const complaintTrend = dashboard?.complaintTrend || {};
    const allMonths = Array.from(
      new Set([...Object.keys(billingTrend), ...Object.keys(complaintTrend)])
    ).sort();
    if (allMonths.length === 0) return [];
    return allMonths.map((month) => ({
      month,
      bills: billingTrend[month] || 0,
      complaints: complaintTrend[month] || 0,
    }));
  }, [dashboard]);

  const stats = useMemo(() => {
    const totalBills = dashboard?.totalBills ?? 0;
    const adjustedBills = dashboard?.adjustedBills ?? 0;
    const accuracyRate = dashboard?.accuracyRate ?? 0;
    const totalCustomers = dashboard?.totalCustomers ?? 0;
    const activeCustomers = dashboard?.activeCustomers ?? 0;
    const pendingCustomers = dashboard?.pendingCustomers ?? 0;
    const totalComplaints = dashboard?.totalComplaints ?? 0;
    const openComplaints = dashboard?.openComplaints ?? 0;
    return {
      totalBills,
      adjustedBills,
      adjustmentRate: totalBills === 0 ? "0.0" : ((adjustedBills / totalBills) * 100).toFixed(1),
      accuracyRate: (accuracyRate * 100).toFixed(1),
      totalCustomers,
      activeCustomers,
      pendingCustomers,
      totalComplaints,
      openComplaints,
    };
  }, [dashboard]);

  return (
    <div style={P.container}>
      <Sidebar active={active} setActive={setActive} />
      <div style={P.main}>
        <TopBar title="Admin Dashboard" />

        <div style={{ padding: "24px 28px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Reports</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Billing analytics, usage trends and service performance insights</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* 📊 STAT CARDS */}
            <div style={{ ...P.statGrid, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0s" }}>
                <Stat label="Total Bills" value={stats.totalBills} icon="🧾" color="#3b82f6" loading={loading} />
              </div>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0.1s" }}>
                <Stat label="Adjusted Bills" value={stats.adjustedBills} icon="⚙️" color="#ef4444" loading={loading} />
              </div>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0.2s" }}>
                <Stat label="Billing Accuracy" value={`${stats.accuracyRate}%`} icon="✅" color="#22c55e" loading={loading} />
              </div>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0.3s" }}>
                <Stat label="Total Customers" value={stats.totalCustomers} icon="👥" color="#8b5cf6" loading={loading} />
              </div>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0.4s" }}>
                <Stat label="Pending Approvals" value={stats.pendingCustomers} icon="🕐" color="#f59e0b" loading={loading} />
              </div>
              <div style={{ animation: "fadeInUp 0.5s ease-out 0.5s" }}>
                <Stat label="Total Complaints" value={stats.totalComplaints} icon="⚖️" color="#06b6d4" loading={loading} />
              </div>
            </div>

            {/* 🔍 FILTER SECTION */}
            <div style={P.filterSection}>
              <div>
                <label style={P.label}>Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  style={P.input}
                >
                  <option value="">All Services</option>
                  <option value="WATER">Water</option>
                  <option value="ELECTRIC">Electricity</option>
                  <option value="GAS">Gas</option>
                </select>
              </div>
              <div>
                <label style={P.label}>From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={P.input}
                />
              </div>
              <div>
                <label style={P.label}>To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={P.input}
                />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={loadDashboard}
                  style={{
                    ...P.button,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  🔍 Apply Filters
                </button>
              </div>
            </div>

            {/* 📈 CHART SECTION */}
            <div style={P.card}>
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
                📊 Monthly Billing & Complaint Trends
              </h3>
              {chartData.length === 0 ? (
                <Empty message="No trend data available yet" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6eaf4" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid #bcdff0",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="bills" fill="#50C878" name="Bills" />
                    <Bar dataKey="complaints" fill="#ef4444" name="Complaints" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 📈 COMPLAINT TREND */}
            <div style={P.card}>
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
                📉 Complaint Volume Over Time
              </h3>
              {chartData.length === 0 ? (
                <Empty message="No complaint data available yet" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6eaf4" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid #bcdff0",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="complaints"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", r: 5 }}
                      name="Complaints"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 📋 GENERATE REPORT */}
            <div style={P.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>📝 Generate Report</h3>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  style={{
                    ...P.button,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  ✨ New Report
                </button>
              </div>
              <table style={P.table}>
                <thead>
                  <tr>
                    <th style={P.th}>Report Name</th>
                    <th style={P.th}>Scope</th>
                    <th style={P.th}>Generated Date</th>
                    <th style={P.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <tr key={report.reportId}>
                        <td style={P.td}>
                          {report.scope} Report
                          {(report.startDate || report.endDate) && (
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                              {report.startDate} → {report.endDate}
                            </div>
                          )}
                        </td>
                        <td style={P.td}>
                          <span style={P.badge("#3b82f6", "#1d4ed8")}>{report.scope}</span>
                        </td>
                        <td style={P.td}>{report.generatedDate ? new Date(report.generatedDate).toLocaleString() : "—"}</td>
                        <td style={P.td}>
                          <button
                            onClick={() => handleExportReport(report.reportId, report.scope)}
                            disabled={exportingId === report.reportId}
                            style={{
                              ...P.buttonSecondary,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              opacity: exportingId === report.reportId ? 0.6 : 1,
                            }}
                          >
                            {exportingId === report.reportId ? "⏳ Exporting..." : "📥 Export CSV"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ ...P.td, textAlign: "center", padding: "40px 0" }}>
                        <Empty message="No reports generated yet" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ⚙️ KPI THRESHOLDS */}
            <div style={P.card}>
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: "#1f2937" }}>⚙️ KPI Thresholds</h3>
              <div className="rg-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                <div style={P.formGroup}>
                  <label style={P.label}>SLA Threshold (days)</label>
                  <input
                    type="number"
                    value={slaThreshold}
                    onChange={(e) => setSlaThreshold(parseInt(e.target.value) || 0)}
                    min="1"
                    max="30"
                    style={P.input}
                  />
                </div>
                <div style={P.formGroup}>
                  <label style={P.label}>Adjustment Threshold (%)</label>
                  <input
                    type="number"
                    value={adjustmentThreshold}
                    onChange={(e) => setAdjustmentThreshold(parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    style={P.input}
                  />
                </div>
                <div style={P.formGroup}>
                  <label style={P.label}>Complaint Threshold (count)</label>
                  <input
                    type="number"
                    value={complaintThreshold}
                    onChange={(e) => setComplaintThreshold(parseInt(e.target.value) || 0)}
                    min="1"
                    max="1000"
                    style={P.input}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveKpi}
                disabled={savingKpi}
                style={{
                  ...P.button,
                  marginTop: 20,
                  opacity: savingKpi ? 0.7 : 1,
                }}
              >
                {savingKpi ? "💾 Saving..." : "💾 Save KPI Thresholds"}
              </button>
            </div>
          </>
        )}

        {/* 🔨 GENERATE REPORT MODAL */}
        {showGenerateModal && (
          <div style={P.modal} onClick={() => !generatingReport && setShowGenerateModal(false)}>
            <div style={P.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700, color: "#1f2937" }}>
                📝 Generate New Report
              </h2>

              <div style={P.formGroup}>
                <label style={P.label}>Report Scope</label>
                <select
                  value={reportScope}
                  onChange={(e) => setReportScope(e.target.value)}
                  style={P.input}
                >
                  <option value="OVERALL">Overall</option>
                  <option value="BILLING">Billing</option>
                  <option value="COMPLAINTS">Complaints</option>
                  <option value="SERVICE_ORDERS">Service Orders</option>
                </select>
              </div>

              <div style={P.formGroup}>
                <label style={P.label}>Start Date</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  style={P.input}
                />
              </div>

              <div style={P.formGroup}>
                <label style={P.label}>End Date</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  style={P.input}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  style={{
                    ...P.button,
                    flex: 1,
                    opacity: generatingReport ? 0.7 : 1,
                  }}
                >
                  {generatingReport ? "⏳ Generating..." : "✨ Generate Report"}
                </button>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generatingReport}
                  style={{
                    ...P.buttonSecondary,
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// 📅 Helper functions
function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
