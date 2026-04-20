import { useEffect, useState } from "react";
import { Sidebar, TopBar } from "../../components/Layout";
import { billingApi } from "../../api/billing.api";
import { Stat } from "../../styles/ui";

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

if (typeof window !== "undefined" && !document.getElementById("bills-animations")) {
  const styleEl = document.createElement("style");
  styleEl.id = "bills-animations";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

const statusMeta = {
    PAID:      { color: "#22c55e", bg: "#22c55e18", icon: "✅" },
    GENERATED: { color: "#facc15", bg: "#facc1518", icon: "📄" },
    ADJUSTED:  { color: "#a78bfa", bg: "#a78bfa18", icon: "⚙️" },
    CLOSED:    { color: "#64748b", bg: "#64748b18", icon: "🔒" },
    FAILED:    { color: "#f87171", bg: "#f8717118", icon: "❌" },
};
const connIcon = { ELECTRIC: "⚡", GAS: "🔥", WATER: "💧" };

export default function MyBillsPage() {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [filters, setFilters] = useState({
        status: "",
        connectionType: "",
        fromDate: "",
        toDate: "",
    });
    const fetchBills = async () => {
 try {
   const hasFilters = Object.values(filters).some((v) => v !== "");
   if (!hasFilters) {
     const res = await billingApi.getAllBills();
     setBills(res.data);
     return;
   }
   // ✅ FIXED FILTER OBJECT
   const cleanedFilters = {};
   if (filters.status) cleanedFilters.status = filters.status;
   if (filters.connectionType) cleanedFilters.connectionType = filters.connectionType;
   if (filters.fromDate) {
     cleanedFilters.fromDate = filters.fromDate;
   }
   if (filters.toDate) {
     cleanedFilters.toDate = filters.toDate;
   }
   const res = await billingApi.filterBills(cleanedFilters);
   setBills(res.data);
 } catch (e) {
   console.error("Error fetching bills:", e);
 }
};
    useEffect(() => {
        fetchBills();
    }, []);
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };
    const applyFilters = () => {
        fetchBills();
    };
    const resetFilters = () => {
        setFilters({
            status: "",
            connectionType: "",
            fromDate: "",
            toDate: "",
        });
        setTimeout(() => fetchBills(), 0);
    };
    const openModal = (bill) => {
        setSelectedBill(bill);
    };
    const closeModal = () => {
        setSelectedBill(null);
    };
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
            <Sidebar />
            <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1, background: "linear-gradient(145deg, #FBF9E7 0%, #f2fbff 60%, #fff8e8 100%)" }}>
                <TopBar title="Admin Dashboard" />
                <div style={{ padding: "24px 28px" }}>

                    {/* ── Page Header ── */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Billing Management</h3>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>View and filter all customer bills across service types</p>
                        </div>
                        <button onClick={fetchBills} style={{ background: "#ffffff", color: "#1f2937", border: "1px solid #82C8E5", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                            onMouseOver={e => { e.currentTarget.style.color = "#1f2937"; e.currentTarget.style.borderColor = "#50C878"; }}
                            onMouseOut={e => { e.currentTarget.style.color = "#1f2937"; e.currentTarget.style.borderColor = "#82C8E5"; }}>
                            ↻ Refresh
                        </button>
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className="rg-5" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 24 }}>
                        <Stat label="Total Bills" value={bills.length} icon="🧾" color="#3b82f6" />
                        <Stat label="Paid" value={bills.filter(b => b.billStatus === "PAID").length} icon="✅" color="#22c55e" />
                        <Stat label="Generated" value={bills.filter(b => b.billStatus === "GENERATED").length} icon="📄" color="#facc15" />
                        <Stat label="Adjusted" value={bills.filter(b => b.billStatus === "ADJUSTED").length} icon="⚙️" color="#a78bfa" />
                        <Stat label="Failed" value={bills.filter(b => b.billStatus === "FAILED").length} icon="❌" color="#f87171" />
                    </div>

                    {/* ── Filters ── */}
                    <div style={{ background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
                        <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8 }}>🔍 Filters</p>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <label style={fLabel}>Status</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} style={fSelect}>
                                    <option value="">All Status</option>
                                    <option value="PAID">Paid</option>
                                    <option value="GENERATED">Generated</option>
                                    <option value="ADJUSTED">Adjusted</option>
                                    <option value="CLOSED">Closed</option>
                                    <option value="FAILED">Failed</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <label style={fLabel}>Connection Type</label>
                                <select name="connectionType" value={filters.connectionType} onChange={handleFilterChange} style={fSelect}>
                                    <option value="">All Types</option>
                                    <option value="ELECTRIC">Electric</option>
                                    <option value="GAS">Gas</option>
                                    <option value="WATER">Water</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <label style={fLabel}>From Date</label>
                                <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} style={fInput} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <label style={fLabel}>To Date</label>
                                <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} style={fInput} />
                            </div>
                            <button onClick={applyFilters} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer", alignSelf: "flex-end" }}
                                onMouseOver={e => e.currentTarget.style.background = "#1d4ed8"}
                                onMouseOut={e => e.currentTarget.style.background = "#2563eb"}>
                                Apply
                            </button>
                            <button onClick={resetFilters} style={{ background: "transparent", color: "#64748b", border: "1px solid #1e2d4a", borderRadius: 8, padding: "9px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer", alignSelf: "flex-end" }}
                                onMouseOver={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#334155"; }}
                                onMouseOut={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#1e2d4a"; }}>
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div style={{ background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 20px rgba(130,200,229,0.15)" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid #d6eaf4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>Bills</span>
                            <span style={{ fontSize: 11, color: "#475569" }}>{bills.length} record{bills.length !== 1 ? "s" : ""}</span>
                        </div>
                        {bills.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "52px 0", color: "#475569", fontSize: 13 }}>📭 No bills found</div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "#f5fbff" }}>
                                            {["ID", "Customer", "Connection", "Amount", "Due Date", "Status", "Action"].map(h => (
                                                <th key={h} style={{ padding: "11px 16px", fontSize: 10, color: "#475569", fontWeight: 700, textAlign: "left", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #d6eaf4" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bills.map((b) => {
                                            const s = statusMeta[b.billStatus] || { color: "#94a3b8", bg: "#94a3b818", icon: "•" };
                                            return (
                                                <tr key={b.billId} style={{ borderBottom: "1px solid #e3eff6", transition: "background 0.12s" }}
                                                    onMouseOver={e => e.currentTarget.style.background = "#eef8ff"}
                                                    onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                                                    <td style={TD}><span style={{ fontFamily: "monospace", fontSize: 11, color: "#475569" }}>#{b.billId}</span></td>
                                                    <td style={{ ...TD, color: "#1f2937", fontWeight: 600 }}>{b.customerName}</td>
                                                    <td style={TD}>
                                                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                            <span>{connIcon[b.connectionType] || "🔌"}</span>
                                                            <span style={{ fontSize: 11 }}>{b.connectionType}</span>
                                                        </span>
                                                    </td>
                                                    <td style={{ ...TD, color: "#1f2937", fontWeight: 700 }}>₹{b.amount?.toFixed(2)}</td>
                                                    <td style={{ ...TD, color: "#475569" }}>{b.dueDate}</td>
                                                    <td style={TD}>
                                                        <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33`, borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>
                                                            {s.icon} {b.billStatus}
                                                        </span>
                                                    </td>
                                                    <td style={TD}>
                                                        <button onClick={() => openModal(b)}
                                                            style={{ background: "#82C8E5", color: "#ffffff", border: "1px solid #82C8E5", borderRadius: 7, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                                                            onMouseOver={e => e.currentTarget.style.background = "#6fb8d8"}
                                                            onMouseOut={e => e.currentTarget.style.background = "#82C8E5"}>
                                                            View →
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Bill Detail Modal ── */}
            {selectedBill && (() => {
                const s = statusMeta[selectedBill.billStatus] || { color: "#94a3b8", bg: "#1e2d4a", icon: "•" };
                return (
                    <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
                        <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 18, width: 460, boxShadow: "0 24px 60px rgba(130,200,229,0.15)", overflow: "hidden" }}>
                            {/* Modal Header */}
                            <div style={{ background: `linear-gradient(135deg, ${s.color}11, #FBF9E7)`, borderBottom: "1px solid #cde8f4", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Bill Details</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1f2937" }}>{selectedBill.customerName}</div>
                                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{selectedBill.email}</div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                                    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}44`, borderRadius: 7, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>{s.icon} {selectedBill.billStatus}</span>
                                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "#475569" }}>#{selectedBill.billId}</span>
                                </div>
                            </div>
                            {/* Modal Body */}
                            <div style={{ padding: "20px 24px" }}>
                                {/* Amount hero */}
                                <div style={{ background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 12, padding: "16px 20px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Total Amount</div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: "#1f2937" }}>₹{selectedBill.amount?.toFixed(2)}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Due Date</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f87171" }}>{selectedBill.dueDate}</div>
                                    </div>
                                </div>
                                {/* Details grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                                    {[
                                        { label: "Connection Type", value: `${connIcon[selectedBill.connectionType] || "🔌"} ${selectedBill.connectionType}` },
                                        { label: "Billing From",    value: selectedBill.fromDate || "—" },
                                        { label: "Billing To",      value: selectedBill.toDate   || "—" },
                                        { label: "Bill Status",     value: selectedBill.billStatus },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ background: "#f5fbff", border: "1px solid #bcdff0", borderRadius: 10, padding: "12px 14px" }}>
                                            <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>{label}</div>
                                            <div style={{ fontSize: 13, color: "#1f2937", fontWeight: 600 }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                                {/* Footer */}
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={closeModal} style={{ flex: 1, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 9, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                                        onMouseOver={e => e.currentTarget.style.background = "#fee2e2"}
                                        onMouseOut={e => e.currentTarget.style.background = "#fef2f2"}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

const TD = { padding: "12px 16px", fontSize: 12, color: "#334155" };
const fLabel = { fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 };
const fSelect = { background: "#ffffff", border: "1px solid #bcdff0", color: "#1f2937", borderRadius: 8, padding: "8px 12px", fontSize: 12, outline: "none", minWidth: 140 };
const fInput  = { background: "#ffffff", border: "1px solid #bcdff0", color: "#1f2937", borderRadius: 8, padding: "8px 12px", fontSize: 12, outline: "none" };