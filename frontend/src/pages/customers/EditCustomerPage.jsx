import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customersApi } from "../../api/customers.api";
import { adminApi } from "../../api/admin.api";
import toast from "react-hot-toast";

function Field({ label, value, onChange, type = "text", required, maxLength }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={P.label}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
      <input type={type} value={value} required={required} maxLength={maxLength}
        onChange={e => onChange(e.target.value)} style={P.input} />
    </div>
  );
}

function Btn({ children, loading }) {
  return (
    <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#1e2d4a" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 12 }}>
      {loading ? "Please wait..." : children}
    </button>
  );
}

function badge(color) {
  return { background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 };
}

const S = {
  page: { minHeight: "100vh", background: "#080f1e", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440 },
  logo: { fontSize: 13, fontWeight: 800, color: "#f1f5f9", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, textAlign: "center" },
  title: { fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
  foot: { fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 8 },
  link: { color: "#3b82f6", cursor: "pointer", fontWeight: 600 },
};

const P = {
  wrap: { padding: "0 0 40px" },
  h2: { fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 24px" },
  h3: { fontSize: 15, fontWeight: 700, color: "#334155", margin: "0 0 16px" },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 24 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" },
  label: { display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  input: { width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  tabBtn: { border: "1px solid #bcdff0", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer" },
  backBtn: { background: "none", border: "1px solid #bcdff0", color: "#475569", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, marginBottom: 20 },
  outlineBtn: { background: "#ffffff", color: "#82C8E5", border: "1px solid #82C8E5", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  primaryBtn: { background: "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  dangerBtn: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  th: { padding: "10px 14px", fontSize: 11, color: "#475569", fontWeight: 700, textAlign: "left", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #cde8f4" },
  td: { padding: "12px 14px", fontSize: 13, color: "#1f2937" },
  empty: { textAlign: "center", padding: "48px 0", color: "#64748b", fontSize: 13 },
};

export default function EditCustomerPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", phone: "", address: "", countryCode: "", regionCode: "" });
  const [deactivateReason, setDeactivateReason] = useState("");
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (id) {
      customersApi.getProfile(id)
        .then(res => {
          const c = res.data;
          setForm({
            email: c.email || c.user?.email || "",
            phone: c.phone || c.user?.phone || "",
            address: c.address || "",
            countryCode: c.countryCode || "",
            regionCode: c.regionCode || "",
          });
        })
        .catch(() => {});
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customersApi.updateContact(id, form);
      toast.success("Customer updated");
      navigate(-1);
    } catch (err) {
      toast.error(err?.message ?? "Update failed");
    } finally { setLoading(false); }
  };

  const handleDeactivate = async () => {
    if (!deactivateReason) { toast.error("Reason is required"); return; }
    setStatusLoading(true);
    try {
      await adminApi.deactivateCustomer(id, deactivateReason);
      toast.success("Customer deactivated");
      navigate(-1);
    } catch (err) {
      toast.error(err?.message ?? "Deactivation failed");
    } finally { setStatusLoading(false); }
  };

  return (
    <div style={P.wrap}>
      <button onClick={() => navigate(-1)} style={P.backBtn}>← Back</button>
      <h2 style={P.h2}>Edit Customer</h2>
      <div style={P.card}>
        <form onSubmit={handleUpdate}>
          <div style={P.grid2}>
            <Field label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
            <Field label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
            <Field label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} />
            <Field label="Country Code" value={form.countryCode} onChange={v => setForm({ ...form, countryCode: v })} required />
            <Field label="Region Code" value={form.regionCode} onChange={v => setForm({ ...form, regionCode: v })} required />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>
      <div style={{ ...P.card, marginTop: 16, borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
        <h3 style={{ ...P.h3, color: "#dc2626" }}>⚠ Danger Zone</h3>
        {!showDeactivate
          ? <button onClick={() => setShowDeactivate(true)} style={P.dangerBtn}>Deactivate Customer</button>
          : <>
            <Field label="Reason for deactivation (required)" value={deactivateReason} onChange={setDeactivateReason} required />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDeactivate} style={{ background: "#dc2626", color: "#ffffff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 }} disabled={statusLoading}>{statusLoading ? "Processing..." : "Confirm Deactivate"}</button>
              <button onClick={() => setShowDeactivate(false)} style={{ background: "#ffffff", color: "#82C8E5", border: "1px solid #82C8E5", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            </div>
          </>}
      </div>
    </div>
  );
}