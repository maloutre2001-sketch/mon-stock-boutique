import { useState, useEffect, useRef, useCallback } from "react";

const STATUTS = [
  { id: "boutique", label: "En boutique", color: "#2d6a4f", bg: "#d8f3dc" },
  { id: "atelier", label: "En atelier", color: "#7b3f00", bg: "#ffe8cc" },
  { id: "reserve", label: "En réserve", color: "#1a3a5c", bg: "#d0e8ff" },
  { id: "vendu", label: "Vendu", color: "#5a5a5a", bg: "#ebebeb" },
];

const STORAGE_KEY = "stock-boutique-v1";

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function StatutBadge({ statutId, onClick, size = "sm" }) {
  const s = STATUTS.find(x => x.id === statutId) || STATUTS[0];
  return (
    <span
      onClick={onClick}
      style={{
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.color}33`,
        borderRadius: 20,
        padding: size === "lg" ? "6px 16px" : "3px 10px",
        fontSize: size === "lg" ? 14 : 12,
        fontWeight: 600,
        fontFamily: "'DM Mono', monospace",
        cursor: onClick ? "pointer" : "default",
        letterSpacing: "0.02em",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function PhotoZone({ photo, onPhoto }) {
  const inputRef = useRef();
  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        width: "100%",
        aspectRatio: "4/3",
        borderRadius: 12,
        overflow: "hidden",
        background: photo ? "none" : "#f3f0eb",
        border: photo ? "none" : "2px dashed #c8bfb0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {photo ? (
        <img src={photo} alt="objet" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ textAlign: "center", color: "#a09585" }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
          <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Ajouter une photo</div>
        </div>
      )}
      {photo && (
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          background: "rgba(0,0,0,0.55)", borderRadius: 8,
          color: "#fff", fontSize: 11, padding: "3px 8px",
          fontFamily: "'DM Mono', monospace", cursor: "pointer"
        }}>
          Changer
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = ev => onPhoto(ev.target.result);
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}

function ItemCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        cursor: "pointer",
        transition: "box-shadow 0.18s, transform 0.18s",
        border: "1px solid #ede8e0",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.13)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{
        width: "100%", aspectRatio: "4/3", background: "#f3f0eb",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
      }}>
        {item.photo
          ? <img src={item.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 36, opacity: 0.3 }}>🏷</span>}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: "#1a1410", lineHeight: 1.3, flex: 1 }}>
            {item.designation || <span style={{ color: "#bbb", fontStyle: "italic" }}>Sans désignation</span>}
          </div>
          <StatutBadge statutId={item.statut} />
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#a09585", marginBottom: 4 }}>
          {item.codeBarres || "—"}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ fontSize: 12, color: "#8a7a6a", fontFamily: "'DM Mono', monospace" }}>
            Achat : {item.prixAchat ? `${item.prixAchat} €` : "—"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2d6a4f", fontFamily: "'DM Mono', monospace" }}>
            {item.prixVente ? `${item.prixVente} €` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(15,10,5,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, backdropFilter: "blur(3px)",
      }}
    >
      <div style={{
        background: "#faf8f5", borderRadius: 20, width: "100%", maxWidth: 520,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        padding: 28,
      }}>
        {children}
      </div>
    </div>
  );
}

const emptyItem = () => ({
  id: genId(),
  designation: "",
  codeBarres: "",
  categorie: "",
  description: "",
  prixAchat: "",
  prixVente: "",
  statut: "boutique",
  photo: null,
  dateEntree: new Date().toISOString().slice(0, 10),
  notes: "",
});

export default function App() {
  const [items, setItems] = useState(loadItems);
  const [view, setView] = useState("stock"); // stock | form
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyItem());
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [search, setSearch] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => { saveItems(items); }, [items]);

  const filtered = items.filter(it => {
    const matchStatut = filtreStatut === "tous" || it.statut === filtreStatut;
    const q = search.toLowerCase();
    const matchSearch = !q || it.designation?.toLowerCase().includes(q) || it.codeBarres?.toLowerCase().includes(q) || it.categorie?.toLowerCase().includes(q);
    return matchStatut && matchSearch;
  });

  const openNew = () => {
    setForm(emptyItem());
    setEditItem(null);
    setView("form");
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setEditItem(item.id);
    setView("form");
  };

  const saveForm = () => {
    if (editItem) {
      setItems(prev => prev.map(it => it.id === editItem ? { ...form } : it));
    } else {
      setItems(prev => [{ ...form }, ...prev]);
    }
    setView("stock");
    setConfirmDel(false);
  };

  const deleteItem = () => {
    setItems(prev => prev.filter(it => it.id !== editItem));
    setView("stock");
    setConfirmDel(false);
  };

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const counts = {};
  STATUTS.forEach(s => { counts[s.id] = items.filter(it => it.statut === s.id).length; });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f1eb",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0ece6; }
        ::-webkit-scrollbar-thumb { background: #c8bfb0; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#1a1410",
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f5f1eb", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Inventaire
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a7a6a", marginTop: 1 }}>
            {items.length} objet{items.length !== 1 ? "s" : ""} enregistré{items.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          onClick={openNew}
          style={{
            background: "#c8a96e",
            color: "#1a1410",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          + Entrée
        </button>
      </div>

      {/* Statut tabs */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #ede8e0",
        padding: "12px 20px",
        display: "flex",
        gap: 8,
        overflowX: "auto",
      }}>
        <button
          onClick={() => setFiltreStatut("tous")}
          style={{
            border: "none",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            background: filtreStatut === "tous" ? "#1a1410" : "#f0ece6",
            color: filtreStatut === "tous" ? "#f5f1eb" : "#5a5048",
            fontFamily: "'DM Mono', monospace",
            whiteSpace: "nowrap",
          }}
        >
          Tous ({items.length})
        </button>
        {STATUTS.map(s => (
          <button
            key={s.id}
            onClick={() => setFiltreStatut(s.id)}
            style={{
              border: "none",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: filtreStatut === s.id ? s.color : s.bg,
              color: filtreStatut === s.id ? "#fff" : s.color,
              fontFamily: "'DM Mono', monospace",
              whiteSpace: "nowrap",
            }}
          >
            {s.label} ({counts[s.id] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: "16px 20px 0" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par désignation, code-barres, catégorie…"
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #ddd8cf",
            background: "#fff",
            fontSize: 14,
            outline: "none",
            color: "#1a1410",
          }}
        />
      </div>

      {/* Grid */}
      <div style={{
        padding: "16px 20px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
      }}>
        {filtered.length === 0 ? (
          <div style={{
            gridColumn: "1/-1",
            textAlign: "center",
            padding: "60px 0",
            color: "#b0a898",
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
          }}>
            {items.length === 0 ? "Aucun objet encore — cliquez sur + Entrée" : "Aucun résultat"}
          </div>
        ) : filtered.map(item => (
          <ItemCard key={item.id} item={item} onClick={() => openEdit(item)} />
        ))}
      </div>

      {/* Modal formulaire */}
      {view === "form" && (
        <Modal onClose={() => setView("stock")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#1a1410" }}>
              {editItem ? "Modifier l'objet" : "Nouvel objet"}
            </div>
            <button onClick={() => setView("stock")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8a7a6a" }}>✕</button>
          </div>

          {/* Photo */}
          <PhotoZone photo={form.photo} onPhoto={p => field("photo", p)} />

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Désignation */}
            <div>
              <label style={labelStyle}>Désignation *</label>
              <input
                value={form.designation}
                onChange={e => field("designation", e.target.value)}
                placeholder="ex: Cafetière argentée Art Déco"
                style={inputStyle}
              />
            </div>

            {/* Code-barres */}
            <div>
              <label style={labelStyle}>Code-barres</label>
              <input
                value={form.codeBarres}
                onChange={e => field("codeBarres", e.target.value)}
                placeholder="Scanner ou saisir"
                style={inputStyle}
              />
            </div>

            {/* Catégorie */}
            <div>
              <label style={labelStyle}>Catégorie</label>
              <input
                value={form.categorie}
                onChange={e => field("categorie", e.target.value)}
                placeholder="ex: Argenterie, Mobilier, Bijoux…"
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={e => field("description", e.target.value)}
                placeholder="Époque, état, provenance, poinçons…"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Prix */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Prix d'achat (€)</label>
                <input
                  type="number"
                  value={form.prixAchat}
                  onChange={e => field("prixAchat", e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Prix de vente (€)</label>
                <input
                  type="number"
                  value={form.prixVente}
                  onChange={e => field("prixVente", e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Marge */}
            {form.prixAchat && form.prixVente && (
              <div style={{
                background: "#d8f3dc", borderRadius: 10, padding: "10px 14px",
                display: "flex", justifyContent: "space-between",
                fontFamily: "'DM Mono', monospace", fontSize: 13,
              }}>
                <span style={{ color: "#2d6a4f" }}>Marge brute</span>
                <span style={{ fontWeight: 700, color: "#2d6a4f" }}>
                  {(((form.prixVente - form.prixAchat) / form.prixAchat) * 100).toFixed(0)} % · +{(form.prixVente - form.prixAchat).toFixed(2)} €
                </span>
              </div>
            )}

            {/* Date entrée */}
            <div>
              <label style={labelStyle}>Date d'entrée</label>
              <input
                type="date"
                value={form.dateEntree}
                onChange={e => field("dateEntree", e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Statut */}
            <div>
              <label style={labelStyle}>Statut</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                {STATUTS.map(s => (
                  <div
                    key={s.id}
                    onClick={() => field("statut", s.id)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 20,
                      cursor: "pointer",
                      border: `2px solid ${form.statut === s.id ? s.color : "transparent"}`,
                      background: s.bg,
                      color: s.color,
                      fontWeight: 700,
                      fontSize: 13,
                      fontFamily: "'DM Mono', monospace",
                      transition: "border 0.15s",
                    }}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes internes</label>
              <textarea
                value={form.notes}
                onChange={e => field("notes", e.target.value)}
                placeholder="Fournisseur, historique, remarques…"
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={saveForm}
              disabled={!form.designation}
              style={{
                flex: 1,
                background: form.designation ? "#1a1410" : "#ccc",
                color: "#f5f1eb",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontSize: 15,
                fontWeight: 700,
                cursor: form.designation ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {editItem ? "Enregistrer" : "Ajouter au stock"}
            </button>
            {editItem && (
              <button
                onClick={() => setConfirmDel(true)}
                style={{
                  background: confirmDel ? "#c0392b" : "#fdecea",
                  color: confirmDel ? "#fff" : "#c0392b",
                  border: "none",
                  borderRadius: 12,
                  padding: "13px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClickCapture={e => {
                  if (!confirmDel) { e.stopPropagation(); setConfirmDel(true); }
                  else deleteItem();
                }}
              >
                {confirmDel ? "Confirmer suppression" : "Supprimer"}
              </button>
            )}
          </div>
          {confirmDel && (
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "#c0392b", fontFamily: "'DM Mono', monospace" }}>
              Cliquez à nouveau sur "Confirmer suppression" pour effacer définitivement.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#8a7a6a",
  marginBottom: 5,
  fontFamily: "'DM Mono', monospace",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid #ddd8cf",
  background: "#fff",
  fontSize: 14,
  color: "#1a1410",
  outline: "none",
};
