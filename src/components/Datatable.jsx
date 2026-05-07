import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./datatable.css";
import SearchIcon         from "@mui/icons-material/Search";
import PrintIcon          from "@mui/icons-material/Print";
import PictureAsPdfIcon   from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon     from "@mui/icons-material/Visibility";
import EditIcon           from "@mui/icons-material/Edit";
import DeleteIcon         from "@mui/icons-material/Delete";
import FirstPageIcon      from "@mui/icons-material/FirstPage";
import LastPageIcon       from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon   from "@mui/icons-material/NavigateNext";

export default function DataTable({
  columns = [],
  data = [],
  onAdd,
  onEdit,
  onDelete,
  onView,
  title = "Table",
  exportName = "export",
}) {
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage]       = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      columns.some((c) =>
        String(row[c.key] ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const res = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? res : -res;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const pageData   = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const exportPDF = () => {
    const pdfColumns = columns.filter((c) => !c.pdfExclude);
    const doc = new jsPDF();
    doc.text(title, 10, 10);
    autoTable(doc, {
      head: [pdfColumns.map((c) => c.label)],
      body: sorted.map((row) =>
        pdfColumns.map((c) => {
          const value = row[c.key];
          return c.pdfFormat ? c.pdfFormat(value) : (value ?? "");
        })
      ),
    });
    doc.save(`${exportName}.pdf`);
  };

  const handlePrint = () => {
    const printColumns = columns.filter((c) => !c.pdfExclude);
    const rows = sorted.map((row) =>
      printColumns.map((c) => {
        const value = row[c.key];
        return c.pdfFormat ? c.pdfFormat(value) : (value ?? "");
      })
    );

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: "Segoe UI", Arial, sans-serif; padding: 24px; color: #1a1a2e; }
            h2 { font-size: 18px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            thead tr { background: #EA6113; color: #fff; }
            th { padding: 10px 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 10.5px; letter-spacing: .4px; }
            td { padding: 9px 12px; border-bottom: 1px solid #f0e0cc; color: #2d2013; }
            tr:nth-child(even) td { background: #fdfaf7; }
            tr:last-child td { border-bottom: none; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <table>
            <thead>
              <tr>${printColumns.map((c) => `<th>${c.label}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows.map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
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

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    for (let i = left; i <= right; i++) range.push(i);
    if (left > 1)           { range.unshift("..."); range.unshift(1); }
    if (right < totalPages) { range.push("...");    range.push(totalPages); }
    return range;
  };

  return (
    <div className="dt-container">

      <div className="dt-header">
        <h2 className="dt-title">{title}</h2>
        <div className="dt-actions">
          {onAdd && (
            <button className="dt-btn" onClick={onAdd}>+ Ajouter</button>
          )}
          <button className="dt-btn-pdf" onClick={exportPDF}>
            <PictureAsPdfIcon fontSize="small" /> PDF
          </button>
          <button className="dt-btn-print" onClick={handlePrint}>
            <PrintIcon fontSize="small" /> Imprimer
          </button>
        </div>
      </div>

      <div className="dt-search-wrap">
        <SearchIcon
          sx={{
            position: "absolute",
            left: 11,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 18,
            color: "#F88F22",
            pointerEvents: "none",
          }}
        />
        <input
          className="dt-search"
          placeholder="Rechercher..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="dt-table-card">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} onClick={() => handleSort(c.key)}>
                  {c.label}&nbsp;
                  {sortKey === c.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="dt-empty">
                  Aucun résultat trouvé
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr key={row.id_brevet}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {c.render ? c.render(row[c.key], row) : row[c.key]}
                    </td>
                  ))}
                  <td className="dt-actions-cell">
                    {onView && (
                      <button className="dt-btn-icon dt-btn-view" onClick={() => onView(row)} title="Voir">
                        <VisibilityIcon fontSize="small" />
                      </button>
                    )}
                    {onEdit && (
                      <button className="dt-btn-icon dt-btn-edit" onClick={() => onEdit(row)} title="Modifier">
                        <EditIcon fontSize="small" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="dt-btn-icon dt-btn-delete"
                        onClick={() => {
                          if (window.confirm("Voulez-vous vraiment supprimer cet élément ?")) {
                            onDelete(row);
                          }
                        }}
                        title="Supprimer"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {sorted.length > 0 && (
          <div className="dt-pagination">
            <span className="dt-pg-info">
              {sorted.length} résultat{sorted.length !== 1 ? "s" : ""} — page {page} / {totalPages || 1}
            </span>
            <button className="dt-pg-btn" onClick={() => setPage(1)} disabled={page === 1} title="Première page">
              <FirstPageIcon fontSize="small" />
            </button>
            <button className="dt-pg-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} title="Page précédente">
              <NavigateBeforeIcon fontSize="small" />
            </button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="dt-pg-ellipsis">…</span>
              ) : (
                <button
                  key={p}
                  className={`dt-pg-btn${p === page ? " active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button className="dt-pg-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} title="Page suivante">
              <NavigateNextIcon fontSize="small" />
            </button>
            <button className="dt-pg-btn" onClick={() => setPage(totalPages)} disabled={page >= totalPages} title="Dernière page">
              <LastPageIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}