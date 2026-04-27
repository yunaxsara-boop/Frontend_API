import { useEffect, useState } from "react";

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      <h3>{editData ? "Modifier paiement" : "Ajouter paiement"}</h3>

      <input
        name="titre_brevet"
        placeholder="Titre du brevet"
        value={form.titre_brevet}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="date_paiement"
        value={form.date_paiement}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="montant_total"
        placeholder="Montant total DA"
        value={form.montant_total}
        onChange={handleChange}
        min="0"
        step="0.01"
        required
      />

      <select name="statut" value={form.statut} onChange={handleChange}>
        <option value="non_payer">Non payé</option>
        <option value="payer">Payé</option>
      </select>

      <button type="submit">{editData ? "Modifier" : "Ajouter"}</button>

      {editData && (
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Annuler
        </button>
      )}
    </form>
  );
}