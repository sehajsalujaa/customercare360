import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, TopBar } from "../../components/Layout";
import { customersApi } from "../../api/customers.api";
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

const P = {
  wrap: { padding: "0 0 40px" },
  h2: { fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 24px" },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 24 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0 16px" },
  label: { display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  input: { width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" },
};

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("create-customer");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "", name: "", email: "", phone: "", password: "",
    address: "", customerType: "RESIDENTIAL", countryCode: "", regionCode: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        username: form.username?.trim(),
        name: form.name?.trim(),
        email: form.email?.trim(),
        phone: form.phone?.trim(),
        address: form.address?.trim(),
        countryCode: form.countryCode?.trim()?.toUpperCase(),
        regionCode: form.regionCode?.trim()?.toUpperCase(),
        customerType: form.customerType?.trim()?.toUpperCase(),
      };
      const res = await customersApi.create(payload);
      toast.success(typeof res?.data === "string" ? res.data : "Customer created successfully");
      const customerId = res?.data?.customerId || res?.data?.id;
      if (customerId) navigate(`/customers/${customerId}`);
      else navigate("/agent/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to create customer";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
      <Sidebar active={active} setActive={setActive} />
      <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1 }}>
        <TopBar title="Agent Dashboard" />
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Create New Customer</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Register a new customer account with service details</p>
            </div>
          </div>
          <div style={P.card}>
            <h2 style={{ ...P.h2, margin: 0, marginBottom: 24 }}>Customer Information</h2>
            <form onSubmit={handleSubmit}>
              <div style={P.grid2}>
                <Field label="Username" value={form.username} onChange={v => setForm({ ...form, username: v })} required />
                <Field label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
                <Field label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
                <Field label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
                <Field label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} required />
                <Field label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} />
                <div style={{ marginBottom: 16 }}>
                  <label style={P.label}>Customer Type</label>
                  <select value={form.customerType} onChange={e => setForm({ ...form, customerType: e.target.value })} style={P.input}>
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                  </select>
                </div>
                <Field label="Country Code" value={form.countryCode} onChange={v => setForm({ ...form, countryCode: v })} required />
                <Field label="Region Code" value={form.regionCode} onChange={v => setForm({ ...form, regionCode: v })} required />
              </div>
              <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 24 }}>
                {loading ? "Creating..." : "✓ Create Customer"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}