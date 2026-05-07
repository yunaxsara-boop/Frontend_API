import React, { useState, useMemo } from "react";
import SearchIcon        from "@mui/icons-material/Search";
import PictureAsPdfIcon  from "@mui/icons-material/PictureAsPdf";
import PrintIcon         from "@mui/icons-material/Print";
import ArrowUpwardIcon   from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon    from "@mui/icons-material/UnfoldMore";
import "./DataTable3.css";

export function Badge({ label, color = "gray" }) {
  if (!label || label === "—")
    return <span className="dt3-muted">—</span>;
  return <span className={`dt3-badge b-${color}`}>{label}</span>;
}

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

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col)
    return <UnfoldMoreIcon className="dt3-sort" style={{ fontSize: 13 }} />;
  return sortDir === "asc"
    ? <ArrowUpwardIcon   className="dt3-sort on" style={{ fontSize: 13 }} />
    : <ArrowDownwardIcon className="dt3-sort on" style={{ fontSize: 13 }} />;
}

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
  fileName = "export",
}) {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("Tous");
  const [extraState, setExtra]    = useState(
    Object.fromEntries(extraFilters.map((f) => [f.key, "Tous"]))
  );
  const [sortCol, setSortCol]     = useState(null);
  const [sortDir, setSortDir]     = useState("asc");
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(10);

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

  const handlePDF = () => {
    import("jspdf").then(({ default: jsPDF }) => {
      import("jspdf-autotable").then(() => {
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(15);
        doc.text(pdfTitle || title, 14, 16);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
          `Exporté le ${new Date().toLocaleDateString("fr-FR")} — ${filtered.length} enregistrement(s)`,
          14, 23
        );
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

  const handlePrint = () => {
    const rows = filtered.map(pdfRow);

    const html = `
      <html>
        <head>
          <title>${pdfTitle || title}</title>
          <style>
            body { font-family: "Segoe UI", Arial, sans-serif; padding: 24px; color: #1a1a2e; }
            h2 { font-size: 18px; margin-bottom: 6px; }
            p  { font-size: 12px; color: #a0826d; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            thead tr { background: #EA6113; color: #fff; }
            th { padding: 10px 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 10.5px; letter-spacing: .4px; }
            td { padding: 9px 12px; border-bottom: 1px solid #f0e0cc; color: #2d2013; }
            tr:nth-child(even) td { background: #fdfaf7; }
            tr:last-child td { border-bottom: none; }
          </style>
        </head>
        <body>
          <h2>${pdfTitle || title}</h2>
          <p>Imprimé le ${new Date().toLocaleDateString("fr-FR")} — ${filtered.length} enregistrement(s)</p>
          <table>
            <thead>
              <tr>${pdfColumns.map((c) => `<th>${c}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows.map((r) => `<tr>${r.map((cell) => `<td>${cell ?? ""}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="dt3-page">

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
          <button className="dt3-btn dt3-btn-print" onClick={handlePrint}>
            <PrintIcon style={{ fontSize: 16 }} /> Imprimer
          </button>
        </div>
      </div>

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

      <div className="dt3-card">
        <div className="dt3-toolbar">
          <div className="dt3-toolbar-left">
            <div className="dt3-search-wrap">
              <div><SearchIcon style={{ fontSize: 17 }} /></div>
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