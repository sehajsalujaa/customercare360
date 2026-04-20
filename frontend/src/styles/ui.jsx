// ─── Shared styles ────────────────────────────────────────────
export const card = {
 background: "linear-gradient(135deg, #FBF9E7 0%, #f5f9ff 100%)",
 border: "1px solid #82C8E5",
 borderRadius: 12,
 padding: 20,
 boxShadow: "0 8px 20px rgba(130, 200, 229, 0.15)"
};
export const h3s = {
 fontSize: 13,
 fontWeight: 700,
 color: "#1f2937",
 margin: "0 0 14px"
};
export const TH = {
 padding: "9px 13px",
 fontSize: 10,
 color: "#3f4b5a",
 fontWeight: 700,
 textAlign: "left",
 textTransform: "uppercase",
 letterSpacing: 0.8,
 borderBottom: "1px solid #d6eaf4"
};
export const TD = {
 padding: "11px 13px",
 fontSize: 12,
 color: "#334155"
};
export const lbl = {
 display: "block",
 fontSize: 10,
 color: "#3f4b5a",
 fontWeight: 600,
 marginBottom: 5,
 textTransform: "uppercase",
 letterSpacing: 0.6
};
export const inp = {
 width: "100%",
 background: "#ffffff",
 border: "1px solid #bcdff0",
 borderRadius: 7,
 color: "#1f2937",
 padding: "9px 12px",
 fontSize: 12,
 outline: "none",
 boxSizing: "border-box"
};
export const btn = (bg = "#50C878", c = "#ffffff") => ({
 background: bg,
 color: c,
 border: "none",
 borderRadius: 7,
 padding: "9px 20px",
 fontSize: 12,
 fontWeight: 700,
 cursor: "pointer"
});

// ─── Components ───────────────────────────────────────────────
export function Badge({ text, color = "#3b82f6" }) {
 return (
<span
     style={{
       background: color + "22",
       color,
       border: `1px solid ${color}44`,
       borderRadius: 5,
       padding: "2px 8px",
       fontSize: 10,
       fontWeight: 700
     }}
>
     {text}
</span>
 );
}
export function Stat({ label, value, icon, color, loading }) {
 return (
<div style={{ ...card, borderLeft: `3px solid ${color}` }}>
<div style={{ display: "flex", justifyContent: "space-between" }}>
<div>
<div
           style={{
             fontSize: 9,
             color: "#3f4b5a",
             fontWeight: 700,
             textTransform: "uppercase",
             letterSpacing: 1
           }}
>
           {label}
</div>
<div
           style={{
             fontSize: 24,
             fontWeight: 800,
             color: "#1f2937",
             marginTop: 3
           }}
>
           {loading ? "..." : value}
</div>
</div>
<span style={{ fontSize: 20 }}>{icon}</span>
</div>
</div>
 );
}
export function Empty({ msg }) {
 return (
<div style={{ textAlign: "center", padding: "30px 0", color: "#3f4b5a", fontSize: 12 }}>
     📭 {msg}
</div>
 );
}
export function Spinner() {
 return (
<div style={{ textAlign: "center", padding: "30px 0", color: "#3f4b5a", fontSize: 12 }}>
     ⏳ Loading...
</div>
 );
}

// ─── Helpers ──────────────────────────────────────────────────
export function statusColor(s) {
 const m = {
   GENERATED: "#50C878",
   ACTIVE: "#50C878",
   RESOLVED: "#50C878",
   COMPLETED: "#50C878",
   SUCCESS: "#50C878",
   PENDING: "#FDB813",
   OPEN: "#FDB813",
   RUNNING: "#FDB813",
   FAILED: "#d9534f",
   LOCKED: "#d9534f",
   INACTIVE: "#d9534f",
   ADJUSTED: "#82C8E5",
   CLOSED: "#64748b"
 };
 return m[(s || "").toUpperCase()] || "#94a3b8";
}
