import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import toast from "react-hot-toast";

function Field({ label, value, onChange, type = "text", required, maxLength }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <input
        type={type} value={value} required={required} maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

function Btn({ children, loading }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff",
      border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700,
      cursor: loading ? "not-allowed" : "pointer", marginBottom: 12,
    }}>
      {loading ? "Please wait..." : children}
    </button>
  );
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 55%, #fff8dc 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440 },
  logo: { fontSize: 13, fontWeight: 800, color: "#1f2937", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, textAlign: "center" },
  title: { fontSize: 22, fontWeight: 800, color: "#1f2937", margin: "0 0 6px", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
  foot: { fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 8 },
  link: { color: "#50C878", cursor: "pointer", fontWeight: 600 },
  toggleBtn: { flex: 1, border: "1px solid #bcdff0", borderRadius: 8, padding: "8px 0", fontSize: 12, cursor: "pointer", fontWeight: 600 },
};


export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [form, setForm] = useState({ otpCode: "", newPassword: "", confirmPassword: "" });

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ForgotPasswordRequestDto: { emailOrPhone }
      await authApi.forgotPassword({ emailOrPhone });
      toast.success("OTP sent successfully!");
      setStep("reset");
    } catch (err) {
      toast.error(err?.message ?? "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match"); return;
    }
    if (form.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters"); return;
    }
    setLoading(true);
    try {
      // ResetPasswordRequestDto: { emailOrPhone, otpCode, newPassword }
      await authApi.resetPassword({
        emailOrPhone,
        otpCode: form.otpCode,
        newPassword: form.newPassword,
      });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message ?? "Reset failed. OTP may have expired.");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>CustomerCare<span style={{ color: "#50C878" }}>360°</span></div>
        <h2 style={S.title}>{step === "request" ? "Forgot Password" : "Reset Password"}</h2>
        <p style={S.subtitle}>
          {step === "request" ? "Enter your registered email or phone" : "Enter OTP and your new password"}
        </p>

        {step === "request" ? (
          <form onSubmit={handleRequest}>
            <Field label="Email or Phone" value={emailOrPhone} onChange={setEmailOrPhone} required />
            <Btn loading={loading}>Send OTP</Btn>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <Field label="OTP Code" value={form.otpCode} onChange={v => setForm({ ...form, otpCode: v })} maxLength={6} required />
            <Field label="New Password" type="password" value={form.newPassword} onChange={v => setForm({ ...form, newPassword: v })} required />
            <Field label="Confirm New Password" type="password" value={form.confirmPassword} onChange={v => setForm({ ...form, confirmPassword: v })} required />
            <Btn loading={loading}>Reset Password</Btn>
          </form>
        )}
        <p style={S.foot}><span onClick={() => navigate("/login")} style={S.link}>← Back to Login</span></p>
      </div>
    </div>
  );
}