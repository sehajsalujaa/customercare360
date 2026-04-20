import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Sidebar, TopBar } from "../../components/Layout";
import { billingApi } from "../../api/billing.api";
import { notificationsApi } from "../../api/notifications.api";
import { Badge, Empty, Spinner, Stat } from "../../styles/ui";

const card = { background: "linear-gradient(135deg, #FBF9E7 0%, #f4fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 18, boxShadow: "0 8px 20px rgba(130,200,229,0.16)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #bcdff0", background: "#ffffff", color: "#1f2937" };
const btn = { background: "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };
const btnSec = { ...btn, background: "#82C8E5" };

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
}

function downloadCsv(filename, headers, rows) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BillingDashboardPage() {
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({});
  const [bills, setBills] = useState([]);
  const [failedBills, setFailedBills] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [tariffPlans, setTariffPlans] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [disputeFilter, setDisputeFilter] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [cycle, setCycle] = useState({ serviceType: "ELECTRIC", startDate: "", endDate: "", billDate: "" });
  const [dispute, setDispute] = useState({ disputeId: "", status: "APPROVED", amountDelta: 0, approver: "", decisionReason: "" });
  const [tariff, setTariff] = useState({
    serviceType: "ELECTRIC",
    customerType: "RESIDENTIAL",
    region: "DEFAULT",
    fixedCharge: "50",
    taxPercent: "5",
    dutyPercent: "0",
    subsidyAmount: "0",
    lateFeeRule: "2% monthly",
    effectiveFrom: "",
    effectiveTo: "",
    slabsText: "0-100:4\n100-300:6\n300-:8",
  });

  const loadSummary = async () => {
    try {
      const res = await billingApi.getSummary();
      setSummary(res.data || {});
    } catch (e) {
      console.error("Error loading summary:", e);
      setSummary({});
    }
  };

  const loadCycles = async () => {
    try {
      const res = await billingApi.getCycles();
      setCycles(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading cycles:", e);
      setCycles([]);
    }
  };

  const loadTariffPlans = async () => {
    try {
      const res = await billingApi.getTariffPlans();
      setTariffPlans(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading tariff plans:", e);
      setTariffPlans([]);
    }
  };

  const loadBills = async () => {
    try {
      const res = await billingApi.getAllBills();
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading bills:", e);
      setBills([]);
    }
  };

  const loadExceptions = async () => {
    try {
      const res = await billingApi.getFailedBills();
      setFailedBills(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading exceptions:", e);
      setFailedBills([]);
    }
  };

  const loadDisputes = async (status = "") => {
    try {
      const res = await billingApi.getDisputes(status);
      setDisputes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading disputes:", e);
      setDisputes([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const [nRes, cRes] = await Promise.all([
        notificationsApi.getMine("DESC"),
        notificationsApi.getMyUnreadCount(),
      ]);
      setNotifications(Array.isArray(nRes.data) ? nRes.data : []);
      setUnreadCount(Number(cRes?.data || 0));
    } catch (e) {
      console.error("Error loading notifications:", e);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSummary(),
        loadCycles(),
        loadTariffPlans(),
        loadBills(),
        loadExceptions(),
        loadDisputes(disputeFilter),
        loadNotifications(),
      ]);
    } catch (e) {
      toast.error(e?.message || "Failed to load billing dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    loadDisputes(disputeFilter).catch(() => toast.error("Failed to load disputes"));
  }, [disputeFilter]);

  const createCycle = async (e) => {
    e.preventDefault();
    try {
      await billingApi.createCycle(cycle);
      toast.success("Billing cycle created");
      setCycle({ serviceType: "ELECTRIC", startDate: "", endDate: "", billDate: "" });
      await Promise.all([loadCycles(), loadSummary()]);
    } catch (e2) {
      toast.error(e2?.message || "Failed to create cycle");
    }
  };

  const generateForCycle = async (cycleId) => {
    try {
      const res = await billingApi.generateBills(cycleId);
      const message = String(res?.data || "Bills generated");
      await Promise.all([loadSummary(), loadBills(), loadExceptions(), loadCycles()]);

      const failedMatch = message.match(/Failed:\s*(\d+)/i);
      const failedCount = failedMatch ? Number(failedMatch[1]) : 0;
      if (failedCount > 0) {
        toast.error(`${message}. Check Exceptions tab for exact reason.`);
      } else {
        toast.success(message);
      }
    } catch (e) {
      toast.error(e?.message || "Failed to generate bills");
    }
  };

  const closeCycle = async (cycleId) => {
    try {
      await billingApi.closeCycle(cycleId);
      toast.success("Cycle closed");
      await Promise.all([loadCycles(), loadSummary()]);
    } catch (e) {
      toast.error(e?.message || "Failed to close cycle");
    }
  };

  const retryBill = async (billId) => {
    try {
      await billingApi.retryBill(billId);
      toast.success("Retry triggered");
      await Promise.all([loadExceptions(), loadBills(), loadSummary()]);
    } catch {
      toast.error("Retry failed");
    }
  };

  const resolveDispute = async (e) => {
    e.preventDefault();
    try {
      await billingApi.resolveDispute({
        ...dispute,
        disputeId: Number(dispute.disputeId),
        amountDelta: Number(dispute.amountDelta),
      });
      toast.success("Dispute resolved");
      setDispute({ disputeId: "", status: "APPROVED", amountDelta: 0, approver: "", decisionReason: "" });
      await Promise.all([loadDisputes(disputeFilter), loadBills(), loadSummary()]);
    } catch (e2) {
      toast.error(e2?.message || "Failed to resolve dispute");
    }
  };

  const parseSlabs = (slabsText) => {
    const lines = String(slabsText || "").split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.map((line) => {
      const [range, rateRaw] = line.split(":").map((p) => p.trim());
      const [startRaw, endRaw] = String(range || "").split("-").map((p) => p.trim());
      return {
        startUnit: Number(startRaw),
        endUnit: endRaw ? Number(endRaw) : null,
        ratePerUnit: Number(rateRaw),
      };
    }).filter((s) => Number.isFinite(s.startUnit) && Number.isFinite(s.ratePerUnit));
  };

  const createTariffPlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        serviceType: tariff.serviceType,
        customerType: tariff.customerType,
        region: tariff.region,
        fixedCharge: Number(tariff.fixedCharge),
        taxPercent: Number(tariff.taxPercent),
        dutyPercent: Number(tariff.dutyPercent),
        subsidyAmount: Number(tariff.subsidyAmount),
        lateFeeRule: tariff.lateFeeRule,
        effectiveFrom: tariff.effectiveFrom,
        effectiveTo: tariff.effectiveTo,
        slabs: parseSlabs(tariff.slabsText),
      };

      if (!payload.slabs.length) {
        toast.error("Add at least one valid slab (e.g. 0-100:4)");
        return;
      }

      await billingApi.createTariffPlan(payload);
      toast.success("Tariff plan created");
      await loadTariffPlans();
    } catch (e2) {
      toast.error(e2?.response?.data?.message || e2?.message || "Failed to create tariff plan");
    }
  };

  const reportStats = useMemo(() => {
    const total = bills.length;
    const paid = bills.filter((b) => b.billStatus === "PAID").length;
    const adjusted = bills.filter((b) => b.billStatus === "ADJUSTED").length;
    const failed = bills.filter((b) => b.billStatus === "FAILED").length;
    const amountPaid = bills.filter((b) => b.billStatus === "PAID").reduce((s, b) => s + Number(b.amount || 0), 0);
    return {
      total,
      paid,
      adjusted,
      failed,
      collectionRate: total === 0 ? 0 : ((paid / total) * 100).toFixed(1),
      amountPaid: amountPaid.toFixed(2),
    };
  }, [bills]);

  const monthlyRows = useMemo(() => {
    const map = {};
    bills.forEach((b) => {
      const key = (b.dueDate || "").slice(0, 7) || "Unknown";
      if (!map[key]) map[key] = { month: key, total: 0, paid: 0, failed: 0 };
      map[key].total += 1;
      if (b.billStatus === "PAID") map[key].paid += 1;
      if (b.billStatus === "FAILED") map[key].failed += 1;
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [bills]);

  const requestedDisputes = disputes.filter((d) => d.status === "REQUESTED");
  const readCount = Math.max(0, notifications.length - unreadCount);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
      <Sidebar active={active} setActive={setActive} unreadCount={unreadCount} />
      <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1 }}>
        <TopBar title="Billing Analyst Dashboard" notifications={notifications.slice(0, 5)} />

        <div style={{ padding: "24px 28px", display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>{active === "dashboard" ? "Overview" : active === "billing-mgmt" ? "Billing Cycles" : active === "exceptions" ? "Billing Exceptions" : active === "resolve-dispute" ? "Resolve Disputes" : active === "reports" ? "Reports" : "Notifications"}</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{active === "dashboard" ? "Billing cycle summary, exceptions and dispute snapshot" : active === "billing-mgmt" ? "Manage and run billing cycles for all service types" : active === "exceptions" ? "Review failed and anomalous billing records" : active === "resolve-dispute" ? "Review and resolve customer billing disputes" : active === "reports" ? "Billing analytics and usage trend reports" : "System alerts and billing activity updates"}</p>
            </div>
            <button onClick={refreshAll} style={btnSec}>↻ Refresh</button>
          </div>

          {loading ? <Spinner /> : (
            <>
              {active === "dashboard" && (
                <>
                  <div className="rg-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                    <Stat label="Total Bills" value={summary.totalBills ?? 0} icon="🧾" color="#3b82f6" />
                    <Stat label="Paid Bills" value={summary.paidBills ?? 0} icon="✅" color="#22c55e" />
                    <Stat label="Unpaid Bills" value={summary.unpaidBills ?? 0} icon="🕒" color="#f59e0b" />
                    <Stat label="Open Cycles" value={cycles.filter((c) => c.status === "OPEN").length} icon="💳" color="#8b5cf6" />
                    <Stat label="Requested Disputes" value={requestedDisputes.length} icon="⚖️" color="#ef4444" />
                  </div>

                  <div className="rg-main" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
                    <div style={card}>
                      <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>Recent Billing Cycles</div>
                      {!cycles.length ? <Empty msg="No billing cycles yet" /> : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead><tr><th style={th}>Cycle</th><th style={th}>Service</th><th style={th}>Period</th><th style={th}>Status</th></tr></thead>
                          <tbody>
                            {cycles.slice(0, 6).map((c) => (
                              <tr key={c.cycleId}><td style={td}>#{c.cycleId}</td><td style={td}>{c.serviceType}</td><td style={td}>{fmtDate(c.startDate)} - {fmtDate(c.endDate)}</td><td style={td}><Badge text={c.status} color={c.status === "OPEN" ? "#f59e0b" : "#22c55e"} /></td></tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div style={card}>
                      <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: 10 }}>Pending Disputes</div>
                      {!requestedDisputes.length ? <Empty msg="No pending disputes" /> : requestedDisputes.slice(0, 6).map((d) => (
                        <div key={d.disputeId} style={{ border: "1px solid #d6eaf4", background: "#fff", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>Dispute #{d.disputeId} • Bill #{d.billId}</div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{d.customerName} ({d.customerEmail})</div>
                          <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>{d.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {active === "billing-mgmt" && (
                <>
                  <form onSubmit={createCycle} className="rg-form" style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={label}>Service Type (Required)</label>
                      <select required value={cycle.serviceType} onChange={(e) => setCycle({ ...cycle, serviceType: e.target.value })} style={input}>
                        <option value="ELECTRIC">ELECTRIC</option>
                        <option value="GAS">GAS</option>
                        <option value="WATER">WATER</option>
                      </select>
                    </div>
                    <div>
                      <label style={label}>Cycle Start Date (Required)</label>
                      <input required type="date" value={cycle.startDate} onChange={(e) => setCycle({ ...cycle, startDate: e.target.value })} style={input} />
                    </div>
                    <div>
                      <label style={label}>Cycle End Date (Required)</label>
                      <input required type="date" value={cycle.endDate} onChange={(e) => setCycle({ ...cycle, endDate: e.target.value })} style={input} />
                    </div>
                    <div>
                      <label style={label}>Bill Date (Required)</label>
                      <input required type="date" value={cycle.billDate} onChange={(e) => setCycle({ ...cycle, billDate: e.target.value })} style={input} />
                    </div>
                    <button type="submit" style={btn}>Create Cycle</button>
                  </form>

                  <form onSubmit={createTariffPlan} style={{ ...card, display: "grid", gap: 10 }}>
                    <div style={{ fontWeight: 800, color: "#1f2937" }}>Tariff Plan Setup</div>
                    <div className="rg-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                      <div>
                        <label style={label}>Service Type (Required)</label>
                        <select required value={tariff.serviceType} onChange={(e) => setTariff({ ...tariff, serviceType: e.target.value })} style={input}>
                          <option value="ELECTRIC">ELECTRIC</option>
                          <option value="GAS">GAS</option>
                          <option value="WATER">WATER</option>
                        </select>
                      </div>
                      <div>
                        <label style={label}>Customer Type (Required)</label>
                        <select required value={tariff.customerType} onChange={(e) => setTariff({ ...tariff, customerType: e.target.value })} style={input}>
                          <option value="RESIDENTIAL">RESIDENTIAL</option>
                          <option value="COMMERCIAL">COMMERCIAL</option>
                          <option value="INDUSTRIAL">INDUSTRIAL</option>
                        </select>
                      </div>
                      <div>
                        <label style={label}>Region (Optional)</label>
                        <input value={tariff.region} onChange={(e) => setTariff({ ...tariff, region: e.target.value })} placeholder="e.g. DEFAULT / NORTH" style={input} />
                      </div>
                      <div>
                        <label style={label}>Effective From (Required)</label>
                        <input type="date" value={tariff.effectiveFrom} onChange={(e) => setTariff({ ...tariff, effectiveFrom: e.target.value })} style={input} required />
                      </div>
                      <div>
                        <label style={label}>Effective To (Required)</label>
                        <input type="date" value={tariff.effectiveTo} onChange={(e) => setTariff({ ...tariff, effectiveTo: e.target.value })} style={input} required />
                      </div>
                    </div>

                    <div className="rg-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                      <div>
                        <label style={label}>Fixed Charge (Optional)</label>
                        <input type="number" value={tariff.fixedCharge} onChange={(e) => setTariff({ ...tariff, fixedCharge: e.target.value })} placeholder="Default: 0" style={input} />
                      </div>
                      <div>
                        <label style={label}>Tax % (Optional)</label>
                        <input type="number" value={tariff.taxPercent} onChange={(e) => setTariff({ ...tariff, taxPercent: e.target.value })} placeholder="Default: 0" style={input} />
                      </div>
                      <div>
                        <label style={label}>Duty % (Optional)</label>
                        <input type="number" value={tariff.dutyPercent} onChange={(e) => setTariff({ ...tariff, dutyPercent: e.target.value })} placeholder="Default: 0" style={input} />
                      </div>
                      <div>
                        <label style={label}>Subsidy Amount (Optional)</label>
                        <input type="number" value={tariff.subsidyAmount} onChange={(e) => setTariff({ ...tariff, subsidyAmount: e.target.value })} placeholder="Default: 0" style={input} />
                      </div>
                      <div>
                        <label style={label}>Late Fee Rule (Optional)</label>
                        <input value={tariff.lateFeeRule} onChange={(e) => setTariff({ ...tariff, lateFeeRule: e.target.value })} placeholder="e.g. 2% monthly" style={input} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                      <div>
                        <label style={label}>Tariff Slabs (Required)</label>
                        <textarea
                          required
                          value={tariff.slabsText}
                          onChange={(e) => setTariff({ ...tariff, slabsText: e.target.value })}
                          rows={3}
                          style={{ ...input, resize: "vertical" }}
                          placeholder={"One slab per line\n0-100:4\n100-300:6\n300-:8"}
                        />
                      </div>
                      <button type="submit" style={btn}>Create Tariff</button>
                    </div>
                  </form>

                  <div style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ fontWeight: 800, color: "#1f2937" }}>Active Tariff Plans</div>
                      <button onClick={loadTariffPlans} style={btnSec}>Refresh</button>
                    </div>
                    {!tariffPlans.length ? <Empty msg="No tariff plans found" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>ID</th><th style={th}>Service</th><th style={th}>Customer Type</th><th style={th}>Region</th><th style={th}>Fixed</th><th style={th}>Tax%</th><th style={th}>Duty%</th><th style={th}>Subsidy</th><th style={th}>Effective</th><th style={th}>Slabs</th></tr></thead>
                        <tbody>
                          {tariffPlans.map((t) => (
                            <tr key={t.tariffPlanId}>
                              <td style={td}>#{t.tariffPlanId}</td>
                              <td style={td}>{t.serviceType}</td>
                              <td style={td}>{t.customerType}</td>
                              <td style={td}>{t.region || "DEFAULT"}</td>
                              <td style={td}>₹{Number(t.fixedCharge || 0).toFixed(2)}</td>
                              <td style={td}>{Number(t.taxPercent || 0).toFixed(2)}</td>
                              <td style={td}>{Number(t.dutyPercent || 0).toFixed(2)}</td>
                              <td style={td}>₹{Number(t.subsidyAmount || 0).toFixed(2)}</td>
                              <td style={td}>{fmtDate(t.effectiveFrom)} - {fmtDate(t.effectiveTo)}</td>
                              <td style={td}>{Array.isArray(t.slabs) ? t.slabs.length : 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={card}>
                    <div style={{ fontWeight: 800, marginBottom: 12, color: "#1f2937" }}>Cycle Operations</div>
                    {!cycles.length ? <Empty msg="No cycles found" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Cycle ID</th><th style={th}>Service</th><th style={th}>Start</th><th style={th}>End</th><th style={th}>Bill Date</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
                        <tbody>
                          {cycles.map((c) => (
                            <tr key={c.cycleId}>
                              <td style={td}>#{c.cycleId}</td>
                              <td style={td}>{c.serviceType}</td>
                              <td style={td}>{fmtDate(c.startDate)}</td>
                              <td style={td}>{fmtDate(c.endDate)}</td>
                              <td style={td}>{fmtDate(c.billDate)}</td>
                              <td style={td}><Badge text={c.status} color={c.status === "OPEN" ? "#f59e0b" : "#22c55e"} /></td>
                              <td style={td}>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button style={btnSec} onClick={() => generateForCycle(c.cycleId)}>Generate</button>
                                  <button style={btn} disabled={c.status !== "OPEN"} onClick={() => closeCycle(c.cycleId)}>Close</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {active === "exceptions" && (
                <>
                  <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    <Stat label="Failed Bills" value={failedBills.length} icon="⚠️" color="#ef4444" />
                    <Stat label="Electric Failed" value={failedBills.filter((b) => b?.serviceAccount?.serviceType === "ELECTRIC").length} icon="⚡" color="#3b82f6" />
                    <Stat label="Gas Failed" value={failedBills.filter((b) => b?.serviceAccount?.serviceType === "GAS").length} icon="🔥" color="#f59e0b" />
                    <Stat label="Water Failed" value={failedBills.filter((b) => b?.serviceAccount?.serviceType === "WATER").length} icon="💧" color="#06b6d4" />
                  </div>

                  <div style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ color: "#1f2937", fontWeight: 800 }}>Billing Exceptions</div>
                      <button onClick={loadExceptions} style={btnSec}>Refresh</button>
                    </div>
                    {!failedBills.length ? <Empty msg="No failed bills" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Bill ID</th><th style={th}>Cycle</th><th style={th}>Status</th><th style={th}>Error</th><th style={th}>Action</th></tr></thead>
                        <tbody>
                          {failedBills.map((b) => (
                            <tr key={b.billId}>
                              <td style={td}>#{b.billId}</td>
                              <td style={td}>#{b.billingCycle?.cycleId || "-"}</td>
                              <td style={td}><Badge text={b.billStatus} color="#ef4444" /></td>
                              <td style={{ ...td, maxWidth: 420 }}>{b.errorMessage || "-"}</td>
                              <td style={td}><button onClick={() => retryBill(b.billId)} style={btn}>Retry</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {active === "resolve-dispute" && (
                <>
                  <div style={{ ...card, display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                    <select value={disputeFilter} onChange={(e) => setDisputeFilter(e.target.value)} style={input}>
                      <option value="">All Disputes</option>
                      <option value="REQUESTED">REQUESTED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <button onClick={() => loadDisputes(disputeFilter)} style={btnSec}>Refresh</button>
                  </div>

                  <form onSubmit={resolveDispute} className="rg-form" style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr auto", gap: 10, alignItems: "end" }}>
                    <input required value={dispute.disputeId} onChange={(e) => setDispute({ ...dispute, disputeId: e.target.value })} placeholder="Dispute ID" style={input} />
                    <select value={dispute.status} onChange={(e) => setDispute({ ...dispute, status: e.target.value })} style={input}>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <input type="number" value={dispute.amountDelta} onChange={(e) => setDispute({ ...dispute, amountDelta: e.target.value })} placeholder="Amount Delta" style={input} />
                    <input required value={dispute.approver} onChange={(e) => setDispute({ ...dispute, approver: e.target.value })} placeholder="Approver" style={input} />
                    <input required value={dispute.decisionReason} onChange={(e) => setDispute({ ...dispute, decisionReason: e.target.value })} placeholder="Decision reason" style={input} />
                    <button type="submit" style={btn}>Resolve</button>
                  </form>

                  <div style={card}>
                    {!disputes.length ? <Empty msg="No disputes found" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Dispute</th><th style={th}>Bill</th><th style={th}>Customer</th><th style={th}>Reason</th><th style={th}>Status</th><th style={th}>Action</th></tr></thead>
                        <tbody>
                          {disputes.map((d) => (
                            <tr key={d.disputeId}>
                              <td style={td}>#{d.disputeId}</td>
                              <td style={td}>#{d.billId} • ₹{Number(d.currentBillAmount || 0).toFixed(2)}</td>
                              <td style={td}>{d.customerName}<div style={{ color: "#64748b", fontSize: 11 }}>{d.customerEmail}</div></td>
                              <td style={{ ...td, maxWidth: 340 }}>{d.reason}</td>
                              <td style={td}><Badge text={d.status} color={d.status === "REQUESTED" ? "#f59e0b" : d.status === "APPROVED" ? "#22c55e" : "#ef4444"} /></td>
                              <td style={td}>
                                {d.status === "REQUESTED" ? (
                                  <button style={btnSec} onClick={() => setDispute({ ...dispute, disputeId: String(d.disputeId), amountDelta: 0, decisionReason: d.reason || "" })}>Use</button>
                                ) : <span style={{ color: "#64748b", fontSize: 12 }}>{d.approver || "-"}</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {active === "reports" && (
                <>
                  <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    <Stat label="Total Bills" value={reportStats.total} icon="🧾" color="#3b82f6" />
                    <Stat label="Paid Amount" value={`₹${reportStats.amountPaid}`} icon="💰" color="#22c55e" />
                    <Stat label="Collection Rate" value={`${reportStats.collectionRate}%`} icon="📈" color="#8b5cf6" />
                    <Stat label="Failed Bills" value={reportStats.failed} icon="⚠️" color="#ef4444" />
                  </div>

                  <div style={{ ...card, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button style={btn} onClick={() => downloadCsv("billing-bills.csv", ["BillId", "Customer", "Email", "Amount", "DueDate", "Status", "ConnectionType"], bills.map((b) => [b.billId, b.customerName, b.email, b.amount, b.dueDate, b.billStatus, b.connectionType]))}>Export Bills CSV</button>
                    <button style={btnSec} onClick={() => downloadCsv("billing-disputes.csv", ["DisputeId", "BillId", "Customer", "Reason", "Status", "Approver"], disputes.map((d) => [d.disputeId, d.billId, d.customerName, d.reason, d.status, d.approver]))}>Export Disputes CSV</button>
                    <button style={btnSec} onClick={() => downloadCsv("billing-cycles.csv", ["CycleId", "ServiceType", "StartDate", "EndDate", "BillDate", "Status"], cycles.map((c) => [c.cycleId, c.serviceType, c.startDate, c.endDate, c.billDate, c.status]))}>Export Cycles CSV</button>
                  </div>

                  <div style={card}>
                    <div style={{ color: "#1f2937", fontWeight: 800, marginBottom: 10 }}>Monthly Billing Snapshot</div>
                    {!monthlyRows.length ? <Empty msg="No billing data for reports" /> : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><th style={th}>Month</th><th style={th}>Total Bills</th><th style={th}>Paid</th><th style={th}>Failed</th></tr></thead>
                        <tbody>
                          {monthlyRows.map((r) => (
                            <tr key={r.month}><td style={td}>{r.month}</td><td style={td}>{r.total}</td><td style={td}>{r.paid}</td><td style={td}>{r.failed}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

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
