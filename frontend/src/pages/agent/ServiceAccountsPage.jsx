import { useState } from "react";
import { Sidebar, TopBar } from "../../components/Layout";
import { agentApi } from "../../api/agent.api";
import { customersApi } from "../../api/customers.api";
import toast from "react-hot-toast";

const card = { background: "linear-gradient(135deg, #FBF9E7 0%, #f4fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 18, boxShadow: "0 8px 20px rgba(130,200,229,0.16)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #bcdff0", background: "#ffffff", color: "#1f2937" };
const btn = { background: "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

const TH = { padding: "12px 14px", fontSize: 12, color: "#475569", fontWeight: 700, textAlign: "left", background: "#f5fbff", borderBottom: "1px solid #cde8f4" };
const TD = { padding: "12px 14px", fontSize: 13, color: "#1f2937", borderBottom: "1px solid #eef8ff" };
const overlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 };
const modal = { width: "min(640px, 100%)", background: "#ffffff", border: "1px solid #cde8f4", borderRadius: 12, boxShadow: "0 20px 40px rgba(15,23,42,0.25)", overflow: "hidden" };
const detailLabel = { color: "#64748b", fontSize: 12, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 };
const detailValue = { color: "#0f172a", fontSize: 14, fontWeight: 600 };

export default function ServiceAccountsPage() {
  const [active, setActive] = useState("service-accounts");
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [serviceType, setServiceType] = useState("ELECTRIC");
  const [startDate, setStartDate] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [premiseForm, setPremiseForm] = useState({ serviceAccountId: "", address: "", region: "", meterId: "" });
  const [agreementForm, setAgreementForm] = useState({ serviceAccountId: "", termStartDate: "", termEndDate: "", tariffCode: "", specialNotes: "" });

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.error("Enter customer ID");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId: Number(customerId),
        serviceType,
        startDate: startDate || new Date().toISOString().split("T")[0]
      };
      await customersApi.createServiceAccount(payload);
      toast.success("Service account created successfully!");
      setCustomerId("");
      setServiceType("ELECTRIC");
      setStartDate("");
      setShowForm(false);
      // Reload accounts
      if (customerId) loadAccounts(customerId);
    } catch (error) {
      toast.error(error?.message || "Failed to create service account");
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async (cid) => {
    if (!cid) return;
    setLoading(true);
    try {
      const res = await agentApi.getServiceAccounts(cid);
      setAccounts(res.data || []);
    } catch (error) {
      toast.error(error?.message || "Failed to load service accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPremise = async (e) => {
    e.preventDefault();
    if (!premiseForm.serviceAccountId) {
      toast.error("Enter service account ID");
      return;
    }
    setLoading(true);
    try {
      await customersApi.linkPremise({
        serviceAccountId: Number(premiseForm.serviceAccountId),
        address: premiseForm.address?.trim(),
        region: premiseForm.region?.trim()?.toUpperCase(),
        meterId: premiseForm.meterId?.trim(),
      });
      toast.success("Premise linked successfully");
      setPremiseForm({ serviceAccountId: "", address: "", region: "", meterId: "" });
      if (customerId) loadAccounts(customerId);
    } catch (error) {
      toast.error(error?.message || "Failed to link premise");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAgreement = async (e) => {
    e.preventDefault();
    if (!agreementForm.serviceAccountId) {
      toast.error("Enter service account ID");
      return;
    }
    setLoading(true);
    try {
      await customersApi.recordAgreement({
        serviceAccountId: Number(agreementForm.serviceAccountId),
        termStartDate: agreementForm.termStartDate,
        termEndDate: agreementForm.termEndDate,
        tariffCode: agreementForm.tariffCode?.trim() || null,
        specialNotes: agreementForm.specialNotes?.trim() || null,
      });
      toast.success("Service agreement recorded");
      setAgreementForm({ serviceAccountId: "", termStartDate: "", termEndDate: "", tariffCode: "", specialNotes: "" });
    } catch (error) {
      toast.error(error?.message || "Failed to record agreement");
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
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Service Accounts</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Create service accounts, link premises and manage agreements</p>
            </div>
          </div>
          
          {/* ────── Quick Actions ────── */}
          <div style={card}>
            <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>⚡ Service Account Management</h3>
            <button onClick={() => setShowForm(!showForm)} style={{ ...btn, marginBottom: showForm ? 16 : 0 }}>
              {showForm ? "Cancel" : "+ Create New Account"}
            </button>

            {showForm && (
              <form onSubmit={handleCreateAccount} style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #cde8f4" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Customer ID *</label>
                    <input type="number" value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Enter Customer ID" style={input} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Service Type</label>
                    <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={input}>
                      <option value="ELECTRIC">Electric</option>
                      <option value="GAS">Gas</option>
                      <option value="WATER">Water</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={input} />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ ...btn, width: "100%", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Creating..." : "✓ Create Account"}
                </button>
              </form>
            )}
          </div>

          {/* ────── Search & List ────── */}
          <div style={card}>
            <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>🔍 View Accounts by Customer</h3>
            <form onSubmit={(e) => { e.preventDefault(); loadAccounts(customerId); }} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: accounts.length > 0 ? 20 : 0 }}>
              <input type="number" placeholder="Enter Customer ID" style={input} value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
              <button type="submit" disabled={loading} style={{ ...btn, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Loading..." : "Load"}
              </button>
            </form>

            {accounts.length > 0 && (
              <div>
                <div style={{ color: "#64748b", marginBottom: 12, fontSize: 13 }}>Found {accounts.length} service account(s) for customer #{customerId}</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={TH}>Account ID</th>
                        <th style={TH}>Service Type</th>
                        <th style={TH}>Status</th>
                        <th style={TH}>Created</th>
                        <th style={TH}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc) => (
                        <tr key={acc.id ?? acc.accountId}>
                          <td style={TD}><strong>#{acc.id ?? acc.accountId ?? "-"}</strong></td>
                          <td style={TD}>{acc.serviceType || acc.type || "-"}</td>
                          <td style={TD}>
                            <span style={{ background: (acc.status || "").toUpperCase() === "ACTIVE" ? "#dcfce7" : "#fecaca", color: (acc.status || "").toUpperCase() === "ACTIVE" ? "#166534" : "#dc2626", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                              {acc.status || "ACTIVE"}
                            </span>
                          </td>
                          <td style={TD}>{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : "-"}</td>
                          <td style={TD}>
                            <button onClick={() => setSelectedAccount(acc)} style={{ ...btn, padding: "6px 12px", fontSize: 11 }}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!accounts.length && customerId && !loading && (
              <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>
                No service accounts found for this customer
              </div>
            )}
          </div>

          {!customerId && !accounts.length && (
            <div style={{ ...card, textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
              <div style={{ color: "#64748b" }}>Enter a customer ID to view or create service accounts</div>
            </div>
          )}

          {/* ────── Link Premise ────── */}
          <div style={card}>
            <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>🏠 Link Premise</h3>
            <form onSubmit={handleLinkPremise}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Service Account ID *</label>
                  <input type="number" value={premiseForm.serviceAccountId} onChange={(e) => setPremiseForm({ ...premiseForm, serviceAccountId: e.target.value })} style={input} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Meter ID</label>
                  <input value={premiseForm.meterId} onChange={(e) => setPremiseForm({ ...premiseForm, meterId: e.target.value })} placeholder="Optional" style={input} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Address *</label>
                  <input value={premiseForm.address} onChange={(e) => setPremiseForm({ ...premiseForm, address: e.target.value })} style={input} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Region *</label>
                  <input value={premiseForm.region} onChange={(e) => setPremiseForm({ ...premiseForm, region: e.target.value })} placeholder="DEFAULT / NORTH" style={input} required />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ ...btn, width: "100%", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Linking..." : "🔗 Link Premise"}
              </button>
            </form>
          </div>

          {/* ────── Service Agreement ────── */}
          <div style={card}>
            <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>📝 Record Service Agreement</h3>
            <form onSubmit={handleRecordAgreement}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Service Account ID *</label>
                  <input type="number" value={agreementForm.serviceAccountId} onChange={(e) => setAgreementForm({ ...agreementForm, serviceAccountId: e.target.value })} style={input} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Tariff Code</label>
                  <input value={agreementForm.tariffCode} onChange={(e) => setAgreementForm({ ...agreementForm, tariffCode: e.target.value })} placeholder="Required for INDUSTRIAL" style={input} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Term Start Date *</label>
                  <input type="date" value={agreementForm.termStartDate} onChange={(e) => setAgreementForm({ ...agreementForm, termStartDate: e.target.value })} style={input} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Term End Date *</label>
                  <input type="date" value={agreementForm.termEndDate} onChange={(e) => setAgreementForm({ ...agreementForm, termEndDate: e.target.value })} style={input} required />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Special Notes</label>
                <textarea value={agreementForm.specialNotes} onChange={(e) => setAgreementForm({ ...agreementForm, specialNotes: e.target.value })} style={{ ...input, minHeight: 80 }} />
              </div>
              <button type="submit" disabled={loading} style={{ ...btn, width: "100%", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Saving..." : "✅ Save Agreement"}
              </button>
            </form>
          </div>

        </div>
      </div>

      {selectedAccount && (
        <div style={overlay} onClick={() => setSelectedAccount(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e2eef5", background: "#f7fcff" }}>
              <h3 style={{ margin: 0, color: "#1f2937", fontSize: 16, fontWeight: 800 }}>Service Account Details</h3>
              <button onClick={() => setSelectedAccount(null)} style={{ border: "none", background: "transparent", color: "#64748b", cursor: "pointer", fontWeight: 700 }}>✕</button>
            </div>
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div style={detailLabel}>Account ID</div>
                <div style={detailValue}>#{selectedAccount.id ?? selectedAccount.accountId ?? "-"}</div>
              </div>
              <div>
                <div style={detailLabel}>Customer ID</div>
                <div style={detailValue}>#{selectedAccount.customerId ?? customerId ?? "-"}</div>
              </div>
              <div>
                <div style={detailLabel}>Service Type</div>
                <div style={detailValue}>{selectedAccount.serviceType || selectedAccount.type || "-"}</div>
              </div>
              <div>
                <div style={detailLabel}>Status</div>
                <div style={detailValue}>{selectedAccount.status || "ACTIVE"}</div>
              </div>
              <div>
                <div style={detailLabel}>Start Date</div>
                <div style={detailValue}>{selectedAccount.startDate ? new Date(selectedAccount.startDate).toLocaleDateString() : "-"}</div>
              </div>
              <div>
                <div style={detailLabel}>Created At</div>
                <div style={detailValue}>{selectedAccount.createdAt ? new Date(selectedAccount.createdAt).toLocaleString() : "-"}</div>
              </div>
            </div>
            <div style={{ padding: 16, borderTop: "1px solid #e2eef5", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedAccount(null)} style={{ ...btn, padding: "8px 14px" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
