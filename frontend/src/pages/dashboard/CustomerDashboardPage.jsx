import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Sidebar, TopBar } from "../../components/Layout";
import { serviceOrdersApi } from "../../api/serviceOrders.api";
import { billingApi } from "../../api/billing.api";
import { complaintsApi } from "../../api/complaints.api";
import { notificationsApi } from "../../api/notifications.api";
import { Badge, Empty, Spinner, Stat } from "../../styles/ui";

const card = { background: "linear-gradient(135deg, #FBF9E7 0%, #f4fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 18, boxShadow: "0 8px 20px rgba(130,200,229,0.16)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #bcdff0", background: "#ffffff", color: "#1f2937" };
const btn = { background: "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };
const btnSec = { ...btn, background: "#82C8E5" };
const label = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5 };

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("cc360_user") || "{}"); }
  catch { return {}; }
}

const STATUS_BILL = {
  DRAFT: "#94a3b8",
  GENERATED: "#3b82f6",
  SENT: "#0ea5e9",
  OVERDUE: "#f97316",
  DISPUTED: "#f59e0b",
  PAID: "#22c55e",
  ADJUSTED: "#a78bfa",
  FAILED: "#ef4444",
  CANCELLED: "#64748b",
};
const STATUS_REQ = { OPEN: "#f59e0b", IN_PROGRESS: "#3b82f6", RESOLVED: "#22c55e", CLOSED: "#94a3b8" };
const STATUS_COMPLAINT = { OPEN: "#f59e0b", IN_PROGRESS: "#3b82f6", RESOLVED: "#22c55e", CLOSED: "#94a3b8" };
const STATUS_DISPUTE = { REQUESTED: "#f59e0b", APPROVED: "#22c55e", REJECTED: "#ef4444" };

export default function CustomerDashboardPage() {
  const user = getUser();
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [bills, setBills] = useState([]);
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Forms
  const [requestForm, setRequestForm] = useState({ requestType: "NEW_CONNECTION" });
  const [disputeForm, setDisputeForm] = useState({ billId: "", reason: "" });
  const [complaintForm, setComplaintForm] = useState({ complaintCategory: "SERVICE", description: "" });
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payingBillId, setPayingBillId] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [profileRes, billsRes, reqRes, compRes, dispRes, notifRes, unreadRes] = await Promise.allSettled([
        billingApi.getMyProfile(),
        billingApi.getMyBills(),
        serviceOrdersApi.getMyRequests(),
        complaintsApi.getMyComplaints(),
        billingApi.getMyDisputes(),
        notificationsApi.getMine("DESC"),
        notificationsApi.getMyUnreadCount(),
      ]);
      if (profileRes.status === "fulfilled") setProfile(profileRes.value?.data || null);
      if (billsRes.status === "fulfilled") setBills(Array.isArray(billsRes.value?.data) ? billsRes.value.data : []);
      if (reqRes.status === "fulfilled") setRequests(Array.isArray(reqRes.value?.data) ? reqRes.value.data : []);
      if (compRes.status === "fulfilled") setComplaints(Array.isArray(compRes.value?.data) ? compRes.value.data : []);
      if (dispRes.status === "fulfilled") setDisputes(Array.isArray(dispRes.value?.data) ? dispRes.value.data : []);
      if (notifRes.status === "fulfilled") setNotifications(Array.isArray(notifRes.value?.data) ? notifRes.value.data : []);
      if (unreadRes.status === "fulfilled") setUnreadCount(Number(unreadRes.value?.data || 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const raiseRequest = async (e) => {
    e.preventDefault();
    if (!profile?.customerId) return toast.error("Customer profile not loaded");
    try {
      await serviceOrdersApi.raiseServiceRequest({ customerId: profile.customerId, requestType: requestForm.requestType });
      toast.success("Service request raised successfully");
      setRequestForm({ requestType: "NEW_CONNECTION" });
      const res = await serviceOrdersApi.getMyRequests();
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (e2) { toast.error(e2?.message || "Failed to raise request"); }
  };

  const trackRequest = async () => {
    if (!trackId) return toast.error("Enter a Request ID");
    setTrackLoading(true);
    setTrackResult(null);
    try {
      const res = await serviceOrdersApi.getRequestStatus(trackId);
      setTrackResult(res.data);
    } catch { toast.error("Request not found"); }
    finally { setTrackLoading(false); }
  };

  const raiseDispute = async (e) => {
    e.preventDefault();
    try {
      await billingApi.raiseDispute({ billId: Number(disputeForm.billId), reason: disputeForm.reason });
      toast.success("Dispute raised successfully");
      setDisputeForm({ billId: "", reason: "" });
      const res = await billingApi.getMyDisputes();
      setDisputes(Array.isArray(res.data) ? res.data : []);
    } catch (e2) { toast.error(e2?.message || "Failed to raise dispute"); }
  };

  const raiseComplaint = async (e) => {
    e.preventDefault();
    try {
      await complaintsApi.create({ userId: Number(user?.userId || 0), ...complaintForm });
      toast.success("Complaint submitted successfully");
      setComplaintForm({ complaintCategory: "SERVICE", description: "" });
      const res = await complaintsApi.getMyComplaints();
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (e2) { toast.error(e2?.message || "Failed to submit complaint"); }
  };

  const openBillPopup = (bill) => {
    setSelectedBill(bill);
  };

  const closeBillPopup = () => {
    setSelectedBill(null);
    setPayingBillId(null);
  };

  const payBill = async (billId) => {
    try {
      setPayingBillId(billId);
      await billingApi.payMyBill(billId);
      const refreshed = await billingApi.getMyBills();
      const nextBills = Array.isArray(refreshed?.data) ? refreshed.data : [];
      setBills(nextBills);
      const paidBill = nextBills.find((b) => b.billId === billId);
      setSelectedBill((prev) => (
        prev && prev.billId === billId
          ? { ...prev, billStatus: paidBill?.billStatus || "PAID" }
          : prev
      ));
      toast.success("Bill paid successfully");
    } catch (e2) {
      const apiMsg = e2?.response?.data?.message || e2?.response?.data?.error;
      toast.error(apiMsg || e2?.message || "Failed to pay bill");
    } finally {
      setPayingBillId(null);
    }
  };

  const billStats = useMemo(() => ({
    total: bills.length,
    paid: bills.filter((b) => b.billStatus === "PAID").length,
    unpaid: bills.filter((b) => ["DRAFT", "GENERATED", "SENT", "OVERDUE", "DISPUTED", "ADJUSTED"].includes(b.billStatus)).length,
    totalDue: bills.filter((b) => ["DRAFT", "GENERATED", "SENT", "OVERDUE", "DISPUTED", "ADJUSTED"].includes(b.billStatus)).reduce((s, b) => s + Number(b.amount || 0), 0).toFixed(2),
  }), [bills]);

  const readCount = Math.max(0, notifications.length - unreadCount);
  const customerName = profile?.name || user?.name || user?.email?.split("@")[0] || "Customer";

  const tabTitle = {
    dashboard: "My Dashboard",
    "my-bills": "My Bills",
    "raise-request": "Raise Service Request",
    "raise-dispute": "Raise Dispute",
    "track-request": "Track Request Status",
    notifications: "My Notifications",
  };

  const th = { padding: "10px 12px", textAlign: "left", color: "#64748b", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid #d6eaf4" };
  const td = { padding: "10px 12px", color: "#1f2937", fontSize: 12, borderBottom: "1px solid #e8f1f6" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
      <Sidebar active={active} setActive={setActive} unreadCount={unreadCount} />
      <div className="page-content" style={{ marginLeft: "var(--app-sidebar-width)", flex: 1 }}>
        <TopBar title="Customer Dashboard" notifications={notifications.slice(0, 5)} />

        <div style={{ padding: "24px 28px", display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <div>
              {active === "dashboard" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#1f2937" }}>Hello, {customerName}</div>
                </div>
              )}
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>{tabTitle[active] || active}</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{active === "dashboard" ? "Your account summary, bills and recent service requests" : active === "my-bills" ? "View all your bills, payment history and active disputes" : active === "raise-request" ? "Submit a new service request or log a complaint" : active === "raise-dispute" ? "Dispute a bill and track resolution status" : active === "track-request" ? "Check the live status of your service requests" : "Your account notifications and system alerts"}</p>
            </div>
            <button onClick={loadAll} style={btnSec}>↻ Refresh</button>
          </div>

          {loading ? <Spinner /> : (
            <>
              {/* ── DASHBOARD TAB ── */}
              {active === "dashboard" && (
                <>
                  {profile && (
                    <div className="rg-4" style={{ ...card, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>NAME</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#1f2937" }}>{profile.name || "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>EMAIL</div>
                        <div style={{ fontSize: 13, color: "#1f2937" }}>{profile.email || "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>ADDRESS</div>
                        <div style={{ fontSize: 13, color: "#1f2937" }}>{profile.address || "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>STATUS</div>
                        <Badge text={profile.customerStatus || "UNKNOWN"} color={profile.customerStatus === "ACTIVE" ? "#22c55e" : "#f59e0b"} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                    <Stat label="Total Bills" value={billStats.total} icon="🧾" color="#3b82f6" />
                    <Stat label="Paid Bills" value={billStats.paid} icon="✅" color="#22c55e" />
                    <Stat label="Unpaid Bills" value={billStats.unpaid} icon="🕒" color="#f59e0b" />
                    <Stat label="Amount Due" value={`₹${billStats.totalDue}`} icon="💰" color="#ef4444" />
                  </div>

                  <div className="rg-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={card}>
                      <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>Recent Bills</div>
                      {!bills.length ? <Empty msg="No bills yet" /> : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead><tr><th style={th}>Bill ID</th><th style={th}>Amount</th><th style={th}>Due Date</th><th style={th}>Status</th></tr></thead>
                          <tbody>
                            {bills.slice(0, 5).map((b) => (
                              <tr key={b.billId}>
                                <td style={td}>#{b.billId}</td>
                                <td style={td}>₹{Number(b.amount || 0).toFixed(2)}</td>
                                <td style={td}>{fmtDate(b.dueDate)}</td>
                                <td style={td}><Badge text={b.billStatus} color={STATUS_BILL[b.billStatus] || "#64748b"} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div style={card}>
                      <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>Recent Service Requests</div>
                      {!requests.length ? <Empty msg="No service requests yet" /> : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead><tr><th style={th}>Req ID</th><th style={th}>Type</th><th style={th}>Priority</th><th style={th}>Status</th></tr></thead>
                          <tbody>
                            {requests.slice(0, 5).map((r) => (
                              <tr key={r.requestId}>
                                <td style={td}>#{r.requestId}</td>
                                <td style={td}>{r.requestType}</td>
                                <td style={td}><Badge text={r.priority || "-"} color="#8b5cf6" /></td>
                                <td style={td}><Badge text={r.status} color={STATUS_REQ[r.status] || "#64748b"} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {profile?.serviceAccounts?.length > 0 && (
                    <div style={card}>
                      <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>My Service Accounts</div>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Account ID</th><th style={th}>Service Type</th><th style={th}>Address</th><th style={th}>Region</th><th style={th}>Meter ID</th><th style={th}>Status</th></tr></thead>
                        <tbody>
                          {profile.serviceAccounts.map((a) => (
                            <tr key={a.accountId}>
                              <td style={td}>#{a.accountId}</td>
                              <td style={td}>{a.serviceType}</td>
                              <td style={td}>{a.address || "-"}</td>
                              <td style={td}>{a.region || "-"}</td>
                              <td style={td}>{a.meterId || "-"}</td>
                              <td style={td}><Badge text={String(a.serviceAccountStatus)} color={String(a.serviceAccountStatus) === "ACTIVE" ? "#22c55e" : "#ef4444"} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* ── MY BILLS TAB ── */}
              {active === "my-bills" && (
                <>
                  <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                    <Stat label="Total Bills" value={billStats.total} icon="🧾" color="#3b82f6" />
                    <Stat label="Paid" value={billStats.paid} icon="✅" color="#22c55e" />
                    <Stat label="Unpaid" value={billStats.unpaid} icon="🕒" color="#f59e0b" />
                    <Stat label="Total Due" value={`₹${billStats.totalDue}`} icon="💰" color="#ef4444" />
                  </div>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 12 }}>All My Bills</div>
                    {!bills.length ? <Empty msg="No bills found" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Bill ID</th><th style={th}>Usage</th><th style={th}>Amount</th><th style={th}>Due Date</th><th style={th}>Period</th><th style={th}>Status</th><th style={th}>Action</th></tr></thead>
                        <tbody>
                          {bills.map((b) => (
                            <tr key={b.billId}>
                              <td style={td}>#{b.billId}</td>
                              <td style={td}>{b.usage ?? "-"}</td>
                              <td style={td}>₹{Number(b.amount || 0).toFixed(2)}</td>
                              <td style={td}>{fmtDate(b.dueDate)}</td>
                              <td style={td}>{fmtDate(b.fromDate)} – {fmtDate(b.toDate)}</td>
                              <td style={td}><Badge text={b.billStatus} color={STATUS_BILL[b.billStatus] || "#64748b"} /></td>
                              <td style={td}>
                                <button style={{ ...btnSec, padding: "6px 10px", fontSize: 11 }} onClick={() => openBillPopup(b)}>
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 12 }}>My Disputes</div>
                    {!disputes.length ? <Empty msg="No disputes raised yet" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Dispute ID</th><th style={th}>Bill ID</th><th style={th}>Amount</th><th style={th}>Reason</th><th style={th}>Status</th><th style={th}>Decision</th></tr></thead>
                        <tbody>
                          {disputes.map((d) => (
                            <tr key={d.disputeId}>
                              <td style={td}>#{d.disputeId}</td>
                              <td style={td}>#{d.billId}</td>
                              <td style={td}>₹{Number(d.currentBillAmount || 0).toFixed(2)}</td>
                              <td style={{ ...td, maxWidth: 280 }}>{d.reason}</td>
                              <td style={td}><Badge text={d.status} color={STATUS_DISPUTE[d.status] || "#64748b"} /></td>
                              <td style={td}>{d.decisionReason || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* ── RAISE REQUEST TAB ── */}
              {active === "raise-request" && (
                <>
                  <form onSubmit={raiseRequest} style={{ ...card, display: "grid", gridTemplateColumns: "2fr auto", gap: 14, alignItems: "end" }}>
                    <div>
                      <label style={label}>Request Type *</label>
                      <select value={requestForm.requestType} onChange={(e) => setRequestForm({ ...requestForm, requestType: e.target.value })} style={input}>
                        <option value="NEW_CONNECTION">NEW_CONNECTION</option>
                        <option value="DISCONNECT">DISCONNECT</option>
                        <option value="COMPLAINT">COMPLAINT</option>
                        <option value="INQUIRY">INQUIRY</option>
                      </select>
                    </div>
                    <button type="submit" style={{ ...btn, alignSelf: "flex-end" }}>🔧 Raise Request</button>
                  </form>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>My Service Requests</div>
                    {!requests.length ? <Empty msg="No service requests yet" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Request ID</th><th style={th}>Type</th><th style={th}>Priority</th><th style={th}>Status</th><th style={th}>Raised On</th><th style={th}>Last Updated</th></tr></thead>
                        <tbody>
                          {requests.map((r) => (
                            <tr key={r.requestId}>
                              <td style={td}>#{r.requestId}</td>
                              <td style={td}>{r.requestType}</td>
                              <td style={td}><Badge text={r.priority || "-"} color="#8b5cf6" /></td>
                              <td style={td}><Badge text={r.status} color={STATUS_REQ[r.status] || "#64748b"} /></td>
                              <td style={td}>{fmtDate(r.createdAt)}</td>
                              <td style={td}>{fmtDate(r.lastUpdated)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 12 }}>Submit a Complaint</div>
                    <form onSubmit={raiseComplaint} className="rg-form" style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "end" }}>
                      <div>
                        <label style={label}>Category *</label>
                        <select value={complaintForm.complaintCategory} onChange={(e) => setComplaintForm({ ...complaintForm, complaintCategory: e.target.value })} style={input}>
                          <option value="SERVICE">SERVICE</option>
                          <option value="BILLING">BILLING</option>
                          <option value="OUTAGE">OUTAGE</option>
                        </select>
                      </div>
                      <div>
                        <label style={label}>Description *</label>
                        <input required value={complaintForm.description} onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} placeholder="Describe your complaint..." style={input} />
                      </div>
                      <button type="submit" style={{ ...btnSec, alignSelf: "flex-end" }}>📝 Submit</button>
                    </form>

                    {complaints.length > 0 && (
                      <>
                        <div style={{ fontWeight: 700, color: "#1f2937", marginTop: 16, marginBottom: 8 }}>My Complaints</div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead><tr><th style={th}>ID</th><th style={th}>Category</th><th style={th}>Description</th><th style={th}>Status</th><th style={th}>Raised On</th></tr></thead>
                          <tbody>
                            {complaints.map((c) => (
                              <tr key={c.complaintId}>
                                <td style={td}>#{c.complaintId}</td>
                                <td style={td}>{c.complaintCategory}</td>
                                <td style={{ ...td, maxWidth: 300 }}>{c.description}</td>
                                <td style={td}><Badge text={String(c.complaintStatus)} color={STATUS_COMPLAINT[String(c.complaintStatus)] || "#64748b"} /></td>
                                <td style={td}>{fmtDate(c.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* ── RAISE DISPUTE TAB ── */}
              {active === "raise-dispute" && (
                <>
                  <form onSubmit={raiseDispute} className="rg-form" style={{ ...card, display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={label}>Bill ID *</label>
                      <select required value={disputeForm.billId} onChange={(e) => setDisputeForm({ ...disputeForm, billId: e.target.value })} style={input}>
                        <option value="">-- Select Bill --</option>
                        {bills.map((b) => (
                          <option key={b.billId} value={b.billId}>
                            #{b.billId} | ₹{Number(b.amount || 0).toFixed(2)} | {b.billStatus} | Due: {fmtDate(b.dueDate)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={label}>Reason *</label>
                      <input required value={disputeForm.reason} onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })} placeholder="Describe why you are disputing this bill..." style={input} />
                    </div>
                    <button type="submit" style={{ ...btn, alignSelf: "flex-end" }}>⚖️ Raise Dispute</button>
                  </form>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>My Disputes</div>
                    {!disputes.length ? <Empty msg="No disputes raised yet" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Dispute ID</th><th style={th}>Bill ID</th><th style={th}>Amount</th><th style={th}>Reason</th><th style={th}>Status</th><th style={th}>Approver</th><th style={th}>Decision</th></tr></thead>
                        <tbody>
                          {disputes.map((d) => (
                            <tr key={d.disputeId}>
                              <td style={td}>#{d.disputeId}</td>
                              <td style={td}>#{d.billId}</td>
                              <td style={td}>₹{Number(d.currentBillAmount || 0).toFixed(2)}</td>
                              <td style={{ ...td, maxWidth: 260 }}>{d.reason}</td>
                              <td style={td}><Badge text={d.status} color={STATUS_DISPUTE[d.status] || "#64748b"} /></td>
                              <td style={td}>{d.approver || "-"}</td>
                              <td style={{ ...td, maxWidth: 200 }}>{d.decisionReason || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* ── TRACK REQUEST TAB ── */}
              {active === "track-request" && (
                <>
                  <div style={{ ...card, display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={label}>Enter Request ID to Track</label>
                      <input value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder="e.g. 12" style={input} />
                    </div>
                    <button onClick={trackRequest} style={{ ...btn, alignSelf: "flex-end" }} disabled={trackLoading}>
                      {trackLoading ? "..." : "📍 Track"}
                    </button>
                  </div>

                  {trackResult && (
                    <div className="rg-3" style={{ ...card, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>REQUEST STATUS</div>
                        <Badge text={trackResult.requestStatus || "-"} color={STATUS_REQ[trackResult.requestStatus] || "#64748b"} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>ORDER STATUS</div>
                        <Badge text={trackResult.orderStatus || "No Order Yet"} color={trackResult.orderStatus === "COMPLETED" ? "#22c55e" : trackResult.orderStatus === "FAILED" ? "#ef4444" : "#3b82f6"} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>LAST UPDATED</div>
                        <div style={{ fontSize: 13, color: "#1f2937" }}>{fmtDate(trackResult.lastUpdated)}</div>
                      </div>
                    </div>
                  )}

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>All My Service Requests</div>
                    {!requests.length ? <Empty msg="No service requests yet" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Req ID</th><th style={th}>Type</th><th style={th}>Priority</th><th style={th}>Status</th><th style={th}>Raised On</th><th style={th}>Track</th></tr></thead>
                        <tbody>
                          {requests.map((r) => (
                            <tr key={r.requestId}>
                              <td style={td}>#{r.requestId}</td>
                              <td style={td}>{r.requestType}</td>
                              <td style={td}><Badge text={r.priority || "-"} color="#8b5cf6" /></td>
                              <td style={td}><Badge text={r.status} color={STATUS_REQ[r.status] || "#64748b"} /></td>
                              <td style={td}>{fmtDate(r.createdAt)}</td>
                              <td style={td}>
                                <button style={btnSec} onClick={() => { setTrackId(String(r.requestId)); setTrackResult(null); }}>Use</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {active === "notifications" && (
                <>
                  <div className="rg-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    <Stat label="Total" value={notifications.length} icon="🔔" color="#3b82f6" />
                    <Stat label="Unread" value={unreadCount} icon="📩" color="#ef4444" />
                    <Stat label="Read" value={readCount} icon="✅" color="#22c55e" />
                  </div>

                  <div style={{ ...card, display: "flex", gap: 10 }}>
                    <button style={btn} onClick={async () => { await notificationsApi.markMyRead(); toast.success("All marked as read"); const res = await notificationsApi.getMyUnreadCount(); setUnreadCount(Number(res?.data || 0)); }}>Mark all read</button>
                    <button style={btnSec} onClick={async () => { const res = await notificationsApi.getMine("DESC"); setNotifications(Array.isArray(res.data) ? res.data : []); }}>Refresh</button>
                  </div>

                  <div style={card}>
                    {!notifications.length ? <Empty msg="No notifications" /> : notifications.map((n, idx) => (
                      <div key={idx} style={{ background: "#fff", border: "1px solid #d6eaf4", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <Badge text={n.category || "NOTIFICATION"} color="#3b82f6" />
                          <Badge text={n.status || "READ"} color={n.status === "UNREAD" ? "#ef4444" : "#22c55e"} />
                        </div>
                        <div style={{ color: "#1f2937", fontSize: 13 }}>{n.message}</div>
                        <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{fmtDate(n.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedBill && (
                <div
                  onClick={closeBillPopup}
                  style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: "min(680px, 100%)", background: "#ffffff", border: "1px solid #cde8f4", borderRadius: 12, boxShadow: "0 20px 40px rgba(15,23,42,0.25)", overflow: "hidden" }}
                  >
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #e3eff6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Bill Details</h3>
                      <button onClick={closeBillPopup} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}>✕</button>
                    </div>

                    <div style={{ padding: 16, display: "grid", gap: 10 }}>
                      <div className="rg-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>BILL ID</div><div style={{ fontSize: 13, color: "#1f2937" }}>#{selectedBill.billId}</div></div>
                        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>USAGE</div><div style={{ fontSize: 13, color: "#1f2937" }}>{selectedBill.usage ?? "-"}</div></div>
                        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>AMOUNT</div><div style={{ fontSize: 13, color: "#1f2937" }}>₹{Number(selectedBill.amount || 0).toFixed(2)}</div></div>
                        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>DUE DATE</div><div style={{ fontSize: 13, color: "#1f2937" }}>{fmtDate(selectedBill.dueDate)}</div></div>
                        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>PERIOD START</div><div style={{ fontSize: 13, color: "#1f2937" }}>{fmtDate(selectedBill.fromDate)}</div></div>
                        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>PERIOD END</div><div style={{ fontSize: 13, color: "#1f2937" }}>{fmtDate(selectedBill.toDate)}</div></div>
                      </div>

                      <div style={{ marginTop: 6 }}>
                        <Badge text={selectedBill.billStatus} color={STATUS_BILL[selectedBill.billStatus] || "#64748b"} />
                      </div>
                    </div>

                    <div style={{ padding: "12px 16px", borderTop: "1px solid #e3eff6", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button onClick={closeBillPopup} style={{ ...btnSec }}>Close</button>
                      {selectedBill.billStatus !== "PAID" && (
                        <button
                          onClick={() => payBill(selectedBill.billId)}
                          disabled={payingBillId === selectedBill.billId}
                          style={{ ...btn, opacity: payingBillId === selectedBill.billId ? 0.7 : 1 }}
                        >
                          {payingBillId === selectedBill.billId ? "Paying..." : "💳 Pay Now"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
