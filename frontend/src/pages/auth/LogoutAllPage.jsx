import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
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
    <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 12 }}>
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
  h2: { fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: "0 0 24px" },
  h3: { fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 24 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" },
  label: { display: "block", fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  input: { width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  tabBtn: { border: "1px solid #1e2d4a", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer" },
  backBtn: { background: "none", border: "1px solid #1e2d4a", color: "#94a3b8", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, marginBottom: 20 },
  outlineBtn: { background: "#1e3a6e", color: "#93c5fd", border: "1px solid #2d4f8e", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  primaryBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  dangerBtn: { background: "#3d1a1a", color: "#f87171", border: "1px solid #7f1d1d", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  th: { padding: "10px 14px", fontSize: 11, color: "#475569", fontWeight: 700, textAlign: "left", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #1e2d4a" },
  td: { padding: "12px 14px", fontSize: 13, color: "#94a3b8" },
  empty: { textAlign: "center", padding: "48px 0", color: "#475569", fontSize: 13 },
};

export default function LogoutAllPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogoutAll = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("cc360_user") || "{}");
      const email = user?.email || "";
      if (!email) {
        toast.error("User email not found");
        return;
      }
      await authApi.logoutAll(email);
      localStorage.clear();
      toast.success("Logged out from all devices");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message ?? "Failed to logout from all devices");
    } finally { setLoading(false); }
  };

  const styles = {
    page: { minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 55%, #fff8dc 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
    card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440 },
    title: { fontSize: 22, fontWeight: 800, color: "#1f2937", margin: "0 0 6px", textAlign: "center" },
    subtitle: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
    link: { fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 8 },
    linkSpan: { color: "#50C878", cursor: "pointer", fontWeight: 600 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>🔒</div>
        <h2 style={styles.title}>Logout All Devices</h2>
        <p style={styles.subtitle}>This will invalidate all active sessions including this one.</p>
        <button onClick={handleLogoutAll} disabled={loading} style={{ width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 12 }}>{loading ? "Processing..." : "Logout All Devices"}</button>
        <p style={styles.link}><span onClick={() => navigate(-1)} style={styles.linkSpan}>Cancel</span></p>
      </div>
    </div>
  );
}