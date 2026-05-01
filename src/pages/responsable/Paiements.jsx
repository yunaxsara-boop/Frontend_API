

import { useEffect, useState } from "react";
import Datatable2 from "../../components/Datatable2";
import PaiementForm from "./PaiementForm";
import {
  getPaiements,
  addPaiement,
  updatePaiement,
  deletePaiement,
} from "../../features/paiements/paiementApi";

export default function RespPaiements() {
  const [data, setData] = useState([]);
  const [editPaiement, setEditPaiement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPaiements();
      setData(res);
    } catch {
      setError("Erreur chargement des paiements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (paiement) => {
    try {
      setError("");
      if (editPaiement) {
        await updatePaiement(editPaiement.id_paiement, paiement);
        setEditPaiement(null);
      } else {
        await addPaiement(paiement);
      }
      await load();
    } catch (err) {
      console.log("ERREUR:", err.response?.data);
      setError(JSON.stringify(err.response?.data) || "Erreur enregistrement.");
    }
  };

  const handleEdit = (row) => setEditPaiement(row);

  const handleDelete = async (row) => {
    try {
      await deletePaiement(row.id_paiement);
      await load();
    } catch {
      setError("Erreur suppression.");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <>
      {error && (
        <p style={{ color: "red", padding: "8px 16px" }}>{error}</p>
      )}
      <Datatable2
        title="Gestion des paiements"
        exportName="paiements"
        data={data}
        columns={[
          {
            key: "id_brevet",
            label: "Brevet",
            // ✅ id_brevet est maintenant un objet grâce au serializer
            render: (val) =>
              typeof val === "object"
                ? `${val?.titre ?? ""} — N°${val?.num_brevet ?? ""}`.trim()
                : val,
            pdfFormat: (val) =>
              typeof val === "object"
                ? `${val?.titre ?? ""} — N°${val?.num_brevet ?? ""}`.trim()
                : val,
          },
          { key: "date_paiement", label: "Date paiement" },
          {
            key: "montant_total",
            label: "Montant (DA)",
            render: (val) =>
              val != null
                ? Number(val).toLocaleString("fr-DZ") + " DA"
                : "—",
            pdfFormat: (val) =>
              val != null ? Number(val).toLocaleString("fr-DZ") + " DA" : "—",
          },
          {
            key: "statut",
            label: "Statut",
            render: (val) => (
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  background: val === "payer" ? "#e8f5e9" : "#fff3e0",
                  color: val === "payer" ? "#2e7d32" : "#e65100",
                  border: `1px solid ${val === "payer" ? "#a5d6a7" : "#ffcc80"}`,
                }}
              >
                {val === "payer" ? "Payé" : "Non payé"}
              </span>
            ),
            pdfFormat: (val) => (val === "payer" ? "Payé" : "Non payé"),
          },
        ]}
        form={
          <PaiementForm
            key={editPaiement ? editPaiement.id_paiement : "new"}
            editData={editPaiement}
            onSubmit={handleSubmit}
            onCancel={() => setEditPaiement(null)}
          />
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}