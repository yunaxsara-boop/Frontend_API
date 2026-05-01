
import { useState, useMemo, useEffect, useCallback } from "react";
import StatCard from "../../components/dashboard/StatCard";
import BarChartCard from "../../components/dashboard/BarChartCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";
import RecentTable from "../../components/dashboard/RecentTable";
import "../../components/dashboard/dashboard.css";
import { api } from "/src/contexts/AuthContext.jsx";

const IconBrevet  = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IconAccepte = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IconDoc     = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconRecours = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const MODES = ["Jour", "Mois", "Année"];

const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d} / ${m} / ${y}`;
};

export default function RespDashboard() {
  const [mode, setMode]         = useState("Mois");
  const [selected, setSelected] = useState("");
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // ✅ Charger les données avec les paramètres de filtre
  const fetchDash = useCallback(async (currentMode, currentSelected) => {
  try {
    setLoading(true);
    setError("");

    const params = currentSelected
      ? { mode: currentMode, selected: currentSelected }
      : {};

    const res = await api.get("/dashboard/stats/", { params });

    console.log("DATA DASHBOARD:", res.data); // ✅ DEBUG

    setDashData(res.data);

  } catch (err) {
    console.error(err); // ✅ voir erreur réelle
    setError("Erreur chargement du tableau de bord.");
  } finally {
    setLoading(false);
  }
}, []);

  // ✅ Recharger à chaque changement de filtre
  useEffect(() => {
    fetchDash(mode, selected);
  }, [mode, selected, fetchDash]);

  const inputType = mode === "Jour" ? "date" : mode === "Mois" ? "month" : "number";

  const stats     = dashData?.stats              ?? {};
  const donut     = dashData?.donut              ?? {};
  const barData   = dashData?.bar_data           ?? { labels: [], revenus: [], paiements: [] };
  const brevets   = dashData?.derniers_brevets   ?? [];
  const paiements = dashData?.derniers_paiements ?? [];

  return (
    <div className="dash-page">

      {/* FILTRE */}
      <div className="dash-filter-bar">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e", margin: 0, letterSpacing: "-0.3px" }}>
            Tableau de bord
          </h1>
          <h3 style={{ fontSize: "13px", fontWeight: 400, color: "#a0826d", margin: 0, padding: 0 }}>
            Vue d'ensemble de vos brevets et paiements
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto", flexWrap: "wrap" }}>
          <span className="dash-filter-label">Filtrer par</span>

          <div className="dash-filter-modes">
            {MODES.map((m) => (
              <button
                key={m}
                className={`dash-filter-mode ${mode === m ? "active" : ""}`}
                onClick={() => { setMode(m); setSelected(""); }}
              >
                {m}
              </button>
            ))}
          </div>

          <input
            className="dash-filter-input"
            type={inputType}
            value={selected}
            min={inputType === "number" ? 2000 : undefined}
            max={inputType === "number" ? 2100 : undefined}
            placeholder={mode === "Année" ? "ex: 2024" : ""}
            onChange={(e) => setSelected(e.target.value)}
          />

          {selected && (
            <button className="dash-filter-reset" onClick={() => setSelected("")}>
              ✕ Réinitialiser
            </button>
          )}
        </div>
      </div>

      {loading && <p style={{ padding: "16px" }}>Chargement...</p>}
      {error   && <p style={{ padding: "16px", color: "red" }}>{error}</p>}

      {/* STATS CARDS */}
      <div className="stats-grid">
        <StatCard icon={IconBrevet}  value={stats.total_brevets    ?? 0} label="Total Brevets"    trend="8%"  trendUp         color="orange" />
        <StatCard icon={IconAccepte} value={stats.brevets_acceptes ?? 0} label="Brevets acceptés" trend="12%" trendUp         color="green"  />
        <StatCard icon={IconDoc}     value={stats.total_demandes   ?? 0} label="Total Demandes"   trend="13%" trendUp         color="blue"   />
        <StatCard icon={IconRecours} value={stats.total_recours    ?? 0} label="Total Recours"    trend="4%"  trendUp={false} color="purple" />
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        {/* ✅ Bar chart connecté aux vraies données */}
        <BarChartCard
          title="Revenus & Paiements"
          labels={barData.labels.length > 0 ? barData.labels : ["Aucune donnée"]}
          datasets={[
            {
              label: "Revenus",
              data: barData.revenus.length > 0 ? barData.revenus : [0],
              borderRadius: 6,
            },
            {
              label: "Paiements",
              data: barData.paiements.length > 0 ? barData.paiements : [0],
              borderRadius: 6,
            },
          ]}
        />

        {/* ✅ Donut chart connecté aux vraies données */}
        <DonutChartCard
          title="Statut des brevets"
          labels={["Acceptés", "Refusés", "En attente"]}
          data={[donut.acceptes ?? 0, donut.refuses ?? 0, donut.en_attente ?? 0]}
          colors={["#22c55e", "#EA6113", "#FBB931"]}
        />
      </div>

      {/* TABLES */}
      <div className="tables-row">
        <RecentTable
          title="Derniers brevets"
          columns={[
            { key: "num_brevet", label: "N° Brevet"  },
            { key: "titre",      label: "Titre"       },
            { key: "date_depot", label: "Date dépôt", render: (v) => formatDate(v) },
            { key: "statut",     label: "Statut"      },
          ]}
          rows={brevets}
          badgeKey="statut"
          badgeMap={{ EN_ATTENTE: "b-pending", ACCEPTER: "b-delivered", REFUSER: "b-refused" }}
        />
        <RecentTable
          title="Derniers paiements"
          columns={[
            { key: "titre_brevet",  label: "Titre brevet"  },
            { key: "montant_total", label: "Montant total"  },
            { key: "date_paiement", label: "Date paiement", render: (v) => formatDate(v) },
            { key: "statut",        label: "Statut"         },
          ]}
          rows={paiements}
          badgeKey="statut"
          badgeMap={{ "Payé": "b-delivered", "Non payé": "b-pending" }}
        />
      </div>

    </div>
  );
}