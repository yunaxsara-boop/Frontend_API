import { useEffect, useState } from "react";

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
    id: null,
    titre_brevet: "",
    date_paiement: "",
    montant_total: "",
    statut: "non_payer",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(editData || emptyForm);
  }, [editData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      id: form.id || Date.now(),
      montant_total: parseFloat(form.montant_total) || 0,
    });
    if (!editData) setForm(emptyForm);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    if (onCancel) onCancel();
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3>{editData ? "✏️ Modifier paiement" : "+ Nouveau paiement"}</h3>

      <div style={FIELD_WRAP}>
        <label style={LABEL_STYLE}>Titre du brevet</label>
        <input
          name="titre_brevet"
          placeholder="Ex : Brevet FR-2024-001"
          value={form.titre_brevet}
          onChange={handleChange}
          required
        />
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
          placeholder="Ex : 1 500"
          value={form.montant_total}
          onChange={handleChange}
          min="0"
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

      <button type="submit">
        {editData ? "💾 Enregistrer les modifications" : "✅ Ajouter le paiement"}
      </button>

      {editData && (
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Annuler
        </button>
      )}
    </form>
  );
}