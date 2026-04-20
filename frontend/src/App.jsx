// src/App.jsx — COMPLETE REWRITE — every endpoint wired
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import DashboardPage from "./pages/dashboard/AdminDashboardPage";
import toast from "react-hot-toast";

// ─── Auth helpers ─────────────────────────────────────────────
function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("cc360_user")) || {}; } catch { return {}; }
}
function getUserRole() { 
  try {
   const token = localStorage.getItem("cc360_access_token");
   if (!token) return "";
   const payload = JSON.parse(atob(token.split(".")[1]));
   return payload.roles?.[0] || payload.role || "";
  } catch {
   return "";
  }
 }
function getCurrentUserId() {
  try {
    const t = localStorage.getItem("cc360_access_token");
    if (!t) return null;
    const p = JSON.parse(atob(t.split(".")[1]));
    return p.userId || p.id || null;
  } catch { return null; }
}

// ─── Idle timer ───────────────────────────────────────────────
function useIdleTimer() {
  useEffect(() => {
    const reset = () => {
      clearTimeout(window._idle);
      window._idle = setTimeout(() => { localStorage.clear(); window.location.href = "/login"; }, 30 * 60 * 1000);
    };
    ["mousemove","keydown","click","scroll"].forEach(e => window.addEventListener(e, reset));
    reset();
    return () => ["mousemove","keydown","click","scroll"].forEach(e => window.removeEventListener(e, reset));
  }, []);
}

// ─── Shared styles ────────────────────────────────────────────
const card = { background:"linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border:"1px solid #cde8f4", borderRadius:12, padding:20 };
const h3s = { fontSize:13, fontWeight:700, color:"#1f2937", margin:"0 0 14px" };
const TH = { padding:"9px 13px", fontSize:10, color:"#475569", fontWeight:700, textAlign:"left", textTransform:"uppercase", letterSpacing:0.8, borderBottom:"1px solid #d6eaf4" };
const TD = { padding:"11px 13px", fontSize:12, color:"#334155" };
const lbl = { display:"block", fontSize:10, color:"#475569", fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:0.6 };
const inp = { width:"100%", background:"#ffffff", border:"1px solid #bcdff0", borderRadius:7, color:"#1f2937", padding:"9px 12px", fontSize:12, outline:"none", boxSizing:"border-box" };
const btn = (bg="#50C878", c="#fff") => ({ background:bg, color:c, border:"none", borderRadius:7, padding:"9px 20px", fontSize:12, fontWeight:700, cursor:"pointer" });

function Badge({ text, color="#50C878" }) {
  return <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:5, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{text}</span>;
}
function Stat({ label, value, icon, color, loading }) {
  return (
    <div style={{ ...card, borderLeft:`3px solid ${color}` }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:9, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
          <div style={{ fontSize:24, fontWeight:800, color:"#1f2937", marginTop:3 }}>{loading?"...":value}</div>
        </div>
        <span style={{ fontSize:20 }}>{icon}</span>
      </div>
    </div>
  );
}
function Empty({ msg }) { return <div style={{ textAlign:"center", padding:"30px 0", color:"#475569", fontSize:12 }}>📭 {msg}</div>; }
function Spinner() { return <div style={{ textAlign:"center", padding:"30px 0", color:"#475569", fontSize:12 }}>⏳ Loading...</div>; }
function statusColor(s) {
  const m = { GENERATED:"#22c55e",ACTIVE:"#22c55e",RESOLVED:"#22c55e",COMPLETED:"#22c55e",SUCCESS:"#22c55e", PENDING:"#f59e0b",OPEN:"#f59e0b",RUNNING:"#f59e0b", FAILED:"#ef4444",LOCKED:"#ef4444",INACTIVE:"#ef4444", ADJUSTED:"#8b5cf6",CLOSED:"#64748b" };
  return m[(s||"").toUpperCase()] || "#94a3b8";
}

// ─── Nav config ───────────────────────────────────────────────
const NAV = {
  ADMIN: [
    { id:"dashboard", label:"Dashboard", icon:"◈" },
    { id:"approvals", label:"Pending Approvals", icon:"✅", badge:"pending" },
    { id:"create-agent", label:"Create Agent", icon:"👤" },
    { id:"billing-mgmt", label:"Billing", icon:"💳" },
    { id:"complaints-mgmt", label:"Complaints", icon:"⚖️" },
    { id:"reports", label:"Reports", icon:"📊" },
    { id:"audit", label:"Audit Trail", icon:"📋" },
    { id:"notifications", label:"Notifications", icon:"🔔", badge:"unread" },
  ],
  AGENT: [
    { id:"dashboard", label:"Dashboard", icon:"◈" },
    { id:"create-customer", label:"Create Customer", icon:"➕" },
    { id:"customer-profile", label:"Customer Profile", icon:"🔍" },
    { id:"service-accounts", label:"Service Accounts", icon:"⚡" },
    { id:"complaints-agent", label:"Complaints", icon:"⚖️" },
    { id:"notifications", label:"Notifications", icon:"🔔", badge:"unread" },
  ],
  CUSTOMER: [
    { id:"dashboard", label:"My Dashboard", icon:"◈" },
    { id:"my-bills", label:"My Bills", icon:"💳" },
    { id:"raise-request", label:"Raise Request", icon:"🔧" },
    { id:"raise-dispute", label:"Raise Dispute", icon:"⚖️" },
    { id:"track-request", label:"Track Status", icon:"📍" },
    { id:"notifications", label:"Notifications", icon:"🔔", badge:"unread" },
  ],
  BILLING_ANALYST: [
    { id:"dashboard", label:"Dashboard", icon:"◈" },
    { id:"billing-mgmt", label:"Billing Cycles", icon:"💳" },
    { id:"exceptions", label:"Exceptions", icon:"⚠️" },
    { id:"resolve-dispute", label:"Resolve Dispute", icon:"⚖️" },
    { id:"reports", label:"Reports", icon:"📊" },
    { id:"notifications", label:"Notifications", icon:"🔔", badge:"unread" },
  ],
  FIELD_COORDINATOR: [
    { id:"dashboard", label:"Dashboard", icon:"◈" },
    { id:"create-order", label:"Create Order", icon:"🔧" },
    { id:"assign-order", label:"Assign Order", icon:"👤" },
    { id:"complete-order", label:"Complete Order", icon:"✅" },
    { id:"notifications", label:"Notifications", icon:"🔔", badge:"unread" },
  ],
};
const roleColor = { ADMIN:"#ef4444", AGENT:"#3b82f6", CUSTOMER:"#22c55e", BILLING_ANALYST:"#8b5cf6", FIELD_COORDINATOR:"#f59e0b" };

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active, setActive, unreadCount, pendingCount }) {
  const navigate = useNavigate();
  const role = getUserRole();
  const user = getStoredUser();
  const nav = NAV[role] || NAV.CUSTOMER;
  const rc = roleColor[role] || "#64748b";

  return (
    <div style={{ width:220, background:"#0b1426", height:"100vh", position:"fixed", left:0, top:0, display:"flex", flexDirection:"column", borderRight:"1px solid #1e2d4a" }}>
      <div style={{ padding:"18px 16px", borderBottom:"1px solid #1e2d4a" }}>
        <div style={{ fontSize:10, color:"#3b82f6", fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>CustomerCare</div>
        <div style={{ fontSize:19, color:"#f1f5f9", fontWeight:900 }}>360°</div>
        <div style={{ marginTop:5, display:"inline-block", background:rc+"22", color:rc, border:`1px solid ${rc}44`, borderRadius:5, padding:"2px 8px", fontSize:9, fontWeight:800 }}>{role}</div>
      </div>
      <nav style={{ padding:"10px 8px", flex:1, overflowY:"auto" }}>
        {nav.map(item => {
          const count = item.badge==="unread" ? unreadCount : item.badge==="pending" ? pendingCount : 0;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:7, border:"none", cursor:"pointer", marginBottom:2, background:active===item.id?"#1e3a6e":"transparent", color:active===item.id?"#93c5fd":"#64748b", fontSize:12, fontWeight:active===item.id?700:400, textAlign:"left" }}>
              <span style={{ fontSize:13 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {count>0 && <span style={{ background:"#ef4444", color:"#fff", borderRadius:10, fontSize:9, fontWeight:800, padding:"1px 5px" }}>{count}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"8px" }}>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ width:"100%", background:"#3d1a1a", color:"#f87171", border:"none", borderRadius:7, padding:"7px 0", fontSize:11, cursor:"pointer", fontWeight:600 }}>🚪 Logout</button>
      </div>
      <div style={{ padding:"10px 14px 14px", display:"flex", alignItems:"center", gap:8, borderTop:"1px solid #1e2d4a" }}>
        <div style={{ width:30, height:30, borderRadius:"50%", background:rc+"33", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:rc, fontWeight:800, border:`2px solid ${rc}44`, flexShrink:0 }}>
          {(user?.user?.email||"?").substring(0,2).toUpperCase()}
        </div>
        <div style={{ overflow:"hidden" }}>
          <div style={{ fontSize:11, color:"#e2e8f0", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.user?.email||"User"}</div>
          <div style={{ fontSize:9, color:"#475569" }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────
function TopBar({ title }) {
  return (
    <div style={{ height:50, background:"#0d1526", borderBottom:"1px solid #1e2d4a", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", position:"sticky", top:0, zIndex:10 }}>
      <h1 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{title}</h1>
    </div>
  );
}

// ─── ADMIN: Dashboard ─────────────────────────────────────────
function AdminDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const sixMoAgo = new Date(Date.now()-180*864e5).toISOString().split("T")[0];

  const { data:dash, isLoading } = useQuery({
    queryKey:["admin-dash"], retry:false,
    queryFn: async () => {
      const { reportsApi } = await import("./api/reports.api");
      return reportsApi.getDashboard("Electric", sixMoAgo, today).then(r=>r.data);
    }
  });
  const { data:health } = useQuery({ queryKey:["health"], retry:false, refetchInterval:30000, queryFn:()=>fetch("/api/v1/health").then(r=>r.text()) });
  const { data:ready } = useQuery({ queryKey:["ready"], retry:false, refetchInterval:30000, queryFn:()=>fetch("/api/v1/ready").then(r=>r.text()) });

  const chartData = dash?.adjustmentsTrend
    ? Object.entries(dash.adjustmentsTrend).map(([month,count])=>({month,adjustments:count}))
    : [];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
        <Stat label="Total Bills" value={dash?.totalBills??0} icon="💳" color="#8b5cf6" loading={isLoading} />
        <Stat label="Adjusted Bills" value={dash?.adjustedBills??0} icon="⚖️" color="#f59e0b" loading={isLoading} />
        <Stat label="Accuracy Rate" value={dash?.accuracyRate?`${dash.accuracyRate}%`:"—"} icon="✅" color="#22c55e" loading={isLoading} />
        <Stat label="System" value={health?"Online":"Offline"} icon="🖥️" color={health?"#22c55e":"#ef4444"} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:16 }}>
        <div style={card}>
          <h3 style={h3s}>Billing Adjustment Trend</h3>
          {chartData.length>0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="month" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:"#0f1729",border:"1px solid #1e2d4a",borderRadius:8,fontSize:11}} />
                <Bar dataKey="adjustments" fill="#f59e0b" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty msg={isLoading?"Loading chart...":"No billing data yet — generate a report first"} />}
        </div>
        <div style={card}>
          <h3 style={h3s}>System Status</h3>
          {[
            { label:"Backend API", ok:!!health, value:health||"Offline" },
            { label:"MySQL Database", ok:ready==="Application is ready", value:ready==="Application is ready"?"Connected":"Checking..." },
            { label:"JWT Auth", ok:true, value:"Active" },
          ].map(s => (
            <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #1a2640" }}>
              <span style={{ fontSize:12, color:"#94a3b8" }}>{s.label}</span>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:s.ok?"#22c55e":"#ef4444", display:"block" }} />
                <span style={{ fontSize:11, color:s.ok?"#22c55e":"#ef4444", fontWeight:600 }}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN: Pending Approvals ─────────────────────────────────
function PendingApprovalsPage({ setPendingCount }) {
  const [customerId, setCustomerId] = useState("");
  const [action, setAction] = useState("approve");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!customerId) { toast.error("Enter Customer ID"); return; }
    if (action==="deactivate" && !reason) { toast.error("Reason required"); return; }
    setLoading(true);
    try {
      const { adminApi } = await import("./api/admin.api");
      if (action==="approve") { await adminApi.approveCustomer(Number(customerId)); toast.success(`Customer #${customerId} approved! They can now login.`); }
      else if (action==="deactivate") { await adminApi.deactivateCustomer(Number(customerId), reason); toast.success(`Customer #${customerId} deactivated`); }
      else { await adminApi.reactivateCustomer(Number(customerId)); toast.success(`Customer #${customerId} reactivated`); }
      setCustomerId(""); setReason("");
    } catch (err) { toast.error(err?.message||"Action failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ ...card, marginBottom:16, borderLeft:"3px solid #22c55e" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:4 }}>Customer Approval Queue</div>
        <div style={{ fontSize:11, color:"#64748b" }}>
          New customers registered via portal need admin approval before they can login.
          Find the Customer ID by checking MySQL: <code style={{ color:"#3b82f6" }}>SELECT userid, username, email, status FROM user;</code>
        </div>
      </div>
      <div style={card}>
        <h3 style={h3s}>Approve / Manage Customer</h3>
        <form onSubmit={handle}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={lbl}>Customer ID (from DB)</label>
              <input type="number" value={customerId} onChange={e=>setCustomerId(e.target.value)} placeholder="e.g. 2, 3, 52..." style={inp} required />
            </div>
            <div>
              <label style={lbl}>Action</label>
              <select value={action} onChange={e=>setAction(e.target.value)} style={inp}>
                <option value="approve">✅ Approve Customer</option>
                <option value="deactivate">🚫 Deactivate Customer</option>
                <option value="reactivate">♻️ Reactivate Customer</option>
              </select>
            </div>
          </div>
          {action==="deactivate" && (
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Reason for deactivation *</label>
              <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Enter reason" style={inp} required />
            </div>
          )}
          <button type="submit" disabled={loading} style={btn(action==="approve"?"#16a34a":action==="deactivate"?"#dc2626":"#2563eb")}>
            {loading?"Processing...":action==="approve"?"✅ Approve":action==="deactivate"?"🚫 Deactivate":"♻️ Reactivate"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── ADMIN: Create Agent ──────────────────────────────────────
function CreateAgentPage() {
  const [form, setForm] = useState({ username:"", email:"", phone:"" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { adminApi } = await import("./api/admin.api");
      await adminApi.createAgent(form);
      toast.success("Agent created! Temporary password sent to their email.");
      setForm({ username:"", email:"", phone:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={card}>
      <h3 style={h3s}>Create New Agent Account</h3>
      <p style={{ fontSize:12, color:"#64748b", marginBottom:16 }}>Agent will receive a temporary password and must reset on first login.</p>
      <form onSubmit={handle}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div><label style={lbl}>Username *</label><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Email *</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Phone (10 digits) *</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} maxLength={10} style={inp} required /></div>
        </div>
        <button type="submit" disabled={loading} style={btn()}>
          {loading?"Creating...":"Create Agent"}
        </button>
      </form>
    </div>
  );
}

// ─── ADMIN/BA: Billing Management ────────────────────────────
function BillingMgmtPage() {
  const [tab, setTab] = useState("create");
  const [cycleForm, setCycleForm] = useState({ serviceType:"Electric", startDate:"", endDate:"", billDate:"" });
  const [cycleId, setCycleId] = useState("");
  const [loading, setLoading] = useState(false);
  const { data:failed, isLoading:failLoading, refetch } = useQuery({
    queryKey:["failed-bills"], retry:false,
    queryFn: async () => { const { billingApi } = await import("./api/billing.api"); return billingApi.getFailedBills().then(r=>r.data); }
  });

  const createCycle = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { billingApi } = await import("./api/billing.api");
      await billingApi.createCycle(cycleForm);
      toast.success("Billing cycle created successfully!");
      setCycleForm({ serviceType:"Electric", startDate:"", endDate:"", billDate:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const generateBills = async () => {
    if (!cycleId) { toast.error("Enter Cycle ID"); return; }
    setLoading(true);
    try {
      const { billingApi } = await import("./api/billing.api");
      const res = await billingApi.generateBills(Number(cycleId));
      toast.success(res.data||"Bills generated!");
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const closeCycle = async () => {
    if (!cycleId) { toast.error("Enter Cycle ID"); return; }
    setLoading(true);
    try {
      const { billingApi } = await import("./api/billing.api");
      await billingApi.closeCycle(Number(cycleId));
      toast.success("Billing cycle closed!");
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const retryBill = async (billId) => {
    try {
      const { billingApi } = await import("./api/billing.api");
      await billingApi.retryBill(billId);
      toast.success("Bill retried!"); refetch();
    } catch (err) { toast.error(err?.message||"Failed"); }
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["create","📅 Create Cycle"],["generate","⚡ Generate Bills"],["close","🔒 Close Cycle"],["exceptions","⚠️ Exceptions"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ border:"1px solid #d6eaf4", borderRadius:7, padding:"7px 14px", fontSize:12, cursor:"pointer", fontWeight:tab===t?700:400, background:tab===t?"#82C8E5":"#ffffff", color:tab===t?"#ffffff":"#64748b" }}>{l}</button>
        ))}
      </div>
      <div style={card}>
        {tab==="create" && (
          <form onSubmit={createCycle}>
            <h3 style={h3s}>Create Billing Cycle</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div><label style={lbl}>Service Type</label><select value={cycleForm.serviceType} onChange={e=>setCycleForm({...cycleForm,serviceType:e.target.value})} style={inp}><option>Electric</option><option>Gas</option><option>Water</option></select></div>
              <div><label style={lbl}>Start Date</label><input type="date" value={cycleForm.startDate} onChange={e=>setCycleForm({...cycleForm,startDate:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>End Date</label><input type="date" value={cycleForm.endDate} onChange={e=>setCycleForm({...cycleForm,endDate:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Bill Date</label><input type="date" value={cycleForm.billDate} onChange={e=>setCycleForm({...cycleForm,billDate:e.target.value})} style={inp} required /></div>
            </div>
            <button type="submit" disabled={loading} style={btn()}>{loading?"Creating...":"Create Cycle"}</button>
          </form>
        )}
        {(tab==="generate"||tab==="close") && (
          <div>
            <h3 style={h3s}>{tab==="generate"?"Generate Bills for Cycle":"Close Billing Cycle"}</h3>
            <div style={{ display:"flex", gap:12, alignItems:"flex-end" }}>
              <div style={{ flex:1 }}><label style={lbl}>Cycle ID</label><input type="number" value={cycleId} onChange={e=>setCycleId(e.target.value)} placeholder="Enter billing cycle ID" style={inp} /></div>
              <button onClick={tab==="generate"?generateBills:closeCycle} disabled={loading} style={btn(tab==="close"?"#dc2626":"#2563eb")}>
                {loading?"Processing...":tab==="generate"?"⚡ Generate Bills":"🔒 Close Cycle"}
              </button>
            </div>
          </div>
        )}
        {tab==="exceptions" && (
          <div>
            <h3 style={h3s}>Failed Bill Exceptions</h3>
            {failLoading ? <Spinner /> : failed?.length>0 ? (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["Bill ID","Account ID","Status","Error","Action"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>{failed.map((b,i)=>(
                  <tr key={i} style={{ borderBottom:"1px solid #1a2640" }}>
                    <td style={TD}>{b.billId||b.id}</td>
                    <td style={TD}>{b.accountId||"—"}</td>
                    <td style={TD}><Badge text={b.billStatus||"FAILED"} color="#ef4444" /></td>
                    <td style={{ ...TD, color:"#f87171" }}>{b.errorMessage||"Generation failed"}</td>
                    <td style={TD}><button onClick={()=>retryBill(b.billId||b.id)} style={{ ...btn("#1e3a6e","#93c5fd"), padding:"4px 10px", fontSize:10 }}>Retry</button></td>
                  </tr>
                ))}</tbody>
              </table>
            ) : <Empty msg="No exceptions — all bills generated successfully" />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN/AGENT: Complaints ──────────────────────────────────
function ComplaintsPage() {
  const [tab, setTab] = useState("log");
  const [logForm, setLogForm] = useState({ userId:"", complaintCategory:"BILLING", description:"" });
  const [resolveForm, setResolveForm] = useState({ complaintId:"", complaintStatus:"RESOLVED", resolutionNotes:"" });
  const [loading, setLoading] = useState(false);

  const logComplaint = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { complaintsApi } = await import("./api/complaints.api");
      await complaintsApi.create({ ...logForm, userId:Number(logForm.userId) });
      toast.success("Complaint logged!"); setLogForm({ userId:"", complaintCategory:"BILLING", description:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const resolveComplaint = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { complaintsApi } = await import("./api/complaints.api");
      await complaintsApi.resolve({ ...resolveForm, complaintId:Number(resolveForm.complaintId) });
      toast.success("Complaint resolved!"); setResolveForm({ complaintId:"", complaintStatus:"RESOLVED", resolutionNotes:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["log","📝 Log Complaint"],["resolve","✅ Resolve Complaint"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ border:"1px solid #d6eaf4", borderRadius:7, padding:"7px 14px", fontSize:12, cursor:"pointer", fontWeight:tab===t?700:400, background:tab===t?"#82C8E5":"#ffffff", color:tab===t?"#ffffff":"#64748b" }}>{l}</button>
        ))}
      </div>
      <div style={card}>
        {tab==="log" && (
          <form onSubmit={logComplaint}>
            <h3 style={h3s}>Log New Complaint</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><label style={lbl}>User ID</label><input type="number" value={logForm.userId} onChange={e=>setLogForm({...logForm,userId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Category</label><select value={logForm.complaintCategory} onChange={e=>setLogForm({...logForm,complaintCategory:e.target.value})} style={inp}><option value="BILLING">Billing</option><option value="SERVICE">Service</option><option value="OUTAGE">Outage</option></select></div>
            </div>
            <div style={{ marginBottom:14 }}><label style={lbl}>Description</label><textarea value={logForm.description} onChange={e=>setLogForm({...logForm,description:e.target.value})} rows={3} style={{ ...inp, resize:"vertical" }} required /></div>
            <button type="submit" disabled={loading} style={btn()}>{loading?"Logging...":"Log Complaint"}</button>
          </form>
        )}
        {tab==="resolve" && (
          <form onSubmit={resolveComplaint}>
            <h3 style={h3s}>Resolve Complaint</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><label style={lbl}>Complaint ID</label><input type="number" value={resolveForm.complaintId} onChange={e=>setResolveForm({...resolveForm,complaintId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Status</label><select value={resolveForm.complaintStatus} onChange={e=>setResolveForm({...resolveForm,complaintStatus:e.target.value})} style={inp}><option value="RESOLVED">RESOLVED</option><option value="CLOSED">CLOSED</option></select></div>
            </div>
            <div style={{ marginBottom:14 }}><label style={lbl}>Resolution Notes</label><textarea value={resolveForm.resolutionNotes} onChange={e=>setResolveForm({...resolveForm,resolutionNotes:e.target.value})} rows={3} style={{ ...inp, resize:"vertical" }} required /></div>
            <button type="submit" disabled={loading} style={btn("#16a34a")}>{loading?"Resolving...":"Resolve Complaint"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN: Reports ───────────────────────────────────────────
function ReportsPage() {
  const [form, setForm] = useState({ scope:"REGION", startDate:"", endDate:"" });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { reportsApi } = await import("./api/reports.api");
      const res = await reportsApi.generate(form);
      setReport(res.data); toast.success("Report generated!");
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const exportCsv = async () => {
    if (!report?.id) { toast.error("Generate a report first"); return; }
    try {
      const { reportsApi } = await import("./api/reports.api");
      const res = await reportsApi.exportReport(report.id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a"); a.href=url; a.download="report.csv"; a.click();
    } catch { toast.error("Export failed"); }
  };

  return (
    <div>
      <div style={{ ...card, marginBottom:16 }}>
        <h3 style={h3s}>Generate Operational Report</h3>
        <form onSubmit={generate}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:14 }}>
            <div><label style={lbl}>Scope</label><select value={form.scope} onChange={e=>setForm({...form,scope:e.target.value})} style={inp}><option value="REGION">Region</option><option value="SERVICE">Service</option><option value="PERIOD">Period</option></select></div>
            <div><label style={lbl}>Start Date</label><input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} style={inp} required /></div>
            <div><label style={lbl}>End Date</label><input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} style={inp} required /></div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button type="submit" disabled={loading} style={btn()}>{loading?"Generating...":"Generate Report"}</button>
            {report && <button type="button" onClick={exportCsv} style={btn("#16a34a")}>⬇ Export CSV</button>}
          </div>
        </form>
      </div>
      {report && (
        <div style={card}>
          <h3 style={h3s}>Report Result</h3>
          <pre style={{ color:"#93c5fd", fontSize:11, background:"#0f1729", padding:14, borderRadius:8, overflow:"auto" }}>{JSON.stringify(report,null,2)}</pre>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: Audit Trail ───────────────────────────────────────
function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [filters, setFilters] = useState({ email:"", start:"", end:"" });

  // Load all logs on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (e) => {
    e?.preventDefault(); setLoading(true);
    try {
      const { authApi } = await import("./api/auth.api");
      const hasFilter = filters.email||filters.start||filters.end;
      const res = hasFilter
        ? await authApi.filterAuditLogs({ email:filters.email||undefined, start:filters.start||undefined, end:filters.end||undefined })
        : await authApi.getAllAuditLogs();
      setLogs(res.data||[]); setFetched(true);
    } catch (err) { toast.error(err?.message||"Failed to fetch audit logs"); }
    finally { setLoading(false); }
  };

  const exportCsv = async () => {
    try {
      const { authApi } = await import("./api/auth.api");
      const res = await authApi.exportAuthAudit();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a"); a.href=url; a.download="auth_audit.csv"; a.click();
    } catch { toast.error("Export failed"); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>Auth Audit Logs ({logs.length})</div>
        <button onClick={exportCsv} style={btn("#1e3a6e","#93c5fd")}>⬇ Export CSV</button>
      </div>
      <div style={{ ...card, marginBottom:14 }}>
        <form onSubmit={fetchLogs} style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div style={{ flex:1, minWidth:160 }}><label style={lbl}>Email (optional)</label><input value={filters.email} onChange={e=>setFilters({...filters,email:e.target.value})} placeholder="user@example.com" style={inp} /></div>
          <div style={{ flex:1, minWidth:160 }}><label style={lbl}>Start (ISO: 2026-01-01T00:00:00)</label><input value={filters.start} onChange={e=>setFilters({...filters,start:e.target.value})} placeholder="2026-01-01T00:00:00" style={inp} /></div>
          <div style={{ flex:1, minWidth:160 }}><label style={lbl}>End (ISO)</label><input value={filters.end} onChange={e=>setFilters({...filters,end:e.target.value})} placeholder="2026-12-31T23:59:59" style={inp} /></div>
          <button type="submit" disabled={loading} style={btn()}>{loading?"Loading...":"Filter"}</button>
        </form>
      </div>
      <div style={card}>
        {loading ? <Spinner />
          : logs.length===0 ? <Empty msg="No audit logs found" />
          : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Email","Action","Status","Timestamp"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>{logs.map((l,i)=>(
                <tr key={i} style={{ borderBottom:"1px solid #1a2640" }}>
                  <td style={TD}>{l.email}</td>
                  <td style={TD}>{l.action}</td>
                  <td style={TD}><Badge text={l.status} color={statusColor(l.status)} /></td>
                  <td style={{ ...TD, fontSize:11 }}>{l.timestamp?new Date(l.timestamp).toLocaleString():"—"}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
      </div>
    </div>
  );
}

// ─── AGENT: Create Customer ───────────────────────────────────
function CreateCustomerPage() {
  const [form, setForm] = useState({ username:"", email:"", phone:"", password:"", name:"", address:"", countryCode:"IN", regionCode:"MH", customerType:"Residential" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { customersApi } = await import("./api/customers.api");
      await customersApi.create(form);
      toast.success("Customer created! Pending admin approval.");
      setForm({ username:"", email:"", phone:"", password:"", name:"", address:"", countryCode:"IN", regionCode:"MH", customerType:"Residential" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={card}>
      <h3 style={h3s}>Create Customer Profile</h3>
      <form onSubmit={handle}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <div><label style={lbl}>Username *</label><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Full Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Email *</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Phone (10 digits) *</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} maxLength={10} style={inp} required /></div>
          <div><label style={lbl}>Password *</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Customer Type</label><select value={form.customerType} onChange={e=>setForm({...form,customerType:e.target.value})} style={inp}><option>Residential</option><option>Commercial</option><option>Industrial</option></select></div>
          <div><label style={lbl}>Address *</label><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Country Code *</label><input value={form.countryCode} onChange={e=>setForm({...form,countryCode:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Region Code *</label><input value={form.regionCode} onChange={e=>setForm({...form,regionCode:e.target.value})} style={inp} required /></div>
        </div>
        <button type="submit" disabled={loading} style={btn()}>{loading?"Creating...":"Create Customer"}</button>
      </form>
    </div>
  );
}

// ─── AGENT: Customer Profile 360° ────────────────────────────
function CustomerProfilePage() {
  const [customerId, setCustomerId] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState({ email:"", phone:"", address:"", countryCode:"", regionCode:"" });
  const [tab, setTab] = useState("view");

  const fetchProfile = async (e) => {
    e?.preventDefault(); setLoading(true);
    try {
      const { customersApi } = await import("./api/customers.api");
      const res = await customersApi.getProfile(Number(customerId));
      setProfile(res.data);
      setUpdateForm({ email:res.data.email||"", phone:res.data.phone||"", address:"", countryCode:"", regionCode:"" });
    } catch (err) { toast.error(err?.message||"Customer not found"); }
    finally { setLoading(false); }
  };

  const updateContact = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { customersApi } = await import("./api/customers.api");
      await customersApi.updateContact(Number(customerId), updateForm);
      toast.success("Contact updated!"); fetchProfile();
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ ...card, marginBottom:14 }}>
        <h3 style={h3s}>Search Customer</h3>
        <form onSubmit={fetchProfile} style={{ display:"flex", gap:10 }}>
          <input type="number" value={customerId} onChange={e=>setCustomerId(e.target.value)} placeholder="Enter Customer ID" style={{ ...inp, flex:1 }} required />
          <button type="submit" disabled={loading} style={btn()}>{loading?"Loading...":"Load Profile"}</button>
        </form>
      </div>

      {profile && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {[["view","👤 Profile"],["edit","✏️ Edit Contact"],["accounts","⚡ Accounts"],["bills","💳 Bills"],["requests","🔧 Requests"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{ border:"1px solid #d6eaf4", borderRadius:7, padding:"6px 12px", fontSize:11, cursor:"pointer", fontWeight:tab===t?700:400, background:tab===t?"#82C8E5":"#ffffff", color:tab===t?"#ffffff":"#64748b" }}>{l}</button>
            ))}
          </div>
          <div style={card}>
            {tab==="view" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[["Customer ID",profile.customerId],["Name",profile.name],["Email",profile.email],["Phone",profile.phone]].map(([k,v])=>(
                  <div key={k}><div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:0.8, marginBottom:2 }}>{k}</div><div style={{ fontSize:13, color:"#e2e8f0", fontWeight:600 }}>{v||"—"}</div></div>
                ))}
              </div>
            )}
            {tab==="edit" && (
              <form onSubmit={updateContact}>
                <h3 style={h3s}>Update Contact Info</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                  <div><label style={lbl}>Email</label><input type="email" value={updateForm.email} onChange={e=>setUpdateForm({...updateForm,email:e.target.value})} style={inp} /></div>
                  <div><label style={lbl}>Phone</label><input value={updateForm.phone} onChange={e=>setUpdateForm({...updateForm,phone:e.target.value})} maxLength={10} style={inp} /></div>
                  <div><label style={lbl}>Address</label><input value={updateForm.address} onChange={e=>setUpdateForm({...updateForm,address:e.target.value})} style={inp} /></div>
                  <div><label style={lbl}>Country Code</label><input value={updateForm.countryCode} onChange={e=>setUpdateForm({...updateForm,countryCode:e.target.value})} style={inp} /></div>
                  <div><label style={lbl}>Region Code</label><input value={updateForm.regionCode} onChange={e=>setUpdateForm({...updateForm,regionCode:e.target.value})} style={inp} /></div>
                </div>
                <button type="submit" disabled={loading} style={btn()}>{loading?"Saving...":"Save Changes"}</button>
              </form>
            )}
            {tab==="accounts" && (
              <div>
                <h3 style={h3s}>Service Accounts</h3>
                {profile.serviceAccounts?.length>0 ? (
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr>{["Account ID","Service Type","Status","Address"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>{profile.serviceAccounts.map((a,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid #1a2640" }}>
                        <td style={TD}>{a.accountId}</td>
                        <td style={TD}>{a.serviceType}</td>
                        <td style={TD}><Badge text={a.serviceAccountStatus} color={statusColor(a.serviceAccountStatus)} /></td>
                        <td style={TD}>{a.address}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                ) : <Empty msg="No service accounts found" />}
              </div>
            )}
            {tab==="bills" && (
              <div>
                <h3 style={h3s}>Bills</h3>
                {profile.bills?.length>0 ? (
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr>{["Account ID","Cycle ID","Amount","Due Date","Status"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>{profile.bills.map((b,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid #1a2640" }}>
                        <td style={TD}>{b.accountId}</td>
                        <td style={TD}>{b.cycleId}</td>
                        <td style={{ ...TD, fontWeight:600, color:"#f1f5f9" }}>₹{b.amount}</td>
                        <td style={TD}>{b.dueDate}</td>
                        <td style={TD}><Badge text={b.status} color={statusColor(b.status)} /></td>
                      </tr>
                    ))}</tbody>
                  </table>
                ) : <Empty msg="No bills found" />}
              </div>
            )}
            {tab==="requests" && (
              <div>
                <h3 style={h3s}>Service Requests</h3>
                {profile.requests?.length>0 ? (
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr>{["Request ID","Type","Status","Priority"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>{profile.requests.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid #1a2640" }}>
                        <td style={TD}>{r.requestId}</td>
                        <td style={TD}>{r.type}</td>
                        <td style={TD}><Badge text={r.status} color={statusColor(r.status)} /></td>
                        <td style={TD}>{r.priority}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                ) : <Empty msg="No requests found" />}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AGENT: Service Accounts ──────────────────────────────────
function ServiceAccountsPage() {
  const [tab, setTab] = useState("account");
  const [acctForm, setAcctForm] = useState({ customerId:"", serviceType:"Electric", startDate:"" });
  const [premiseForm, setPremiseForm] = useState({ serviceAccountId:"", address:"", region:"", meterId:"" });
  const [agreementForm, setAgreementForm] = useState({ serviceAccountId:"", termStartDate:"", termEndDate:"", tariffCode:"", specialNotes:"" });
  const [loading, setLoading] = useState(false);

  const createAccount = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { customersApi } = await import("./api/customers.api");
      await customersApi.createServiceAccount({ ...acctForm, customerId:Number(acctForm.customerId) });
      toast.success("Service account created!"); setAcctForm({ customerId:"", serviceType:"Electric", startDate:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const linkPremise = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { customersApi } = await import("./api/customers.api");
      await customersApi.linkPremise({ ...premiseForm, serviceAccountId:Number(premiseForm.serviceAccountId) });
      toast.success("Premise linked!"); setPremiseForm({ serviceAccountId:"", address:"", region:"", meterId:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const recordAgreement = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { customersApi } = await import("./api/customers.api");
      await customersApi.recordAgreement({ ...agreementForm, serviceAccountId:Number(agreementForm.serviceAccountId) });
      toast.success("Agreement recorded!"); setAgreementForm({ serviceAccountId:"", termStartDate:"", termEndDate:"", tariffCode:"", specialNotes:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["account","⚡ Create Account"],["premise","📍 Link Premise"],["agreement","📄 Agreement"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ border:"1px solid #d6eaf4", borderRadius:7, padding:"7px 14px", fontSize:12, cursor:"pointer", fontWeight:tab===t?700:400, background:tab===t?"#82C8E5":"#ffffff", color:tab===t?"#ffffff":"#64748b" }}>{l}</button>
        ))}
      </div>
      <div style={card}>
        {tab==="account" && (
          <form onSubmit={createAccount}>
            <h3 style={h3s}>Create Service Account</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div><label style={lbl}>Customer ID *</label><input type="number" value={acctForm.customerId} onChange={e=>setAcctForm({...acctForm,customerId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Service Type</label><select value={acctForm.serviceType} onChange={e=>setAcctForm({...acctForm,serviceType:e.target.value})} style={inp}><option>Electric</option><option>Gas</option><option>Water</option></select></div>
              <div><label style={lbl}>Start Date *</label><input type="date" value={acctForm.startDate} onChange={e=>setAcctForm({...acctForm,startDate:e.target.value})} style={inp} required /></div>
            </div>
            <button type="submit" disabled={loading} style={btn()}>{loading?"Creating...":"Create Account"}</button>
          </form>
        )}
        {tab==="premise" && (
          <form onSubmit={linkPremise}>
            <h3 style={h3s}>Link Premise to Service Account</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div><label style={lbl}>Service Account ID *</label><input type="number" value={premiseForm.serviceAccountId} onChange={e=>setPremiseForm({...premiseForm,serviceAccountId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Address *</label><input value={premiseForm.address} onChange={e=>setPremiseForm({...premiseForm,address:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Region *</label><input value={premiseForm.region} onChange={e=>setPremiseForm({...premiseForm,region:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Meter ID (optional)</label><input value={premiseForm.meterId} onChange={e=>setPremiseForm({...premiseForm,meterId:e.target.value})} style={inp} /></div>
            </div>
            <button type="submit" disabled={loading} style={btn()}>{loading?"Linking...":"Link Premise"}</button>
          </form>
        )}
        {tab==="agreement" && (
          <form onSubmit={recordAgreement}>
            <h3 style={h3s}>Record Service Agreement</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><label style={lbl}>Service Account ID *</label><input type="number" value={agreementForm.serviceAccountId} onChange={e=>setAgreementForm({...agreementForm,serviceAccountId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Tariff Code</label><input value={agreementForm.tariffCode} onChange={e=>setAgreementForm({...agreementForm,tariffCode:e.target.value})} style={inp} /></div>
              <div><label style={lbl}>Term Start *</label><input type="date" value={agreementForm.termStartDate} onChange={e=>setAgreementForm({...agreementForm,termStartDate:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Term End *</label><input type="date" value={agreementForm.termEndDate} onChange={e=>setAgreementForm({...agreementForm,termEndDate:e.target.value})} style={inp} required /></div>
            </div>
            <div style={{ marginBottom:14 }}><label style={lbl}>Special Notes</label><textarea value={agreementForm.specialNotes} onChange={e=>setAgreementForm({...agreementForm,specialNotes:e.target.value})} rows={3} style={{ ...inp, resize:"vertical" }} /></div>
            <button type="submit" disabled={loading} style={btn()}>{loading?"Saving...":"Record Agreement"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── CUSTOMER: Dashboard ──────────────────────────────────────
function CustomerDashboard() {
  const userId = getCurrentUserId();
  const { data:bills, isLoading } = useQuery({
    queryKey:["my-bills",userId], enabled:!!userId, retry:false,
    queryFn: async () => { const { billingApi } = await import("./api/billing.api"); return billingApi.getBillsForCustomer(userId).then(r=>r.data); }
  });
  const total = bills?.reduce((s,b)=>s+b.amount,0)||0;

  return (
    <div>
      <div style={{ background:"linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border:"1px solid #cde8f4", borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#f1f5f9" }}>Welcome to CustomerCare 360°</div>
        <div style={{ fontSize:12, color:"#93c5fd", marginTop:3 }}>View your bills, raise requests and track your services</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        <Stat label="Total Bills" value={bills?.length??0} icon="💳" color="#8b5cf6" loading={isLoading} />
        <Stat label="Total Amount Due" value={`₹${total.toFixed(2)}`} icon="💰" color="#f59e0b" loading={isLoading} />
        <Stat label="Unpaid Bills" value={bills?.filter(b=>b.billStatus==="GENERATED").length??0} icon="⚠️" color="#ef4444" loading={isLoading} />
      </div>
      <div style={card}>
        <h3 style={h3s}>My Recent Bills</h3>
        {isLoading ? <Spinner />
          : bills?.length>0 ? (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Bill ID","Usage","Amount","Due Date","Status"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>{bills.map((b,i)=>(
                <tr key={i} style={{ borderBottom:"1px solid #1a2640" }}>
                  <td style={TD}>{b.billId}</td>
                  <td style={TD}>{b.usage}</td>
                  <td style={{ ...TD, fontWeight:600, color:"#f1f5f9" }}>₹{b.amount}</td>
                  <td style={TD}>{b.dueDate}</td>
                  <td style={TD}><Badge text={b.billStatus} color={statusColor(b.billStatus)} /></td>
                </tr>
              ))}</tbody>
            </table>
          ) : <Empty msg="No bills yet — they appear after billing cycle runs" />}
      </div>
    </div>
  );
}

// ─── CUSTOMER: Raise Request ──────────────────────────────────
function RaiseRequestPage() {
  const userId = getCurrentUserId();
  const [form, setForm] = useState({ customerId:userId||"", requestType:"NEW_CONNECTION" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { serviceOrdersApi } = await import("./api/serviceOrders.api");
      await serviceOrdersApi.raiseServiceRequest({ customerId:Number(form.customerId), requestType:form.requestType });
      toast.success("Service request raised successfully!");
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={card}>
      <h3 style={h3s}>Raise Service Request</h3>
      <form onSubmit={handle}>
        <div style={{ marginBottom:12 }}><label style={lbl}>Customer ID</label><input type="number" value={form.customerId} onChange={e=>setForm({...form,customerId:e.target.value})} style={inp} required /></div>
        <div style={{ marginBottom:14 }}><label style={lbl}>Request Type</label>
          <select value={form.requestType} onChange={e=>setForm({...form,requestType:e.target.value})} style={inp}>
            <option value="NEW_CONNECTION">New Connection</option>
            <option value="DISCONNECT">Disconnect</option>
            <option value="INQUIRY">Inquiry</option>
          </select>
        </div>
        <button type="submit" disabled={loading} style={btn()}>{loading?"Submitting...":"Raise Request"}</button>
      </form>
    </div>
  );
}

// ─── CUSTOMER: Raise Dispute ──────────────────────────────────
function RaiseDisputePage() {
  const [form, setForm] = useState({ billId:"", reason:"" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { billingApi } = await import("./api/billing.api");
      await billingApi.raiseDispute({ billId:Number(form.billId), reason:form.reason });
      toast.success("Dispute raised!"); setForm({ billId:"", reason:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={card}>
      <h3 style={h3s}>Raise Billing Dispute</h3>
      <form onSubmit={handle}>
        <div style={{ marginBottom:12 }}><label style={lbl}>Bill ID *</label><input type="number" value={form.billId} onChange={e=>setForm({...form,billId:e.target.value})} style={inp} required /></div>
        <div style={{ marginBottom:14 }}><label style={lbl}>Reason *</label><textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} rows={4} style={{ ...inp, resize:"vertical" }} required /></div>
        <button type="submit" disabled={loading} style={btn("#dc2626")}>{loading?"Submitting...":"Raise Dispute"}</button>
      </form>
    </div>
  );
}

// ─── CUSTOMER: Track Status ───────────────────────────────────
function TrackStatusPage() {
  const [requestId, setRequestId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const track = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { serviceOrdersApi } = await import("./api/serviceOrders.api");
      const res = await serviceOrdersApi.getRequestStatus(Number(requestId));
      setResult(res.data);
    } catch (err) { toast.error(err?.message||"Request not found"); setResult(null); }
    finally { setLoading(false); }
  };

  return (
    <div style={card}>
      <h3 style={h3s}>Track Request / Order Status</h3>
      <form onSubmit={track} style={{ display:"flex", gap:10, marginBottom:16 }}>
        <input type="number" value={requestId} onChange={e=>setRequestId(e.target.value)} placeholder="Enter Request ID" style={{ ...inp, flex:1 }} required />
        <button type="submit" disabled={loading} style={btn()}>{loading?"Tracking...":"Track"}</button>
      </form>
      {result && (
        <div style={{ background:"#0f1729", borderRadius:8, padding:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><div style={lbl}>Request Status</div><Badge text={result.requestStatus||"—"} color={statusColor(result.requestStatus)} /></div>
            <div><div style={lbl}>Order Status</div><Badge text={result.orderStatus||"—"} color={statusColor(result.orderStatus)} /></div>
            <div><div style={lbl}>Last Updated</div><span style={{ fontSize:12, color:"#94a3b8" }}>{result.lastUpdated?new Date(result.lastUpdated).toLocaleString():"—"}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BA: Resolve Dispute ──────────────────────────────────────
function ResolveDisputePage() {
  const [form, setForm] = useState({ disputeId:"", status:"APPROVED", amountDelta:"", approver:"", decisionReason:"" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { billingApi } = await import("./api/billing.api");
      await billingApi.resolveDispute({ ...form, disputeId:Number(form.disputeId), amountDelta:Number(form.amountDelta)||0 });
      toast.success("Dispute resolved!"); setForm({ disputeId:"", status:"APPROVED", amountDelta:"", approver:"", decisionReason:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={card}>
      <h3 style={h3s}>Resolve Billing Dispute</h3>
      <form onSubmit={handle}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div><label style={lbl}>Dispute ID *</label><input type="number" value={form.disputeId} onChange={e=>setForm({...form,disputeId:e.target.value})} style={inp} required /></div>
          <div><label style={lbl}>Decision</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inp}><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></div>
          <div><label style={lbl}>Amount Delta (±)</label><input type="number" value={form.amountDelta} onChange={e=>setForm({...form,amountDelta:e.target.value})} style={inp} /></div>
          <div><label style={lbl}>Approver Name *</label><input value={form.approver} onChange={e=>setForm({...form,approver:e.target.value})} style={inp} required /></div>
        </div>
        <div style={{ marginBottom:14 }}><label style={lbl}>Decision Reason</label><textarea value={form.decisionReason} onChange={e=>setForm({...form,decisionReason:e.target.value})} rows={3} style={{ ...inp, resize:"vertical" }} /></div>
        <button type="submit" disabled={loading} style={btn("#16a34a")}>{loading?"Resolving...":"Resolve Dispute"}</button>
      </form>
    </div>
  );
}

// ─── FIELD: Order Management ──────────────────────────────────
function FieldOrdersPage({ defaultTab="create" }) {
  const [tab, setTab] = useState(defaultTab);
  const [createForm, setCreateForm] = useState({ requestId:"", serviceAccountId:"", premiseId:"", orderType:"CONNECT", scheduledDate:"" });
  const [assignForm, setAssignForm] = useState({ orderId:"", technicianName:"" });
  const [completeForm, setCompleteForm] = useState({ orderId:"", status:"COMPLETED" });
  const [loading, setLoading] = useState(false);

  const doCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { serviceOrdersApi } = await import("./api/serviceOrders.api");
      await serviceOrdersApi.createServiceOrder({ requestId:Number(createForm.requestId), serviceAccountId:Number(createForm.serviceAccountId), premiseId:Number(createForm.premiseId), orderType:createForm.orderType, scheduledDate:createForm.scheduledDate });
      toast.success("Service order created!"); setCreateForm({ requestId:"", serviceAccountId:"", premiseId:"", orderType:"CONNECT", scheduledDate:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const doAssign = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { serviceOrdersApi } = await import("./api/serviceOrders.api");
      await serviceOrdersApi.assignOrder({ orderId:Number(assignForm.orderId), technicianName:assignForm.technicianName });
      toast.success("Technician assigned!"); setAssignForm({ orderId:"", technicianName:"" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  const doComplete = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { serviceOrdersApi } = await import("./api/serviceOrders.api");
      await serviceOrdersApi.completeOrder({ orderId:Number(completeForm.orderId), status:completeForm.status });
      toast.success("Order status updated!"); setCompleteForm({ orderId:"", status:"COMPLETED" });
    } catch (err) { toast.error(err?.message||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["create","🔧 Create Order"],["assign","👤 Assign"],["complete","✅ Complete/Fail"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ border:"1px solid #d6eaf4", borderRadius:7, padding:"7px 14px", fontSize:12, cursor:"pointer", fontWeight:tab===t?700:400, background:tab===t?"#82C8E5":"#ffffff", color:tab===t?"#ffffff":"#64748b" }}>{l}</button>
        ))}
      </div>
      <div style={card}>
        {tab==="create" && (
          <form onSubmit={doCreate}>
            <h3 style={h3s}>Create Service Order</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div><label style={lbl}>Request ID *</label><input type="number" value={createForm.requestId} onChange={e=>setCreateForm({...createForm,requestId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Service Account ID *</label><input type="number" value={createForm.serviceAccountId} onChange={e=>setCreateForm({...createForm,serviceAccountId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Premise ID *</label><input type="number" value={createForm.premiseId} onChange={e=>setCreateForm({...createForm,premiseId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Order Type</label><select value={createForm.orderType} onChange={e=>setCreateForm({...createForm,orderType:e.target.value})} style={inp}><option value="CONNECT">Connect</option><option value="DISCONNECT">Disconnect</option><option value="INSPECTION">Inspection</option></select></div>
              <div><label style={lbl}>Scheduled Date *</label><input type="date" value={createForm.scheduledDate} onChange={e=>setCreateForm({...createForm,scheduledDate:e.target.value})} style={inp} required /></div>
            </div>
            <button type="submit" disabled={loading} style={btn()}>{loading?"Creating...":"Create Order"}</button>
          </form>
        )}
        {tab==="assign" && (
          <form onSubmit={doAssign}>
            <h3 style={h3s}>Assign Technician to Order</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div><label style={lbl}>Order ID *</label><input type="number" value={assignForm.orderId} onChange={e=>setAssignForm({...assignForm,orderId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Technician Name *</label><input value={assignForm.technicianName} onChange={e=>setAssignForm({...assignForm,technicianName:e.target.value})} style={inp} required /></div>
            </div>
            <button type="submit" disabled={loading} style={btn()}>{loading?"Assigning...":"Assign Technician"}</button>
          </form>
        )}
        {tab==="complete" && (
          <form onSubmit={doComplete}>
            <h3 style={h3s}>Complete or Fail Order</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div><label style={lbl}>Order ID *</label><input type="number" value={completeForm.orderId} onChange={e=>setCompleteForm({...completeForm,orderId:e.target.value})} style={inp} required /></div>
              <div><label style={lbl}>Status</label><select value={completeForm.status} onChange={e=>setCompleteForm({...completeForm,status:e.target.value})} style={inp}><option value="COMPLETED">Completed</option><option value="FAILED">Failed</option></select></div>
            </div>
            <button type="submit" disabled={loading} style={btn("#16a34a")}>{loading?"Updating...":"Update Status"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────
function NotificationsPage({ setUnreadCount }) {
  const userId = getCurrentUserId();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    import("./api/notifications.api").then(({ notificationsApi }) =>
      notificationsApi.getForUser(userId).then(r => { setNotes(r.data||[]); }).catch(()=>{}).finally(()=>setLoading(false))
    );
  }, [userId]);

  const markAll = async () => {
    const { notificationsApi } = await import("./api/notifications.api");
    await notificationsApi.markAllRead(userId).catch(()=>{});
    setNotes(p=>p.map(n=>({...n,status:"READ"}))); setUnreadCount(0);
    toast.success("All marked as read");
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontSize:12, color:"#64748b" }}>{notes.filter(n=>n.status==="UNREAD").length} unread</span>
        <button onClick={markAll} style={btn("#1e3a6e","#93c5fd")}>Mark all as read</button>
      </div>
      {loading ? <Spinner />
        : notes.length===0 ? <Empty msg="No notifications yet" />
        : notes.map((n,i)=>(
          <div key={i} style={{ background:n.status==="UNREAD"?"#e0f2fe":"#ffffff", border:`1px solid ${n.status==="UNREAD"?"#82C8E5":"#d6eaf4"}`, borderLeft:`3px solid ${n.status==="UNREAD"?"#50C878":"#d6eaf4"}`, borderRadius:10, padding:"12px 16px", marginBottom:10, display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:n.status==="UNREAD"?"#e2e8f0":"#94a3b8", fontWeight:n.status==="UNREAD"?600:400 }}>{n.message}</div>
              <div style={{ fontSize:10, color:"#475569", marginTop:3 }}>{n.category} • {n.createdAt?new Date(n.createdAt).toLocaleString():""}</div>
            </div>
            {n.status==="UNREAD" && <span style={{ width:8, height:8, borderRadius:"50%", background:"#3b82f6", flexShrink:0, display:"block" }} />}
          </div>
        ))}
    </div>
  );
}

// ─── Page title map ───────────────────────────────────────────
const TITLES = {
  dashboard:"Dashboard", approvals:"Pending Approvals", "create-agent":"Create Agent",
  "billing-mgmt":"Billing Management", "complaints-mgmt":"Complaints", "complaints-agent":"Complaints",
  reports:"Reports & Analytics", audit:"Audit Trail", notifications:"Notifications",
  "create-customer":"Create Customer", "customer-profile":"Customer 360° Profile",
  "service-accounts":"Service Accounts", "my-bills":"My Bills",
  "raise-request":"Raise Service Request", "raise-dispute":"Raise Dispute",
  "track-request":"Track Request Status", "resolve-dispute":"Resolve Dispute",
  exceptions:"Billing Exceptions", "create-order":"Create Service Order",
  "assign-order":"Assign Order", "complete-order":"Complete Order",
};

// ─── App Root ─────────────────────────────────────────────────
export default function App() {
  useIdleTimer();
  const [activePage, setActivePage] = useState("dashboard");
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount] = useState(1); // static indicator
  const role = getUserRole();
  const userId = getCurrentUserId();

  // Poll unread notifications
  useQuery({
    queryKey:["unread",userId], enabled:!!userId, retry:false, refetchInterval:30000,
    queryFn: async () => {
      const { notificationsApi } = await import("./api/notifications.api");
      const res = await notificationsApi.getUnreadCount(userId);
      setUnreadCount(res.data??0); return res.data;
    }
  });

  const renderPage = () => {
    if (activePage === "dashboard") return <DashboardPage />;

    if (activePage==="notifications") return <NotificationsPage setUnreadCount={setUnreadCount} />;
    if (activePage==="audit") return <AuditTrailPage />;
    if (activePage==="reports") return <ReportsPage />;
    if (activePage==="billing-mgmt") return <BillingMgmtPage />;
    if (activePage==="exceptions") return <BillingMgmtPage />;
    if (activePage==="complaints-mgmt"||activePage==="complaints-agent") return <ComplaintsPage />;
    if (activePage==="resolve-dispute") return <ResolveDisputePage />;

    if (role==="ADMIN") {
      if (activePage==="approvals") return <PendingApprovalsPage setPendingCount={()=>{}} />;
      if (activePage==="create-agent") return <CreateAgentPage />;
    }
    if (role==="AGENT") {
      if (activePage==="create-customer") return <CreateCustomerPage />;
      if (activePage==="customer-profile") return <CustomerProfilePage />;
      if (activePage==="service-accounts") return <ServiceAccountsPage />;
    }
    if (role==="CUSTOMER") {
      if (activePage==="my-bills") return <CustomerDashboard />;
      if (activePage==="raise-request") return <RaiseRequestPage />;
      if (activePage==="raise-dispute") return <RaiseDisputePage />;
      if (activePage==="track-request") return <TrackStatusPage />;
    }
    if (role==="BILLING_ANALYST") {
      if (activePage==="dashboard") return <BillingMgmtPage />;
    }
    if (role==="FIELD_COORDINATOR") {
      if (activePage==="create-order") return <FieldOrdersPage defaultTab="create" />;
      if (activePage==="assign-order") return <FieldOrdersPage defaultTab="assign" />;
      if (activePage==="complete-order") return <FieldOrdersPage defaultTab="complete" />;
    }
    return <div style={{ ...card, textAlign:"center", padding:40 }}><div style={{ fontSize:32, marginBottom:8 }}>🚧</div><div style={{ color:"#64748b" }}>Page not found</div></div>;
  };

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#080f1e", minHeight:"100vh", color:"#f1f5f9" }}>
      <Sidebar active={activePage} setActive={setActivePage} unreadCount={unreadCount} pendingCount={pendingCount} />
      <div style={{ marginLeft:220, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <TopBar title={TITLES[activePage]||"Dashboard"} />
        <main style={{ flex:1, padding:"20px 24px" }}>{renderPage()}</main>
      </div>
    </div>
  );
}
export { AdminDashboard, CustomerDashboard };
