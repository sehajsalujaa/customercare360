import { useEffect, useState } from "react";
import { Sidebar, TopBar } from "../../components/Layout";
import { Stat } from "../../styles/ui.jsx";
import { adminApi } from "../../api/admin.api.js";
import toast from "react-hot-toast";

// 🎨 Keyframe Animations (same as dashboard)
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

if (typeof window !== "undefined" && !document.getElementById("approval-animations")) {
  const styleEl = document.createElement("style");
  styleEl.id = "approval-animations";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

const getCustomerTypeMeta = (type) => {
    const t = (type || "").toUpperCase();
    if (t === "COMMERCIAL") return { label: "Commercial", bg: "#1d4ed8", fg: "#dbeafe", border: "#2563eb" };
    if (t === "INDUSTRIAL") return { label: "Industrial", bg: "#7c3aed", fg: "#ede9fe", border: "#8b5cf6" };
    if (t === "RESIDENTIAL") return { label: "Residential", bg: "#065f46", fg: "#d1fae5", border: "#10b981" };
    return { label: "-", bg: "#334155", fg: "#e2e8f0", border: "#475569" };
};

export default function AdminApprovalsPage() {
    const [pendingList, setPendingList] = useState([]);
    const [approvedToday, setApprovedToday] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getPendingCustomers();
            setPendingList(res.data || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load pending approvals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
        calculateApprovalsToday();
    }, []);

    const calculateApprovalsToday = async () => {
        try {
            // Try to fetch all customers to see which ones were approved today
            const res = await adminApi.getPendingCustomers();
            const allCustomers = res.data || [];
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Count customers approved today by checking approval timestamp
            const approvedCount = allCustomers.filter(c => {
                if (c.approvalDate || c.approvedAt || c.statusUpdatedAt) {
                    const approvalDate = new Date(c.approvalDate || c.approvedAt || c.statusUpdatedAt);
                    approvalDate.setHours(0, 0, 0, 0);
                    return approvalDate.getTime() === today.getTime() && c.status === "APPROVED";
                }
                return false;
            }).length;
            
            setApprovedToday(approvedCount);
        } catch (e) {
            console.error("Error calculating approvals today:", e);
        }
    };

    const handleApprove = async (id) => {
        try {
            await adminApi.approveCustomer(id);
            toast.success("Customer approved successfully");
            fetchPending();
            calculateApprovalsToday();
        } catch (e) {
            console.error("Approve error:", e);
            toast.error(e?.message ?? "Failed to approve customer");
        }
    };

    const handleReject = async (id) => {
        try {
            await adminApi.rejectCustomer(id);
            toast.success("❌ Customer rejected");
            fetchPending();
        } catch (e) {
            console.error("Reject error:", e);
            toast.error(e?.message ?? "Failed to reject customer");
        }
    };

    const TH = { padding: "13px 16px", fontSize: 10, color: "#64748b", fontWeight: 700, textAlign: "left", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #d6eaf4" };
    const TD = { padding: "14px 16px", fontSize: 12, color: "#1f2937" };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
            <Sidebar />
            <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1, background: "linear-gradient(145deg, #FBF9E7 0%, #f2fbff 60%, #fff8e8 100%)", position: "relative", overflow: "hidden" }}>
                {/* Background accent glow */}
                <div style={{ position: "absolute", top: "-40%", right: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", pointerEvents: "none", animation: "float 8s ease-in-out infinite" }} className="ani-float" />

                <TopBar title="Admin Dashboard" />

                <div style={{ padding: "24px 28px", position: "relative", zIndex: 1 }}>

                    {/* ── Page Header ── */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }} className="ani-slide-down">
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Approval Queue</h3>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Review and approve pending customer registrations</p>
                        </div>
                        <button
                            onClick={fetchPending}
                            style={{ background: "linear-gradient(135deg, #50C878 0%, #3fb967 100%)", color: "#fff", border: "1px solid #6fd597", borderRadius: 10, padding: "10px 18px", fontSize: 12, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", boxShadow: "0 4px 12px rgba(80,200,120,0.2)" }}
                            onMouseOver={e => { e.currentTarget.style.boxShadow = "0 8px 20px rgba(34,197,94,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseOut={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(34,197,94,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <span style={{ display: "inline-block", animation: loading ? "spin-subtle 1s linear infinite" : "none" }}>↻</span> Refresh
                        </button>
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className="rg-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 26 }}>
                        {/* Total Pending */}
                        <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.1s backwards" }}>
                            <div style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}>
                                <Stat label="Pending Review" value={pendingList.length} icon="🕐" color="#f59e0b" />
                            </div>
                        </div>

                        {/* Average Wait Time */}
                        <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.2s backwards" }}>
                            <div style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}>
                                <Stat label="Avg Response" value="2h" icon="⏱️" color="#3b82f6" />
                            </div>
                        </div>

                        {/* Actions Today */}
                        <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.3s backwards" }}>
                            <div style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}>
                                <Stat label="Approved Today" value={approvedToday} icon="✅" color="#22c55e" />
                            </div>
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="ani-fade-left" style={{ animation: "fadeInLeft 0.6s ease-out 0.3s backwards", background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 32px rgba(130,200,229,0.18)" }}>
                        <div style={{ padding: "18px 22px", borderBottom: "1px solid #d6eaf4", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(90deg, #ffffff 0%, #f5fbff 100%)" }}>
                            <div>
                                <span style={{ fontSize: 13, fontWeight: 800, color: "#1f2937" }}>Customers</span>
                                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>{pendingList.length} awaiting approval</p>
                            </div>
                            <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>Click row to take action</span>
                        </div>

                        {pendingList.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 0", color: "#475569", fontSize: 13 }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
                                <div>No pending approvals</div>
                                <div style={{ fontSize: 11, marginTop: 4, color: "#334155" }}>All customers have been reviewed</div>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "#ffffff" }}>
                                            <th style={TH}>Name</th>
                                            <th style={TH}>Email</th>
                                            <th style={TH}>Customer Type</th>
                                            <th style={TH}>Requested</th>
                                            <th style={TH}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingList.map((c, idx) => (
                                            <tr
                                                key={c.customerId}
                                                style={{ borderBottom: "1px solid #e3eff6", transition: "all 0.2s ease", animation: `bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.05}s backwards` }}
                                                onMouseOver={e => { e.currentTarget.style.background = "linear-gradient(90deg, #82C8E522 0%, #50C8781a 100%)"; }}
                                                onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}
                                            >
                                                <td style={{ ...TD, color: "#1f2937", fontWeight: 700 }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #1e40af)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                                                            {(c.name || c.user?.username || "?").charAt(0).toUpperCase()}
                                                        </span>
                                                        {c.name || c.user?.username}
                                                    </span>
                                                </td>
                                                <td style={TD}>{c.user?.email}</td>
                                                <td style={TD}>
                                                    {(() => {
                                                        const typeMeta = getCustomerTypeMeta(c.customerType);
                                                        return (
                                                            <span style={{ background: typeMeta.bg, color: typeMeta.fg, border: `1px solid ${typeMeta.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 700 }}>
                                                                {typeMeta.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td style={{ ...TD, fontSize: 11, color: "#64748b" }}>
                                                    {new Date().toLocaleDateString()}
                                                </td>
                                                <td style={{ ...TD, display: "flex", gap: 8 }}>
                                                    <button
                                                        onClick={() => handleApprove(c.customerId)}
                                                        style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", border: "1px solid #4ade80", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease" }}
                                                        onMouseOver={e => { e.currentTarget.style.boxShadow = "0 6px 16px rgba(34,197,94,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                                        onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(c.customerId)}
                                                        style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "#fff", border: "1px solid #f87171", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease" }}
                                                        onMouseOver={e => { e.currentTarget.style.boxShadow = "0 6px 16px rgba(239,68,68,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                                        onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                                                    >
                                                        ✗ Reject
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
    );
}
