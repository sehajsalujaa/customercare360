import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import toast from "react-hot-toast";
// ================= FIELD =================
function Field({ label, value, onChange, type = "text", required, maxLength }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label
                style={{
                    display: "block",
                    fontSize: 11,
                    color: "#475569",
                    fontWeight: 600,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                }}
            >
                {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            <input
                type={type}
                value={value}
                required={required}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid #bcdff0",
                    borderRadius: 8,
                    color: "#1f2937",
                    padding: "10px 14px",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                }}
            />
        </div>
    );
}
// ================= BUTTON =================
function Btn({ children, loading }) {
    return (
        <button
            type="submit"
            disabled={loading}
            style={{
                width: "100%",
                background: loading ? "#cbd5f0" : "#50C878",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: 12,
            }}
        >
            {loading ? "Please wait..." : children}
        </button>
    );
}
// ================= STYLES =================
const S = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 55%, #fff8dc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)",
        border: "1px solid #cde8f4",
        borderRadius: 16,
        padding: 32,
        width: "100%",
        maxWidth: 440,
    },
    logo: {
        fontSize: 13,
        fontWeight: 800,
        color: "#1f2937",
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 24,
        textAlign: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: 800,
        color: "#1f2937",
        margin: "0 0 6px",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 13,
        color: "#64748b",
        textAlign: "center",
        marginBottom: 24,
    },
    footer: {
        fontSize: 12,
        color: "#64748b",
        textAlign: "center",
        marginTop: 8,
    },
    link: {
        color: "#50C878",
        cursor: "pointer",
        fontWeight: 600,
    },
};
// ================= MAIN =================
export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState("register");
    const [loading, setLoading] = useState(false);
    const [emailOrPhone, setEmailOrPhone] = useState("");
    // ✅ UPDATED STATE
    const [form, setForm] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        name: "",
        address: "",
        regionCode: "",
        customerType: "RESIDENTIAL",
    });
    const [otp, setOtp] = useState("");
    // ================= REGISTER =================
    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        if (!/^\d{10}$/.test(form.phone)) {
            toast.error("Phone must be exactly 10 digits");
            return;
        }
        setLoading(true);
        try {
            await authApi.register({
                username: form.username,
                email: form.email,
                phone: form.phone,
                password: form.password,
                name: form.name,
                address: form.address,
                regionCode: form.regionCode,
                customerType: form.customerType,
            });
            setEmailOrPhone(form.email || form.phone);
            toast.success("OTP sent!");
            setStep("otp");
        } catch (err) {
            toast.error(err?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };
    // ================= VERIFY OTP =================
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.verifyOtp({
                emailOrPhone,
                otp,
            });
            toast.success("Account verified. Please login.");
            navigate("/login");
        } catch (err) {
            toast.error(err?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={S.page}>
            <div style={S.card}>
                <div style={S.logo}>
                    CustomerCare<span style={{ color: "#50C878" }}>360</span>
                </div>
                <h2 style={S.title}>
                    {step === "register" ? "Create Account" : "Verify OTP"}
                </h2>
                <p style={S.subtitle}>
                    {step === "register"
                        ? "Register as a new customer"
                        : `OTP sent to ${emailOrPhone}`}
                </p>
                {step === "register" ? (
                    <form onSubmit={handleRegister}>
                        <Field
                            label="Full Name"
                            value={form.name}
                            onChange={(v) => setForm({ ...form, name: v })}
                            required
                        />
                        <Field
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={(v) => setForm({ ...form, email: v })}
                            required
                        />
                        <Field
                            label="Username"
                            value={form.username}
                            onChange={(v) => setForm({ ...form, username: v })}
                            required
                        />
                        <Field
                            label="Phone"
                            value={form.phone}
                            onChange={(v) => setForm({ ...form, phone: v })}
                            required
                            maxLength={10}
                        />
                        <Field
                            label="Address"
                            value={form.address}
                            onChange={(v) => setForm({ ...form, address: v })}
                            required
                        />
                        <Field
                            label="Region Code (TN, DL...)"
                            value={form.regionCode}
                            onChange={(v) =>
                                setForm({ ...form, regionCode: v.toUpperCase() })
                            }
                            required
                        />
                        {/* ✅ DROPDOWN */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ color: "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>
                                CUSTOMER TYPE *
                            </label>
                            <select
                                value={form.customerType}
                                onChange={(e) =>
                                    setForm({ ...form, customerType: e.target.value })
                                }
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 8,
                                    marginTop: 6,
                                    background: "#ffffff",
                                    color: "#1f2937",
                                    border: "1px solid #bcdff0",
                                    fontSize: 13,
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            >
                                <option value="RESIDENTIAL">Residential</option>
                                <option value="COMMERCIAL">Commercial</option>
                                <option value="INDUSTRIAL">Industrial</option>
                            </select>
                        </div>
                        <Field
                            label="Password"
                            type="password"
                            value={form.password}
                            onChange={(v) => setForm({ ...form, password: v })}
                            required
                        />
                        <Field
                            label="Confirm Password"
                            type="password"
                            value={form.confirmPassword}
                            onChange={(v) =>
                                setForm({ ...form, confirmPassword: v })
                            }
                            required
                        />
                        <Btn loading={loading}>Register</Btn>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <Field
                            label="Enter OTP"
                            value={otp}
                            onChange={setOtp}
                            required
                            maxLength={6}
                        />
                        <Btn loading={loading}>Verify OTP</Btn>
                    </form>
                )}
                <p style={S.footer}>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} style={S.link}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}