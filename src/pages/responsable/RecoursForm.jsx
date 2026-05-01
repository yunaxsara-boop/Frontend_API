import { useEffect, useState } from "react";
import { api } from "/src/contexts/AuthContext.jsx";

export default function RecoursForm({ onSubmit, editData, onCancel }) {
  const emptyForm = {
    id_brevet: "",
    motif: "",
    description: "",
    statut: "EN_COURS",
    date_traitement: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [brevets, setBrevets] = useState([]);  // ✅ liste des brevets pour le select
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Charger la liste des brevets pour le select
  useEffect(() => {
    const fetchBrevets = async () => {
      try {
        const res = await api.get("brevets/");
        setBrevets(res.data.results ?? res.data);
      } catch {
        console.log("Erreur chargement brevets");
      }
    };
    fetchBrevets();
  }, []);

  // ✅ Pré-remplir si édition
  useEffect(() => {
    if (editData) {
      setForm({
        id_brevet:       editData.id_brevet?.id_brevet ?? editData.id_brevet ?? "",
        motif:           editData.motif ?? "",
        description:     editData.description ?? "",
        statut:          editData.statut ?? "EN_COURS",
        date_traitement: editData.date_traitement ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // ✅ Envoyer seulement les champs nécessaires
      const payload = {
        id_brevet:   Number(form.id_brevet),
        motif:       form.motif,
        description: form.description,
        statut:      form.statut,
        // date_traitement seulement si remplie
        ...(form.date_traitement && { date_traitement: form.date_traitement }),
      };
      await onSubmit(payload);
      if (!editData) setForm(emptyForm);
    } catch (err) {
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    if (onCancel) onCancel();
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3>{editData ? "Modifier recours" : "Ajouter recours"}</h3>

      {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

      {/* ✅ Select brevet depuis l'API */}
      <label>Brevet</label>
      <select
        name="id_brevet"
        value={form.id_brevet}
        onChange={handleChange}
        required
      >
        <option value="">-- Sélectionner un brevet --</option>
        {brevets.map((b) => (
          <option key={b.id_brevet} value={b.id_brevet}>
            {b.titre} — N°{b.num_brevet}
          </option>
        ))}
      </select>

      <label>Motif</label>
      <input
        name="motif"
        placeholder="Motif du recours"
        value={form.motif}
        onChange={handleChange}
        required
      />

      <label>Description</label>
      <textarea
        name="description"
        placeholder="Description détaillée"
        value={form.description}
        onChange={handleChange}
        rows="3"
      />

      <label>Statut</label>
      <select name="statut" value={form.statut} onChange={handleChange}>
        <option value="EN_COURS">EN COURS</option>
        <option value="TRAITE">TRAITÉ</option>
        <option value="REFUSE">REFUSÉ</option>
      </select>

      <label>Date de traitement</label>
      <input
        type="date"
        name="date_traitement"
        value={form.date_traitement}
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : editData ? "Modifier" : "Ajouter"}
      </button>

      {editData && (
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Annuler
        </button>
      )}
    </form>
  );
}