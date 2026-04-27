
import React, { useMemo } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import DataTable3, { Badge } from "../../components/DataTable3";

const DATA = [
  { id: 1, num_brevet: "BR-001", titre: "Système de récupération d'énergie", date_depo: "2024-01-10", date_sortie: "2024-07-10", titulaire: "Karim Boudjema",  statut: "ACCEPTER"   },
  { id: 2, num_brevet: "BR-002", titre: "Procédé de traitement des eaux",    date_depo: "2023-11-22", date_sortie: "—",          titulaire: "Sara Moussaoui",  statut: "EN_ATTENTE" },
  { id: 3, num_brevet: "BR-003", titre: "Alliage haute résistance pipeline", date_depo: "2024-02-15", date_sortie: "—",          titulaire: "Yacine Amrani",   statut: "EN_ATTENTE" },
  { id: 4, num_brevet: "BR-004", titre: "Capteur de pression intelligent",   date_depo: "2023-06-30", date_sortie: "2024-01-30", titulaire: "Nadia Ferhat",    statut: "ACCEPTER"   },
  { id: 5, num_brevet: "BR-005", titre: "Méthode d'optimisation de forage",  date_depo: "2023-10-05", date_sortie: "2024-04-05", titulaire: "Omar Bensalem",   statut: "REFUSER"    },
  { id: 6, num_brevet: "BR-006", titre: "Catalyseur pour raffinage pétrole", date_depo: "2023-04-18", date_sortie: "2023-10-18", titulaire: "Amina Kebir",     statut: "ACCEPTER"   },
  { id: 7, num_brevet: "BR-007", titre: "Détection de fuites par ultrasons", date_depo: "2024-03-22", date_sortie: "—",          titulaire: "Mourad Tlemçani", statut: "EN_ATTENTE" },
  { id: 8, num_brevet: "BR-008", titre: "Isolant thermique nanostructuré",   date_depo: "2023-08-12", date_sortie: "2024-02-12", titulaire: "Rania Hadj",      statut: "REFUSER"    },
];

const STATUT_COLOR = { ACCEPTER: "green", REFUSER: "red", EN_ATTENTE: "yellow" };
const STATUT_LABEL = { ACCEPTER: "Accepté", REFUSER: "Refusé", EN_ATTENTE: "En attente" };

const COLUMNS = [
  { key: "num_brevet",  label: "N° Brevet",    sortable: true,  render: (r) => <span className="dt3-ref">{r.num_brevet}</span> },
  { key: "titre",       label: "Titre",         sortable: true,  render: (r) => <span title={r.titre}>{r.titre.length > 45 ? r.titre.slice(0, 45) + "…" : r.titre}</span> },
  { key: "date_depo",   label: "Date dépôt",    sortable: true  },
  { key: "date_sortie", label: "Date sortie",   sortable: true,  render: (r) => r.date_sortie === "—" ? <span className="dt3-muted">—</span> : r.date_sortie },
  { key: "titulaire",   label: "Titulaire",     sortable: true  },
  { key: "statut",      label: "Statut",        sortable: false, render: (r) => <Badge label={STATUT_LABEL[r.statut] || r.statut} color={STATUT_COLOR[r.statut]} /> },
];

export default function DirBrevets() {
  const stats = useMemo(() => [
    { label: "Total brevets",  value: DATA.length },
    { label: "Acceptés",       value: DATA.filter(r => r.statut === "ACCEPTER").length,   color: "green"  },
    { label: "Refusés",        value: DATA.filter(r => r.statut === "REFUSER").length,    color: "red"    },
    { label: "En attente",     value: DATA.filter(r => r.statut === "EN_ATTENTE").length, color: "yellow" },
  ], []);

  return (
    <DataTable3
      icon={<DescriptionIcon />}
      title="Brevets"
      subtitle="Registre des brevets — lecture seule"
      stats={stats}
      columns={COLUMNS}
      data={DATA}
      searchKeys={["num_brevet", "titre", "titulaire"]}
      statusKey="statut"
      statusList={["Tous", "ACCEPTER", "REFUSER", "EN_ATTENTE"]}
      pdfTitle="Registre des Brevets — Directeur"
      pdfColumns={["N° Brevet", "Titre", "Date dépôt", "Date sortie", "Titulaire", "Statut"]}
      pdfRow={(r) => [r.num_brevet, r.titre.slice(0, 48), r.date_depo, r.date_sortie, r.titulaire, STATUT_LABEL[r.statut] || r.statut]}
      excelRow={(r) => ({ "N° Brevet": r.num_brevet, Titre: r.titre, "Date dépôt": r.date_depo, "Date sortie": r.date_sortie, Titulaire: r.titulaire, Statut: STATUT_LABEL[r.statut] || r.statut })}
      fileName="brevets"
    />
  );
}