import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserRole, getStoredUser } from "../utils/auth";

// ─── Idle timer ───────────────────────────────────────────────
function useIdleTimer() {
    useEffect(() => {
        const reset = () => {
            clearTimeout(window._idle);
            window._idle = setTimeout(() => { localStorage.clear(); window.location.href = "/login"; }, 30 * 60 * 1000);
        };
        ["mousemove", "keydown", "click", "scroll"].forEach(e => window.addEventListener(e, reset));
        reset();
        return () => ["mousemove", "keydown", "click", "scroll"].forEach(e => window.removeEventListener(e, reset));
    }, []);
}

// ─── Nav config ───────────────────────────────────────────────
const NAV = {
    ADMIN: [
        { id: "dashboard", label: "Dashboard", icon: "🏠", path: "/admin/dashboard" },
        { id: "approvals", label: "Pending Approvals", icon: "✅", path: "/admin/approvals" },
        { id: "create-agent", label: "Create Staff User", icon: "👤", path: "/admin/create-agent" },
        { id: "roles", label: "Role Management", icon: "🛡️", path: "/admin/roles" },
        { id: "billing-mgmt", label: "Billing", icon: "💳", path: "/admin/bills" },
        { id: "billing-ops", label: "Billing Operations", icon: "🧮", path: "/billing/dashboard" },
        { id: "complaints-mgmt", label: "Complaints", icon: "⚖️", path: "/admin/complaints" },
        { id: "reports", label: "Reports", icon: "📊", path: "/admin/reports" },
        { id: "audit", label: "Audit Trail", icon: "🧾", path: "/admin/audit" },
        { id: "notifications", label: "Notifications", icon: "🔔", path: "/admin/notifications" }
    ],
    AGENT: [
        { id: "dashboard", label: "Dashboard", icon: "🏠", path: "/agent/dashboard" },
        { id: "create-customer", label: "Create Customer", icon: "➕", path: "/customers/new" },
        { id: "customer-profile", label: "Customer Profile", icon: "🔍", path: "/customers/profile" },
        { id: "service-accounts", label: "Service Accounts", icon: "⚡", path: "/accounts" },
        { id: "complaints-agent", label: "Complaints", icon: "⚖️", path: "/agent/complaints" },
        { id: "notifications", label: "Notifications", icon: "🔔", badge: "unread", path: "/agent/notifications" },
    ],
    CUSTOMER: [
        { id: "dashboard", label: "My Dashboard", icon: "🏠", path: "/customer/dashboard" },
        { id: "my-bills", label: "My Bills", icon: "💳", path: "/customer/dashboard" },
        { id: "raise-request", label: "Raise Request", icon: "🔧", path: "/customer/dashboard" },
        { id: "raise-dispute", label: "Raise Dispute", icon: "⚖️", path: "/customer/dashboard" },
        { id: "track-request", label: "Track Status", icon: "📍", path: "/customer/dashboard" },
        { id: "notifications", label: "Notifications", icon: "🔔", badge: "unread", path: "/customer/dashboard" },
    ],
    BILLING_ANALYST: [
        { id: "dashboard", label: "Dashboard", icon: "🏠", path: "/billing/dashboard" },
        { id: "billing-mgmt", label: "Billing Cycles", icon: "💳", path: "/billing/dashboard" },
        { id: "exceptions", label: "Exceptions", icon: "⚠️", path: "/billing/dashboard" },
        { id: "resolve-dispute", label: "Resolve Dispute", icon: "⚖️", path: "/billing/dashboard" },
        { id: "reports", label: "Reports", icon: "📊", path: "/billing/dashboard" },
        { id: "notifications", label: "Notifications", icon: "🔔", badge: "unread", path: "/billing/dashboard" },
    ],
    FIELD_COORDINATOR: [
        { id: "dashboard", label: "Dashboard", icon: "🏠", path: "/field/dashboard" },
        { id: "create-order", label: "Create Order", icon: "🔧", path: "/field/dashboard" },
        { id: "assign-order", label: "Assign Order", icon: "👤", path: "/field/dashboard" },
        { id: "complete-order", label: "Complete Order", icon: "✅", path: "/field/dashboard" },
        { id: "meter-readings", label: "Meter Readings", icon: "📊", path: "/field/dashboard" },
        { id: "notifications", label: "Notifications", icon: "🔔", badge: "unread", path: "/field/dashboard" },
    ],
};
const roleColor = { ADMIN: "#50C878", AGENT: "#82C8E5", CUSTOMER: "#50C878", BILLING_ANALYST: "#FDB813", FIELD_COORDINATOR: "#82C8E5" };

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active, setActive, unreadCount, pendingCount }) {
    const navigate = useNavigate();
    const location = useLocation();
    const role = getUserRole();
    const user = getStoredUser();
    const roleNavMap = {
        ROLE_ADMIN: NAV.ADMIN,
        ROLE_AGENT: NAV.AGENT,
        ROLE_CUSTOMER: NAV.CUSTOMER,
        ROLE_BILLING_ANALYST: NAV.BILLING_ANALYST,
        ROLE_FIELD_COORDINATOR: NAV.FIELD_COORDINATOR
    };
    const nav = roleNavMap[role] || [];
    const cleanRole = role?.replace("ROLE_", "");
    const rc = roleColor[cleanRole] || "#64748b";
    const isCustomer = role === "ROLE_CUSTOMER";
    const userName = user?.name || user?.user?.name || user?.username || user?.user?.username || (user?.email || user?.user?.email || "").split("@")[0] || "Customer";
    const userEmail = user?.email || user?.user?.email || "";
    const initialsSource = userName || userEmail || "?";
    const initials = initialsSource
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || initialsSource.substring(0, 2).toUpperCase();

    const getActiveItemFromPath = () => {
        const path = location.pathname;
        const item = nav.find(n => n.path === path);
        return item ? item.id : "dashboard";
    };

    const currentActive = active || getActiveItemFromPath();
    const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 1024 : false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        const openMenu = () => setMobileOpen(true);
        const closeMenu = () => setMobileOpen(false);
        window.addEventListener("cc360:open-sidebar", openMenu);
        window.addEventListener("cc360:close-sidebar", closeMenu);
        return () => {
            window.removeEventListener("cc360:open-sidebar", openMenu);
            window.removeEventListener("cc360:close-sidebar", closeMenu);
        };
    }, []);

    useEffect(() => {
        if (!isMobile) setMobileOpen(false);
    }, [isMobile]);

    const handleNavigate = (item) => {
        if (setActive) {
            setActive(item.id);
        }
        if (item.path) {
            navigate(item.path);
        }
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    return (
        <>
        {isMobile && mobileOpen && (
            <div
                onClick={() => setMobileOpen(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.35)", zIndex: 49 }}
            />
        )}
        <div style={{
            width: 220,
            background: "linear-gradient(180deg, #FBF9E7 0%, #f4fbff 60%, #fff7dc 100%)",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #cce7f3",
            boxShadow: "8px 0 24px rgba(130, 200, 229, 0.18)",
            zIndex: 50,
            transform: isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
            transition: "transform 0.25s ease"
        }}>
            <div style={{ padding: "18px 16px", borderBottom: "1px solid #d7edf7", position: "relative" }}>
                {isMobile && (
                    <button
                        onClick={() => setMobileOpen(false)}
                        style={{ position: "absolute", right: 10, top: 8, border: "1px solid #bcdff0", background: "#ffffff", borderRadius: 8, width: 24, height: 24, cursor: "pointer", fontSize: 12 }}
                    >✕</button>
                )}
                <div style={{ position: "absolute", right: 10, top: 10, width: 26, height: 26, borderRadius: "50%", background: "#FDB81333" }} />
                <div style={{ fontSize: 10, color: "#3f4b5a", fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>CustomerCare</div>
                <div style={{ fontSize: 19, color: "#1f2937", fontWeight: 900 }}>360°</div>
                <div style={{ marginTop: 5, display: "inline-block", background: rc + "22", color: "#1f2937", border: `1px solid ${rc}55`, borderRadius: 999, padding: "3px 10px", fontSize: 9, fontWeight: 800 }}>{isCustomer ? "Customer Portal" : role}</div>
            </div>
            <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
                {nav.map(item => {
                    const count = item.badge === "unread" ? unreadCount : item.badge === "pending" ? pendingCount : 0;
                    return (
                        <button key={item.id} onClick={() => handleNavigate(item)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 12, border: currentActive === item.id ? "1px solid #82C8E5" : "1px solid transparent", cursor: "pointer", marginBottom: 6, background: currentActive === item.id ? "linear-gradient(135deg, #82C8E533 0%, #50C8781f 100%)" : "transparent", color: currentActive === item.id ? "#1f2937" : "#475569", fontSize: 12, fontWeight: currentActive === item.id ? 700 : 500, textAlign: "left", transition: "all 0.2s ease" }}>
                            <span style={{ fontSize: 13 }}>{item.icon}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {count > 0 && <span style={{ background: "#FDB813", color: "#1f2937", borderRadius: 10, fontSize: 9, fontWeight: 800, padding: "1px 6px" }}>{count}</span>}
                        </button>
                    );
                })}
            </nav>
            <div style={{ padding: "8px" }}>
                <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ width: "100%", background: "linear-gradient(135deg, #FDB813 0%, #f7c63c 100%)", color: "#1f2937", border: "1px solid #ebbf4f", borderRadius: 10, padding: "9px 0", fontSize: 11, cursor: "pointer", fontWeight: 700, marginBottom: 6 }}>🚪 Logout</button>
                <button onClick={() => navigate("/logout-all")} style={{ width: "100%", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "#ffffff", border: "1px solid #b91c1c", borderRadius: 10, padding: "9px 0", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>🔒 Logout All Devices</button>
            </div>
            <div style={{ padding: "10px 14px 14px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #d7edf7" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: rc + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#1f2937", fontWeight: 800, border: `2px solid ${rc}66`, flexShrink: 0 }}>
                    {initials}
                </div>
                <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 11, color: "#1f2937", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
                    <div style={{ fontSize: 9, color: "#64748b" }}>{isCustomer ? "Customer Account" : role}</div>
                </div>
            </div>
        </div>
        </>
    );
}

// ─── Topbar ───────────────────────────────────────────────────
function TopBar({ title, notifications = [] }) {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 1024 : false);
    const navigate = useNavigate();

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const openSidebar = () => window.dispatchEvent(new CustomEvent("cc360:open-sidebar"));

    return (
        <div
            style={{
                padding: 15,
                borderBottom: "1px solid #cfe8f4",
                background: "linear-gradient(90deg, #FBF9E7 0%, #f5fbff 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {isMobile && (
                    <button
                        onClick={openSidebar}
                        style={{ border: "1px solid #bcdff0", background: "#ffffff", color: "#1f2937", borderRadius: 8, width: 32, height: 32, cursor: "pointer" }}
                    >☰</button>
                )}
                <h2 style={{ color: "#1f2937", fontWeight: 800, fontSize: isMobile ? 18 : 24 }}>{title}</h2>
            </div>
            {/* 🔔 NOTIFICATION BELL */}
            <div style={{ position: "relative" }}>
                <div
                    onClick={() => setOpen(!open)}
                    style={{ cursor: "pointer", fontSize: 20, background: "#82C8E526", border: "1px solid #82C8E5", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    🔔
                </div>
                {/* 🔥 COUNT BADGE */}
                {notifications.length > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: -5,
                            right: -8,
                            background: "#FDB813",
                            color: "#1f2937",
                            borderRadius: "50%",
                            padding: "2px 6px",
                            fontSize: 10,
                            fontWeight: 800,
                        }}
                    >
                        {notifications.length}
                    </span>
                )}
                {/* 🔥 DROPDOWN */}
                {open && (
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            top: 30,
                            width: isMobile ? 220 : 250,
                            background: "#FBF9E7",
                            border: "1px solid #cce7f3",
                            borderRadius: 8,
                            zIndex: 100,
                            boxShadow: "0 10px 24px rgba(130, 200, 229, 0.2)"
                        }}
                    >
                        {notifications.length === 0 ? (
                            <div style={{ padding: 10, color: "#3f4b5a" }}>No notifications</div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        navigate("/admin/approvals");
                                        setOpen(false);
                                    }}
                                    style={{
                                        padding: 10,
                                        borderBottom: "1px solid #e2eff6",
                                        cursor: "pointer",
                                        color: "#1f2937",
                                    }}
                                >
                                    {n.message}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export { Sidebar, TopBar }