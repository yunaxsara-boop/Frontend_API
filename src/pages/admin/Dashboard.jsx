import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../features/users/userApi";
import "../../components/dashboard/dashboard.css";

const ROLE_DESCRIPTIONS = {
  admin:       "Gère les utilisateurs, les rôles et les accès.",
  agent:       "Crée et suit les demandes, brevets, documents et paiements.",
  responsable: "Vérifie les demandes et change leur statut.",
  directeur:   "Consulte les informations principales du système.",
};

const ROLE_LABEL = {
  admin:       "Admin",
  agent:       "Agent",
  responsable: "Responsable",
  directeur:   "Directeur",
};

const quickActions = [
  { label: "Ajouter un utilisateur", section: "dt-form", active: true },
  { label: "Modifier un rôle",       section: "dt-list" },
  { label: "Consulter la liste",     section: "dt-list" },
];

// ✅ API renvoie groups = ["directeur"] (minuscule, tableau de strings)
function getRole(user) {
  if (user?.is_staff || user?.is_superuser) return "admin";
  return (user?.groups?.[0] || "").toLowerCase() || "sans_role";
}

function getRoleLabel(role) {
  return ROLE_LABEL[role] || "Sans rôle";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getUsers()
      .then((data) => { if (active) setUsers(Array.isArray(data) ? data : []); })
      .catch((err) => console.error("Dashboard load error:", err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const roleCounts = { admin: 0, agent: 0, responsable: 0, directeur: 0, sans_role: 0 };

    users.forEach((user) => {
      const role = getRole(user);
      if (role in roleCounts) roleCounts[role]++;
      else roleCounts.sans_role++;
    });

    return {
      total:      users.length,
      roleCounts,
      sansRole:   roleCounts.sans_role,
      rolesDistincts: Object.keys(roleCounts).filter(
        (r) => r !== "sans_role" && roleCounts[r] > 0
      ).length,
    };
  }, [users]);

  const focusCards = [
    {
      value: String(summary.total),
      label: "Utilisateurs",
      text:  "Comptes enregistrés dans le système.",
    },
    {
      value: String(summary.rolesDistincts),
      label: "Rôles actifs",
      text:  "Rôles ayant au moins un utilisateur.",
    },
    {
      value: summary.sansRole > 0 ? String(summary.sansRole) : "OK",
      label: "Accès",
      text:  summary.sansRole > 0
        ? `${summary.sansRole} utilisateur(s) sans rôle attribué.`
        : "Chaque utilisateur a un rôle attribué.",
      alert: summary.sansRole > 0,
    },
    {
      value: String(summary.total),
      label: "Comptes",
      text:  "Tous les comptes sont actifs.",
    },
  ];

  const latestUsers = useMemo(() =>
    [...users]
      .sort((a, b) =>
        new Date(b?.date_ajout || 0).getTime() - new Date(a?.date_ajout || 0).getTime()
      )
      .slice(0, 3)
      .map((user) => ({
        username: user.username,
        role:     getRoleLabel(getRole(user)),
      })),
    [users]
  );

  const goToUsers = (section) => navigate(`/admin/users#${section}`);

  if (loading) return <div className="dash-page"><p>Chargement…</p></div>;

  return (
    <div className="dash-page">

      <div className="dash-topbar">
        <h2 className="dash-page-title">Tableau de bord Admin</h2>
        <button className="filter-btn active" type="button" onClick={() => goToUsers("dt-form")}>
          Gérer les utilisateurs
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="stats-grid">
        {focusCards.map((card) => (
          <div className={`stat-card${card.alert ? " alert" : ""}`} key={card.label}>
            <span className="stat-accent-bar" />
            <div className="stat-info">
              <div className="stat-val">{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <span className={`stat-trend ${card.alert ? "down" : "up"}`}>{card.text}</span>
            </div>
            <span className="stat-deco" />
          </div>
        ))}
      </div>

      <div className="charts-row">

        {/* ── ROLES ── */}
        <section className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Rôles du système</span>
          </div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Rôle</th>
                <th>Utilisateurs</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => (
                <tr key={role}>
                  <td><strong>{ROLE_LABEL[role]}</strong></td>
                  <td>{summary.roleCounts[role] ?? 0}</td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── ACTIONS RAPIDES ── */}
        <section className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Actions rapides</span>
          </div>

          <div className="table-filters admin-quick-actions">
            {quickActions.map((action) => (
              <button
                className={`filter-btn${action.active ? " active" : ""}`}
                key={action.label}
                type="button"
                onClick={() => goToUsers(action.section)}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="admin-summary-card">
            <div className="admin-summary-head">Résumé rapide</div>

            <div className="admin-summary-row">
              <span>Utilisateurs sans rôle</span>
              <strong style={{ color: summary.sansRole > 0 ? "#ef4444" : "#22c55e" }}>
                {summary.sansRole}
              </strong>
            </div>

            {/* Compteurs par rôle */}
            {Object.entries(summary.roleCounts)
              .filter(([role]) => role !== "sans_role")
              .map(([role, count]) => (
                <div className="admin-summary-row" key={role}>
                  <span>{ROLE_LABEL[role]}</span>
                  <strong>{count}</strong>
                </div>
              ))
            }

            <div className="admin-summary-head" style={{ marginTop: 12 }}>
              Derniers inscrits
            </div>
            <div className="admin-summary-list">
              {latestUsers.length === 0 ? (
                <span className="admin-summary-empty">Aucun utilisateur récent.</span>
              ) : (
                latestUsers.map((user) => (
                  <div className="admin-summary-user" key={user.username}>
                    <span>{user.username}</span>
                    <small>{user.role}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}