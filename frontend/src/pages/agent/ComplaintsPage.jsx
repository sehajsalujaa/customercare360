import { useEffect, useState } from "react";
import { Sidebar, TopBar } from "../../components/Layout";
import { agentApi } from "../../api/agent.api";
import { complaintsApi } from "../../api/complaints.api";
import toast from "react-hot-toast";

const card = { background: "linear-gradient(135deg, #FBF9E7 0%, #f4fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 18, boxShadow: "0 8px 20px rgba(130,200,229,0.16)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #bcdff0", background: "#ffffff", color: "#1f2937" };
const btn = { background: "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

const TH = { padding: "12px 14px", fontSize: 12, color: "#475569", fontWeight: 700, textAlign: "left", background: "#f5fbff", borderBottom: "1px solid #cde8f4" };
const TD = { padding: "12px 14px", fontSize: 13, color: "#1f2937", borderBottom: "1px solid #eef8ff" };
const overlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 };
const modal = { width: "min(680px, 100%)", background: "#ffffff", border: "1px solid #cde8f4", borderRadius: 12, boxShadow: "0 20px 40px rgba(15,23,42,0.25)", overflow: "hidden" };
const detailLabel = { color: "#64748b", fontSize: 12, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 };
const detailValue = { color: "#0f172a", fontSize: 14, fontWeight: 600 };

export default function ComplaintsPage() {
  const [active, setActive] = useState("complaints-agent");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [customerId, setCustomerId] = useState("");
  const [category, setCategory] = useState("BILLING");
  const [description, setDescription] = useState("");
  
  // Data
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    
    if (!customerId || !description.trim()) {
      toast.error("Enter customer ID and description");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: Number(customerId),
        complaintCategory: category,
        description: description.trim()
      };
      await complaintsApi.create(payload);
      toast.success("Complaint logged successfully!");
      setCustomerId("");
      setCategory("BILLING");
      setDescription("");
      setShowForm(false);
      loadComplaints();
    } catch (error) {
      toast.error(error?.message || "Failed to log complaint");
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await agentApi.getComplaints(0, 20);
      setComplaints(res.data?.content || res.data || []);
    } catch (error) {
      toast.error(error?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
      <Sidebar active={active} setActive={setActive} />
      <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1 }}>
        <TopBar title="Agent Dashboard" />
        
        <div style={{ padding: "24px 28px", display: "grid", gap: 24 }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Complaints Management</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Log, track and resolve customer complaints</p>
            </div>
          </div>
          
          {/* ────── Log New Complaint ────── */}
          <div style={card}>
            <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>📝 Log New Complaint</h3>
            <button onClick={() => setShowForm(!showForm)} style={{ ...btn, marginBottom: showForm ? 16 : 0 }}>
              {showForm ? "Cancel" : "+ New Complaint"}
            </button>

            {showForm && (
              <form onSubmit={handleCreateComplaint} style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #cde8f4" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Customer ID *</label>
                    <input type="number" value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Enter Customer ID" style={input} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={input}>
                      <option value="BILLING">Billing</option>
                      <option value="SERVICE">Service</option>
                      <option value="TECHNICAL">Technical</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Description *</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Describe the complaint..." 
                    style={{ ...input, minHeight: 100, resize: "vertical" }} 
                    required 
                  />
                </div>
                <button type="submit" disabled={loading} style={{ ...btn, width: "100%", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Logging..." : "✓ Log Complaint"}
                </button>
              </form>
            )}
          </div>

          {/* ────── Recent Complaints ────── */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#1f2937", fontWeight: 800, margin: 0 }}>⚖️ My Complaints</h3>
              <button onClick={loadComplaints} style={{ background: "transparent", color: "#82C8E5", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                Refresh →
              </button>
            </div>

            {complaints.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={TH}>ID</th>
                      <th style={TH}>Customer ID</th>
                      <th style={TH}>Category</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Created</th>
                      <th style={TH}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id}>
                        <td style={TD}><strong>#{c.id}</strong></td>
                        <td style={TD}>#{c.userId || "-"}</td>
                        <td style={TD}>{c.complaintCategory || "-"}</td>
                        <td style={TD}>
                          <span style={{
                            background: c.complaintStatus === "RESOLVED" ? "#dcfce7" : c.complaintStatus === "PENDING" ? "#fef3c7" : "#e5e7eb",
                            color: c.complaintStatus === "RESOLVED" ? "#166534" : c.complaintStatus === "PENDING" ? "#92400e" : "#374151",
                            borderRadius: 4,
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {c.complaintStatus || "OPEN"}
                          </span>
                        </td>
                        <td style={TD}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</td>
                        <td style={TD}>
                          <button onClick={() => setSelectedComplaint(c)} style={{ ...btn, padding: "6px 12px", fontSize: 11 }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                <div>No complaints logged yet. Click "New Complaint" to start.</div>
              </div>
            )}
          </div>

        </div>
      </div>

      {selectedComplaint && (
        <div style={overlay} onClick={() => setSelectedComplaint(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e2eef5", background: "#f7fcff" }}>
              <h3 style={{ margin: 0, color: "#1f2937", fontSize: 16, fontWeight: 800 }}>Complaint Details</h3>
              <button onClick={() => setSelectedComplaint(null)} style={{ border: "none", background: "transparent", color: "#64748b", cursor: "pointer", fontWeight: 700 }}>✕</button>
            </div>
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div style={detailLabel}>Complaint ID</div>
                <div style={detailValue}>#{selectedComplaint.id ?? "-"}</div>
              </div>
              <div>
                <div style={detailLabel}>Customer ID</div>
                <div style={detailValue}>#{selectedComplaint.userId ?? "-"}</div>
              </div>
              <div>
                <div style={detailLabel}>Category</div>
                <div style={detailValue}>{selectedComplaint.complaintCategory || "-"}</div>
              </div>
              <div>
                <div style={detailLabel}>Status</div>
                <div style={detailValue}>{selectedComplaint.complaintStatus || "OPEN"}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={detailLabel}>Description</div>
                <div style={{ ...detailValue, whiteSpace: "pre-wrap" }}>{selectedComplaint.description || "-"}</div>
              </div>
              <div>
                <div style={detailLabel}>Created At</div>
                <div style={detailValue}>{selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleString() : "-"}</div>
              </div>
            </div>
            <div style={{ padding: 16, borderTop: "1px solid #e2eef5", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedComplaint(null)} style={{ ...btn, padding: "8px 14px" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
