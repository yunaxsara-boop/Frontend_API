
import React, { useMemo, useEffect, useState } from "react";
import GavelIcon from "@mui/icons-material/Gavel";
import DataTable3, { Badge } from "../../components/DataTable3";
import { getRecours } from "../../features/recours/recoursApi"; // ← adapte le chemin

const STATUT_COLOR = { EN_COURS: "yellow", TRAITE: "green", REFUSE: "red" };
const STATUT_LABEL = { EN_COURS: "En attente", TRAITE: "Traité", REFUSE: "Refusé" };

const COLUMNS = [
  {
    key: "titre_brevet",
    label: "Titre brevet",
    sortable: true,
    render: (r) => {
      const titre = r.id_brevet_detail?.titre ?? "—";
      return (
        <span title={titre}>
          {titre.length > 38 ? titre.slice(0, 38) + "…" : titre}
        </span>
      );
    },
  },
  { key: "date_depot", label: "Date dépôt", sortable: true },
  { key: "motif",      label: "Motif",      sortable: true },
  {
    key: "description",
    label: "Description",
    sortable: false,
    render: (r) => (
      <span style={{ fontSize: 12, color: "#666" }} title={r.description}>
        {r.description?.length > 45 ? r.description.slice(0, 45) + "…" : r.description}
      </span>
    ),
  },
  {
    key: "date_traitement",
    label: "Date traitement",
    sortable: true,
    render: (r) => r.date_traitement
      ? r.date_traitement
      : <span className="dt3-muted">—</span>,
  },
  {
    key: "statut",
    label: "Statut",
    sortable: false,
    render: (r) => (
      <Badge label={STATUT_LABEL[r.statut] ?? r.statut} color={STATUT_COLOR[r.statut]} />
    ),
  },
];

export default function DirRecour() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getRecours()
      .then((rows) => setData(rows))
      .catch((err) => {
        console.error("Erreur chargement recours :", err);
        setError("Impossible de charger les recours.");
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => [
    { label: "Total recours", value: data.length },
    { label: "En attente",    value: data.filter((r) => r.statut === "EN_COURS").length, color: "yellow" },
    { label: "Traités",       value: data.filter((r) => r.statut === "TRAITE").length,   color: "green"  },
    { label: "Refusés",       value: data.filter((r) => r.statut === "REFUSE").length,   color: "red"    },
  ], [data]);

  if (loading) return <p style={{ padding: 24 }}>Chargement des recours…</p>;
  if (error)   return <p style={{ padding: 24, color: "red" }}>{error}</p>;

  return (
    <DataTable3
      icon={<GavelIcon />}
      title="Recours"
      subtitle="Suivi des recours — lecture seule"
      stats={stats}
      columns={COLUMNS}
      data={data}
      searchKeys={["motif", "description", "date_depot"]}
      statusKey="statut"
      statusList={["Tous", "EN_COURS", "TRAITE", "REFUSE"]}
      pdfTitle="Registre des Recours — Directeur"
      pdfColumns={["Titre brevet", "Date dépôt", "Motif", "Description", "Date traitement", "Statut"]}
      pdfRow={(r) => [
        r.id_brevet_detail?.titre ?? "—",
        r.date_depot,
        r.motif,
        r.description?.slice(0, 50) ?? "—",
        r.date_traitement ?? "—",
        STATUT_LABEL[r.statut] ?? r.statut,
      ]}
      excelRow={(r) => ({
        "Titre brevet":    r.id_brevet_detail?.titre ?? "—",
        "Date dépôt":      r.date_depot,
        Motif:             r.motif,
        Description:       r.description,
        "Date traitement": r.date_traitement ?? "—",
        Statut:            STATUT_LABEL[r.statut] ?? r.statut,
      })}
      fileName="recours"
    />
  );
}