
import React, { useMemo } from "react";
import PaymentIcon from "@mui/icons-material/Payment";
import DataTable3, { Badge } from "../../components/DataTable3";

const DATA = [
  { id: 1, titre_brevet: "Système récupération énergie", date_paiement: "2024-01-15", montant: 45000, statut: "Payé"     },
  { id: 2, titre_brevet: "Procédé traitement des eaux",  date_paiement: "2024-02-03", montant: 12000, statut: "Non payé" },
  { id: 3, titre_brevet: "Alliage haute résistance",     date_paiement: "2024-02-20", montant: 30000, statut: "Non payé" },
  { id: 4, titre_brevet: "Capteur pression intelligent", date_paiement: "2024-03-01", montant: 18500, statut: "Payé"     },
  { id: 5, titre_brevet: "Optimisation forage",          date_paiement: "2024-03-12", montant: 60000, statut: "Payé"     },
  { id: 6, titre_brevet: "Catalyseur raffinage pétrole", date_paiement: "2024-03-25", montant: 22000, statut: "Payé"     },
  { id: 7, titre_brevet: "Détection fuites ultrasons",   date_paiement: "2024-04-02", montant: 15000, statut: "Non payé" },
  { id: 8, titre_brevet: "Isolant thermique nano",       date_paiement: "2024-04-10", montant: 35000, statut: "Non payé" },
];

const STATUT_COLOR = { "Payé": "green", "Non payé": "red" };

const COLUMNS = [
  { key: "titre_brevet",  label: "Titre brevet",   sortable: true,  render: (r) => <span title={r.titre_brevet}>{r.titre_brevet.length > 45 ? r.titre_brevet.slice(0, 45) + "…" : r.titre_brevet}</span> },
  { key: "date_paiement", label: "Date paiement",  sortable: true  },
  { key: "montant",       label: "Montant total",  sortable: true,  render: (r) => <strong>{r.montant.toLocaleString("fr-FR")} DA</strong> },
  { key: "statut",        label: "Statut",         sortable: false, render: (r) => <Badge label={r.statut} color={STATUT_COLOR[r.statut]} /> },
];

export default function DirPaiements() {
  const totalMontant = DATA.reduce((s, r) => s + r.montant, 0);
  const montantPaye  = DATA.filter(r => r.statut === "Payé").reduce((s, r) => s + r.montant, 0);
  const montantNon   = DATA.filter(r => r.statut === "Non payé").reduce((s, r) => s + r.montant, 0);

  const stats = useMemo(() => [
    { label: "Montant total",    value: `${totalMontant.toLocaleString("fr-FR")} DA` },
    { label: "Total payé",       value: `${montantPaye.toLocaleString("fr-FR")} DA`,  color: "green" },
    { label: "Total non payé",   value: `${montantNon.toLocaleString("fr-FR")} DA`,   color: "red"   },
  ], []);

  return (
    <DataTable3
      icon={<PaymentIcon />}
      title="Paiements"
      subtitle="Consultation des paiements — lecture seule"
      stats={stats}
      columns={COLUMNS}
      data={DATA}
      searchKeys={["titre_brevet"]}
      statusKey="statut"
      statusList={["Tous", "Payé", "Non payé"]}
      pdfTitle="Liste des Paiements — Directeur"
      pdfColumns={["Titre brevet", "Date paiement", "Montant total", "Statut"]}
      pdfRow={(r) => [r.titre_brevet, r.date_paiement, `${r.montant.toLocaleString("fr-FR")} DA`, r.statut]}
      excelRow={(r) => ({ "Titre brevet": r.titre_brevet, "Date paiement": r.date_paiement, "Montant total": r.montant, Statut: r.statut })}
      fileName="paiements"
    />
  );
}