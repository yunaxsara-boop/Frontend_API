import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import DataTable from "../../components/Datatable";
import { getDemandes, deleteDemande, validerDemande, refuserDemande } from "../../features/demandes/demandeApi";
import { buildAndOpen } from "./demandeUtils";
import PrintIcon       from "@mui/icons-material/Print";
import DownloadIcon    from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon      from "@mui/icons-material/Cancel";

export default function RespDemandes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mesData,    setMesData]    = useState([]);
  const [agentsData, setAgentsData] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const load = async () => {
    try {
      setLoading(true); setError("");
      const res = await getDemandes();
      const all = res.results || res;
      setMesData(all.filter(d => d.createur_id === user.id));
      // ✅ Correction : exclure les demandes des autres responsables
      setAgentsData(all.filter(d => d.createur_id !== user.id && d.createur_groupe === 'agent'));
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

  const handleValider = async (row) => {
    try { await validerDemande(row.id_demande); load(); }
    catch { setError("Erreur validation."); }
  };

  const handleRefuser = async (row) => {
    try { await refuserDemande(row.id_demande); load(); }
    catch { setError("Erreur refus."); }
  };

  const colonnesBase = [
    { key: "date_depo", label: "Date dépôt" },
    { key: "nature",    label: "Nature" },
    { key: "titre",     label: "Titre" },
    {
      key: "deposant",
      label: "Déposant(s)",
      render: (value) =>
        Array.isArray(value) && value.length > 0
          ? value.map(d => `${d.nom_dep} ${d.prenom_dep}`).join(", ") : "—",
      pdfFormat: (val) =>
        Array.isArray(val) && val.length > 0
          ? val.map(d => `${d.nom_dep} ${d.prenom_dep}`).join(", ") : "—",
    },
    {
      key: "inventeur",
      label: "Inventeur(s)",
      render: (value) =>
        Array.isArray(value) && value.length > 0
          ? value.map(i => `${i.nom_inv} ${i.prenom_inv}`).join(", ") : "—",
      pdfFormat: (val) =>
        Array.isArray(val) && val.length > 0
          ? val.map(i => `${i.nom_inv} ${i.prenom_inv}`).join(", ") : "—",
    },
    { key: "statut", label: "Statut" },
  ];

  const colonneFormulaire = {
    key: "_actions_formulaire",
    label: "Formulaire",
    pdfExclude: true,
    render: (_, row) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button
          title="Imprimer"
          style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer" }}
          onClick={() => buildAndOpen(row, "print")}
        >
          <PrintIcon sx={{ fontSize: 16 }} />
        </button>
        <button
          title="Télécharger"
          style={{ background: "#0f766e", color: "#fff", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer" }}
          onClick={() => buildAndOpen(row, "download")}
        >
          <DownloadIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    ),
  };

  const colonneDecision = {
    key: "_actions_decision",
    label: "Décision",
    pdfExclude: true,
    render: (_, row) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button
          title="Valider"
          disabled={row.statut === "valider"}
          style={{
            background: row.statut === "valider" ? "#86efac" : "#16a34a",
            color: "#fff", border: "none", borderRadius: 6,
            padding: "5px 9px",
            cursor: row.statut === "valider" ? "default" : "pointer",
          }}
          onClick={() => handleValider(row)}
        >
          <CheckCircleIcon sx={{ fontSize: 16 }} />
        </button>
        <button
          title="Refuser"
          disabled={row.statut === "refuser"}
          style={{
            background: row.statut === "refuser" ? "#fca5a5" : "#dc2626",
            color: "#fff", border: "none", borderRadius: 6,
            padding: "5px 9px",
            cursor: row.statut === "refuser" ? "default" : "pointer",
          }}
          onClick={() => handleRefuser(row)}
        >
          <CancelIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    ),
  };

  if (loading) return <p style={{ padding: 20 }}>Chargement…</p>;
  if (error)   return <p style={{ padding: 20, color: "red" }}>{error}</p>;

  return (
    <div style={{ background: "#faf7f2", minHeight: "100vh" }}>

      {/* ── TABLE 1 : Mes demandes ── */}
      <DataTable
        title="Mes Demandes de Protection"
        data={mesData}
        columns={[...colonnesBase, colonneFormulaire]}
        onAdd={()     => navigate("/responsable/demandes/add")}
        onEdit={(row) => navigate(`/responsable/demandes/edit/${row.id_demande}`)}
        onView={(row) => navigate(`/responsable/demandes/view/${row.id_demande}`)}
        onDelete={handleDelete}
      />

      {/* ── TABLE 2 : Demandes des agents uniquement ── */}
      <DataTable
        title="Demandes des Agents"
        data={agentsData}
        columns={[
          { key: "createur_username", label: "Agent", render: (val) => val || "—" },
          ...colonnesBase,
          colonneFormulaire,
          colonneDecision,
        ]}
        onView={(row) => navigate(`/responsable/demandes/view/${row.id_demande}`)}
      />

    </div>
  );
}