import { useState } from "react";
import { customersApi } from "../../api/customers.api";
import toast from "react-hot-toast";
/* ---------- Reusable Field ---------- */
function Field({ label, value, onChange, type = "text", required }) {
 return (
<div style={{ marginBottom: 16 }}>
<label style={P.label}>
       {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
</label>
<input
       type={type}
       value={value}
       required={required}
       onChange={(e) => onChange(e.target.value)}
       style={P.input}
     />
</div>
 );
}
/* ---------- Styles ---------- */
const P = {
 wrap: { padding: "20px" },
 h2: { fontSize: 22, fontWeight: 800, color: "#1f2937", marginBottom: 20 },
 h3: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
 card: {
   background: "linear-gradient(135deg, #FBF9E7 0%, #f5fbff 100%)",
   border: "1px solid #cde8f4",
   borderRadius: 12,
   padding: 20,
 },
 grid2: {
   display: "grid",
   gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
   gap: "16px",
 },
 label: {
   display: "block",
   fontSize: 12,
   color: "#475569",
   marginBottom: 6,
 },
 input: {
   width: "100%",
   padding: "10px",
   borderRadius: 8,
   border: "1px solid #bcdff0",
   background: "#ffffff",
   color: "#1f2937",
 },
 tabBtn: {
   padding: "8px 16px",
   borderRadius: 8,
   border: "1px solid #bcdff0",
   cursor: "pointer",
 },
 primaryBtn: {
   marginTop: 12,
   padding: "10px",
   background: "#50C878",
   border: "none",
   borderRadius: 8,
   color: "#ffffff",
   cursor: "pointer",
   fontWeight: 700,
 },
};
export default function ServiceAccountPage() {
 const [activeTab, setActiveTab] = useState("create-account");
 const [loading, setLoading] = useState(false);
 const [accountForm, setAccountForm] = useState({
   customerId: "",
   serviceType: "Electric",
   startDate: "",
 });
 const [premiseForm, setPremiseForm] = useState({
   accountId: "",
   address: "",
   meterId: "",
   region: "",
 });
 const [agreementForm, setAgreementForm] = useState({
   accountId: "",
   termStart: "",
   termEnd: "",
   tariffCode: "",
   notes: "",
 });
 /* ---------- CREATE ACCOUNT ---------- */
 const handleCreateAccount = async (e) => {
   e.preventDefault();
   setLoading(true);
   try {
     await customersApi.createServiceAccount({
       customerId: accountForm.customerId,
       serviceType: accountForm.serviceType,
       startDate: accountForm.startDate,
     });
     toast.success("Service account created!");
     setAccountForm({ customerId: "", serviceType: "Electric", startDate: "" });
   } catch (err) {
     toast.error(err?.response?.data?.message || "Failed to create account");
   } finally {
     setLoading(false);
   }
 };
 /* ---------- LINK PREMISE ---------- */
 const handleLinkPremise = async (e) => {
   e.preventDefault();
   setLoading(true);
   try {
     await customersApi.linkPremise({
       serviceAccountId: premiseForm.accountId,
       address: premiseForm.address,
       meterId: premiseForm.meterId,
       region: premiseForm.region,
     });
     toast.success("Premise linked successfully!");
     setPremiseForm({ accountId: "", address: "", meterId: "", region: "" });
   } catch (err) {
     toast.error(err?.response?.data?.message || "Failed to link premise");
   } finally {
     setLoading(false);
   }
 };
 /* ---------- AGREEMENT ---------- */
 const handleAgreement = async (e) => {
   e.preventDefault();
   setLoading(true);
   try {
     await customersApi.recordAgreement({
       serviceAccountId: agreementForm.accountId,
       termStartDate: agreementForm.termStart,
       termEndDate: agreementForm.termEnd,
       tariffCode: agreementForm.tariffCode,
       specialNotes: agreementForm.notes,
     });
     toast.success("Agreement saved!");
     setAgreementForm({
       accountId: "",
       termStart: "",
       termEnd: "",
       tariffCode: "",
       notes: "",
     });
   } catch (err) {
     toast.error(err?.response?.data?.message || "Failed to save agreement");
   } finally {
     setLoading(false);
   }
 };
 return (
<div style={P.wrap}>
<h2 style={P.h2}>Service Accounts & Agreements</h2>
     {/* Tabs */}
<div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
       {[
         ["create-account", "Create Account"],
         ["link-premise", "Link Premise"],
         ["agreement", "Agreement"],
       ].map(([key, label]) => (
<button
           key={key}
           onClick={() => setActiveTab(key)}
           style={{
             ...P.tabBtn,
             background: activeTab === key ? "#82C8E5" : "#ffffff",
             color: activeTab === key ? "#93c5fd" : "#64748b",
           }}
>
           {label}
</button>
       ))}
</div>
<div style={P.card}>
       {/* CREATE ACCOUNT */}
       {activeTab === "create-account" && (
<form onSubmit={handleCreateAccount}>
<h3 style={P.h3}>Create Service Account</h3>
<div style={P.grid2}>
<Field
               label="Customer ID"
               value={accountForm.customerId}
               onChange={(v) =>
                 setAccountForm({ ...accountForm, customerId: v })
               }
               required
             />
<div>
<label style={P.label}>Service Type</label>
<select
                 value={accountForm.serviceType}
                 onChange={(e) =>
                   setAccountForm({
                     ...accountForm,
                     serviceType: e.target.value,
                   })
                 }
                 style={P.input}
>
<option>Electric</option>
<option>Gas</option>
<option>Water</option>
</select>
</div>
<Field
               label="Start Date"
               type="date"
               value={accountForm.startDate}
               onChange={(v) =>
                 setAccountForm({ ...accountForm, startDate: v })
               }
               required
             />
</div>
<button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
             {loading ? "Creating..." : "Create Account"}
</button>
</form>
       )}
       {/* LINK PREMISE */}
       {activeTab === "link-premise" && (
<form onSubmit={handleLinkPremise}>
<h3 style={P.h3}>Link Premise</h3>
<div style={P.grid2}>
<Field
               label="Account ID"
               value={premiseForm.accountId}
               onChange={(v) =>
                 setPremiseForm({ ...premiseForm, accountId: v })
               }
               required
             />
<Field
               label="Address"
               value={premiseForm.address}
               onChange={(v) =>
                 setPremiseForm({ ...premiseForm, address: v })
               }
               required
             />
<Field
               label="Meter ID"
               value={premiseForm.meterId}
               onChange={(v) =>
                 setPremiseForm({ ...premiseForm, meterId: v })
               }
             />
<Field
               label="Region"
               value={premiseForm.region}
               onChange={(v) =>
                 setPremiseForm({ ...premiseForm, region: v })
               }
               required
             />
</div>
<button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
             {loading ? "Linking..." : "Link Premise"}
</button>
</form>
       )}
       {/* AGREEMENT */}
       {activeTab === "agreement" && (
<form onSubmit={handleAgreement}>
<h3 style={P.h3}>Service Agreement</h3>
<div style={P.grid2}>
<Field
               label="Account ID"
               value={agreementForm.accountId}
               onChange={(v) =>
                 setAgreementForm({ ...agreementForm, accountId: v })
               }
               required
             />
<Field
               label="Tariff Code"
               value={agreementForm.tariffCode}
               onChange={(v) =>
                 setAgreementForm({ ...agreementForm, tariffCode: v })
               }
             />
<Field
               label="Start Date"
               type="date"
               value={agreementForm.termStart}
               onChange={(v) =>
                 setAgreementForm({ ...agreementForm, termStart: v })
               }
               required
             />
<Field
               label="End Date"
               type="date"
               value={agreementForm.termEnd}
               onChange={(v) =>
                 setAgreementForm({ ...agreementForm, termEnd: v })
               }
               required
             />
</div>
<div style={{ marginTop: 10 }}>
<label style={P.label}>Notes</label>
<textarea
               value={agreementForm.notes}
               onChange={(e) =>
                 setAgreementForm({
                   ...agreementForm,
                   notes: e.target.value,
                 })
               }
               style={{ ...P.input, height: 80 }}
             />
</div>
<button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#cbd5f0" : "#50C878", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
             {loading ? "Saving..." : "Save Agreement"}
</button>
</form>
       )}
</div>
</div>
 );
}