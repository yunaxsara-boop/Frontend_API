
import { useEffect, useState } from "react";
import Datatable2 from "../../components/Datatable2";
import PaiementForm from "./PaiementForm";

export default function RespPaiements() {
  const [data, setData] = useState([]);
  const [editPaiement, setEditPaiement] = useState(null);

  useEffect(() => {
    const exempleData = [
      {
        id: 1,
        titre_brevet: "Brevet FR-2024-001",
        date_paiement: "2024-01-15",
        montant_total: 1500.00,
        statut: "payer",
      },
      {
        id: 2,
        titre_brevet: "Brevet FR-2024-002",
        date_paiement: "2024-02-20",
        montant_total: 2300.50,
        statut: "non_payer",
      },
      {
        id: 3,
        titre_brevet: "Brevet FR-2024-003",
        date_paiement: "2024-03-05",
        montant_total: 800.00,
        statut: "non_payer",
      },
    ];
    setData(exempleData);
  }, []);

  const handleSubmit = (paiement) => {
    if (editPaiement) {
      setData((prev) =>
        prev.map((p) => (p.id === editPaiement.id ? paiement : p))
      );
      setEditPaiement(null);
    } else {
      setData((prev) => [...prev, paiement]);
    }
  };

  const handleEdit = (row) => setEditPaiement(row);
  const handleDelete = (row) => setData((prev) => prev.filter((p) => p.id !== row.id));

  return (
    <Datatable2
      title="Gestion des paiements"
      exportName="paiements"
      data={data}
      columns={[
        { key: "titre_brevet", label: "Titre brevet" },
        { key: "date_paiement", label: "Date paiement" },
        { key: "montant_total", label: "Montant total DA" },
        { key: "statut", label: "Statut" },
      ]}
      form={
        <PaiementForm
          key={editPaiement ? editPaiement.id : "new"}
          editData={editPaiement}
          onSubmit={handleSubmit}
          onCancel={() => setEditPaiement(null)}
        />
      }
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}