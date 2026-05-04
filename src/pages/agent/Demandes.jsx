import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Datatable";
import { getDemandes, deleteDemande } from "../../features/demandes/demandeApi";
import { buildAndOpen } from "./demandeUtils";
import PrintIcon    from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";

export default function AgentDemandes() {
  const navigate = useNavigate();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const load = async () => {
    try {
      setLoading(true); setError("");
      const res = await getDemandes();
      setData(res.results || res);
    } catch {
      setError("Erreur chargement des demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (row) => {
    try { await deleteDemande(row.id_demande); load(); }
    catch { setError("Erreur suppression."); }
  };

  if (loading) return <p style={{ padding: 20 }}>Chargement…</p>;
  if (error)   return <p style={{ padding: 20, color: "red" }}>{error}</p>;

  return (
    <DataTable
      title="Demandes de Protection"
      data={data}
      columns={[
        
        { key: "date_depo",  label: "Date dépôt" },
        { key: "nature",     label: "Nature" },
        { key: "titre",      label: "Titre" },
        {
          key: "deposant",
          label: "Déposant(s)",
          // ✅ deposant est un tableau d'objets retourné par l'API
          render: (value) =>
            Array.isArray(value) && value.length > 0
              ? value.map(d => `${d.nom_dep} ${d.prenom_dep}`).join(", ")
              : "—",
          pdfFormat: (val) =>
            Array.isArray(val) && val.length > 0
              ? val.map(d => `${d.nom_dep} ${d.prenom_dep}`).join(", ")
              : "—",
        },
        {
          key: "inventeur",
          label: "Inventeur(s)",
          // ✅ FIX: inventeur est le tableau retourné par get_inventeur() dans le serializer
          render: (value) =>
            Array.isArray(value) && value.length > 0
              ? value.map(i => `${i.nom_inv} ${i.prenom_inv}`).join(", ")
              : "—",
          pdfFormat: (val) =>
            Array.isArray(val) && val.length > 0
              ? val.map(i => `${i.nom_inv} ${i.prenom_inv}`).join(", ")
              : "—",
        },
        { key: "statut", label: "Statut" },
        {
          key: "_actions_formulaire",
          label: "Formulaire",
          pdfExclude: true,
          render: (_, row) => (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="act-btn print"
                title="Imprimer"
                style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer" }}
                onClick={() => buildAndOpen(row, "print")}
              >
                <PrintIcon sx={{ fontSize: 16 }} />
              </button>
              <button
                className="act-btn dl"
                title="Télécharger"
                style={{ background: "#0f766e", color: "#fff", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer" }}
                onClick={() => buildAndOpen(row, "download")}
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          ),
        },
      ]}
      onAdd={()         => navigate("/agent/demandes/add")}
      onEdit={(row)     => navigate(`/agent/demandes/edit/${row.id_demande}`)}
      onView={(row)     => navigate(`/agent/demandes/view/${row.id_demande}`)}
      onDelete={handleDelete}
    />
  );
}