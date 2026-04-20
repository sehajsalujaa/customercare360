import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const handleReset = async () => {
        if (!password) { toast.error("Please enter a new password"); return; }
        if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        if (password !== confirm) { toast.error("Passwords do not match"); return; }
        setLoading(true);
        try {
            await axiosClient.post("/auth/reset-password", { newPassword: password });
            toast.success("Password updated!");
            // Clear firstLogin flag from stored user
            const user = JSON.parse(localStorage.getItem("cc360_user") || "{}");
            localStorage.setItem("cc360_user", JSON.stringify({ ...user, firstLogin: false }));
            navigate("/admin/dashboard");
        } catch (e) {
            toast.error(e?.message ?? "Error resetting password");
        } finally {
            setLoading(false);
        }
    };
    const S = {
        page: { minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 55%, #fff8dc 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
        card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 16, padding: 32, width: "100%", maxWidth: 400 },
        logo: { fontSize: 13, fontWeight: 800, color: "#1f2937", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, textAlign: "center" },
        title: { fontSize: 22, fontWeight: 800, color: "#1f2937", margin: "0 0 6px", textAlign: "center" },
        subtitle: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 },
        lbl: { display: "block", fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
        inp: { width: "100%", background: "#ffffff", border: "1px solid #bcdff0", borderRadius: 8, color: "#1f2937", padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" },
        field: { marginBottom: 16 },
    };
    return (
        <div style={S.page}>
            <div style={S.card}>
                <div style={S.logo}>CustomerCare<span style={{ color: "#50C878" }}>360°</span></div>
                <h2 style={S.title}>Set New Password</h2>
                <p style={S.subtitle}>Choose a new password for your account</p>
                <div style={S.field}>
                    <label style={S.lbl}>New Password <span style={{ color: "#ef4444" }}>*</span></label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters" style={S.inp} />
                </div>
                <div style={S.field}>
                    <label style={S.lbl}>Confirm Password <span style={{ color: "#ef4444" }}>*</span></label>
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repeat new password" style={S.inp} />
                </div>
                <button onClick={handleReset} disabled={loading}
                    style={{ width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </div>
        </div>
    );
}
