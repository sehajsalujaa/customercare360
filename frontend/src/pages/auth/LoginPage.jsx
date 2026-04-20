// src/pages/auth/LoginPage.jsx — REPLACE ENTIRE FILE
// Email-only login, show/hide password, no API hints shown to user
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/auth.api";

function decodeJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); }
  catch { return {}; }
}

function getHomePathFromRoles(roles = []) {
  // Always redirect to /home for the personalized landing page
  return "/home";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      // LoginRequestDto: { email, phone, password }
      // phone is null when using email login
      const res = await authApi.login({ email, password });
      const { accessToken, refreshToken } = res.data;

      localStorage.setItem("cc360_access_token", accessToken);
      localStorage.setItem("cc360_refresh_token", refreshToken);

      const decoded = decodeJwt(accessToken);

      const user = {
        userId: decoded.userId || decoded.id || null,
        email: decoded.email || decoded.sub,
        name: decoded.name || decoded.sub,
        role: decoded.role || decoded.roles?.[0],
        firstLogin: decoded.firstLogin || false
      };

      let roles = [];
      if (decoded.roles) {
        roles = decoded.roles;
      } else if (decoded.authorities) {
        roles = decoded.authorities;
      } else if (decoded.role) {
        roles = [decoded.role];
      } else {
        roles = ["ROLE_CUSTOMER"];
      }

      localStorage.setItem("cc360_user", JSON.stringify({ ...user, roles }));
      toast.success("Login successful!");

      if (user.firstLogin) {
        navigate("/reset-password");
      } else {
        navigate(getHomePathFromRoles(roles));
      }
    } catch (err) {
      toast.error(err?.message ?? "Invalid email or password");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>CustomerCare<span style={{ color: "#50C878" }}>360°</span></div>
        <h2 style={S.title}>Welcome Back</h2>
        <p style={S.subtitle}>Sign in to your account</p>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={S.field}>
            <label style={S.label}>Email Address <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="you@example.com" style={S.input}
              autoComplete="email"
            />
          </div>

          {/* Password with show/hide */}
          <div style={S.field}>
            <label style={S.label}>Password <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="Enter your password"
                style={{ ...S.input, paddingRight: 42 }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 15, padding: 0, lineHeight: 1 }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <span onClick={() => navigate("/forgot-password")} style={S.link}>Forgot password?</span>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", background: loading ? "#cbd5f0" : "#50C878",
            color: "#ffffff", border: "none", borderRadius: 8, padding: "12px 0",
            fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 12,
          }}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p style={S.foot}>
          No account? <span onClick={() => navigate("/register")} style={S.link}>Register here</span>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 55%, #fff8dc 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: 32, width: "100%", maxWidth: 400 },
  logo: { fontSize: 12, fontWeight: 800, color: "#1f2937", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20, textAlign: "center" },
  title: { fontSize: 22, fontWeight: 800, color: "#1f2937", margin: "0 0 4px", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  input: { width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  foot: { fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 8 },
  link: { color: "#50C878", cursor: "pointer", fontWeight: 600 },
};
