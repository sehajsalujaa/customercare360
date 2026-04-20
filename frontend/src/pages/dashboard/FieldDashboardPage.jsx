import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Sidebar, TopBar } from "../../components/Layout";
import { serviceOrdersApi } from "../../api/serviceOrders.api";
import { notificationsApi } from "../../api/notifications.api";
import { Badge, Empty, Spinner, Stat } from "../../styles/ui";

const card = { background: "linear-gradient(135deg, #FBF9E7 0%, #f4fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 18, boxShadow: "0 8px 20px rgba(130,200,229,0.16)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #bcdff0", background: "#ffffff", color: "#1f2937" };
const btn = { background: "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };
const btnSec = { ...btn, background: "#82C8E5" };
const btnDanger = { ...btn, background: "#ef4444" };

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
}

const STATUS_COLOR = {
  SCHEDULED: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  FAILED: "#ef4444",
};

const PRIORITY_COLOR = { P1: "#ef4444", P2: "#f59e0b", P3: "#3b82f6", P4: "#94a3b8" };

const getAccountId = (a) => a?.id ?? a?.accountId ?? a?.serviceAccountId;
const getAccountCustomerId = (a) => a?.customerId ?? a?.customer?.customerId ?? a?.customer?.id;
const getReadingId = (r) => r?.readingId ?? r?.id;
const getReadingAccountId = (r) => r?.serviceAccountId ?? r?.accountId ?? r?.serviceAccount?.accountId ?? r?.serviceAccount?.id;
const getReadingCustomerId = (r) => r?.customerId ?? r?.serviceAccount?.customerId ?? r?.serviceAccount?.customer?.customerId ?? r?.serviceAccount?.customer?.id;

export default function FieldDashboardPage() {
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [premises, setPremises] = useState([]);
  const [serviceAccounts, setServiceAccounts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingReadings, setPendingReadings] = useState([]);

  // Forms
  const [createForm, setCreateForm] = useState({ requestId: "", serviceAccountId: "", premiseId: "", orderType: "CONNECT", scheduledDate: "" });
  const [assignForm, setAssignForm] = useState({ orderId: "", technicianName: "" });
  const [completeForm, setCompleteForm] = useState({ orderId: "", serviceOrderStatus: "COMPLETED", failureReason: "" });
  const [readingForm, setReadingForm] = useState({ serviceAccountId: "", readingDate: "", readingValue: "", source: "MANUAL" });
  const [validateForm, setValidateForm] = useState({ readingId: "", qualityFlag: "VALIDATED" });
  const [meterCustomerId, setMeterCustomerId] = useState("");

  const loadOrders = async () => {
    const res = await serviceOrdersApi.getOrders();
    setOrders(Array.isArray(res.data) ? res.data : []);
  };
  const loadServiceRequests = async () => {
    const res = await serviceOrdersApi.getServiceRequests();
    setServiceRequests(Array.isArray(res.data) ? res.data : []);
  };
  const loadPremises = async () => {
    const res = await serviceOrdersApi.getPremises();
    setPremises(Array.isArray(res.data) ? res.data : []);
  };
  const loadServiceAccounts = async (customerId = "") => {
    try {
      const res = await serviceOrdersApi.getServiceAccounts(customerId);
      setServiceAccounts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setServiceAccounts([]);
    }
  };

  const loadPendingReadings = async () => {
    try {
      const res = await serviceOrdersApi.getPendingMeterReadings();
      setPendingReadings(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPendingReadings([]);
    }
  };
  const loadNotifications = async () => {
    const [nRes, cRes] = await Promise.all([
      notificationsApi.getMine("DESC"),
      notificationsApi.getMyUnreadCount(),
    ]);
    setNotifications(Array.isArray(nRes.data) ? nRes.data : []);
    setUnreadCount(Number(cRes?.data || 0));
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadOrders(), loadServiceRequests(), loadPremises(), loadNotifications(), loadPendingReadings()]);
    } catch (e) {
      toast.error(e?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshAll(); }, []);

  useEffect(() => {
    if (active === "create-order" || active === "meter-readings") {
      loadServiceAccounts();
    }
    if (active === "meter-readings") {
      loadPendingReadings();
    }
  }, [active]);

  // Create order
  const createOrder = async (e) => {
    e.preventDefault();
    try {
      await serviceOrdersApi.createServiceOrder({
        requestId: Number(createForm.requestId),
        serviceAccountId: Number(createForm.serviceAccountId),
        premiseId: Number(createForm.premiseId),
        orderType: createForm.orderType,
        scheduledDate: createForm.scheduledDate,
      });
      toast.success("Service order created");
      setCreateForm({ requestId: "", serviceAccountId: "", premiseId: "", orderType: "CONNECT", scheduledDate: "" });
      await Promise.all([loadOrders(), loadServiceRequests()]);
    } catch (e2) {
      toast.error(e2?.message || "Failed to create order");
    }
  };

  // Assign technician
  const assignOrder = async (e) => {
    e.preventDefault();
    try {
      await serviceOrdersApi.assignOrder({ orderId: Number(assignForm.orderId), technicianName: assignForm.technicianName });
      toast.success("Technician assigned");
      setAssignForm({ orderId: "", technicianName: "" });
      await loadOrders();
    } catch (e2) {
      toast.error(e2?.message || "Failed to assign order");
    }
  };

  // Complete / fail order
  const completeOrder = async (e) => {
    e.preventDefault();
    try {
      await serviceOrdersApi.completeOrder({
        orderId: Number(completeForm.orderId),
        serviceOrderStatus: completeForm.serviceOrderStatus,
        failureReason: completeForm.serviceOrderStatus === "FAILED" ? completeForm.failureReason : undefined,
      });
      toast.success("Order status updated");
      setCompleteForm({ orderId: "", serviceOrderStatus: "COMPLETED", failureReason: "" });
      await loadOrders();
    } catch (e2) {
      toast.error(e2?.message || "Failed to update order");
    }
  };

  // Submit meter reading
  const submitReading = async (e) => {
    e.preventDefault();
    try {
      await serviceOrdersApi.submitMeterReading({
        serviceAccountId: Number(readingForm.serviceAccountId),
        readingDate: readingForm.readingDate,
        readingValue: Number(readingForm.readingValue),
        source: readingForm.source,
      });
      toast.success("Meter reading submitted");
      setReadingForm({ serviceAccountId: "", readingDate: "", readingValue: "", source: "MANUAL" });
      await loadPendingReadings();
    } catch (e2) {
      toast.error(e2?.message || "Failed to submit meter reading");
    }
  };

  // Validate meter reading
  const validateReading = async (e) => {
    e.preventDefault();
    try {
      await serviceOrdersApi.validateMeterReading(Number(validateForm.readingId), {
        qualityFlag: validateForm.qualityFlag,
      });
      toast.success("Reading validated");
      setValidateForm({ readingId: "", qualityFlag: "VALIDATED" });
      await loadPendingReadings();
    } catch (e2) {
      toast.error(e2?.message || "Failed to validate reading");
    }
  };

  // Quick validate from table row
  const quickValidate = async (readingId, flag) => {
    try {
      await serviceOrdersApi.validateMeterReading(readingId, { qualityFlag: flag });
      toast.success(flag === "VALIDATED" ? "Reading approved" : "Reading flagged as anomaly");
      await loadPendingReadings();
    } catch {
      toast.error("Validation failed");
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    scheduled: orders.filter((o) => o.serviceOrderStatus === "SCHEDULED").length,
    inProgress: orders.filter((o) => o.serviceOrderStatus === "IN_PROGRESS").length,
    completed: orders.filter((o) => o.serviceOrderStatus === "COMPLETED").length,
    failed: orders.filter((o) => o.serviceOrderStatus === "FAILED").length,
  }), [orders]);

  const scheduledOrders = useMemo(() => orders.filter((o) => o.serviceOrderStatus === "SCHEDULED"), [orders]);
  const activeOrders = useMemo(() => orders.filter((o) => ["SCHEDULED", "IN_PROGRESS"].includes(o.serviceOrderStatus)), [orders]);
  const filteredAccounts = useMemo(() => {
    const cid = String(meterCustomerId || "").trim();
    if (!cid) return serviceAccounts;
    return serviceAccounts.filter((a) => String(getAccountCustomerId(a) ?? "") === cid);
  }, [serviceAccounts, meterCustomerId]);

  const meterStats = useMemo(() => ({
    pending: pendingReadings.length,
    accountsLoaded: filteredAccounts.length,
  }), [pendingReadings, filteredAccounts]);

  const readCount = Math.max(0, notifications.length - unreadCount);

  const tabTitle = {
    dashboard: "Overview",
    "create-order": "Create Service Order",
    "assign-order": "Assign Order",
    "complete-order": "Update Order Status",
    "meter-readings": "Meter Readings",
    notifications: "Notifications",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
      <Sidebar active={active} setActive={setActive} unreadCount={unreadCount} />
      <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1 }}>
        <TopBar title="Field Coordinator Dashboard" notifications={notifications.slice(0, 5)} />

        <div style={{ padding: "24px 28px", display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>{tabTitle[active] || active}</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{active === "dashboard" ? "Field service order overview and team workload status" : active === "create-order" ? "Create a new service order from an existing request" : active === "assign-order" ? "Assign field engineers to scheduled service orders" : active === "complete-order" ? "Mark service orders as completed or failed" : active === "meter-readings" ? "Capture customer meter readings used for billing cycle generation" : "System alerts and field operation updates"}</p>
            </div>
            <button onClick={refreshAll} style={btnSec}>↻ Refresh</button>
          </div>

          {loading ? <Spinner /> : (
            <>
              {/* ── DASHBOARD TAB ── */}
              {active === "dashboard" && (
                <>
                  <div className="rg-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                    <Stat label="Total Orders" value={stats.total} icon="📋" color="#3b82f6" />
                    <Stat label="Scheduled" value={stats.scheduled} icon="📅" color="#f59e0b" />
                    <Stat label="In Progress" value={stats.inProgress} icon="🔧" color="#8b5cf6" />
                    <Stat label="Completed" value={stats.completed} icon="✅" color="#22c55e" />
                    <Stat label="Failed" value={stats.failed} icon="⚠️" color="#ef4444" />
                  </div>

                  <div className="rg-main" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
                    <div style={card}>
                      <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>Recent Service Orders</div>
                      {!orders.length ? <Empty msg="No service orders yet" /> : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead><tr><th style={th}>Order</th><th style={th}>Type</th><th style={th}>Customer</th><th style={th}>Technician</th><th style={th}>Scheduled</th><th style={th}>Status</th></tr></thead>
                          <tbody>
                            {orders.slice(0, 8).map((o) => (
                              <tr key={o.orderId}>
                                <td style={td}>#{o.orderId}</td>
                                <td style={td}>{o.orderType || "-"}</td>
                                <td style={td}>{o.customerName || "-"}</td>
                                <td style={td}>{o.technicianName || <span style={{ color: "#94a3b8" }}>Unassigned</span>}</td>
                                <td style={td}>{fmtDate(o.scheduledDate)}</td>
                                <td style={td}><Badge text={o.serviceOrderStatus} color={STATUS_COLOR[o.serviceOrderStatus] || "#64748b"} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div style={card}>
                      <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>Pending Service Requests</div>
                      {!serviceRequests.filter((r) => r.status === "OPEN").length ? (
                        <Empty msg="No open service requests" />
                      ) : serviceRequests.filter((r) => r.status === "OPEN").slice(0, 8).map((r) => (
                        <div key={r.requestId} style={{ border: "1px solid #d6eaf4", background: "#fff", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>Req #{r.requestId} • {r.requestType}</div>
                            <Badge text={r.priority} color={PRIORITY_COLOR[r.priority] || "#64748b"} />
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Customer #{r.customerId} • {fmtDate(r.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── CREATE ORDER TAB ── */}
              {active === "create-order" && (
                <>
                  <form onSubmit={createOrder} className="rg-form" style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={label}>Service Request *</label>
                      <select required value={createForm.requestId} onChange={(e) => setCreateForm({ ...createForm, requestId: e.target.value })} style={input}>
                        <option value="">-- Select Request --</option>
                        {serviceRequests.filter((r) => ["OPEN", "IN_PROGRESS"].includes(r.status)).map((r) => (
                          <option key={r.requestId} value={r.requestId}>
                            #{r.requestId} | {r.requestType} | {r.status} | P: {r.priority}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={label}>Service Account *</label>
                      <select required value={createForm.serviceAccountId} onChange={(e) => setCreateForm({ ...createForm, serviceAccountId: e.target.value })} style={input}>
                        <option value="">-- Select Account --</option>
                        {serviceAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            #{a.id} | {a.serviceType} | {a.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={label}>Premise *</label>
                      <select required value={createForm.premiseId} onChange={(e) => setCreateForm({ ...createForm, premiseId: e.target.value })} style={input}>
                        <option value="">-- Select Premise --</option>
                        {premises.map((p) => (
                          <option key={p.premiseId} value={p.premiseId}>
                            #{p.premiseId} | {p.address} | {p.region}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={label}>Order Type *</label>
                      <select value={createForm.orderType} onChange={(e) => setCreateForm({ ...createForm, orderType: e.target.value })} style={input}>
                        <option value="CONNECT">CONNECT</option>
                        <option value="DISCONNECT">DISCONNECT</option>
                        <option value="INSPECTION">INSPECTION</option>
                      </select>
                    </div>

                    <div>
                      <label style={label}>Scheduled Date *</label>
                      <input required type="date" value={createForm.scheduledDate} onChange={(e) => setCreateForm({ ...createForm, scheduledDate: e.target.value })} style={input} />
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <button type="submit" style={{ ...btn, width: "100%", padding: "12px" }}>🔧 Create Service Order</button>
                    </div>
                  </form>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>All Service Orders</div>
                    {!orders.length ? <Empty msg="No service orders found" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>ID</th><th style={th}>Type</th><th style={th}>Service Type</th><th style={th}>Customer</th><th style={th}>Premise</th><th style={th}>Scheduled</th><th style={th}>Status</th></tr></thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr key={o.orderId}>
                              <td style={td}>#{o.orderId}</td>
                              <td style={td}>{o.orderType}</td>
                              <td style={td}>{o.serviceType || "-"}</td>
                              <td style={td}>{o.customerName || "-"}</td>
                              <td style={td}>{o.address ? `${o.address}` : `Premise #${o.premiseId || "-"}`}</td>
                              <td style={td}>{fmtDate(o.scheduledDate)}</td>
                              <td style={td}><Badge text={o.serviceOrderStatus} color={STATUS_COLOR[o.serviceOrderStatus] || "#64748b"} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* ── ASSIGN ORDER TAB ── */}
              {active === "assign-order" && (
                <>
                  <form onSubmit={assignOrder} className="rg-form" style={{ ...card, display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={label}>Order ID *</label>
                      <input required value={assignForm.orderId} onChange={(e) => setAssignForm({ ...assignForm, orderId: e.target.value })} placeholder="Enter Order ID" style={input} />
                    </div>
                    <div>
                      <label style={label}>Technician Name *</label>
                      <input required value={assignForm.technicianName} onChange={(e) => setAssignForm({ ...assignForm, technicianName: e.target.value })} placeholder="Enter technician full name" style={input} />
                    </div>
                    <button type="submit" style={{ ...btn, alignSelf: "flex-end" }}>👤 Assign Technician</button>
                  </form>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>
                      Scheduled Orders ({scheduledOrders.length})
                      <span style={{ marginLeft: 8, fontSize: 11, color: "#64748b", fontWeight: 400 }}>Click "Use" to prefill the form above</span>
                    </div>
                    {!scheduledOrders.length ? <Empty msg="No scheduled orders" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Order ID</th><th style={th}>Type</th><th style={th}>Customer</th><th style={th}>Service Type</th><th style={th}>Address</th><th style={th}>Scheduled</th><th style={th}>Technician</th><th style={th}>Action</th></tr></thead>
                        <tbody>
                          {scheduledOrders.map((o) => (
                            <tr key={o.orderId}>
                              <td style={td}>#{o.orderId}</td>
                              <td style={td}>{o.orderType}</td>
                              <td style={td}>{o.customerName || "-"}</td>
                              <td style={td}>{o.serviceType || "-"}</td>
                              <td style={td}>{o.address || "-"}</td>
                              <td style={td}>{fmtDate(o.scheduledDate)}</td>
                              <td style={td}>{o.technicianName || <span style={{ color: "#94a3b8" }}>Unassigned</span>}</td>
                              <td style={td}>
                                <button style={btnSec} onClick={() => setAssignForm({ orderId: String(o.orderId), technicianName: o.technicianName || "" })}>Use</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* ── COMPLETE ORDER TAB ── */}
              {active === "complete-order" && (
                <>
                  <form onSubmit={completeOrder} className="rg-form" style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={label}>Order ID *</label>
                      <input required value={completeForm.orderId} onChange={(e) => setCompleteForm({ ...completeForm, orderId: e.target.value })} placeholder="Enter Order ID" style={input} />
                    </div>
                    <div>
                      <label style={label}>New Status *</label>
                      <select value={completeForm.serviceOrderStatus} onChange={(e) => setCompleteForm({ ...completeForm, serviceOrderStatus: e.target.value })} style={input}>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </div>
                    <div>
                      <label style={label}>{completeForm.serviceOrderStatus === "FAILED" ? "Failure Reason *" : "Notes (optional)"}</label>
                      <input
                        required={completeForm.serviceOrderStatus === "FAILED"}
                        value={completeForm.failureReason}
                        onChange={(e) => setCompleteForm({ ...completeForm, failureReason: e.target.value })}
                        placeholder={completeForm.serviceOrderStatus === "FAILED" ? "Describe why it failed" : "Completion notes"}
                        style={input}
                      />
                    </div>
                    <button type="submit" style={completeForm.serviceOrderStatus === "FAILED" ? { ...btnDanger, alignSelf: "flex-end" } : { ...btn, alignSelf: "flex-end" }}>
                      {completeForm.serviceOrderStatus === "COMPLETED" ? "✅ Complete" : completeForm.serviceOrderStatus === "FAILED" ? "❌ Mark Failed" : "🔄 Update"}
                    </button>
                  </form>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>
                      Active Orders ({activeOrders.length})
                      <span style={{ marginLeft: 8, fontSize: 11, color: "#64748b", fontWeight: 400 }}>Click "Use" to prefill the form above</span>
                    </div>
                    {!activeOrders.length ? <Empty msg="No active orders" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Order ID</th><th style={th}>Type</th><th style={th}>Customer</th><th style={th}>Technician</th><th style={th}>Scheduled</th><th style={th}>Reassignment Log</th><th style={th}>Status</th><th style={th}>Action</th></tr></thead>
                        <tbody>
                          {activeOrders.map((o) => (
                            <tr key={o.orderId}>
                              <td style={td}>#{o.orderId}</td>
                              <td style={td}>{o.orderType}</td>
                              <td style={td}>{o.customerName || "-"}</td>
                              <td style={td}>{o.technicianName || <span style={{ color: "#94a3b8" }}>Unassigned</span>}</td>
                              <td style={td}>{fmtDate(o.scheduledDate)}</td>
                              <td style={{ ...td, maxWidth: 200, fontSize: 11 }}>{o.reassignmentLog || "-"}</td>
                              <td style={td}><Badge text={o.serviceOrderStatus} color={STATUS_COLOR[o.serviceOrderStatus] || "#64748b"} /></td>
                              <td style={td}>
                                <button style={btnSec} onClick={() => setCompleteForm({ orderId: String(o.orderId), serviceOrderStatus: "COMPLETED", failureReason: "" })}>Use</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>All Orders History</div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr><th style={th}>Order ID</th><th style={th}>Type</th><th style={th}>Customer</th><th style={th}>Technician</th><th style={th}>Scheduled</th><th style={th}>Completed</th><th style={th}>Status</th><th style={th}>Failure Reason</th></tr></thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.orderId}>
                            <td style={td}>#{o.orderId}</td>
                            <td style={td}>{o.orderType}</td>
                            <td style={td}>{o.customerName || "-"}</td>
                            <td style={td}>{o.technicianName || "-"}</td>
                            <td style={td}>{fmtDate(o.scheduledDate)}</td>
                            <td style={td}>{fmtDate(o.completionDate)}</td>
                            <td style={td}><Badge text={o.serviceOrderStatus} color={STATUS_COLOR[o.serviceOrderStatus] || "#64748b"} /></td>
                            <td style={{ ...td, maxWidth: 220, fontSize: 11, color: "#ef4444" }}>{o.failureReason || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── METER READINGS TAB ── */}
              {active === "meter-readings" && (
                <>
                  <div className="rg-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    <Stat label="Pending Validation" value={meterStats.pending} icon="📊" color="#f59e0b" />
                    <Stat label="Accounts Loaded" value={meterStats.accountsLoaded} icon="🏘️" color="#3b82f6" />
                    <Stat label="Ready For Billing" value={pendingReadings.filter((r) => r.qualityFlag === "VALIDATED").length} icon="🧾" color="#22c55e" />
                  </div>

                  <form onSubmit={submitReading} className="rg-form" style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={label}>Customer ID</label>
                      <input
                        type="number"
                        value={meterCustomerId}
                        onChange={(e) => setMeterCustomerId(e.target.value)}
                        placeholder="Filter by customer"
                        style={input}
                      />
                    </div>

                    <div>
                      <label style={label}>Service Account *</label>
                      <select
                        required
                        value={readingForm.serviceAccountId}
                        onChange={(e) => setReadingForm({ ...readingForm, serviceAccountId: e.target.value })}
                        style={input}
                      >
                        <option value="">-- Select Account --</option>
                        {filteredAccounts.map((a) => {
                          const accountId = getAccountId(a);
                          const customerId = getAccountCustomerId(a);
                          return (
                            <option key={accountId} value={accountId}>
                              #{accountId} | C:{customerId ?? "-"} | {a.serviceType || "-"} | {a.status || a.serviceAccountStatus || "-"}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label style={label}>Reading Date *</label>
                      <input
                        required
                        type="date"
                        value={readingForm.readingDate}
                        onChange={(e) => setReadingForm({ ...readingForm, readingDate: e.target.value })}
                        style={input}
                      />
                    </div>

                    <div>
                      <label style={label}>Reading Value *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={readingForm.readingValue}
                        onChange={(e) => setReadingForm({ ...readingForm, readingValue: e.target.value })}
                        placeholder="kWh / Units"
                        style={input}
                      />
                    </div>

                    <div>
                      <label style={label}>Source *</label>
                      <select value={readingForm.source} onChange={(e) => setReadingForm({ ...readingForm, source: e.target.value })} style={input}>
                        <option value="MANUAL">MANUAL</option>
                        <option value="SMART_METER">SMART_METER</option>
                        <option value="ESTIMATED">ESTIMATED</option>
                      </select>
                    </div>

                    <button type="submit" style={{ ...btn, alignSelf: "flex-end" }}>➕ Add Reading</button>
                  </form>

                  <div style={{ ...card, paddingTop: 12 }}>
                    <div style={{ color: "#475569", fontSize: 12, marginBottom: 10 }}>
                      ✅ Submitted readings are used by billing cycle generation to compute customer usage and final bill amount.
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="button" style={btnSec} onClick={() => loadServiceAccounts(meterCustomerId)}>Load Accounts</button>
                      <button type="button" style={btnSec} onClick={loadPendingReadings}>Refresh Pending Readings</button>
                    </div>
                  </div>

                  <form onSubmit={validateReading} className="rg-form" style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={label}>Reading ID *</label>
                      <input
                        required
                        value={validateForm.readingId}
                        onChange={(e) => setValidateForm({ ...validateForm, readingId: e.target.value })}
                        placeholder="Enter Reading ID"
                        style={input}
                      />
                    </div>
                    <div>
                      <label style={label}>Validation Flag *</label>
                      <select value={validateForm.qualityFlag} onChange={(e) => setValidateForm({ ...validateForm, qualityFlag: e.target.value })} style={input}>
                        <option value="VALIDATED">VALIDATED</option>
                        <option value="ANOMALY">ANOMALY</option>
                      </select>
                    </div>
                    <button type="submit" style={{ ...btn, alignSelf: "flex-end" }}>✔ Validate Reading</button>
                  </form>

                  <div style={card}>
                    <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>Pending Meter Readings</div>
                    {!pendingReadings.length ? <Empty msg="No pending meter readings" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={th}>Reading ID</th>
                            <th style={th}>Account</th>
                            <th style={th}>Customer</th>
                            <th style={th}>Date</th>
                            <th style={th}>Value</th>
                            <th style={th}>Source</th>
                            <th style={th}>Flag</th>
                            <th style={th}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingReadings.map((r) => {
                            const readingId = getReadingId(r);
                            return (
                              <tr key={readingId}>
                                <td style={td}>#{readingId}</td>
                                <td style={td}>#{getReadingAccountId(r) ?? "-"}</td>
                                <td style={td}>#{getReadingCustomerId(r) ?? "-"}</td>
                                <td style={td}>{fmtDate(r.readingDate)}</td>
                                <td style={td}>{r.readingValue ?? "-"}</td>
                                <td style={td}>{r.source || "-"}</td>
                                <td style={td}><Badge text={r.qualityFlag || "RAW"} color={r.qualityFlag === "VALIDATED" ? "#22c55e" : r.qualityFlag === "ANOMALY" ? "#ef4444" : "#f59e0b"} /></td>
                                <td style={{ ...td, display: "flex", gap: 8 }}>
                                  <button type="button" style={btnSec} onClick={() => setValidateForm({ readingId: String(readingId), qualityFlag: "VALIDATED" })}>Use</button>
                                  <button type="button" style={btn} onClick={() => quickValidate(readingId, "VALIDATED")}>Approve</button>
                                  <button type="button" style={btnDanger} onClick={() => quickValidate(readingId, "ANOMALY")}>Flag</button>
                                </td>
                              </tr>
                            );
                          })}
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
                    <Stat label="Total Notifications" value={notifications.length} icon="🔔" color="#3b82f6" />
                    <Stat label="Unread" value={unreadCount} icon="📩" color="#ef4444" />
                    <Stat label="Read" value={readCount} icon="✅" color="#22c55e" />
                  </div>

                  <div style={{ ...card, display: "flex", gap: 10 }}>
                    <button style={btn} onClick={async () => { await notificationsApi.markMyRead(); toast.success("All notifications marked as read"); await loadNotifications(); }}>Mark all read</button>
                    <button style={btnSec} onClick={loadNotifications}>Refresh notifications</button>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const th = { padding: "10px 12px", textAlign: "left", color: "#64748b", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid #d6eaf4" };
const td = { padding: "10px 12px", color: "#1f2937", fontSize: 12, borderBottom: "1px solid #e8f1f6" };
const label = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5 };
