import { useState, useEffect, useRef, useCallback } from "react";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://fwbutnnnphccxybacpyz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YnV0bm5ucGhjY3h5YmFjcHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTIwODQsImV4cCI6MjA5Njk2ODA4NH0.sHKBtRVbD-lyGQtS8rzweNHZHWEUPMTgbzRzcYuaHfY";

async function supabaseReq(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// ─── USERS (private - never shown in UI) ──────────────────────────────────────
const USERS = { mateo: "Legacy.mateo1", osvaldo: "Legacy.osvaldo1" };

// ─── DEMO DATA ─────────────────────────────────────────────────────────────────
const IS_DEMO = SUPABASE_URL.includes("YOUR_SUPABASE_URL");
const DEMO_PERFUMES = [
  { id: 1, name: "Sauvage", brand: "Dior", price: 2800, size: 100, gender: "men", notes: "Bergamota, Pimienta, Ambroxan", description: "Fresco e intenso. Evoca paisajes salvajes bajo el cielo azul.", image_url: "https://images.unsplash.com/photo-1594913824140-5b43c1b29a4e?w=400&q=80", in_stock: true },
  { id: 2, name: "Coco Mademoiselle", brand: "Chanel", price: 3200, size: 100, gender: "women", notes: "Naranja, Rosa, Pachulí, Vetiver", description: "Audaz y femenino. Un clásico moderno irresistible.", image_url: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80", in_stock: true },
  { id: 3, name: "Black Orchid", brand: "Tom Ford", price: 3800, size: 50, gender: "unisex", notes: "Trufa negra, Ylang-ylang, Sándalo", description: "Oscuro y sensual. Una fragancia que deja huella.", image_url: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400&q=80", in_stock: true },
  { id: 4, name: "La Vie Est Belle", brand: "Lancôme", price: 2400, size: 75, gender: "women", notes: "Iris, Pralinée, Vainilla", description: "Dulce y gourmand. La fragancia de la felicidad.", image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80", in_stock: false },
];

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  es: {
    brand: "Legacy Perfumes TJ", tagline: "Fragancias originales, distribuidas con distinción en Tijuana",
    hero_cta: "Ver Catálogo", contact_cta: "Pedir por WhatsApp",
    catalog_title: "Nuestro Catálogo", search_placeholder: "Buscar perfume, marca o nota...",
    filter_all: "Todos", filter_men: "Hombre", filter_women: "Mujer", filter_unisex: "Unisex",
    add_cart: "Solicitar por WhatsApp", contact_title: "Contacto",
    contact_desc: "Distribución local en Tijuana. Escríbenos para pedidos, disponibilidad o más información.",
    whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok", phone: "Teléfono",
    admin_title: "Panel Administrativo", admin_login: "Iniciar Sesión",
    admin_user: "Usuario", admin_pass: "Contraseña", admin_wrong: "Usuario o contraseña incorrectos",
    admin_logout: "Cerrar Sesión", add_perfume: "Agregar Perfume", edit_perfume: "Editar",
    save: "Guardar", cancel: "Cancelar", delete: "Eliminar", confirm_delete: "¿Eliminar este perfume?",
    field_name: "Nombre del Perfume", field_brand: "Marca", field_price: "Precio (MXN)",
    field_size: "Tamaño (ml)", field_gender: "Género", field_notes: "Notas Olfativas",
    field_desc: "Descripción", field_image: "URL de Imagen", field_stock: "En Stock",
    loading: "Cargando...", no_results: "No se encontraron perfumes.",
    nav_catalog: "Catálogo", nav_contact: "Contacto", nav_admin: "Admin",
    footer: "© 2025 Legacy Perfumes TJ · Tijuana, B.C. · Todos los derechos reservados",
    out_of_stock: "Agotado", available: "Disponible", men: "Hombre", women: "Mujer", unisex: "Unisex",
  },
  en: {
    brand: "Legacy Perfumes TJ", tagline: "Original fragrances, distributed with distinction in Tijuana",
    hero_cta: "View Catalog", contact_cta: "Order via WhatsApp",
    catalog_title: "Our Catalog", search_placeholder: "Search perfume, brand or note...",
    filter_all: "All", filter_men: "Men", filter_women: "Women", filter_unisex: "Unisex",
    add_cart: "Order via WhatsApp", contact_title: "Contact",
    contact_desc: "Local distribution in Tijuana. Write us for orders, availability or more information.",
    whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok", phone: "Phone",
    admin_title: "Admin Panel", admin_login: "Log In",
    admin_user: "Username", admin_pass: "Password", admin_wrong: "Incorrect username or password",
    admin_logout: "Log Out", add_perfume: "Add Perfume", edit_perfume: "Edit",
    save: "Save", cancel: "Cancel", delete: "Delete", confirm_delete: "Delete this perfume?",
    field_name: "Perfume Name", field_brand: "Brand", field_price: "Price (MXN)",
    field_size: "Size (ml)", field_gender: "Gender", field_notes: "Olfactory Notes",
    field_desc: "Description", field_image: "Image URL", field_stock: "In Stock",
    loading: "Loading...", no_results: "No perfumes found.",
    nav_catalog: "Catalog", nav_contact: "Contact", nav_admin: "Admin",
    footer: "© 2025 Legacy Perfumes TJ · Tijuana, B.C. · All rights reserved",
    out_of_stock: "Out of Stock", available: "Available", men: "Men", women: "Women", unisex: "Unisex",
  },
};

// ─── PALETTE ───────────────────────────────────────────────────────────────────
// Negro #0A0A0A · Dorado #C9A84C · Kaki/Café #8B7355 · Arena #D4C5A9 · Carbón #1C1C1C
const C = {
  black: "#0A0A0A", gold: "#C9A84C", goldLight: "#E8C97A",
  kaki: "#8B7355", kakiLight: "#A68B5B", kakiMid: "#6B5940",
  sand: "#D4C5A9", sandLight: "#F0E8D8",
  carbon: "#1C1C1C", carbon2: "#141414",
  text: "#F0E8D8", muted: "#9A8878", dim: "#5A4E42",
};

// ─── PARTICLES ─────────────────────────────────────────────────────────────────
function GoldParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.2 + 0.4,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -Math.random() * 0.45 - 0.1,
      alpha: Math.random() * 0.55 + 0.15,
      color: Math.random() > 0.5 ? C.gold : C.kaki,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2,"0");
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    const ro = new ResizeObserver(() => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

// ─── SHARED STYLES ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "#0D0B09", border: `1px solid ${C.dim}`,
  borderRadius: 8, padding: "10px 14px", color: C.sand, fontSize: 14,
  boxSizing: "border-box", outline: "none", fontFamily: "Inter, sans-serif",
};
const lblStyle = { display:"block", color: C.muted, fontSize:11, marginBottom:6, textTransform:"uppercase", letterSpacing:1 };

// ─── PERFUME CARD ──────────────────────────────────────────────────────────────
function PerfumeCard({ perfume, t, onWhatsApp }) {
  const [hover, setHover] = useState(false);
  const gLabel = { men: t.men, women: t.women, unisex: t.unisex };
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: hover ? C.carbon : C.carbon2,
      border: `1px solid ${hover ? C.kaki : "#2a2218"}`,
      borderRadius: 14, overflow:"hidden", transition:"all 0.3s ease",
      transform: hover ? "translateY(-5px)" : "none",
      boxShadow: hover ? `0 20px 55px rgba(139,115,85,0.2)` : "0 4px 20px rgba(0,0,0,0.5)",
      display:"flex", flexDirection:"column",
    }}>
      <div style={{ position:"relative", paddingTop:"68%", background:"#0D0B09", overflow:"hidden" }}>
        {perfume.image_url
          ? <img src={perfume.image_url} alt={perfume.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s", transform: hover ? "scale(1.06)" : "scale(1)" }} />
          : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>🌿</div>
        }
        <div style={{ position:"absolute", top:10, left:10, background:"rgba(10,8,5,0.8)", color: C.kakiLight, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, textTransform:"uppercase", letterSpacing:1.5 }}>
          {gLabel[perfume.gender] || perfume.gender}
        </div>
        {!perfume.in_stock && (
          <div style={{ position:"absolute", top:10, right:10, background:"#6B1A1A", color:"#fcc", fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, textTransform:"uppercase" }}>{t.out_of_stock}</div>
        )}
      </div>
      <div style={{ padding:"20px", flex:1, display:"flex", flexDirection:"column", gap:7 }}>
        <div style={{ color: C.kakiLight, fontSize:10, textTransform:"uppercase", letterSpacing:2.5, fontWeight:700 }}>{perfume.brand}</div>
        <div style={{ color: C.sandLight, fontSize:17, fontWeight:700, fontFamily:"'Playfair Display', serif", lineHeight:1.2 }}>{perfume.name}</div>
        {perfume.notes && <div style={{ color: C.muted, fontSize:12, fontStyle:"italic" }}>{perfume.notes}</div>}
        {perfume.description && <div style={{ color:"#8A7D6E", fontSize:13, lineHeight:1.55, flex:1 }}>{perfume.description}</div>}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
          <div>
            <span style={{ color: C.gold, fontSize:21, fontWeight:700 }}>${perfume.price?.toLocaleString("es-MX")}</span>
            <span style={{ color: C.dim, fontSize:12, marginLeft:4 }}>MXN</span>
          </div>
          {perfume.size && <span style={{ color: C.dim, fontSize:12, border:`1px solid ${C.dim}`, padding:"2px 9px", borderRadius:20 }}>{perfume.size}ml</span>}
        </div>
        <button disabled={!perfume.in_stock} onClick={() => onWhatsApp(perfume)} style={{
          marginTop:10,
          background: perfume.in_stock ? `linear-gradient(135deg, ${C.kaki}, ${C.kakiLight})` : "#2a2218",
          color: perfume.in_stock ? "#F0E8D8" : C.dim,
          border:"none", borderRadius:8, padding:"11px",
          fontWeight:700, fontSize:13, cursor: perfume.in_stock ? "pointer" : "not-allowed",
          letterSpacing:0.5, transition:"opacity 0.2s",
        }}>
          {perfume.in_stock ? `📲 ${t.add_cart}` : t.out_of_stock}
        </button>
      </div>
    </div>
  );
}

// ─── PERFUME FORM ──────────────────────────────────────────────────────────────
function PerfumeForm({ perfume, t, onSave, onCancel }) {
  const blank = { name:"", brand:"", price:"", size:"", gender:"unisex", notes:"", description:"", image_url:"", in_stock:true };
  const [form, setForm] = useState(perfume || blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#100E0B", border:`1px solid ${C.kaki}`, borderRadius:16, padding:32, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" }}>
        <h2 style={{ color: C.kakiLight, fontFamily:"'Playfair Display', serif", marginBottom:24, fontSize:24 }}>{perfume ? t.edit_perfume : t.add_perfume}</h2>
        <div style={{ display:"grid", gap:14 }}>
          {[["name", t.field_name],["brand", t.field_brand],["notes", t.field_notes],["image_url", t.field_image]].map(([k, label]) => (
            <div key={k}>
              <label style={lblStyle}>{label}</label>
              <input value={form[k]||""} onChange={e=>set(k,e.target.value)} style={inputStyle} />
            </div>
          ))}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><label style={lblStyle}>{t.field_price}</label><input type="number" value={form.price||""} onChange={e=>set("price",+e.target.value)} style={inputStyle} /></div>
            <div><label style={lblStyle}>{t.field_size}</label><input type="number" value={form.size||""} onChange={e=>set("size",+e.target.value)} style={inputStyle} /></div>
          </div>
          <div>
            <label style={lblStyle}>{t.field_gender}</label>
            <select value={form.gender} onChange={e=>set("gender",e.target.value)} style={inputStyle}>
              <option value="men">{t.men}</option>
              <option value="women">{t.women}</option>
              <option value="unisex">{t.unisex}</option>
            </select>
          </div>
          <div>
            <label style={lblStyle}>{t.field_desc}</label>
            <textarea rows={3} value={form.description||""} onChange={e=>set("description",e.target.value)} style={{...inputStyle, resize:"vertical"}} />
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:10, color: C.muted, cursor:"pointer", fontSize:13 }}>
            <input type="checkbox" checked={form.in_stock} onChange={e=>set("in_stock",e.target.checked)} style={{ width:16, height:16, accentColor: C.kaki }} />
            {t.field_stock}
          </label>
        </div>
        <div style={{ display:"flex", gap:12, marginTop:24 }}>
          <button onClick={()=>onSave(form)} style={{ flex:1, background:`linear-gradient(135deg,${C.kaki},${C.kakiLight})`, color: C.sandLight, border:"none", borderRadius:8, padding:12, fontWeight:700, cursor:"pointer", fontSize:14 }}>{t.save}</button>
          <button onClick={onCancel} style={{ flex:1, background:"transparent", color: C.muted, border:`1px solid ${C.dim}`, borderRadius:8, padding:12, cursor:"pointer", fontSize:14 }}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── SETUP BANNER ──────────────────────────────────────────────────────────────
function SetupBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div style={{ background:"#100E0B", border:`1px solid ${C.kaki}`, borderRadius:12, padding:20, margin:"0 0 28px", position:"relative" }}>
      <button onClick={()=>setOpen(false)} style={{ position:"absolute", top:10, right:14, background:"none", border:"none", color: C.muted, fontSize:18, cursor:"pointer" }}>✕</button>
      <h3 style={{ color: C.kakiLight, marginBottom:10 }}>⚙️ Configuración inicial</h3>
      <p style={{ color: C.muted, fontSize:13, lineHeight:1.7 }}>
        Modo <strong style={{ color: C.gold }}>demostración</strong>. Para activar base de datos real con Supabase:
      </p>
      <ol style={{ color: C.muted, fontSize:13, lineHeight:2, paddingLeft:20, marginTop:8 }}>
        <li>Crea cuenta gratis en <strong style={{ color: C.kakiLight }}>supabase.com</strong></li>
        <li>Crea proyecto → copia tu <strong>Project URL</strong> y <strong>anon key</strong></li>
        <li>Crea tabla <code style={{ color: C.gold }}>perfumes</code>: columnas <code style={{ color:"#9A8878", fontSize:11 }}>id, name, brand, price, size, gender, notes, description, image_url, in_stock</code></li>
        <li>Reemplaza <code style={{ color: C.gold }}>YOUR_SUPABASE_URL</code> y <code style={{ color: C.gold }}>YOUR_SUPABASE_ANON_KEY</code> en el código</li>
        <li>En Authentication → Policies: habilita RLS con lectura pública</li>
      </ol>
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("es");
  const t = T[lang];
  const [page, setPage] = useState("home");
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [adminUser, setAdminUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ user:"", pass:"" });
  const [loginError, setLoginError] = useState("");
  const [editingPerfume, setEditingPerfume] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const loadPerfumes = useCallback(async () => {
    setLoading(true);
    try {
      if (IS_DEMO) { setTimeout(() => { setPerfumes(DEMO_PERFUMES); setLoading(false); }, 500); return; }
      const data = await supabaseReq("Legacy?order=id.asc");
      setPerfumes(data); setLoading(false);
    } catch { setPerfumes(DEMO_PERFUMES); setLoading(false); }
  }, []);

  useEffect(() => { loadPerfumes(); }, [loadPerfumes]);

  const handleWhatsApp = (perfume) => {
    const msg = encodeURIComponent(`Hola Legacy Perfumes TJ! Me interesa el perfume *${perfume.name}* de *${perfume.brand}* (${perfume.size}ml). ¿Está disponible?`);
    window.open(`https://wa.me/5216643362000?text=${msg}`, "_blank");
  };

  const handleLogin = () => {
    const u = loginForm.user.trim().toLowerCase();
    const p = loginForm.pass.trim();
    if (USERS[u] === p) { setAdminUser(u); setLoginError(""); }
    else setLoginError(t.admin_wrong);
  };

  const handleSave = async (form) => {
    try {
      if (IS_DEMO) {
        form.id ? setPerfumes(ps => ps.map(p => p.id === form.id ? { ...p, ...form } : p))
                : setPerfumes(ps => [...ps, { ...form, id: Date.now() }]);
        setEditingPerfume(null); setShowAddForm(false); return;
      }
      if (form.id) { const { id, ...rest } = form; await supabaseReq(`Legacy?id=eq.${id}`, { method:"PATCH", body:JSON.stringify(rest) }); }
      else await supabaseReq("Legacy", { method:"POST", body:JSON.stringify(form) });
      await loadPerfumes(); setEditingPerfume(null); setShowAddForm(false);
    } catch(e) { alert("Error: " + e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirm_delete)) return;
    try {
      if (IS_DEMO) { setPerfumes(ps => ps.filter(p => p.id !== id)); return; }
      await supabaseReq(`Legacy?id=eq.${id}`, { method:"DELETE" });
      await loadPerfumes();
    } catch(e) { alert("Error: " + e.message); }
  };

  const navTo = (p) => { setPage(p); window.scrollTo(0,0); };

  const filtered = perfumes.filter(p => {
    const q = search.toLowerCase();
    return (!q || [p.name, p.brand, p.notes].some(s => s?.toLowerCase().includes(q)))
      && (genderFilter === "all" || p.gender === genderFilter);
  });

  const btnBase = { border:"none", cursor:"pointer", fontFamily:"Inter, sans-serif", fontWeight:600, transition:"all 0.2s" };

  return (
    <div style={{ minHeight:"100vh", background: C.black, color: C.text, fontFamily:"Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:#0A0A0A; } ::-webkit-scrollbar-thumb { background:${C.kaki}; border-radius:3px; }
        input:focus, select:focus, textarea:focus { border-color:${C.kakiLight} !important; box-shadow:0 0 0 2px rgba(139,115,85,0.15); }
        a { text-decoration:none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100%{opacity:.3;} 50%{opacity:.9;} }
        .fadeUp { animation: fadeUp 0.75s ease forwards; }
        .fadeUp2 { animation: fadeUp 0.75s 0.15s ease both; }
        .fadeUp3 { animation: fadeUp 0.75s 0.3s ease both; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        background: scrolled ? "rgba(10,8,5,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.dim}` : "1px solid transparent",
        transition:"all 0.35s ease",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={()=>navTo("home")} style={{ ...btnBase, background:"none", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ color: C.gold, fontSize:22, fontFamily:"'Playfair Display', serif", fontWeight:900 }}>Legacy</span>
            <span style={{ color: C.sand, fontSize:12, fontWeight:300, letterSpacing:4, textTransform:"uppercase" }}>Perfumes TJ</span>
          </button>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {["catalog","contact","admin"].map(p => (
              <button key={p} onClick={()=>navTo(p)} style={{
                ...btnBase,
                background: page===p ? `linear-gradient(135deg,${C.kaki},${C.kakiLight})` : "transparent",
                color: page===p ? C.sandLight : C.muted,
                border: page===p ? "none" : `1px solid ${C.dim}`,
                padding:"7px 18px", borderRadius:50, fontSize:13,
              }}>{t[`nav_${p}`]}</button>
            ))}
            <button onClick={()=>setLang(lang==="es"?"en":"es")} style={{ ...btnBase, background:"transparent", border:`1px solid ${C.kaki}`, color: C.gold, padding:"6px 13px", borderRadius:50, fontSize:12 }}>
              {lang==="es"?"EN":"ES"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HOME ── */}
      {page==="home" && (
        <>
          {/* HERO */}
          <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 60%, #1a1308 0%, ${C.black} 72%)` }} />
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 20% 80%, rgba(139,115,85,0.08) 0%, transparent 60%)` }} />
            <GoldParticles />
            <div style={{ position:"relative", textAlign:"center", padding:"0 24px", maxWidth:680 }}>
              <div className="fadeUp" style={{ color: C.kakiLight, fontSize:11, letterSpacing:7, textTransform:"uppercase", marginBottom:22 }}>Tijuana · B.C. · México</div>
              <h1 className="fadeUp2" style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(48px,9vw,88px)", fontWeight:900, lineHeight:1.0, marginBottom:26 }}>
                <span style={{ color: C.sandLight }}>Legacy</span>
                <br />
                <span style={{ background:`linear-gradient(135deg, ${C.gold}, ${C.kakiLight})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Perfumes</span>
              </h1>
              <p className="fadeUp3" style={{ color: C.muted, fontSize:"clamp(15px,2.2vw,18px)", lineHeight:1.75, maxWidth:480, margin:"0 auto 44px" }}>{t.tagline}</p>
              <div className="fadeUp3" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>navTo("catalog")} style={{ ...btnBase, background:`linear-gradient(135deg,${C.kaki},${C.kakiLight})`, color: C.sandLight, borderRadius:50, padding:"14px 38px", fontSize:15, letterSpacing:0.5 }}>{t.hero_cta}</button>
                <button onClick={()=>handleWhatsApp({name:"información",brand:"",size:""})} style={{ ...btnBase, background:"transparent", color: C.gold, border:`1px solid ${C.gold}`, borderRadius:50, padding:"14px 38px", fontSize:15 }}>📲 {t.contact_cta}</button>
              </div>
              {/* Social links in hero */}
              <div className="fadeUp3" style={{ display:"flex", justifyContent:"center", gap:20, marginTop:40 }}>
                <a href="https://instagram.com/legacy.perfumes.tj" target="_blank" rel="noopener noreferrer" style={{ color: C.muted, fontSize:12, letterSpacing:2, textTransform:"uppercase", display:"flex", alignItems:"center", gap:6, transition:"color 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.kakiLight}
                  onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  @legacy.perfumes.tj
                </a>
                <span style={{ color: C.dim }}>·</span>
                <a href="https://tiktok.com/@legacy.perfumes.tj" target="_blank" rel="noopener noreferrer" style={{ color: C.muted, fontSize:12, letterSpacing:2, textTransform:"uppercase", display:"flex", alignItems:"center", gap:6, transition:"color 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.kakiLight}
                  onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/></svg>
                  @legacy.perfumes.tj
                </a>
              </div>
            </div>
            <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", color: C.dim, fontSize:20, animation:"pulse 2.2s infinite" }}>↓</div>
          </section>

          {/* FEATURED */}
          <section style={{ padding:"80px 24px", maxWidth:1200, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:52 }}>
              <div style={{ color: C.kakiLight, fontSize:10, letterSpacing:5, textTransform:"uppercase", marginBottom:14 }}>{lang==="es"?"Selección Destacada":"Featured Selection"}</div>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(30px,5vw,46px)", color: C.sandLight }}>{t.catalog_title}</h2>
              <div style={{ width:48, height:2, background:`linear-gradient(90deg,${C.kaki},${C.gold})`, margin:"18px auto 0", borderRadius:2 }} />
            </div>
            {loading
              ? <div style={{ textAlign:"center", color: C.kakiLight, padding:60 }}>{t.loading}</div>
              : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:24 }}>
                  {perfumes.slice(0,4).map(p => <PerfumeCard key={p.id} perfume={p} t={t} onWhatsApp={handleWhatsApp} />)}
                </div>
            }
            <div style={{ textAlign:"center", marginTop:50 }}>
              <button onClick={()=>navTo("catalog")} style={{ ...btnBase, background:"transparent", color: C.kakiLight, border:`1px solid ${C.kaki}`, borderRadius:50, padding:"13px 40px", fontSize:14 }}>
                {lang==="es"?"Ver catálogo completo →":"View full catalog →"}
              </button>
            </div>
          </section>

          {/* STRIP */}
          <div style={{ borderTop:`1px solid ${C.dim}`, borderBottom:`1px solid ${C.dim}`, padding:"28px 24px", background:"#0D0B09" }}>
            <div style={{ maxWidth:900, margin:"0 auto", display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:20, textAlign:"center" }}>
              {[["🌍",lang==="es"?"Fragancias Originales":"Original Fragrances"],["🚚",lang==="es"?"Distribución Local TJ":"Local TJ Distribution"],["📲",lang==="es"?"Pedidos por WhatsApp":"Orders via WhatsApp"],["⭐",lang==="es"?"Atención Personalizada":"Personalized Service"]].map(([icon,label])=>(
                <div key={label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:26 }}>{icon}</span>
                  <span style={{ color: C.muted, fontSize:12, letterSpacing:1.5, textTransform:"uppercase" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── CATALOG ── */}
      {page==="catalog" && (
        <section style={{ padding:"80px 24px 60px", maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ color: C.kakiLight, fontSize:10, letterSpacing:5, textTransform:"uppercase", marginBottom:14 }}>Legacy Perfumes TJ</div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(30px,5vw,46px)", color: C.sandLight }}>{t.catalog_title}</h2>
            <div style={{ width:48, height:2, background:`linear-gradient(90deg,${C.kaki},${C.gold})`, margin:"18px auto 0", borderRadius:2 }} />
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:36, alignItems:"center", justifyContent:"center" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search_placeholder}
              style={{ ...inputStyle, maxWidth:300, borderRadius:50, padding:"10px 20px" }} />
            {[["all",t.filter_all],["men",t.filter_men],["women",t.filter_women],["unisex",t.filter_unisex]].map(([v,label])=>(
              <button key={v} onClick={()=>setGenderFilter(v)} style={{
                ...btnBase,
                background: genderFilter===v ? `linear-gradient(135deg,${C.kaki},${C.kakiLight})` : "transparent",
                color: genderFilter===v ? C.sandLight : C.muted,
                border: genderFilter===v ? "none" : `1px solid ${C.dim}`,
                padding:"8px 20px", borderRadius:50, fontSize:13,
              }}>{label}</button>
            ))}
          </div>
          {loading
            ? <div style={{ textAlign:"center", color: C.kakiLight, padding:60 }}>{t.loading}</div>
            : filtered.length===0
              ? <div style={{ textAlign:"center", color: C.dim, padding:60 }}>{t.no_results}</div>
              : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:24 }}>
                  {filtered.map(p=><PerfumeCard key={p.id} perfume={p} t={t} onWhatsApp={handleWhatsApp} />)}
                </div>
          }
        </section>
      )}

      {/* ── CONTACT ── */}
      {page==="contact" && (
        <section style={{ minHeight:"90vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 24px" }}>
          <div style={{ maxWidth:520, width:"100%", textAlign:"center" }}>
            <div style={{ color: C.kakiLight, fontSize:10, letterSpacing:5, textTransform:"uppercase", marginBottom:14 }}>Legacy Perfumes TJ</div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(30px,5vw,42px)", color: C.sandLight, marginBottom:16 }}>{t.contact_title}</h2>
            <div style={{ width:48, height:2, background:`linear-gradient(90deg,${C.kaki},${C.gold})`, margin:"0 auto 28px", borderRadius:2 }} />
            <p style={{ color: C.muted, lineHeight:1.75, marginBottom:44, fontSize:15 }}>{t.contact_desc}</p>
            <div style={{ display:"grid", gap:14 }}>
              {[
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, label:t.whatsapp, val:"+52 664 336 2000", href:"https://wa.me/5216643362000", color:"#25D366" },
                { icon:"📞", label:t.phone, val:"664 336 2000", href:"tel:+526643362000", color: C.gold },
                { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>, label:t.instagram, val:"@legacy.perfumes.tj", href:"https://instagram.com/legacy.perfumes.tj", color:"#E1306C" },
                { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/></svg>, label:t.tiktok, val:"@legacy.perfumes.tj", href:"https://tiktok.com/@legacy.perfumes.tj", color:"#69C9D0" },
              ].map(c=>(
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:16, background:"#0D0B09", border:`1px solid ${C.dim}`, borderRadius:14, padding:"18px 22px", color:"inherit", transition:"border-color 0.2s, background 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=c.color; e.currentTarget.style.background=C.carbon; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.dim; e.currentTarget.style.background="#0D0B09"; }}
                >
                  <span style={{ color:c.color, display:"flex", alignItems:"center", fontSize:typeof c.icon==="string"?22:16 }}>{c.icon}</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ color: C.dim, fontSize:10, textTransform:"uppercase", letterSpacing:1.5 }}>{c.label}</div>
                    <div style={{ color:c.color, fontWeight:600, marginTop:3, fontSize:15 }}>{c.val}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ADMIN ── */}
      {page==="admin" && (
        <section style={{ minHeight:"90vh", padding:"80px 24px 60px", maxWidth:1100, margin:"0 auto" }}>
          {!adminUser ? (
            <div style={{ maxWidth:380, margin:"60px auto", background:"#0D0B09", border:`1px solid ${C.kaki}`, borderRadius:18, padding:42 }}>
              <div style={{ textAlign:"center", marginBottom:30 }}>
                <div style={{ color: C.kakiLight, fontSize:10, letterSpacing:5, textTransform:"uppercase", marginBottom:10 }}>Legacy Perfumes TJ</div>
                <h2 style={{ fontFamily:"'Playfair Display', serif", color: C.sandLight, fontSize:28 }}>{t.admin_title}</h2>
              </div>
              <div style={{ display:"grid", gap:16 }}>
                <div>
                  <label style={lblStyle}>{t.admin_user}</label>
                  <input value={loginForm.user} onChange={e=>setLoginForm(f=>({...f,user:e.target.value}))} style={inputStyle} onKeyDown={e=>e.key==="Enter"&&handleLogin()} autoComplete="username" />
                </div>
                <div>
                  <label style={lblStyle}>{t.admin_pass}</label>
                  <input type="password" value={loginForm.pass} onChange={e=>setLoginForm(f=>({...f,pass:e.target.value}))} style={inputStyle} onKeyDown={e=>e.key==="Enter"&&handleLogin()} autoComplete="current-password" />
                </div>
                {loginError && <div style={{ color:"#E07070", fontSize:13, textAlign:"center" }}>{loginError}</div>}
                <button onClick={handleLogin} style={{ ...btnBase, background:`linear-gradient(135deg,${C.kaki},${C.kakiLight})`, color: C.sandLight, borderRadius:8, padding:13, fontSize:14, marginTop:6 }}>{t.admin_login}</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32, flexWrap:"wrap", gap:12 }}>
                <div>
                  <h2 style={{ fontFamily:"'Playfair Display', serif", color: C.kakiLight, fontSize:28 }}>{t.admin_title}</h2>
                  <div style={{ color: C.dim, fontSize:13, marginTop:5 }}>👤 {adminUser.charAt(0).toUpperCase()+adminUser.slice(1)}</div>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setShowAddForm(true)} style={{ ...btnBase, background:`linear-gradient(135deg,${C.kaki},${C.kakiLight})`, color: C.sandLight, borderRadius:8, padding:"10px 22px", fontSize:13 }}>+ {t.add_perfume}</button>
                  <button onClick={()=>setAdminUser(null)} style={{ ...btnBase, background:"transparent", color: C.muted, border:`1px solid ${C.dim}`, borderRadius:8, padding:"10px 18px", fontSize:13 }}>{t.admin_logout}</button>
                </div>
              </div>
              {IS_DEMO && <SetupBanner />}
              {loading
                ? <div style={{ color: C.kakiLight }}>{t.loading}</div>
                : <div style={{ display:"grid", gap:10 }}>
                    {perfumes.map(p=>(
                      <div key={p.id} style={{ background:"#0D0B09", border:`1px solid ${C.dim}`, borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", transition:"border-color 0.2s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=C.kaki}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=C.dim}
                      >
                        {p.image_url && <img src={p.image_url} alt={p.name} style={{ width:58, height:58, objectFit:"cover", borderRadius:8, flexShrink:0 }} />}
                        <div style={{ flex:1, minWidth:160 }}>
                          <div style={{ color: C.kakiLight, fontSize:10, textTransform:"uppercase", letterSpacing:2 }}>{p.brand}</div>
                          <div style={{ color: C.sandLight, fontWeight:600, fontSize:15, marginTop:2 }}>{p.name}</div>
                          <div style={{ color: C.dim, fontSize:12, marginTop:3 }}>
                            {p.size}ml · <span style={{ color: C.gold }}>${p.price?.toLocaleString("es-MX")} MXN</span> · <span style={{ color: p.in_stock?"#6DB86D":"#C06060" }}>{p.in_stock?t.available:t.out_of_stock}</span>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>setEditingPerfume(p)} style={{ ...btnBase, background:"transparent", border:`1px solid ${C.kaki}`, color: C.kakiLight, borderRadius:8, padding:"8px 16px", fontSize:13 }}>✏️ {t.edit_perfume}</button>
                          <button onClick={()=>handleDelete(p.id)} style={{ ...btnBase, background:"transparent", border:"1px solid #6B3030", color:"#E07070", borderRadius:8, padding:"8px 14px", fontSize:13 }}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${C.dim}`, padding:"36px 24px", textAlign:"center", background:"#0D0B09" }}>
        <div style={{ color: C.gold, fontFamily:"'Playfair Display', serif", fontSize:20, marginBottom:6 }}>Legacy Perfumes TJ</div>
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:14 }}>
          <a href="https://instagram.com/legacy.perfumes.tj" target="_blank" rel="noopener noreferrer" style={{ color: C.dim, fontSize:12, transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=C.kakiLight} onMouseLeave={e=>e.currentTarget.style.color=C.dim}>Instagram</a>
          <span style={{ color: C.dim }}>·</span>
          <a href="https://tiktok.com/@legacy.perfumes.tj" target="_blank" rel="noopener noreferrer" style={{ color: C.dim, fontSize:12, transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=C.kakiLight} onMouseLeave={e=>e.currentTarget.style.color=C.dim}>TikTok</a>
          <span style={{ color: C.dim }}>·</span>
          <a href="https://wa.me/5216643362000" target="_blank" rel="noopener noreferrer" style={{ color: C.dim, fontSize:12, transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=C.kakiLight} onMouseLeave={e=>e.currentTarget.style.color=C.dim}>WhatsApp</a>
        </div>
        <div style={{ color: C.dim, fontSize:11, letterSpacing:1 }}>{t.footer}</div>
      </footer>

      {(showAddForm||editingPerfume) && (
        <PerfumeForm perfume={editingPerfume} t={t} onSave={handleSave} onCancel={()=>{setShowAddForm(false);setEditingPerfume(null);}} />
      )}
    </div>
  );
}
