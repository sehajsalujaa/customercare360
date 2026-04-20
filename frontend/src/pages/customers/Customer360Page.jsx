import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Sidebar, TopBar } from "../../components/Layout";
import { agentApi } from "../../api/agent.api";
import { customersApi } from "../../api/customers.api";
import toast from "react-hot-toast";

const card = { background: "linear-gradient(135deg, #FBF9E7 0%, #f4fbff 100%)", border: "1px solid #cde8f4", borderRadius: 12, padding: 18, boxShadow: "0 8px 20px rgba(130,200,229,0.16)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #bcdff0", background: "#ffffff", color: "#1f2937" };
const btn = { background: "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" };

const TH = { padding: "12px 14px", fontSize: 12, color: "#475569", fontWeight: 700, textAlign: "left", background: "#f5fbff", borderBottom: "1px solid #cde8f4" };
const TD = { padding: "12px 14px", fontSize: 13, color: "#1f2937", borderBottom: "1px solid #eef8ff" };

export default function CustomerProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState("customer-profile");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Enter customer ID or name");
      return;
    }

    setLoading(true);
    try {
      const res = await agentApi.getCustomers(0, 20, searchTerm);
      setCustomers(res.data?.content || res.data || []);
      if (!res.data?.content?.length && !res.data?.length) {
        toast.info("No customers found");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to search customers");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerProfile = async (customerId) => {
    setLoading(true);
    try {
      const res = await customersApi.getProfile(customerId);
      const p = res.data || {};
      setSelectedCustomer({
        ...p,
        id: p.id ?? p.customerId,
        status: p.status ?? p.customerStatus,
        address: p.address ?? p.customerAddress,
        customerType: p.customerType ?? p.type,
      });
      toast.success("Customer profile loaded");
    } catch (error) {
      toast.error(error?.message || "Failed to load customer profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCustomerProfile(id);
    }
  }, [id]);

  useEffect(() => {
    const q = searchParams.get("search");
    if (!q) return;
    setSearchTerm(q);
    const run = async () => {
      setLoading(true);
      try {
        const res = await agentApi.getCustomers(0, 20, q);
        const list = res.data?.content || res.data || [];
        setCustomers(list);
      } catch (error) {
        toast.error(error?.message || "Failed to search customers");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [searchParams]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #FBF9E7 0%, #eef9ff 100%)" }}>
      <Sidebar active={active} setActive={setActive} />
      <div style={{ marginLeft: "var(--app-sidebar-width)", flex: 1 }}>
        <TopBar title="Agent Dashboard" />
        
        <div style={{ padding: "24px 28px", display: "grid", gap: 24 }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1f2937" }}>Customer Profile 360°</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Search and view complete customer profile with billing history</p>
            </div>
          </div>
          
          {/* ────── Search Section ────── */}
          <div style={card}>
            <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>🔍 Search Customer</h3>
            <form onSubmit={handleSearch} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
              <input 
                type="text"
                placeholder="Enter Customer ID or Name" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={input} 
              />
              <button type="submit" disabled={loading} style={{ ...btn, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          {/* ────── Search Results ────── */}
          {customers.length > 0 && (
            <div style={card}>
              <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>Search Results ({customers.length})</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={TH}>ID</th>
                      <th style={TH}>Name</th>
                      <th style={TH}>Email</th>
                      <th style={TH}>Phone</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td style={TD}><strong>#{c.id}</strong></td>
                        <td style={TD}>{c.name || "-"}</td>
                        <td style={TD}>{c.email || "-"}</td>
                        <td style={TD}>{c.phone || "-"}</td>
                        <td style={TD}>
                          <span style={{ background: c.status === "ACTIVE" ? "#dcfce7" : "#fecaca", color: c.status === "ACTIVE" ? "#166534" : "#dc2626", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                            {c.status || "PENDING"}
                          </span>
                        </td>
                        <td style={TD}>
                          <button onClick={() => loadCustomerProfile(c.id)} style={{ ...btn, padding: "6px 12px", fontSize: 11 }}>
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────── Customer Profile Details ────── */}
          {selectedCustomer && (
            <div style={card}>
              <h3 style={{ color: "#1f2937", fontWeight: 800, marginBottom: 16, margin: 0 }}>📋 Customer 360° Profile</h3>
              
              {/* Profile Header */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #cde8f4" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#82C8E5", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 24, fontWeight: 800 }}>
                  {(selectedCustomer.name || "C").substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ color: "#1f2937", fontSize: 20, fontWeight: 800, margin: 0, marginBottom: 4 }}>{selectedCustomer.name || "-"}</h2>
                  <div style={{ color: "#64748b", fontSize: 13 }}>Customer ID: #{selectedCustomer.id}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>Status: <span style={{ fontWeight: 700, color: selectedCustomer.status === "ACTIVE" ? "#16a34a" : "#dc2626" }}>{selectedCustomer.status || "PENDING"}</span></div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: "#1f2937", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📧 Contact Information</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>EMAIL</div>
                    <div style={{ color: "#1f2937", fontSize: 13 }}>{selectedCustomer.email || "-"}</div>
                  </div>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>PHONE</div>
                    <div style={{ color: "#1f2937", fontSize: 13 }}>{selectedCustomer.phone || "-"}</div>
                  </div>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>ADDRESS</div>
                    <div style={{ color: "#1f2937", fontSize: 13 }}>{selectedCustomer.address || "-"}</div>
                  </div>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>CUSTOMER TYPE</div>
                    <div style={{ color: "#1f2937", fontSize: 13 }}>{selectedCustomer.customerType || "-"}</div>
                  </div>
                </div>
              </div>

              {/* Service Accounts */}
              {selectedCustomer.serviceAccounts && selectedCustomer.serviceAccounts.length > 0 && (
                <div>
                  <h4 style={{ color: "#1f2937", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>⚡ Service Accounts ({selectedCustomer.serviceAccounts.length})</h4>
                  <div style={{ display: "grid", gap: 12 }}>
                    {selectedCustomer.serviceAccounts.map((acc, i) => (
                      <div key={i} style={{ padding: 12, border: "1px solid #d6eaf4", borderRadius: 8, background: "#ffffff" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <div style={{ color: "#64748b", fontSize: 10, fontWeight: 600 }}>ACCOUNT ID</div>
                            <div style={{ color: "#1f2937", fontSize: 12, fontWeight: 600 }}>{acc.accountId || acc.id || "-"}</div>
                          </div>
                          <div>
                            <div style={{ color: "#64748b", fontSize: 10, fontWeight: 600 }}>SERVICE TYPE</div>
                            <div style={{ color: "#1f2937", fontSize: 12, fontWeight: 600 }}>{acc.serviceType || "-"}</div>
                          </div>
                          <div>
                            <div style={{ color: "#64748b", fontSize: 10, fontWeight: 600 }}>STATUS</div>
                            <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                              {acc.status || "ACTIVE"}
                            </span>
                          </div>
                          <div>
                            <div style={{ color: "#64748b", fontSize: 10, fontWeight: 600 }}>CREATED</div>
                            <div style={{ color: "#1f2937", fontSize: 12 }}>{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : "-"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!customers.length && !selectedCustomer && (
            <div style={{ ...card, textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <div style={{ color: "#64748b" }}>Search for a customer to view their 360° profile</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
