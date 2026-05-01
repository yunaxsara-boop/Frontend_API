import { useEffect, useState } from "react";
import { api } from "/src/contexts/AuthContext.jsx";

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: "#a0826d",
  textTransform: "uppercase",
  letterSpacing: ".3px",
  marginBottom: 4,
  display: "block",
};

const FIELD_WRAP = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export default function PaiementForm({ onSubmit, editData, onCancel }) {
  const emptyForm = {
    id_brevet:     "",
    date_paiement: "",
    montant_total: "",
    statut:        "non_payer",
  };

  const [form, setForm] = useState(emptyForm);
  const [brevets, setBrevets] = useState([]);
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
        // ✅ id_brevet est un objet en lecture, on extrait l'ID
        id_brevet:     editData.id_brevet?.id_brevet ?? editData.id_brevet ?? "",
        date_paiement: editData.date_paiement ?? "",
        montant_total: editData.montant_total ?? "",
        statut:        editData.statut ?? "non_payer",
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
      const payload = {
        id_brevet_id:  Number(form.id_brevet),  // ✅ clé write_only du serializer
        date_paiement: form.date_paiement,
        montant_total: parseFloat(form.montant_total),
        statut:        form.statut,
      };
      await onSubmit(payload);
      if (!editData) setForm(emptyForm);
    } catch {
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
      <h3>{editData ? "✏️ Modifier paiement" : "+ Nouveau paiement"}</h3>

      {error && (
        <p style={{ color: "red", fontSize: 13, margin: "4px 0" }}>{error}</p>
      )}

      {/* ✅ Select brevet depuis l'API */}
      <div style={FIELD_WRAP}>
        <label style={LABEL_STYLE}>Brevet</label>
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
      </div>

      <div style={FIELD_WRAP}>
        <label style={LABEL_STYLE}>Date de paiement</label>
        <input
          type="date"
          name="date_paiement"
          value={form.date_paiement}
          onChange={handleChange}
          required
        />
      </div>

      <div style={FIELD_WRAP}>
        <label style={LABEL_STYLE}>Montant total (DA)</label>
        <input
          type="number"
          name="montant_total"
          placeholder="Ex : 1500"
          value={form.montant_total}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div style={FIELD_WRAP}>
        <label style={LABEL_STYLE}>Statut</label>
        <select name="statut" value={form.statut} onChange={handleChange}>
          <option value="non_payer">Non payé</option>
          <option value="payer">Payé</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading
          ? "Enregistrement..."
          : editData
          ? " Enregistrer les modifications"
          : " Ajouter le paiement"}
      </button>

      {editData && (
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Annuler
        </button>
      )}
    </form>
  );
}