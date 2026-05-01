

import { useEffect, useState } from "react";
import Datatable2 from "../../components/Datatable2";
import RecoursForm from "./RecoursForm";
import {
  getRecours,
  addRecours,
  updateRecours,
  deleteRecours,
} from "../../features/recours/recoursApi";

export default function RespRecours() {
  const [data, setData] = useState([]);
  const [editRecours, setEditRecours] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getRecours();
      setData(res);
    } catch {
      setError("Erreur chargement des recours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (recours) => {
    try {
      setError("");
      if (editRecours) {
        await updateRecours(editRecours.id_recours, recours);
        setEditRecours(null);
      } else {
        await addRecours(recours);
      }
      await load();
    } catch (err) {
      console.log("ERREUR:", err.response?.data);
      setError(JSON.stringify(err.response?.data) || "Erreur lors de l'enregistrement.");
    }
  };

  const handleEdit = (row) => setEditRecours(row);

  const handleDelete = async (row) => {
    try {
      await deleteRecours(row.id_recours);
      await load();
    } catch {
      setError("Erreur suppression.");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <>
      {error && <p style={{ color: "red", padding: "8px 16px" }}>{error}</p>}
      <Datatable2
        title="Gestion des recours"
        exportName="recours"
        data={data}
        columns={[
          {
            key: "id_brevet_detail",
            label: "Brevet",
            render: (val) =>
              val ? `${val.titre} — N°${val.num_brevet}` : "—",
          },
          { key: "date_depot", label: "Date dépôt" },
          { key: "motif", label: "Motif" },
          { key: "description", label: "Description" },
          { key: "statut", label: "Statut" },
          { key: "date_traitement", label: "Date traitement" },
        ]}
        form={
          <RecoursForm
            key={editRecours ? editRecours.id_recours : "new"}
            editData={editRecours}
            onSubmit={handleSubmit}
            onCancel={() => setEditRecours(null)}
          />
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}