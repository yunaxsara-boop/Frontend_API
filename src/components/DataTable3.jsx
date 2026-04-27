import React, { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import "./DataTable3.css";

/* ════════════════════════════════════════════════
   BADGE — affiche un label coloré
   color: "green" | "yellow" | "red" | "blue" | "gray" | "orange" | "purple"
════════════════════════════════════════════════ */
export function Badge({ label, color = "gray" }) {
  if (!label || label === "—")
    return <span className="dt3-muted">—</span>;
  return (
    <span className={`dt3-badge b-${color}`}>{label}</span>
  );
}

/* ════════════════════════════════════════════════
   PAGINATION
════════════════════════════════════════════════ */
function Pagination({ page, totalPages, total, perPage, setPage, setPerPage }) {
  const maxBtn = 7;
  let pages = [];
  if (totalPages <= maxBtn) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pages = page <= 4
      ? [1, 2, 3, 4, 5, "...", totalPages]
      : page >= totalPages - 3
      ? [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
      : [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  return (
    <div className="dt3-pagination">
      <div className="dt3-per-page">
        <span>Afficher</span>
        <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
          {[5, 10, 25, 50].map((n) => <option key={n}>{n}</option>)}
        </select>
        <span>entrées — {total} résultat{total > 1 ? "s" : ""}</span>
      </div>
      <div className="dt3-pages">
        <button className="dt3-pb" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dot${i}`} style={{ padding: "0 4px", color: "#aaa" }}>…</span>
          ) : (
            <button key={p} className={`dt3-pb ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          )
        )}
        <button className="dt3-pb" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
      </div>
      <span>Page {page} / {totalPages}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SORT ICON
════════════════════════════════════════════════ */
function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col)
    return <UnfoldMoreIcon className="dt3-sort" style={{ fontSize: 13 }} />;
  return sortDir === "asc"
    ? <ArrowUpwardIcon  className="dt3-sort on" style={{ fontSize: 13 }} />
    : <ArrowDownwardIcon className="dt3-sort on" style={{ fontSize: 13 }} />;
}

/* ════════════════════════════════════════════════
   DATATABLE3 — Composant principal

   Props :
   ─────────────────────────────────────────────
   icon        : ReactNode  — icône dans le header
   title       : string     — titre de la page
   subtitle    : string     — sous-titre
   stats       : Array<{ label, value, color? }> — cartes stats
   columns     : Array<{
                   key       : string,
                   label     : string,
                   sortable? : bool,
                   render?   : (row) => ReactNode   ← rendu custom
                 }>
   data        : Array<object>
   searchKeys  : Array<string>  — colonnes cherchées
   statusKey   : string         — clé utilisée pour filtre statut
   statusList  : Array<string>  — ex: ["Tous","Payé","Retard"]
   extraFilters?: Array<{       — filtres supplémentaires (ex: type fichier)
                   key: string,
                   label: string,
                   options: Array<string>
                 }>
   pdfTitle    : string
   pdfColumns  : Array<string>  — en-têtes PDF
   pdfRow      : (row) => Array — ligne PDF
   excelRow    : (row) => object — ligne Excel
   fileName    : string         — nom du fichier exporté (sans extension)
════════════════════════════════════════════════ */
export default function DataTable3({
  icon,
  title,
  subtitle,
  stats = [],
  columns = [],
  data = [],
  searchKeys = [],
  statusKey = "statut",
  statusList = ["Tous"],
  extraFilters = [],
  pdfTitle = "",
  pdfColumns = [],
  pdfRow = () => [],
  excelRow = () => ({}),
  fileName = "export",
}) {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("Tous");
  const [extraState, setExtra]        = useState(
    Object.fromEntries(extraFilters.map((f) => [f.key, "Tous"]))
  );
  const [sortCol, setSortCol]         = useState(null);
  const [sortDir, setSortDir]         = useState("asc");
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(10);

  /* ── filtrage + tri ── */
  const filtered = useMemo(() => {
    let d = [...data];
    if (search) {
      const q = search.toLowerCase();
      d = d.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "Tous") {
      d = d.filter((row) => row[statusKey] === statusFilter);
    }
    extraFilters.forEach((f) => {
      if (extraState[f.key] && extraState[f.key] !== "Tous") {
        d = d.filter((row) => row[f.key] === extraState[f.key]);
      }
    });
    if (sortCol) {
      d.sort((a, b) => {
        const av = a[sortCol] ?? "", bv = b[sortCol] ?? "";
        const cmp = String(av).localeCompare(String(bv), "fr", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return d;
  }, [data, search, statusFilter, extraState, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  /* ── export PDF ── */
  const handlePDF = () => {
    import("jspdf").then(({ default: jsPDF }) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(15);
        doc.text(pdfTitle || title, 14, 16);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")} — ${filtered.length} enregistrement(s)`, 14, 23);
        doc.autoTable({
          startY: 28,
          head: [pdfColumns],
          body: filtered.map(pdfRow),
          styles: { fontSize: 8.5 },
          headStyles: { fillColor: [255, 122, 0], textColor: 255 },
          alternateRowStyles: { fillColor: [255, 250, 243] },
        });
        doc.save(`${fileName}.pdf`);
      });
    });
  };

  /* ── export Excel ── */
  const handleExcel = () => {
    import("xlsx").then((XLSX) => {
      const ws = XLSX.utils.json_to_sheet(filtered.map(excelRow));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    });
  };

  return (
    <div className="dt3-page">
      {/* ── HEADER ── */}
      <div className="dt3-header">
        <div className="dt3-title-block">
          <div className="dt3-icon-box">{icon}</div>
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        <div className="dt3-actions">
          <button className="dt3-btn dt3-btn-pdf" onClick={handlePDF}>
            <PictureAsPdfIcon style={{ fontSize: 16 }} /> Exporter PDF
          </button>
          <button className="dt3-btn dt3-btn-excel" onClick={handleExcel}>
            <TableChartIcon style={{ fontSize: 16 }} /> Exporter Excel
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      {stats.length > 0 && (
        <div className="dt3-stats">
          {stats.map((s, i) => (
            <div key={i} className={`dt3-stat ${s.color || ""}`}>
              <div className="dt3-stat-lbl">{s.label}</div>
              <div className="dt3-stat-val">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABLE CARD ── */}
      <div className="dt3-card">
        {/* Toolbar */}
        <div className="dt3-toolbar">
          <div className="dt3-toolbar-left">
            <div className="dt3-search-wrap">
              <SearchIcon />
              <input
                className="dt3-search"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            {statusList.length > 1 && (
              <select className="dt3-select" value={statusFilter}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                {statusList.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
            {extraFilters.map((f) => (
              <select key={f.key} className="dt3-select"
                value={extraState[f.key]}
                onChange={(e) => { setExtra((prev) => ({ ...prev, [f.key]: e.target.value })); setPage(1); }}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>
          <span className="dt3-count">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div className="dt3-table-wrap">
          <table className="dt3-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={col.sortable ? "sort" : ""}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    {col.label}
                    {col.sortable && (
                      <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="dt3-empty">
                    Aucun résultat trouvé
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr key={row.id ?? idx}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row) : (row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={filtered.length}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
        />
      </div>
    </div>
  );
}