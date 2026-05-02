
import React, { useMemo, useEffect, useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import DataTable3, { Badge } from "../../components/DataTable3";
import { getBrevets } from "../../features/brevets/brevetApi";

const STATUT_COLOR = { ACCEPTER: "green", REFUSER: "red", EN_ATTENTE: "yellow" };
const STATUT_LABEL = { ACCEPTER: "Accepté", REFUSER: "Refusé", EN_ATTENTE: "En attente" };

const COLUMNS = [
  {
    key: "num_brevet",
    label: "N° Brevet",
    sortable: true,
    render: (r) => <span className="dt3-ref">BR-{String(r.num_brevet).padStart(3, "0")}</span>,
  },
  {
    key: "titre",
    label: "Titre",
    sortable: true,
    render: (r) => (
      <span title={r.titre}>{r.titre.length > 45 ? r.titre.slice(0, 45) + "…" : r.titre}</span>
    ),
  },
  { key: "date_depo",   label: "Date dépôt",  sortable: true },
  {
    key: "date_sortie",
    label: "Date sortie",
    sortable: true,
    render: (r) => r.date_sortie ? r.date_sortie : <span className="dt3-muted">—</span>,
  },
  { key: "titulaire", label: "Titulaire", sortable: true },
  {
    key: "statut",
    label: "Statut",
    sortable: false,
    render: (r) => (
      <Badge label={STATUT_LABEL[r.statut] || r.statut} color={STATUT_COLOR[r.statut]} />
    ),
  },
];

export default function DirBrevets() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getBrevets()                         // ← utilise api d'AuthContext, token géré automatiquement
      .then((rows) => setData(rows))
      .catch((err) => {
        console.error("Erreur chargement brevets :", err);
        setError("Impossible de charger les brevets.");
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => [
    { label: "Total brevets", value: data.length },
    { label: "Acceptés",  value: data.filter((r) => r.statut === "ACCEPTER").length,   color: "green"  },
    { label: "Refusés",   value: data.filter((r) => r.statut === "REFUSER").length,    color: "red"    },
    { label: "En attente",value: data.filter((r) => r.statut === "EN_ATTENTE").length, color: "yellow" },
  ], [data]);

  if (loading) return <p style={{ padding: 24 }}>Chargement des brevets…</p>;
  if (error)   return <p style={{ padding: 24, color: "red" }}>{error}</p>;

  return (
    <DataTable3
      icon={<DescriptionIcon />}
      title="Brevets"
      subtitle="Registre des brevets — lecture seule"
      stats={stats}
      columns={COLUMNS}
      data={data}
      searchKeys={["num_brevet", "titre", "titulaire"]}
      statusKey="statut"
      statusList={["Tous", "ACCEPTER", "REFUSER", "EN_ATTENTE"]}
      pdfTitle="Registre des Brevets — Directeur"
      pdfColumns={["N° Brevet", "Titre", "Date dépôt", "Date sortie", "Titulaire", "Statut"]}
      pdfRow={(r) => [
        `BR-${String(r.num_brevet).padStart(3, "0")}`,
        r.titre.slice(0, 48),
        r.date_depo,
        r.date_sortie ?? "—",
        r.titulaire,
        STATUT_LABEL[r.statut] || r.statut,
      ]}
      excelRow={(r) => ({
        "N° Brevet":   `BR-${String(r.num_brevet).padStart(3, "0")}`,
        Titre:         r.titre,
        "Date dépôt":  r.date_depo,
        "Date sortie": r.date_sortie ?? "—",
        Titulaire:     r.titulaire,
        Statut:        STATUT_LABEL[r.statut] || r.statut,
      })}
      fileName="brevets"
    />
  );
}