import { useState, useMemo } from "react";
import StatCard from "../../components/dashboard/StatCard";
import BarChartCard from "../../components/dashboard/BarChartCard";
import DonutChartCard from "../../components/dashboard/DonutChartCard";
import RecentTable from "../../components/dashboard/RecentTable";
import "../../components/dashboard/dashboard.css";

const IconBrevet  = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IconAccepte = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IconDoc     = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconRecours = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const ALL_BREVETS = [
  { num_brevet: "BR-001", titre: "Procédé fab.",   date_depo: "2024-01-01", statut: "EN_ATTENTE" },
  { num_brevet: "BR-002", titre: "Système IA",     date_depo: "2024-02-03", statut: "ACCEPTER"   },
  { num_brevet: "BR-003", titre: "Capteur bio",    date_depo: "2024-02-05", statut: "REFUSER"    },
  { num_brevet: "BR-004", titre: "Algo crypto",    date_depo: "2024-03-07", statut: "EN_ATTENTE" },
  { num_brevet: "BR-005", titre: "Nano matériau",  date_depo: "2024-03-15", statut: "ACCEPTER"   },
];

const ALL_PAIEMENTS = [
  { titre_brevet: "Procédé fab.",  montant_total: "1 500 €", date_paiement: "2024-01-10", statut: "Payé"     },
  { titre_brevet: "Système IA",    montant_total: "2 300 €", date_paiement: "2024-02-03", statut: "Non payé" },
  { titre_brevet: "Capteur bio",   montant_total: "800 €",   date_paiement: "2024-02-20", statut: "Payé"     },
  { titre_brevet: "Algo crypto",   montant_total: "3 100 €", date_paiement: "2024-03-07", statut: "Non payé" },
  { titre_brevet: "Nano matériau", montant_total: "1 200 €", date_paiement: "2024-03-18", statut: "Payé"     },
];

const MODES = ["Jour", "Mois", "Année"];

function filterByMode(rows, dateKey, mode, selected) {
  if (!selected) return rows;
  return rows.filter((r) => {
    const d = new Date(r[dateKey]);
    if (mode === "Jour")  return r[dateKey] === selected;
    if (mode === "Mois")  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` === selected;
    if (mode === "Année") return String(d.getFullYear()) === selected;
    return true;
  });
}

export default function RespDashboard() {
  const [mode, setMode]       = useState("Mois");
  const [selected, setSelected] = useState("");

  const inputType = mode === "Jour" ? "date" : mode === "Mois" ? "month" : "number";

  const filteredBrevets   = useMemo(() => filterByMode(ALL_BREVETS,   "date_depo",     mode, selected), [mode, selected]);
  const filteredPaiements = useMemo(() => filterByMode(ALL_PAIEMENTS, "date_paiement", mode, selected), [mode, selected]);

  const formatDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d} / ${m} / ${y}`;
  };

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

      {/* STATS */}
      <div className="stats-grid">
        <StatCard icon={IconBrevet}  value="321" label="Total Brevets"    trend="8%"  trendUp         color="orange" />
        <StatCard icon={IconAccepte} value="187" label="Brevets acceptés" trend="12%" trendUp         color="green"  />
        <StatCard icon={IconDoc}     value="564" label="Total Demandes"   trend="13%" trendUp         color="blue"   />
        <StatCard icon={IconRecours} value="254" label="Total Recours"    trend="4%"  trendUp={false} color="purple" />
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <BarChartCard
          title="Revenus & Paiements"
          labels={["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil"]}
          datasets={[
            { label: "Revenus",   data: [15000,22000,18000,31000,27000,24000,29000], borderRadius: 6 },
            { label: "Paiements", data: [12000,18000,15000,26000,21000,19000,24000], borderRadius: 6 },
          ]}
        />
        <DonutChartCard
          title="Statut des brevets"
          labels={["Acceptés", "Refusés", "En attente"]}
          data={[187, 54, 80]}
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
            { key: "date_depo",  label: "Date dépôt", render: (v) => formatDate(v) },
            { key: "statut",     label: "Statut"      },
          ]}
          rows={filteredBrevets}
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
          rows={filteredPaiements}
          badgeKey="statut"
          badgeMap={{ "Payé": "b-delivered", "Non payé": "b-pending" }}
        />
      </div>

    </div>
  );
}