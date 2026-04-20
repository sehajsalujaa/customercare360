import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// ── Animations ────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes fadeUp   { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;} to{opacity:1;} }
  @keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
  @keyframes slideL   { from{opacity:0;transform:translateX(-36px);} to{opacity:1;transform:translateX(0);} }
  @keyframes slideR   { from{opacity:0;transform:translateX(36px);}  to{opacity:1;transform:translateX(0);} }
  @keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(80,200,120,0.35);} 70%{box-shadow:0 0 0 14px rgba(80,200,120,0);} }
  @keyframes ticker   { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }

  .ani-up    { animation: fadeUp  0.65s ease-out both; }
  .ani-in    { animation: fadeIn  0.5s  ease-out both; }
  .ani-float { animation: float   4s    ease-in-out infinite; }
  .ani-l     { animation: slideL  0.65s ease-out both; }
  .ani-r     { animation: slideR  0.65s ease-out both; }
  .ani-pulse { animation: pulse   2s    ease-in-out infinite; }

  .service-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(130,200,229,0.25)!important; }
  .service-card       { transition:all 0.3s ease; }
  .benefit-card:hover { border-color:#82C8E5!important; }
  .benefit-card       { transition:all 0.3s ease; }
  .nav-btn:hover      { transform:scale(1.04); }
  .nav-btn            { transition:all 0.2s ease; }
  .cta-btn:hover      { transform:scale(1.05); box-shadow:0 14px 36px rgba(80,200,120,0.45)!important; }
  .cta-btn            { transition:all 0.25s ease; }
  .sec-btn:hover      { background:#f0f9ff!important; border-color:#82C8E5!important; }
  .sec-btn            { transition:all 0.2s ease; }
  .ticker-wrap        { overflow:hidden; white-space:nowrap; }
  .ticker-inner       { display:inline-flex; animation:ticker 28s linear infinite; }
  .step-num           { transition:all 0.3s ease; }
  .step-row:hover .step-num { background:linear-gradient(135deg,#50C878,#82C8E5)!important; color:#fff!important; }
`;
if (typeof window !== "undefined" && !document.getElementById("lp-css")) {
  const s = document.createElement("style"); s.id = "lp-css"; s.textContent = CSS;
  document.head.appendChild(s);
}

const G = { green:"#50C878", blue:"#82C8E5", gold:"#FDB813", red:"#ef4444",
            purple:"#a78bfa", text:"#1f2937", muted:"#475569", light:"#64748b",
            bg:"linear-gradient(145deg,#FBF9E7 0%,#eef9ff 60%,#fff8e8 100%)",
            card:"linear-gradient(135deg,#FBF9E7 0%,#f5fbff 100%)",
            border:"#cde8f4" };

function NavBar() {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(251,249,231,0.94)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${G.border}` : "none",
      padding:"14px 5%", display:"flex", justifyContent:"space-between", alignItems:"center",
      transition:"all 0.3s ease",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:38, height:38, background:"linear-gradient(135deg,#50C878,#82C8E5)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⚡</div>
        <div>
          <div style={{ fontSize:10, color:G.muted, fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>CustomerCare</div>
          <div style={{ fontSize:18, color:G.text, fontWeight:900, lineHeight:1 }}>360°</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:28, alignItems:"center" }}>
        {[["Your Services","#services"],["Support","#support"],["FAQ","#faq"]].map(([label, href]) => (
          <a key={label} href={href}
            style={{ color:G.muted, fontSize:13, fontWeight:600, textDecoration:"none", transition:"color 0.2s" }}
            onMouseEnter={e=>e.target.style.color=G.green}
            onMouseLeave={e=>e.target.style.color=G.muted}>{label}</a>
        ))}
        <button className="nav-btn" onClick={() => nav("/register")}
          style={{ background:"transparent", color:G.text, border:`1.5px solid ${G.border}`, borderRadius:10, padding:"9px 20px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
          Sign Up
        </button>
        <button className="nav-btn" onClick={() => nav("/login")}
          style={{ background:"linear-gradient(135deg,#50C878,#3fb967)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", fontWeight:800, cursor:"pointer", fontSize:13 }}>
          Login →
        </button>
      </div>
    </nav>
  );
}

function Ticker() {
  const items = ["💡 View your bills anytime","⚡ Track your electricity usage","💧 Water & gas in one place","📩 Get instant alerts","⚖️ Raise billing disputes easily","📋 Manage your service requests","✅ Pay & stay on top of your account"];
  const all = [...items, ...items];
  return (
    <div className="ticker-wrap" style={{ background:`${G.green}15`, borderTop:`1px solid ${G.green}30`, borderBottom:`1px solid ${G.green}30`, padding:"11px 0" }}>
      <div className="ticker-inner">
        {all.map((t,i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, marginRight:52, fontSize:12, color:G.muted, fontWeight:600 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, desc, color, delay="0s", tag }) {
  return (
    <div className="service-card ani-up" style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:18, padding:28, boxShadow:"0 6px 24px rgba(130,200,229,0.1)", animationDelay:delay, position:"relative", overflow:"hidden" }}>
      {tag && <div style={{ position:"absolute", top:14, right:14, background:`${color}22`, color, border:`1px solid ${color}55`, borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:800 }}>{tag}</div>}
      <div style={{ width:54, height:54, borderRadius:16, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, marginBottom:16 }}>{icon}</div>
      <div style={{ fontWeight:800, fontSize:15, color:G.text, marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:13, color:G.light, lineHeight:1.75 }}>{desc}</div>
    </div>
  );
}

function BenefitItem({ icon, title, desc }) {
  return (
    <div className="benefit-card" style={{ display:"flex", gap:18, padding:"20px 22px", border:`1px solid ${G.border}`, borderRadius:14, background:"rgba(255,255,255,0.5)" }}>
      <div style={{ flexShrink:0, width:46, height:46, borderRadius:12, background:`${G.blue}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{icon}</div>
      <div>
        <div style={{ fontWeight:800, fontSize:14, color:G.text, marginBottom:4 }}>{title}</div>
        <div style={{ fontSize:13, color:G.light, lineHeight:1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:`1px solid ${G.border}`, borderRadius:12, overflow:"hidden", marginBottom:10 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:"100%", textAlign:"left", padding:"16px 20px", background: open?"#f0f9ff":"rgba(255,255,255,0.5)", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontWeight:700, fontSize:14, color:G.text }}>
        {q}
        <span style={{ fontSize:18, color:G.blue, transition:"transform 0.2s", transform:open?"rotate(45deg)":"none" }}>+</span>
      </button>
      {open && (
        <div style={{ padding:"14px 20px", background:"#f8fffe", fontSize:13, color:G.light, lineHeight:1.75, borderTop:`1px solid ${G.border}` }}>
          {a}
        </div>
      )}
    </div>
  );
}

function Step({ n, icon, label }) {
  return (
    <div className="step-row" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, flex:1 }}>
      <div className="step-num" style={{ width:56, height:56, borderRadius:"50%", background:`${G.green}18`, border:`2px solid ${G.green}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{icon}</div>
      <div style={{ fontWeight:800, fontSize:12, color:G.text, textAlign:"center" }}>Step {n}</div>
      <div style={{ fontSize:12, color:G.light, textAlign:"center", lineHeight:1.6 }}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div style={{ background:G.bg, minHeight:"100vh", color:G.text, fontFamily:"system-ui,sans-serif" }}>
      <NavBar />

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", padding:"0 5%", paddingTop:80 }}>
        <div className="rg-2" style={{ width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
          <div className="ani-l">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#50C87818", border:"1px solid #50C87855", borderRadius:30, padding:"6px 16px", fontSize:11, fontWeight:800, color:G.green, marginBottom:22, textTransform:"uppercase", letterSpacing:1.2 }}>
              🌟 Your Utility Portal
            </div>
            <h1 style={{ fontSize:"clamp(32px,4vw,54px)", fontWeight:900, lineHeight:1.18, margin:"0 0 18px", color:G.text }}>
              Manage Your<br />
              <span style={{ background:"linear-gradient(90deg,#50C878,#82C8E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Utility Services</span><br />
              All in One Place
            </h1>
            <p style={{ fontSize:15, color:G.light, lineHeight:1.85, maxWidth:480, marginBottom:36 }}>
              View your bills, track your energy and water usage, raise a complaint, or request a service. CustomerCare360 puts you in control of your electricity, gas, and water accounts from any device.
            </p>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:40 }}>
              <button className="cta-btn ani-pulse" onClick={() => nav("/register")}
                style={{ background:"linear-gradient(135deg,#50C878,#3fb967)", color:"#fff", border:"none", borderRadius:12, padding:"14px 34px", fontWeight:800, cursor:"pointer", fontSize:15, boxShadow:"0 8px 24px rgba(80,200,120,0.3)" }}>
                🚀 Create Free Account
              </button>
              <button className="sec-btn" onClick={() => nav("/login")}
                style={{ background:"#fff", color:G.text, border:`1.5px solid ${G.border}`, borderRadius:12, padding:"14px 28px", fontWeight:700, cursor:"pointer", fontSize:15 }}>
                Already a customer →
              </button>
            </div>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              {[["⚡","Electricity"],["💧","Water"],["🔥","Gas"]].map(([ic,lbl])=>(
                <div key={lbl} style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:`1px solid ${G.border}`, borderRadius:10, padding:"7px 14px" }}>
                  <span style={{ fontSize:16 }}>{ic}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:G.muted }}>{lbl}</span>
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:`1px solid ${G.border}`, borderRadius:10, padding:"7px 14px" }}>
                <span style={{ fontSize:16 }}>🔒</span>
                <span style={{ fontSize:12, fontWeight:700, color:G.muted }}>Secure Portal</span>
              </div>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="ani-r" style={{ display:"flex", justifyContent:"center" }}>
            <div className="ani-float" style={{ width:"100%", maxWidth:380 }}>
              <div style={{ background:"#fff", border:`1px solid ${G.border}`, borderRadius:20, boxShadow:"0 24px 60px rgba(130,200,229,0.2)", overflow:"hidden" }}>
                <div style={{ background:"linear-gradient(135deg,#50C878,#82C8E5)", padding:"20px 22px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.8)", marginBottom:4 }}>My Dashboard</div>
                  <div style={{ fontSize:20, fontWeight:900, color:"#fff" }}>Good morning, Alex 👋</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:4 }}>Customer ID: CC-00421</div>
                </div>
                <div style={{ padding:"18px 22px", borderBottom:`1px solid ${G.border}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:G.muted, marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>Current Bill</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:30, fontWeight:900, color:G.text }}>₹1,240<span style={{ fontSize:16, fontWeight:600, color:G.light }}>.00</span></div>
                      <div style={{ fontSize:11, color:G.light, marginTop:2 }}>Due: 25 Apr 2026</div>
                    </div>
                    <div style={{ background:"#fef9c3", border:"1px solid #fde047", borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                      <div style={{ fontSize:10, fontWeight:800, color:"#92400e" }}>DUE SOON</div>
                      <div style={{ fontSize:16, fontWeight:900, color:"#92400e" }}>5 days</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding:"16px 22px", borderBottom:`1px solid ${G.border}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:G.muted, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>Monthly Usage (kWh)</div>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:48 }}>
                    {[55,70,48,80,62,90,75].map((h,i)=>(
                      <div key={i} style={{ flex:1, background: i===6?"linear-gradient(180deg,#50C878,#3fb967)":`${G.blue}44`, borderRadius:"4px 4px 0 0", height:`${h}%` }} />
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                    {["Oct","Nov","Dec","Jan","Feb","Mar","Apr"].map(m=>(
                      <div key={m} style={{ fontSize:9, color:G.light, fontWeight:600, flex:1, textAlign:"center" }}>{m}</div>
                    ))}
                  </div>
                </div>
                <div style={{ padding:"16px 22px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:G.muted, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>Quick Actions</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[["💳","Pay Bill"],["⚖️","Raise Issue"],["📋","Service Request"],["📩","Notifications"]].map(([ic,lbl])=>(
                      <div key={lbl} style={{ background:`${G.green}10`, border:`1px solid ${G.green}30`, borderRadius:10, padding:"10px", display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                        <span style={{ fontSize:16 }}>{ic}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:G.text }}>{lbl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Ticker />

      {/* SERVICES */}
      <section id="services" style={{ padding:"84px 5%" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#82C8E522", border:"1px solid #82C8E566", borderRadius:30, padding:"6px 16px", fontSize:11, fontWeight:800, color:G.blue, marginBottom:14, textTransform:"uppercase", letterSpacing:1 }}>
            What You Can Do
          </div>
          <h2 style={{ fontSize:34, fontWeight:900, color:G.text, margin:"0 0 12px" }}>Everything You Need, Right Here</h2>
          <p style={{ color:G.light, fontSize:14, maxWidth:500, margin:"0 auto", lineHeight:1.8 }}>
            No more phone calls or waiting in line. Manage all your utility services online, anytime.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
          <ServiceCard icon="💳" color={G.green}  title="View & Pay Bills"            tag="Most used" delay="0s"   desc="See your current and past bills at a glance. Download invoices and make payments without visiting an office." />
          <ServiceCard icon="📊" color={G.blue}   title="Track Your Usage"                           delay="0.1s" desc="Monitor your electricity, gas, or water consumption month-by-month and understand your usage patterns." />
          <ServiceCard icon="⚖️" color={G.gold}   title="Dispute a Bill"              tag="Easy"     delay="0.2s" desc="Think your bill looks wrong? Raise a billing dispute in one click and track its status until resolved." />
          <ServiceCard icon="🔧" color={G.purple} title="Service Requests"                           delay="0.3s" desc="Request a new connection, meter check, or other field service. Track the status of your open requests." />
          <ServiceCard icon="📣" color={G.red}    title="File a Complaint"                           delay="0.4s" desc="Not happy with something? Raise a formal complaint and get a proper resolution with timely updates." />
          <ServiceCard icon="🔔" color="#f97316"  title="Notifications & Alerts"                     delay="0.5s" desc="Receive bill-ready alerts, payment reminders, complaint updates, and service notifications instantly." />
        </div>
      </section>

      {/* GETTING STARTED */}
      <section style={{ padding:"80px 5%", background:"rgba(130,200,229,0.06)" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#50C87818", border:"1px solid #50C87855", borderRadius:30, padding:"6px 16px", fontSize:11, fontWeight:800, color:G.green, marginBottom:14, textTransform:"uppercase", letterSpacing:1 }}>
            Getting Started
          </div>
          <h2 style={{ fontSize:32, fontWeight:900, color:G.text, margin:"0 0 10px" }}>Up and running in minutes</h2>
          <p style={{ color:G.light, fontSize:14, maxWidth:420, margin:"0 auto", lineHeight:1.75 }}>No paperwork. No long wait times. Just create your account and get instant access to all your services.</p>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", gap:0, maxWidth:800, margin:"0 auto", position:"relative" }}>
          <div style={{ position:"absolute", top:28, left:"calc(10% + 4px)", right:"calc(10% + 4px)", height:2, background:`linear-gradient(90deg,${G.green},${G.blue})`, opacity:0.3, zIndex:0 }} />
          <Step n={1} icon="📝" label="Create your free account in under 2 minutes" />
          <Step n={2} icon="✅" label="Get approved and activate your customer profile" />
          <Step n={3} icon="🔗" label="Your service account is linked automatically" />
          <Step n={4} icon="🏠" label="Access your full dashboard — bills, usage & more" />
        </div>
        <div style={{ textAlign:"center", marginTop:44 }}>
          <button className="cta-btn" onClick={() => nav("/register")}
            style={{ background:"linear-gradient(135deg,#50C878,#3fb967)", color:"#fff", border:"none", borderRadius:12, padding:"14px 40px", fontWeight:800, cursor:"pointer", fontSize:15, boxShadow:"0 8px 24px rgba(80,200,120,0.3)" }}>
            Create My Account →
          </button>
        </div>
      </section>

      {/* WHY */}
      <section style={{ padding:"84px 5%" }}>
        <div className="rg-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
          <div className="ani-l">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#FDB81322", border:"1px solid #FDB81355", borderRadius:30, padding:"6px 16px", fontSize:11, fontWeight:800, color:G.gold, marginBottom:16, textTransform:"uppercase", letterSpacing:1 }}>
              Why CustomerCare360
            </div>
            <h2 style={{ fontSize:32, fontWeight:900, color:G.text, margin:"0 0 14px" }}>You deserve a simpler utility experience</h2>
            <p style={{ color:G.light, fontSize:14, lineHeight:1.8, marginBottom:32, maxWidth:440 }}>
              Forget calling helplines or visiting offices. Everything from bills to complaints is handled online with full transparency.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <BenefitItem icon="📱" title="Access Anywhere, Anytime"     desc="Your account is available 24/7 on any device — no app installation needed." />
              <BenefitItem icon="🔒" title="Secure & Private"             desc="Your data is protected with secure login. Only you can see your account details." />
              <BenefitItem icon="⚡" title="Real-time Updates"            desc="Bill generated? Complaint resolved? You will know instantly through in-app alerts." />
              <BenefitItem icon="🤝" title="Full Transparency"            desc="Every bill shows a detailed breakdown — usage, tariff, taxes, and subsidies." />
              <BenefitItem icon="🕐" title="No Waiting in Queues"         desc="Raise complaints and track resolutions without stepping foot outside." />
            </div>
          </div>
          <div className="ani-r" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"linear-gradient(135deg,#50C87818,#82C8E518)", border:`1px solid ${G.border}`, borderRadius:20, padding:32, textAlign:"center" }}>
              <div style={{ fontSize:52, fontWeight:900, color:G.green, lineHeight:1 }}>100%</div>
              <div style={{ fontSize:14, fontWeight:700, color:G.text, marginTop:8 }}>Online — no office visit needed</div>
              <div style={{ fontSize:12, color:G.light, marginTop:6 }}>Manage bills, disputes, and service requests entirely from your browser.</div>
            </div>
            {[
              { quote:"I can see exactly why my bill is high every summer. The usage chart makes it so clear!", name:"Priya M.", type:"Residential Customer", icon:"🏠" },
              { quote:"Raised a billing dispute and got it resolved in 3 days. Used to take weeks via phone.", name:"Rahul S.", type:"Business Account Holder", icon:"🏢" },
            ].map((t,i)=>(
              <div key={i} style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:16, padding:22 }}>
                <div style={{ fontSize:22, marginBottom:10 }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontSize:13, color:G.muted, fontStyle:"italic", lineHeight:1.7, margin:"0 0 14px" }}>"{t.quote}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#50C878,#82C8E5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:13, color:G.text }}>{t.name}</div>
                    <div style={{ fontSize:11, color:G.light }}>{t.type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT + FAQ */}
      <section id="support" style={{ padding:"80px 5%", background:"rgba(130,200,229,0.06)" }}>
        <div className="rg-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60 }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#82C8E522", border:"1px solid #82C8E566", borderRadius:30, padding:"6px 16px", fontSize:11, fontWeight:800, color:G.blue, marginBottom:18, textTransform:"uppercase", letterSpacing:1 }}>
              Support
            </div>
            <h2 style={{ fontSize:28, fontWeight:900, color:G.text, margin:"0 0 10px" }}>We are here to help</h2>
            <p style={{ fontSize:13, color:G.light, lineHeight:1.75, marginBottom:28 }}>
              Have an issue? Use the portal to raise it directly. Our team will review and respond.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { icon:"⚖️", title:"Billing Dispute",      desc:"Challenge an incorrect charge — tracked until closed", color:G.gold   },
                { icon:"📣", title:"File a Complaint",     desc:"Raise formal issues with response commitments",        color:G.red    },
                { icon:"🔧", title:"Service Request",      desc:"Request meter checks, new connections, and more",      color:G.purple },
                { icon:"📩", title:"In-app Notifications", desc:"All updates delivered directly to your dashboard",     color:G.blue   },
              ].map((s,i)=>(
                <div key={i} style={{ display:"flex", gap:14, padding:"16px 18px", background:"rgba(255,255,255,0.6)", border:`1px solid ${G.border}`, borderRadius:12 }}>
                  <div style={{ width:42, height:42, borderRadius:11, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:13, color:G.text }}>{s.title}</div>
                    <div style={{ fontSize:12, color:G.light, marginTop:3 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div id="faq">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#50C87818", border:"1px solid #50C87855", borderRadius:30, padding:"6px 16px", fontSize:11, fontWeight:800, color:G.green, marginBottom:18, textTransform:"uppercase", letterSpacing:1 }}>
              FAQ
            </div>
            <h2 style={{ fontSize:28, fontWeight:900, color:G.text, margin:"0 0 22px" }}>Common Questions</h2>
            {[
              { q:"How do I view my current bill?",            a:"After logging in, your current bill amount and due date are shown directly on the dashboard. Click on it to see the full itemised breakdown." },
              { q:"Can I dispute a bill online?",              a:"Yes! Go to your bills section, click Raise Dispute next to any bill, describe the issue, and submit. You can track its status in real time." },
              { q:"How do I track my electricity usage?",      a:"Your dashboard includes a monthly usage chart. Select your service account to see detailed consumption data month by month." },
              { q:"What if my service request takes too long?",a:"You can file a complaint referencing your open service request. Our team is notified and must respond within the agreed timeframe." },
              { q:"Is my account information secure?",         a:"Yes. All data is protected with secure JWT-based login. Your session expires automatically after inactivity for added safety." },
              { q:"Can I have multiple utility accounts?",     a:"Absolutely. You can manage electricity, gas, and water accounts all under one customer profile from a single login." },
            ].map((f,i)=><FAQ key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"96px 5%", textAlign:"center" }}>
        <div style={{ maxWidth:620, margin:"0 auto" }}>
          <div style={{ fontSize:52, marginBottom:16 }}>💡</div>
          <h2 style={{ fontSize:36, fontWeight:900, color:G.text, margin:"0 0 14px" }}>
            Take control of your<br />
            <span style={{ background:"linear-gradient(90deg,#50C878,#82C8E5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>utility bills today</span>
          </h2>
          <p style={{ color:G.light, fontSize:15, lineHeight:1.85, marginBottom:38 }}>
            Join thousands of customers who manage their electricity, gas, and water services online — no queues, no hassle, full control.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="cta-btn" onClick={() => nav("/register")}
              style={{ background:"linear-gradient(135deg,#50C878,#3fb967)", color:"#fff", border:"none", borderRadius:12, padding:"15px 42px", fontWeight:800, cursor:"pointer", fontSize:15, boxShadow:"0 10px 28px rgba(80,200,120,0.35)" }}>
              🚀 Get Started — It is Free
            </button>
            <button className="sec-btn" onClick={() => nav("/login")}
              style={{ background:"#fff", color:G.text, border:`1.5px solid ${G.border}`, borderRadius:12, padding:"15px 32px", fontWeight:700, cursor:"pointer", fontSize:15 }}>
              Sign In
            </button>
          </div>
          <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:28, flexWrap:"wrap" }}>
            {["✅ No credit card needed","🔒 Secure account","⚡ Instant access"].map(t=>(
              <span key={t} style={{ fontSize:12, color:G.light, fontWeight:600 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:"28px 5%", borderTop:`1px solid ${G.border}`, background:"rgba(251,249,231,0.7)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#50C878,#82C8E5)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
          <div style={{ fontWeight:900, fontSize:14, color:G.text }}>CustomerCare360°</div>
        </div>
        <div style={{ display:"flex", gap:22 }}>
          {["Privacy Policy","Terms of Service","Support"].map(l=>(
            <a key={l} href="#" style={{ fontSize:12, color:G.light, textDecoration:"none", fontWeight:600 }}
              onMouseEnter={e=>e.target.style.color=G.green}
              onMouseLeave={e=>e.target.style.color=G.light}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize:12, color:G.light }}>© 2026 CustomerCare360. All rights reserved.</div>
      </footer>
    </div>
  );
}
