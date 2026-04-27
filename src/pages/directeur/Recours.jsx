
import React, { useMemo } from "react";
import GavelIcon from "@mui/icons-material/Gavel";
import DataTable3, { Badge } from "../../components/DataTable3";

const DATA = [
  { id: 1, titre_brevet: "Capteur pression intelligent",  date_depo: "2024-01-08", motif: "Antériorité",                 description: "Opposition fondée sur une antériorité documentée",          date_traitement: "2024-03-15", statut: "En attente" },
  { id: 2, titre_brevet: "Alliage haute résistance",      date_depo: "2024-01-20", motif: "Défaut de nouveauté",         description: "Recours en nullité pour défaut de nouveauté",               date_traitement: "2024-04-10", statut: "Traité"     },
  { id: 3, titre_brevet: "Optimisation forage",           date_depo: "2024-02-05", motif: "Rejet injustifié",            description: "Appel suite à un rejet sans justification technique",        date_traitement: "2024-05-20", statut: "Traité"     },
  { id: 4, titre_brevet: "Détection fuites ultrasons",    date_depo: "2024-02-18", motif: "Violation de brevet",         description: "Opposition pour violation des droits de propriété",         date_traitement: "—",          statut: "En attente" },
  { id: 5, titre_brevet: "Isolant thermique nano",        date_depo: "2024-03-01", motif: "Insuffisance de description", description: "Recours pour description insuffisante du brevet",           date_traitement: "—",          statut: "En attente" },
  { id: 6, titre_brevet: "Catalyseur raffinage pétrole",  date_depo: "2024-03-12", motif: "Délai non respecté",          description: "Appel suite à dépassement de délai administratif",          date_traitement: "2024-07-01", statut: "Refusé"     },
  { id: 7, titre_brevet: "Procédé traitement des eaux",   date_depo: "2024-03-28", motif: "Antériorité",                 description: "Antériorité détectée lors de l'examen",                    date_traitement: "—",          statut: "En attente" },
  { id: 8, titre_brevet: "Système récupération énergie",  date_depo: "2024-04-05", motif: "Erreur administrative",       description: "Recours gracieux suite à une erreur de traitement",         date_traitement: "2024-08-10", statut: "Traité"     },
  { id: 9, titre_brevet: "Capteur pression intelligent",  date_depo: "2024-04-15", motif: "Violation de procédure",      description: "Non-respect de la procédure réglementaire",                date_traitement: "—",          statut: "Refusé"     },
];

const STATUT_COLOR = { "En attente": "yellow", "Traité": "green", "Refusé": "red" };

const COLUMNS = [
  { key: "titre_brevet",    label: "Titre brevet",    sortable: true,  render: (r) => <span title={r.titre_brevet}>{r.titre_brevet.length > 38 ? r.titre_brevet.slice(0, 38) + "…" : r.titre_brevet}</span> },
  { key: "date_depo",       label: "Date dépôt",      sortable: true  },
  { key: "motif",           label: "Motif",           sortable: true  },
  { key: "description",     label: "Description",     sortable: false, render: (r) => <span style={{ fontSize: 12, color: "#666" }} title={r.description}>{r.description.length > 45 ? r.description.slice(0, 45) + "…" : r.description}</span> },
  { key: "date_traitement", label: "Date traitement", sortable: true,  render: (r) => r.date_traitement === "—" ? <span className="dt3-muted">—</span> : r.date_traitement },
  { key: "statut",          label: "Statut",          sortable: false, render: (r) => <Badge label={r.statut} color={STATUT_COLOR[r.statut]} /> },
];

export default function DirRecour() {
  const stats = useMemo(() => [
    { label: "Total recours", value: DATA.length },
    { label: "En attente",    value: DATA.filter(r => r.statut === "En attente").length, color: "yellow" },
    { label: "Traités",       value: DATA.filter(r => r.statut === "Traité").length,     color: "green"  },
    { label: "Refusés",       value: DATA.filter(r => r.statut === "Refusé").length,     color: "red"    },
  ], []);

  return (
    <DataTable3
      icon={<GavelIcon />}
      title="Recours"
      subtitle="Suivi des recours — lecture seule"
      stats={stats}
      columns={COLUMNS}
      data={DATA}
      searchKeys={["titre_brevet", "motif", "description"]}
      statusKey="statut"
      statusList={["Tous", "En attente", "Traité", "Refusé"]}
      pdfTitle="Registre des Recours — Directeur"
      pdfColumns={["Titre brevet", "Date dépôt", "Motif", "Description", "Date traitement", "Statut"]}
      pdfRow={(r) => [r.titre_brevet, r.date_depo, r.motif, r.description.slice(0, 50), r.date_traitement, r.statut]}
      excelRow={(r) => ({ "Titre brevet": r.titre_brevet, "Date dépôt": r.date_depo, Motif: r.motif, Description: r.description, "Date traitement": r.date_traitement, Statut: r.statut })}
      fileName="recours"
    />
  );
}