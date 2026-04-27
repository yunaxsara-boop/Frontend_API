import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./datatable.css";
import SearchIcon       from "@mui/icons-material/Search";
import VisibilityIcon   from "@mui/icons-material/Visibility";
import EditIcon         from "@mui/icons-material/Edit";
import DeleteIcon       from "@mui/icons-material/Delete";

export default function Datatable2({
  columns = [],
  data = [],
  form,
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
  const perPage = 10;

  /* ── Search ── */
  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      columns.some((c) =>
        String(row[c.key] ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data, columns]);

  /* ── Sort ── */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const res = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? res : -res;
    });
  }, [filtered, sortKey, sortDir]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(sorted.length / perPage);
  const pageData   = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  /* ── Export Excel ── */
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sorted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "data");
    XLSX.writeFile(wb, `${exportName}.xlsx`);
  };

  /* ── Export PDF ── */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 10, 10);
    autoTable(doc, {
      head: [columns.map((c) => c.label)],
      body: sorted.map((row) => columns.map((c) => row[c.key])),
    });
    doc.save(`${exportName}.pdf`);
  };

  /* ── Page numbers ── */
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
    <div className="dt-layout">

      {/* ── LEFT : formulaire ── */}
      <div className="dt-left">{form}</div>

      {/* ── RIGHT : table ── */}
      <div className="dt-right">

        {/* Header */}
        <div className="dt-header">
          <h2 className="dt-title">{title}</h2>
          <div className="dt-actions">
            <button className="dt-btn-excel" onClick={exportExcel}>⬇ Excel</button>
            <button className="dt-btn-pdf"   onClick={exportPDF}>⬇ PDF</button>
          </div>
        </div>

        {/* Search */}
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

        {/* Table card */}
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
                <tr key={row.id}>
                  {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(row[c.key]): row[c.key]}
                  </td>
                  ))}
                  <td className="dt-actions-cell">
                    {onView && (
                      <button
                        className="dt-btn-icon dt-btn-view"
                        onClick={() => onView(row)}
                        title="Voir"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="dt-btn-icon dt-btn-edit"
                        onClick={() => onEdit(row)}
                        title="Modifier"
                      >
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

          {/* Pagination */}
          {sorted.length > 0 && (
            <div className="dt-pagination">
              <span className="dt-pg-info">
                {sorted.length} résultat{sorted.length !== 1 ? "s" : ""} — page {page} / {totalPages || 1}
              </span>

              <button className="dt-pg-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="dt-pg-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>

              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="dt-pg-ellipsis">…</span>
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

              <button className="dt-pg-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>›</button>
              <button className="dt-pg-btn" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>»</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}