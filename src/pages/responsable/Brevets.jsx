import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Datatable";
import { getBrevets, deleteBrevet } from "../../features/brevets/brevetApi";

export default function RespBrevets() {
  const navigate = useNavigate();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getBrevets();
      setData(response.results || response);
    } catch {
      setError("Erreur chargement des brevets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (row) => {
    try {
      await deleteBrevet(row.id_brevet);
      load();
    } catch {
      setError("Erreur suppression");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;

  return (
    <DataTable
      title="Gestion des brevets"
      data={data}
      columns={[
        { key: "num_brevet",  label: "N° Brevet"   },
        { key: "titre",       label: "Titre"        },
        { key: "date_depo",   label: "Date dépôt"  },
        { key: "date_sortie", label: "Date sortie"  },
        { key: "titulaire",   label: "Titulaire"    },
        {
          key: "id_dep",
          label: "Déposant",
          render: (value) =>
            value ? `${value.nom_dep} ${value.prenom_dep}` : "Aucun",
          pdfFormat: (val) =>
            val ? `${val.nom_dep} ${val.prenom_dep}` : "Aucun",
        },
        {
          key: "id_inv",
          label: "Inventeurs",
          render: (value) =>
            Array.isArray(value) && value.length > 0
              ? value.map((i) => `${i.nom_inv} ${i.prenom_inv}`).join(", ")
              : "Aucun",
          pdfFormat: (val) =>
            Array.isArray(val) && val.length > 0
              ? val.map((i) => `${i.nom_inv} ${i.prenom_inv}`).join(", ")
              : "Aucun",
        },
        { key: "statut", label: "Statut" },
        {
          key: "document_set",
          label: "Documents",
          render: (value, row) => (
            <button
              className="btn"
              onClick={() =>
                navigate(`/responsable/documents?brevet=${row.id_brevet}`)
              }
            >
              {value?.length > 0
                ? `${value.length} document(s)`
                : "Ajouter document"}
            </button>
          ),
          pdfExclude: true,
        },
      ]}
      onAdd={()     => navigate("/responsable/brevets/add")}
      onEdit={(row) => navigate(`/responsable/brevets/edit/${row.id_brevet}`)}
      onView={(row) => navigate(`/responsable/brevets/view/${row.id_brevet}`)}
      onDelete={handleDelete}
    />
  );
}