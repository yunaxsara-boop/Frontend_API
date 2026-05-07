import { useNavigate } from "react-router-dom";

export default function RecentTable({ title, columns, rows, badgeKey, badgeMap, voirToutLink }) {
  const navigate = useNavigate();

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <span className="dash-card-title">{title}</span>
        {voirToutLink && (
          <button className="view-all" onClick={() => navigate(voirToutLink)}>
            Voir tout →
          </button>
        )}
      </div>
      <table className="mini-table">
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "20px", color: "#c4a882", fontStyle: "italic" }}>
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.key === badgeKey ? (
                      <span className={`badge ${badgeMap[row[c.key]] || ""}`}>
                        {row[c.key]}
                      </span>
                    ) : c.render ? (
                      c.render(row[c.key], row)
                    ) : (
                      row[c.key] ?? "—"
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}