import { useState } from "react";
import { Sidebar, TopBar } from "../../components/Layout";
import { adminApi } from "../../api/admin.api";
import toast from "react-hot-toast";
const styles = {
    wrapper: {
        height: "calc(100vh - 60px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)",
        border: "1px solid #cde8f4",
        borderRadius: 16,
        padding: 32,
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 10px 30px rgba(130, 200, 229, 0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
     field: {
   display: "flex",
   flexDirection: "column",
   gap: "5px",
 },
 label: {
   color: "#475569",
   fontSize: "13px",
   fontWeight: "500",
 },
 required: {
   color: "#ef4444",
   marginLeft: "2px",
 },
 input: {
   padding: "10px",
   borderRadius: "6px",
   border: "1px solid #bcdff0",
   background: "#ffffff",
   color: "#1f2937",
   outline: "none",
 },
    title: {
        color: "#1f2937",
        marginBottom: "5px",
    },
    subtitle: {
        color: "#64748b",
        fontSize: "14px",
        marginBottom: "10px",
    },
    button: {
        marginTop: "10px",
        padding: "12px",
        borderRadius: "6px",
        border: "none",
        background: "#50C878",
        color: "#ffffff",
        fontWeight: "600",
        cursor: "pointer",
    },
};
export default function CreateAgentPage() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        phone: "",
        roleName: "ROLE_AGENT"
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
        if (!form.username || !form.email || !form.phone || !form.roleName) {
            toast.error("Please fill all required fields");
            return;
        }
        try {
            await adminApi.createUserWithRole(form);
            toast.success("User created successfully");
            setForm({ username: "", email: "", phone: "", roleName: "ROLE_AGENT" });
        } catch (err) {
            console.error(err);
            toast.error(err?.message ?? "Error creating user");
        }
    };
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ marginLeft: "var(--app-sidebar-width)", width: "100%" }}>
                <TopBar title="Admin Dashboard" />
                <div style={styles.wrapper}>
                    <div style={styles.card}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Create Staff User</h3>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Create Agent, Billing Analyst, or Field Coordinator accounts</p>
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Username <span style={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            style={styles.input}
                        />
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Email <span style={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            name="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleChange}
                            style={styles.input}
                        />
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Phone <span style={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            name="phone"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            style={styles.input}
                        />
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Role <span style={styles.required}>*</span>
                            </label>
                        </div>
                        <select
                            name="roleName"
                            value={form.roleName}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="ROLE_AGENT">Agent</option>
                            <option value="ROLE_BILLING_ANALYST">Billing Analyst</option>
                            <option value="ROLE_FIELD_COORDINATOR">Field Coordinator</option>
                        </select>
                        <button onClick={handleSubmit} style={styles.button}>
                            Create User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}