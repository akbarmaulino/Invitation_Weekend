"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/ui/Navbar";
import { useData } from "@/context/DataContext";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/utils";

const MapPreview = dynamic(() => import("./MapPreview"), { ssr: false });
const SearchMapView = dynamic(() => import("./SearchMapView"), { ssr: false });

const C = {
  ink: "#03254c", espresso: "#03254c", mocha: "#1a4d7a", caramel: "#1a4d7a",
  sand: "#c4e8ff", cream: "#d0efff", paper: "#e1f3ff",
  sage: "#4caf50", terracotta: "#f43f5e",
  white: "#ffffff", muted: "#6b8cae", error: "#f43f5e", success: "#4caf50",
};

interface NominatimResult {
  place_id: string | number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
}

function detectCategory(r: NominatimResult) {
  const typ = r.type?.toLowerCase() || "";
  const cls = r.class?.toLowerCase() || "";
  if (["restaurant","fast_food","food_court","eatery","restoran"].some(k => typ.includes(k)||cls.includes(k)))
    return { category:"Makan", type_key:"restoran", subtype:"Restoran" };
  if (["cafe","coffee"].some(k => typ.includes(k)||cls.includes(k)))
    return { category:"Makan", type_key:"cafe", subtype:"Cafe" };
  if (["hotel","hostel","guest_house","motel","lodging"].some(k => typ.includes(k)||cls.includes(k)))
    return { category:"Menginap", type_key:"hotel", subtype:"Hotel" };
  if (["attraction","museum","theme_park","zoo","landmark"].some(k => typ.includes(k)||cls.includes(k)))
    return { category:"Wisata", type_key:"wisata", subtype:"Tempat Wisata" };
  if (["shop","store","mall","market"].some(k => typ.includes(k)||cls.includes(k)))
    return { category:"Belanja", type_key:"belanja", subtype:"Toko & Belanja" };
  if (["cinema","theater","entertainment","nightclub","bar"].some(k => typ.includes(k)||cls.includes(k)))
    return { category:"Hiburan", type_key:"hiburan", subtype:"Hiburan" };
  if (["park","garden","nature"].some(k => typ.includes(k)||cls.includes(k)))
    return { category:"Wisata", type_key:"taman", subtype:"Taman & Alam" };
  return null;
}

export default function LocationsPage() {
  const { categories, cities, loadAllData } = useData();
  const [locationName, setLocationName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle"|"loading"|"ok"|"denied">("idle");
  const [hoveredResult, setHoveredResult] = useState<string | number | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState<NominatimResult | null>(null);
  const [autoDetected, setAutoDetected] = useState<{ category: string; type_key: string; subtype: string } | null>(null);
  const [form, setForm] = useState({
    name:"", address:"", maps_url:"", category:"", type_key:"", subtype:"",
    city_id:"", phone:"", opening_hours:"", price_range:"", website:"", notes:"",
  });
  const [newFile, setNewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        setGpsStatus("ok");
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "User-Agent": "triplove-app/1.0" } }
          );
          const data = await res.json();
          const addr = data.address;
          setLocationName(addr.suburb || addr.village || addr.town || addr.city_district || addr.city || "");
        } catch { setLocationName(""); }
      },
      () => setGpsStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 3) { setResults([]); setSearchError(""); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true); setSearchError("");
      try {
        const params = new URLSearchParams();
        params.set("query", query);
        if (userCoords && gpsStatus === "ok") {
          params.set("ll", `${userCoords.lat},${userCoords.lon}`);
          params.set("radius", "5000");
        }
        const res = await fetch(`/api/places?${params.toString()}`);
        const data = await res.json();
        const places = data.results || [];
        if (!places.length) { setSearchError("Tidak ada hasil. Coba kata kunci lain."); setResults([]); }
        else setResults(places.map((p: any) => ({
          place_id: p.place_id, name: p.name, display_name: p.display_name,
          lat: p.lat, lon: p.lon, class: p.class || "", type: p.type || "",
        })));
      } catch { setSearchError("Gagal mencari. Cek koneksi internet."); }
      finally { setSearching(false); }
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, userCoords]);

  function handleSelectResult(r: NominatimResult) {
    const detected = detectCategory(r);
    setSelected(r); setAutoDetected(detected);
    setForm({
      name: r.name || "", address: r.display_name || "",
      maps_url: r.lat && r.lon ? `https://www.google.com/maps?q=${r.lat},${r.lon}` : "",
      category: detected?.category || "", type_key: detected?.type_key || "",
      subtype: detected?.subtype || "", city_id: "", phone: "",
      opening_hours: "", price_range: "", website: "", notes: "",
    });
    setSaveStatus(""); setShowAddModal(true);
  }

  function handleOpenManual() {
    setSelected(null); setAutoDetected(null);
    setForm({ name:"", address:"", maps_url:"", category:"", type_key:"", subtype:"",
      city_id:"", phone:"", opening_hours:"", price_range:"", website:"", notes:"" });
    setSaveStatus(""); setShowAddModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setSaveStatus("⚠️ Nama wajib diisi!"); return; }
    if (!form.type_key) { setSaveStatus("⚠️ Pilih kategori & sub-tipe!"); return; }
    setSaving(true); setSaveStatus("⏳ Menyimpan...");
    const catExists = categories.some(c => c.type_key === form.type_key);
    if (!catExists) {
      await supabase.from("idea_categories").upsert([{
        category: form.category, subtype: form.subtype,
        type_key: form.type_key, icon: "📍", photo_url: null,
      }], { onConflict: "type_key" });
    }
    let imageUrl: string | null = null;
    if (newFile) { setSaveStatus("📷 Upload foto..."); imageUrl = await uploadImage(newFile, "anon"); }
    const { error } = await supabase.from("trip_ideas_v2").insert([{
      idea_name: form.name.trim(), type_key: form.type_key, day_of_week: "",
      photo_url: imageUrl, city_id: form.city_id || null,
      address: form.address || null, maps_url: form.maps_url || null,
      phone: form.phone || null, opening_hours: form.opening_hours || null,
      price_range: form.price_range || null, website: form.website || null,
      notes: form.notes || null,
      locations: [{ name:"Lokasi Utama", address: form.address||null, maps_url: form.maps_url||null,
        phone: form.phone||null, opening_hours: form.opening_hours||null,
        price_range: form.price_range||null, website: form.website||null, notes: form.notes||null }],
    }]);
    if (error) { setSaveStatus("❌ Gagal: " + error.message); setSaving(false); return; }
    setSaveStatus("✅ Tersimpan!");
    setSaving(false);
    setTimeout(() => {
      setShowAddModal(false); setSaveStatus(""); setNewFile(null);
      setResults([]); setQuery(""); loadAllData();
    }, 700);
  }

  const subtypesForCat = categories.filter(c => c.category === form.category);
  const showSearchResults = results.length > 0 || searching || !!searchError;
  const showMap = results.length > 0 && results[0]?.lat && !showAddModal;

  const mInp: React.CSSProperties = {
    width:"100%", padding:"11px 14px", border:`1.5px solid ${C.sand}`,
    borderRadius:10, fontSize:"0.92em", color:C.ink, background:C.white,
    outline:"none", fontFamily:"inherit", transition:"border-color 0.2s", boxSizing:"border-box",
  };
  const mLbl: React.CSSProperties = {
    display:"block", fontSize:"0.7em", fontWeight:600, letterSpacing:"0.06em",
    textTransform:"uppercase" as const, color:C.muted, marginBottom:5,
  };

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; }
        .loc-search-input {
          width:100%; padding:13px 44px 13px 44px;
          background:${C.white}; border:1.5px solid ${C.sand}; border-radius:14px;
          font-size:0.95em; font-family:'DM Sans',sans-serif; color:${C.ink};
          outline:none; transition:all 0.2s; box-shadow:0 2px 8px rgba(3,37,76,0.05);
        }
        .loc-search-input:focus { border-color:${C.mocha}; box-shadow:0 0 0 3px rgba(3,37,76,0.1); }
        .loc-search-input::placeholder { color:${C.muted}; }
        .loc-item {
          background:${C.white}; border:1.5px solid ${C.sand}; border-radius:14px;
          padding:12px 14px; cursor:pointer; transition:all 0.15s;
        }
        .loc-item:hover { border-color:${C.mocha}; box-shadow:0 4px 14px rgba(3,37,76,0.1); transform:translateY(-1px); }
        .loc-pin { width:24px; height:24px; border-radius:50%; background:${C.espresso}; color:white;
          display:flex; align-items:center; justify-content:center;
          font-size:0.65em; font-weight:700; flex-shrink:0; transition:background 0.15s; }
        .loc-item:hover .loc-pin { background:${C.mocha}; }
        .loc-tag { display:inline-block; font-size:0.63em; font-weight:700; letter-spacing:0.05em;
          text-transform:uppercase; padding:2px 8px; border-radius:4px;
          background:${C.paper}; color:${C.mocha}; border:1px solid ${C.sand}; }
        .loc-modal-inp:focus { border-color:${C.mocha} !important; }
        .leaflet-container { font-family:'DM Sans',sans-serif !important; }
        .leaflet-pane { z-index:1 !important; }
        .leaflet-top, .leaflet-bottom { z-index:2 !important; }
        .loc-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:18px; }
        .loc-list { max-height:400px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:2px; }
        .loc-map  { min-height:300px; border-radius:14px; overflow:hidden;
          border:1.5px solid ${C.sand}; position:relative; z-index:0;
          box-shadow:0 4px 16px rgba(3,37,76,0.06); }
        @media (max-width:640px) {
          .loc-grid { grid-template-columns:1fr; }
          .loc-list { max-height:none; order:2; }
          .loc-map  { order:1; min-height:220px !important; height:220px; }
        }
      `}</style>

      <Navbar />
      <div style={{ maxWidth:920, margin:"0 auto", padding:"28px 16px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom:28, position:"relative", paddingLeft:16 }}>
          <div style={{ position:"absolute", left:0, top:4, width:3, height:52, borderRadius:2,
            background:`linear-gradient(180deg, ${C.espresso}, ${C.sand})` }} />
          <p style={{ fontSize:"0.68em", fontWeight:700, letterSpacing:"0.16em",
            textTransform:"uppercase", color:C.mocha, margin:"0 0 4px" }}>✦ Trip Planning</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, color:C.espresso,
            fontSize:"clamp(1.7em,4vw,2.4em)", margin:"0 0 6px", lineHeight:1.15, letterSpacing:"-0.02em" }}>
            Temukan <em style={{ color:C.mocha, fontStyle:"italic" }}>Tempat Seru</em>
          </h1>
          <p style={{ color:C.muted, fontSize:"0.87em", margin:0 }}>
            Cari dan simpan tempat-tempat buat trip kalian 💕
          </p>
        </div>

        {/* Search Card */}
        <div style={{ background:C.white, borderRadius:20, border:`1.5px solid ${C.sand}`,
          boxShadow:"0 6px 32px rgba(3,37,76,0.08)", padding:"24px", marginBottom:20,
          position:"relative", zIndex:1 }}>

          {/* stamp */}
          <div style={{ position:"absolute", top:-13, right:24, width:52, height:52, borderRadius:"50%",
            background:C.espresso, display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", boxShadow:"0 4px 14px rgba(3,37,76,0.25)", transform:"rotate(10deg)",
            fontSize:"0.5em", fontWeight:800, textTransform:"uppercase", color:"white",
            lineHeight:1.4, textAlign:"center" }}>
            <span style={{ fontSize:"1.8em" }}>📍</span><span>Find</span>
          </div>

          <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:C.espresso, fontSize:"1.05em", margin:"0 0 2px" }}>
            Cari Lokasi
          </p>
          <p style={{ color:C.muted, fontSize:"0.77em", margin:"0 0 16px" }}>
            Ketik nama tempat, lalu tambahkan ke daftar tripmu
          </p>

          <div style={{ display:"flex", gap:10, alignItems:"stretch", flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex:1, minWidth:200 }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                fontSize:"1em", pointerEvents:"none", opacity:0.3 }}>🔍</span>
              <input className="loc-search-input" value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Restoran, kafe, hotel, wisata..." />
              {searching && <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", opacity:0.4 }}>⏳</span>}
              {query && !searching && (
                <button onClick={() => { setQuery(""); setResults([]); }} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:C.sand, border:"none", cursor:"pointer", color:C.mocha,
                  fontSize:"0.7em", fontWeight:700, width:22, height:22,
                  borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"0 14px", borderRadius:12,
              flexShrink:0, fontSize:"0.79em", fontWeight:600, whiteSpace:"nowrap",
              background: gpsStatus==="ok" ? "rgba(76,175,80,0.08)" : gpsStatus==="denied" ? "rgba(244,63,94,0.08)" : "rgba(3,37,76,0.06)",
              border:`1.5px solid ${gpsStatus==="ok" ? C.sage : gpsStatus==="denied" ? C.terracotta : C.sand}`,
              color: gpsStatus==="ok" ? C.sage : gpsStatus==="denied" ? C.terracotta : C.muted }}>
              {gpsStatus==="loading" ? "⏳" : gpsStatus==="ok" ? "📍" : gpsStatus==="denied" ? "❌" : "📍"}
              <span>{gpsStatus==="loading" ? "Mendeteksi..." : gpsStatus==="ok" ? (locationName||"GPS aktif") : gpsStatus==="denied" ? "GPS nonaktif" : "GPS"}</span>
            </div>
          </div>

          {/* Results */}
          {showSearchResults && (
            <div className="loc-grid">
              <div className="loc-list">
                {searching && (
                  <div style={{ textAlign:"center", padding:"48px 0", color:C.muted, fontSize:"0.85em" }}>
                    <div style={{ fontSize:"2em", marginBottom:8, opacity:0.4 }}>🗺️</div>Sedang mencari...
                  </div>
                )}
                {searchError && !searching && (
                  <div style={{ textAlign:"center", padding:"48px 0", color:C.muted, fontSize:"0.85em" }}>
                    <div style={{ fontSize:"2em", marginBottom:8, opacity:0.4 }}>😕</div>{searchError}
                  </div>
                )}
                {results.map((r, i) => {
                  const det = detectCategory(r);
                  return (
                    <div key={r.place_id} className="loc-item"
                      onMouseEnter={() => setHoveredResult(r.place_id)}
                      onMouseLeave={() => setHoveredResult(null)}
                      onClick={() => setHoveredResult(r.place_id)}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                        <div style={{ minWidth:0, flex:1, display:"flex", gap:10, alignItems:"flex-start" }}>
                          <div className="loc-pin">{i+1}</div>
                          <div style={{ minWidth:0 }}>
                            <p style={{ margin:"0 0 2px", fontWeight:600, color:C.ink, fontSize:"0.88em",
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</p>
                            {r.display_name && (
                              <p style={{ margin:"0 0 5px", fontSize:"0.72em", color:C.muted,
                                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.display_name}</p>
                            )}
                            {det && <span className="loc-tag">{det.subtype}</span>}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleSelectResult(r); }} style={{
                          padding:"6px 14px", borderRadius:999, flexShrink:0,
                          background:C.espresso, color:"white", border:"none",
                          cursor:"pointer", fontSize:"0.73em", fontWeight:600,
                          fontFamily:"inherit", letterSpacing:"0.02em", transition:"background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background=C.mocha)}
                          onMouseLeave={e => (e.currentTarget.style.background=C.espresso)}>
                          + Tambah
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="loc-map">
                {showMap ? (
                  <SearchMapView results={results} hoveredId={hoveredResult}
                    onHover={setHoveredResult} onSelect={handleSelectResult} />
                ) : (
                  <div style={{ height:"100%", minHeight:220, background:C.cream, display:"flex",
                    flexDirection:"column", alignItems:"center", justifyContent:"center",
                    color:C.muted, fontSize:"0.82em", gap:8 }}>
                    <span style={{ fontSize:"2.5em", opacity:0.3 }}>🗺️</span>
                    <span>Peta muncul setelah pencarian</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button onClick={handleOpenManual} style={{
            width:"100%", padding:"12px", borderRadius:12, marginTop:16,
            background:"transparent", border:`1.5px dashed ${C.sand}`,
            color:C.mocha, fontWeight:600, cursor:"pointer",
            fontSize:"0.87em", fontFamily:"inherit", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=C.mocha; e.currentTarget.style.borderStyle="solid"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=C.sand; e.currentTarget.style.borderStyle="dashed"; }}>
            ✏️ Tambah Lokasi Manual
          </button>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(3,37,76,0.5)",
            backdropFilter:"blur(6px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
            onClick={e => { if (e.target===e.currentTarget) setShowAddModal(false); }}>
            <div style={{ background:C.white, borderRadius:"22px 22px 0 0",
              border:`1.5px solid ${C.sand}`, borderBottom:"none",
              width:"100%", maxWidth:600, maxHeight:"92vh",
              overflowY:"auto", padding:"24px 24px 48px",
              boxShadow:"0 -12px 50px rgba(3,37,76,0.18)" }}>
              <div style={{ width:36, height:4, borderRadius:99, background:C.sand, margin:"0 auto 22px" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <p style={{ margin:0, fontSize:"0.67em", fontWeight:700, letterSpacing:"0.1em",
                    textTransform:"uppercase", color:C.mocha }}>{selected ? "Dari Pencarian" : "Manual"}</p>
                  <h3 style={{ margin:"2px 0 0", fontFamily:"'Playfair Display',serif",
                    fontWeight:700, color:C.espresso, fontSize:"1.15em" }}>
                    {selected ? selected.name : "Tambah Lokasi"}
                  </h3>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{
                  background:C.paper, border:`1.5px solid ${C.sand}`, borderRadius:999,
                  padding:"5px 12px", fontWeight:600, cursor:"pointer", color:C.mocha, fontFamily:"inherit", fontSize:"0.82em" }}>
                  ✕ Tutup
                </button>
              </div>

              {selected?.lat && (
                <div style={{ marginBottom:18, borderRadius:12, overflow:"hidden", border:`1.5px solid ${C.sand}` }}>
                  <MapPreview lat={selected.lat} lon={selected.lon} name={form.name} />
                </div>
              )}
              {autoDetected && (
                <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(76,175,80,0.08)",
                  border:`1.5px solid ${C.sage}`, marginBottom:16, fontSize:"0.82em", color:C.sage, fontWeight:600 }}>
                  ✦ Terdeteksi otomatis sebagai <strong>{autoDetected.subtype}</strong>
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
                <div>
                  <label style={mLbl}>Nama Tempat *</label>
                  <input style={mInp} className="loc-modal-inp" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="Nama tempat..." />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={mLbl}>Kategori *</label>
                    <select style={mInp} className="loc-modal-inp" value={form.category}
                      onChange={e => setForm(f => ({ ...f, category:e.target.value, type_key:"", subtype:"" }))}>
                      <option value="">Pilih...</option>
                      {[...new Set(categories.map(c => c.category))].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="__custom__">➕ Baru...</option>
                    </select>
                  </div>
                  <div>
                    <label style={mLbl}>Sub-tipe *</label>
                    <select style={{ ...mInp, opacity:!form.category?0.5:1 }} className="loc-modal-inp"
                      value={form.type_key} disabled={!form.category}
                      onChange={e => {
                        const cat = categories.find(c => c.type_key===e.target.value);
                        setForm(f => ({ ...f, type_key:e.target.value, subtype:cat?.subtype||"" }));
                      }}>
                      <option value="">Pilih...</option>
                      {subtypesForCat.map(s => <option key={s.type_key} value={s.type_key}>{s.subtype}</option>)}
                      <option value="__custom__">➕ Baru...</option>
                    </select>
                    {form.type_key==="__custom__" && (
                      <input style={{ ...mInp, marginTop:6 }} value={form.subtype}
                        onChange={e => setForm(f => ({ ...f, subtype:e.target.value,
                          type_key:e.target.value.toLowerCase().replace(/\s+/g,"_") }))}
                        placeholder="Nama sub-tipe baru" />
                    )}
                  </div>
                </div>
                <div>
                  <label style={mLbl}>Alamat</label>
                  <textarea style={{ ...mInp, resize:"vertical" } as React.CSSProperties} className="loc-modal-inp"
                    value={form.address} rows={2} onChange={e => setForm(f => ({ ...f, address:e.target.value }))} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={mLbl}>No. Telepon</label>
                    <input style={mInp} className="loc-modal-inp" value={form.phone} placeholder="08xx..."
                      onChange={e => setForm(f => ({ ...f, phone:e.target.value }))} />
                  </div>
                  <div>
                    <label style={mLbl}>Jam Buka</label>
                    <input style={mInp} className="loc-modal-inp" value={form.opening_hours} placeholder="10:00 – 22:00"
                      onChange={e => setForm(f => ({ ...f, opening_hours:e.target.value }))} />
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={mLbl}>Kisaran Harga</label>
                    <input style={mInp} className="loc-modal-inp" value={form.price_range} placeholder="Rp 50.000 – 100.000"
                      onChange={e => setForm(f => ({ ...f, price_range:e.target.value }))} />
                  </div>
                  <div>
                    <label style={mLbl}>Kota</label>
                    <select style={mInp} className="loc-modal-inp" value={form.city_id}
                      onChange={e => setForm(f => ({ ...f, city_id:e.target.value }))}>
                      <option value="">Tanpa Kota</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={mLbl}>Link Google Maps</label>
                  <input style={mInp} className="loc-modal-inp" value={form.maps_url} placeholder="https://maps.google.com/..."
                    onChange={e => setForm(f => ({ ...f, maps_url:e.target.value }))} />
                  {selected && <p style={{ margin:"4px 0 0", fontSize:"0.74em", color:C.sage }}>✅ Otomatis dari hasil pencarian</p>}
                </div>
                <div>
                  <label style={mLbl}>Website</label>
                  <input style={mInp} className="loc-modal-inp" value={form.website} placeholder="https://..."
                    onChange={e => setForm(f => ({ ...f, website:e.target.value }))} />
                </div>
                <div>
                  <label style={mLbl}>Catatan</label>
                  <textarea style={{ ...mInp, resize:"vertical" } as React.CSSProperties} className="loc-modal-inp"
                    value={form.notes} rows={2} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} />
                </div>
                <div>
                  <label style={mLbl}>📷 Foto (Opsional)</label>
                  <input type="file" accept="image/*" onChange={e => setNewFile(e.target.files?.[0]||null)}
                    style={{ fontSize:"0.82em", color:C.ink, width:"100%" }} />
                </div>
                {saveStatus && (
                  <p style={{ margin:0, fontSize:"0.85em", fontWeight:600,
                    color:saveStatus.startsWith("❌")?C.error:saveStatus.startsWith("⚠️")?"#f59e0b":C.sage }}>
                    {saveStatus}
                  </p>
                )}
                <button disabled={saving} onClick={handleSave} style={{
                  padding:"13px", borderRadius:12, width:"100%",
                  background:saving?C.sand:C.espresso, color:saving?C.muted:"white",
                  border:"none", fontWeight:700, cursor:saving?"not-allowed":"pointer",
                  fontSize:"0.95em", fontFamily:"inherit", letterSpacing:"0.02em",
                  boxShadow:saving?"none":"0 4px 14px rgba(3,37,76,0.25)", transition:"all 0.2s" }}>
                  {saving ? "⏳ Menyimpan..." : "💾 Simpan Lokasi"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}