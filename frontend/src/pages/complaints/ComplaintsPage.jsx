import { useEffect, useState, useMemo } from 'react';
import { complaintsApi } from '../../api/complaints.api';
import { Sidebar, TopBar } from '../../components/Layout';
import { Badge, Empty, Stat } from '../../styles/ui';
import toast from 'react-hot-toast';

// 🎨 Keyframe Animations
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .ani-fade-up { animation: fadeInUp 0.5s ease-out forwards; }
`;

if (typeof window !== "undefined" && !document.getElementById("complaints-animations")) {
  const styleEl = document.createElement("style");
  styleEl.id = "complaints-animations";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

const P = {
  page: { display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" },
  main: { marginLeft: "var(--app-sidebar-width)", flex: 1, background: "linear-gradient(145deg, #FBF9E7 0%, #f2fbff 60%, #fff8e8 100%)" },
  container: { padding: "24px 28px" },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 },
  title: { margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" },
  subtitle: { margin: "4px 0 0", fontSize: 13, color: "#64748b" },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 14, padding: 18, boxShadow: "0 10px 28px rgba(130,200,229,0.18)" },
  label: { display: "block", fontSize: 11, color: "#3f4b5a", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  input: { width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  outlineBtn: { background: "#ffffff", color: "#1f2937", border: "1px solid #82C8E5", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  primaryBtn: { background: "#50C878", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  th: { padding: "11px 13px", fontSize: 10, color: "#64748b", fontWeight: 700, textAlign: "left", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #cfe8f4" },
  td: { padding: "12px 13px", fontSize: 12, color: "#334155", borderBottom: "1px solid #e3eff6" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 14, padding: 24, maxWidth: 700, width: "90%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" },
  modalClose: { float: "right", fontSize: 24, cursor: "pointer", color: "#64748b", background: "none", border: "none", padding: 0 },
  detailRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e3eff6" },
  detailLabel: { fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase" },
  detailValue: { fontSize: 13, color: "#1f2937", fontWeight: 500, textAlign: "right" },
};

const Field = ({ label, value, onChange, type = "text", required, placeholder }) => (
  <div>
    <label style={P.label}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
    <input type={type} value={value} required={required} onChange={e => onChange(e.target.value)} style={P.input} placeholder={placeholder} />
  </div>
);

const SelectField = ({ label, value, onChange, options, required }) => (
  <div>
    <label style={P.label}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={P.select} required={required}>
      <option value="">-- All --</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default function ComplaintsPage() {
  const [active, setActive] = useState("complaints-mgmt");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [filters, setFilters] = useState({ status: "", category: "", fromDate: "", toDate: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolveStatus, setResolveStatus] = useState("RESOLVED");
  const [resolving, setResolving] = useState(false);

  const normalizedComplaints = useMemo(() => {
    return (complaints || []).map((c, idx) => ({
      key: c.complaintId || idx,
      id: c.complaintId,
      category: c.complaintCategory,
      status: c.complaintStatus,
      description: c.description,
      userName: c.userName,
      userEmail: c.userEmail,
      createdAt: c.createdAt,
      resolvedAt: c.resolvedAt,
      resolutionNotes: c.resolutionNotes,
      slaMet: c.slaMet,
    }));
  }, [complaints]);

  const stats = useMemo(() => {
    const total = normalizedComplaints.length;
    const open = normalizedComplaints.filter(c => c.status === "OPEN").length;
    const resolved = normalizedComplaints.filter(c => c.status === "RESOLVED").length;
    const slaMet = normalizedComplaints.filter(c => c.slaMet).length;
    return { total, open, resolved, slaMet };
  }, [normalizedComplaints]);

  const filteredData = useMemo(() => {
    let result = normalizedComplaints;
    if (filters.status) result = result.filter(c => c.status === filters.status);
    if (filters.category) result = result.filter(c => c.category === filters.category);
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      result = result.filter(c => new Date(c.createdAt) >= fromDate);
    }
    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59);
      result = result.filter(c => new Date(c.createdAt) <= toDate);
    }
    setCurrentPage(1);
    return result;
  }, [normalizedComplaints, filters]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const fetchComplaints = async (forceAll = false) => {
    setLoading(true);
    try {
      const res = await complaintsApi.getAll();
      setComplaints(res.data || []);
      setFetched(true);
    } catch (err) {
      toast.error(err?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (e) => {
    e?.preventDefault();
    if (!resolutionNotes.trim()) {
      toast.error("Resolution notes are required");
      return;
    }

    setResolving(true);
    try {
      await complaintsApi.resolve({
        complaintId: selectedComplaint.id,
        complaintStatus: resolveStatus,
        resolutionNotes: resolutionNotes,
      });
      toast.success("Complaint resolved successfully");
      setShowResolveModal(false);
      await fetchComplaints(true);
    } catch (err) {
      toast.error(err?.message || "Failed to resolve complaint");
    } finally {
      setResolving(false);
    }
  };

  const clearFilters = () => {
    setFilters({ status: "", category: "", fromDate: "", toDate: "" });
  };

  useEffect(() => {
    fetchComplaints(true);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString?.() || dateString;
  };

  const getCategoryColor = (category) => {
    const colors = { BILLING: "#f59e0b", SERVICE: "#06b6d4", OUTAGE: "#ef4444" };
    return colors[category] || "#64748b";
  };

  const getStatusColor = (status) => {
    const colors = { OPEN: "#ef4444", RESOLVED: "#10b981", CLOSED: "#6b7280" };
    return colors[status] || "#64748b";
  };

  return (
    <div style={P.page}>
      <Sidebar active={active} setActive={setActive} />
      <div style={P.main}>
        <TopBar title="Admin Dashboard" />
        <div style={P.container}>
          <div style={P.head}>
            <div>
              <h3 style={P.title}>Complaints</h3>
              <p style={P.subtitle}>Track and manage all customer complaints with real-time updates</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 26 }}>
            {/* Total Complaints */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.1s backwards" }}>
              <div
                style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
              >
                <Stat label="Total Complaints" value={stats.total} icon="⚖️" color="#3b82f6" loading={loading} />
              </div>
            </div>

            {/* Open Complaints */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.2s backwards" }}>
              <div
                style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
              >
                <Stat label="Open Complaints" value={stats.open} icon="🔴" color="#ef4444" loading={loading} />
              </div>
            </div>

            {/* Resolved Complaints */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.3s backwards" }}>
              <div
                style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
              >
                <Stat label="Resolved" value={stats.resolved} icon="✅" color="#22c55e" loading={loading} />
              </div>
            </div>

            {/* SLA Met */}
            <div className="ani-fade-up" style={{ animation: "fadeInUp 0.5s ease-out 0.4s backwards" }}>
              <div
                style={{ transition: "transform 0.25s ease, filter 0.25s ease" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.filter = "brightness(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
              >
                <Stat label="SLA Met" value={stats.slaMet} icon="⏱️" color="#f59e0b" loading={loading} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ ...P.card, marginBottom: 16 }}>
            <form onSubmit={e => { e.preventDefault(); fetchComplaints(false); }} 
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, alignItems: "end" }}>
              <SelectField label="Status" value={filters.status} onChange={v => setFilters({ ...filters, status: v })} 
                options={["OPEN", "RESOLVED", "CLOSED"]} />
              <SelectField label="Category" value={filters.category} onChange={v => setFilters({ ...filters, category: v })} 
                options={["BILLING", "SERVICE", "OUTAGE"]} />
              <Field label="From Date" type="date" value={filters.fromDate} onChange={v => setFilters({ ...filters, fromDate: v })} />
              <Field label="To Date" type="date" value={filters.toDate} onChange={v => setFilters({ ...filters, toDate: v })} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" style={P.primaryBtn} disabled={loading}>{loading ? "Loading..." : "Apply Filters"}</button>
                <button type="button" style={P.outlineBtn} onClick={clearFilters}>Reset</button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div style={P.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#1f2937", fontWeight: 700 }}>Complaints List</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Page {currentPage} of {Math.max(1, totalPages)}</div>
            </div>

            {!fetched || loading ? (
              <div style={{ textAlign: "center", padding: "26px 0", color: "#64748b", fontSize: 12 }}>⏳ Loading complaints...</div>
            ) : filteredData.length === 0 ? (
              <Empty msg="No complaints found" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["ID", "Customer", "Category", "Status", "Created", "SLA"].map((h) => (
                        <th key={h} style={P.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((complaint) => (
                      <tr key={complaint.key} onClick={() => { setSelectedComplaint(complaint); setShowDetailModal(true); }} style={{ cursor: "pointer", transition: "all 0.2s" }}
                        onMouseOver={e => { e.currentTarget.style.background = "#eef8ff"; }}
                        onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ ...P.td, color: "#1f2937", fontWeight: 600 }}>#{complaint.id}</td>
                        <td style={P.td}>
                          <div style={{ color: "#1f2937", fontWeight: 500 }}>{complaint.userName}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{complaint.userEmail}</div>
                        </td>
                        <td style={P.td}>
                          <Badge text={complaint.category} color={getCategoryColor(complaint.category)} />
                        </td>
                        <td style={P.td}>
                          <Badge text={complaint.status} color={getStatusColor(complaint.status)} />
                        </td>
                        <td style={{ ...P.td, color: "#64748b", fontSize: 11 }}>{formatDate(complaint.createdAt)}</td>
                        <td style={P.td}>
                          <Badge text={complaint.slaMet ? "Met" : "Missed"} color={complaint.slaMet ? "#10b981" : "#f59e0b"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e2d4a" }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ ...P.outlineBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  ← Previous
                </button>
                <div style={{ color: "#64748b", fontSize: 12, display: "flex", alignItems: "center" }}>
                  Page <strong style={{ margin: "0 4px" }}>{currentPage}</strong> of <strong style={{ margin: "0 4px" }}>{totalPages}</strong>
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ ...P.outlineBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div style={P.modal} onClick={() => setShowDetailModal(false)}>
          <div style={P.modalContent} onClick={e => e.stopPropagation()}>
            <button style={P.modalClose} onClick={() => setShowDetailModal(false)}>×</button>
            <h2 style={{ margin: "0 0 18px", color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>
              Complaint #{selectedComplaint.id}
            </h2>

            <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
              <Badge text={selectedComplaint.category} color={getCategoryColor(selectedComplaint.category)} />
              <Badge text={selectedComplaint.status} color={getStatusColor(selectedComplaint.status)} />
              <Badge text={selectedComplaint.slaMet ? "SLA Met" : "SLA Missed"} color={selectedComplaint.slaMet ? "#10b981" : "#f59e0b"} />
            </div>

            <div style={{ background: "#f5fbff", borderRadius: 10, padding: 16, marginBottom: 18, border: "1px solid #d6eaf4" }}>
              <div style={P.detailRow}>
                <span style={P.detailLabel}>Customer</span>
                <span style={P.detailValue}>{selectedComplaint.userName}</span>
              </div>
              <div style={P.detailRow}>
                <span style={P.detailLabel}>Email</span>
                <span style={P.detailValue}>{selectedComplaint.userEmail}</span>
              </div>
              <div style={P.detailRow}>
                <span style={P.detailLabel}>Created</span>
                <span style={P.detailValue}>{formatDate(selectedComplaint.createdAt)}</span>
              </div>
              {selectedComplaint.resolvedAt && (
                <div style={P.detailRow}>
                  <span style={P.detailLabel}>Resolved</span>
                  <span style={P.detailValue}>{formatDate(selectedComplaint.resolvedAt)}</span>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 8, display: "block" }}>Description</label>
              <div style={{ background: "#f5fbff", borderRadius: 10, padding: 12, fontSize: 13, color: "#334155", lineHeight: 1.6, marginBottom: 18, border: "1px solid #d6eaf4" }}>
                {selectedComplaint.description}
              </div>
            </div>

            {selectedComplaint.resolutionNotes && (
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 8, display: "block" }}>Resolution Notes</label>
                <div style={{ background: "#f5fbff", borderRadius: 10, padding: 12, fontSize: 13, color: "#334155", lineHeight: 1.6, border: "1px solid #d6eaf4" }}>
                  {selectedComplaint.resolutionNotes}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={P.outlineBtn}
              >
                Close
              </button>
              {selectedComplaint.status === "OPEN" && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowResolveModal(true);
                  }}
                  style={P.primaryBtn}
                >
                  Resolve Complaint
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedComplaint && (
        <div style={P.modal} onClick={() => setShowResolveModal(false)}>
          <div style={P.modalContent} onClick={e => e.stopPropagation()}>
            <button style={P.modalClose} onClick={() => setShowResolveModal(false)}>×</button>
            <h2 style={{ margin: "0 0 12px", color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>
              Resolve Complaint #{selectedComplaint.id}
            </h2>
            <p style={{ margin: "0 0 18px", color: "#94a3b8", fontSize: 12 }}>
              {selectedComplaint.description}
            </p>

            <form onSubmit={handleResolveComplaint} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SelectField
                label="Resolution Status"
                value={resolveStatus}
                onChange={setResolveStatus}
                options={["RESOLVED", "CLOSED"]}
                required
              />

              <div>
                <label style={P.label}>Resolution Notes *</label>
                <textarea
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  style={{ ...P.input, minHeight: 100, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
                  placeholder="Enter resolution details..."
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  style={P.outlineBtn}
                  disabled={resolving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={P.primaryBtn}
                  disabled={resolving}
                >
                  {resolving ? "Resolving..." : "Resolve Complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
