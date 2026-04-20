import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/admin.api";
import { Sidebar, TopBar } from "../../components/Layout";
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
  page: { display: "flex" },
  content: { marginLeft: "var(--app-sidebar-width)", width: "100%" },
  wrap: { padding: "24px 28px 40px" },
  h2: { fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 24px" },
  h3: { fontSize: 15, fontWeight: 700, color: "#334155", margin: "0 0 16px" },
  card: { background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 24 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0 16px" },
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

export default function RBACPage() {
  const [activeTab, setActiveTab] = useState("roles");
  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState(null);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [draftRoles, setDraftRoles] = useState({});

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "",
    roleName: "ROLE_AGENT",
  });

  const availableRoleNames = useMemo(() => roles.map((r) => r.name), [roles]);

  const loadRoles = async () => {
    try {
      const res = await adminApi.getRoles();
      setRoles(res.data || []);
    } catch (err) {
      toast.error(err?.message ?? "Failed to load roles");
    }
  };

  const loadUsers = async (searchValue = "") => {
    try {
      const res = await adminApi.getUsersForRoles(searchValue);
      const list = res.data || [];
      setUsers(list);
      const nextDraft = {};
      list.forEach((u) => {
        nextDraft[u.userId] = [...(u.roles || [])];
      });
      setDraftRoles(nextDraft);
    } catch (err) {
      toast.error(err?.message ?? "Failed to load users");
    }
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  const handleCreateOrUpdateRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    setLoading(true);
    try {
      if (editingRoleId) {
        await adminApi.updateRole(editingRoleId, { name: roleName.trim() });
        toast.success("Role updated successfully");
      } else {
        await adminApi.createRole({ name: roleName.trim() });
        toast.success("Role created successfully");
      }
      setRoleName("");
      setEditingRoleId(null);
      await loadRoles();
    } catch (err) {
      toast.error(err?.message ?? "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      await adminApi.deleteRole(roleId);
      toast.success("Role deleted successfully");
      await loadRoles();
      await loadUsers(search);
    } catch (err) {
      toast.error(err?.message ?? "Failed to delete role");
    }
  };

  const toggleUserRole = (userId, roleNameValue) => {
    setDraftRoles((prev) => {
      const current = prev[userId] || [];
      const exists = current.includes(roleNameValue);
      const next = exists ? current.filter((r) => r !== roleNameValue) : [...current, roleNameValue];
      return { ...prev, [userId]: next };
    });
  };

  const saveUserRoles = async (userId) => {
    const selected = draftRoles[userId] || [];
    if (selected.length === 0) {
      toast.error("At least one role is required");
      return;
    }
    try {
      await adminApi.updateUserRoles(userId, selected);
      toast.success("User roles updated successfully");
      await loadUsers(search);
    } catch (err) {
      toast.error(err?.message ?? "Failed to update roles");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted successfully");
      await loadUsers(search);
    } catch (err) {
      toast.error(err?.message ?? "Failed to delete user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.phone || !newUser.roleName) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await adminApi.createUserWithRole(newUser);
      toast.success("User created successfully. Temporary password is Temp@123");
      setNewUser({ username: "", email: "", phone: "", roleName: "ROLE_AGENT" });
      await loadUsers(search);
    } catch (err) {
      toast.error(err?.message ?? "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={P.page}>
      <Sidebar />
      <div style={P.content}>
        <TopBar title="Admin Dashboard" />
        <div style={P.wrap}>
          <div style={{ marginBottom: 26 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Role & Permission Management</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Create roles and assign permissions to staff users</p>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[["roles", "📋 Roles"], ["assign", "👤 Assign Roles"], ["create-agent", "➕ Create User"]].map(([t, l]) => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ ...P.tabBtn, background: activeTab === t ? "#82C8E5" : "#ffffff", color: activeTab === t ? "#ffffff" : "#64748b", fontWeight: activeTab === t ? 700 : 400 }}>{l}</button>
            ))}
          </div>

          {activeTab === "roles" && (
            <div style={P.card}>
          <h3 style={P.h3}>Role Management</h3>
          <form onSubmit={handleCreateOrUpdateRole} style={{ marginBottom: 14, display: "flex", gap: 8 }}>
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Role name (example: ROLE_BILLING_ANALYST)"
              style={P.input}
            />
            <button type="submit" style={P.primaryBtn} disabled={loading}>
              {editingRoleId ? "Update" : "Create"}
            </button>
            {editingRoleId && (
              <button
                type="button"
                style={P.outlineBtn}
                onClick={() => {
                  setEditingRoleId(null);
                  setRoleName("");
                }}
              >
                Cancel
              </button>
            )}
          </form>

          {roles.length === 0 ? (
            <div style={P.empty}>No roles found</div>
          ) : (
            roles.map((role) => (
              <div key={role.id} style={{ marginBottom: 12, padding: 14, background: "#f5fbff", borderRadius: 8, border: "1px solid #cde8f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{role.name}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={P.outlineBtn}
                    onClick={() => {
                      setEditingRoleId(role.id);
                      setRoleName(role.name);
                    }}
                  >
                    Edit
                  </button>
                  <button style={P.dangerBtn} onClick={() => handleDeleteRole(role.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
            </div>
          )}

          {activeTab === "assign" && (
            <div style={P.card}>
          <h3 style={P.h3}>Assign / Revoke Roles</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username, email, role"
              style={P.input}
            />
            <button style={P.primaryBtn} onClick={() => loadUsers(search)}>Search</button>
            <button style={P.outlineBtn} onClick={() => { setSearch(""); loadUsers(""); }}>Reset</button>
          </div>

          {users.length === 0 ? (
            <div style={P.empty}>No users found</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {users.map((u) => (
                <div key={u.userId} style={{ background: "#f5fbff", border: "1px solid #cde8f4", borderRadius: 8, padding: 12 }}>
                  <div style={{ marginBottom: 8, fontSize: 13, color: "#1f2937", fontWeight: 700 }}>
                    {u.username} ({u.email})
                  </div>
                  <div style={{ marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {availableRoleNames.map((r) => (
                      <label key={r} style={{ fontSize: 12, color: "#334155", border: "1px solid #bcdff0", borderRadius: 6, padding: "4px 8px", background: "#fff" }}>
                        <input
                          type="checkbox"
                          checked={(draftRoles[u.userId] || []).includes(r)}
                          onChange={() => toggleUserRole(u.userId, r)}
                          style={{ marginRight: 6 }}
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={P.primaryBtn} onClick={() => saveUserRoles(u.userId)}>Save Roles</button>
                    <button style={P.dangerBtn} onClick={() => handleDeleteUser(u.userId)}>Delete User</button>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          )}

          {activeTab === "create-agent" && (
            <div style={P.card}>
          <h3 style={P.h3}>Provision New User</h3>
          <form onSubmit={handleCreateUser}>
            <Field label="Username" value={newUser.username} onChange={v => setNewUser({ ...newUser, username: v })} required />
            <Field label="Email" type="email" value={newUser.email} onChange={v => setNewUser({ ...newUser, email: v })} required />
            <Field label="Phone" value={newUser.phone} onChange={v => setNewUser({ ...newUser, phone: v })} required />
            <div style={{ marginBottom: 16 }}>
              <label style={P.label}>Role<span style={{ color: "#ef4444" }}> *</span></label>
              <select value={newUser.roleName} onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })} style={P.input}>
                {availableRoleNames.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Temporary password is Temp@123. User must reset password on first login.</p>
            <button type="submit" style={P.primaryBtn} disabled={loading}>{loading ? "Creating..." : "Create User"}</button>
          </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}