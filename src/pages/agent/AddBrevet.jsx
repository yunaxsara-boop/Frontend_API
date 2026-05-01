import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./addBrevet.css";
import { addBrevet } from "/src/features/brevets/brevetApi.js";

export default function AddBrevet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    num_brevet:  "",
    titre:       "",
    num_depo:    "",
    date_depo:   "",
    date_sortie: "",
    titulaire:   "",
    statut:      "EN_ATTENTE",
  });

  const [deposant, setDeposant] = useState({
    nom_dep:    "",
    prenom_dep: "",
  });

  const [inventeurs, setInventeurs] = useState([
    { nom_inv: "", prenom_inv: "" },
  ]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleInventeurChange = (index, field, value) => {
    const updated = [...inventeurs];
    updated[index] = { ...updated[index], [field]: value };
    setInventeurs(updated);
  };

  const ajouterInventeur = () =>
    setInventeurs([...inventeurs, { nom_inv: "", prenom_inv: "" }]);

  const supprimerInventeur = (index) =>
    setInventeurs(inventeurs.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await addBrevet({
        num_brevet:      Number(form.num_brevet),
        titre:           form.titre,
        num_depo:        Number(form.num_depo),
        date_depo:       form.date_depo,
        date_sortie:     form.date_sortie,
        titulaire:       form.titulaire,
        statut:          form.statut,
        deposant_data:   deposant,
        inventeurs_data: inventeurs.filter(
          (i) => i.nom_inv.trim() !== "" || i.prenom_inv.trim() !== ""
        ),
      });
      navigate("/agent/brevets");
    } catch (err) {
      console.log("ERREUR DÉTAIL:", err.response?.data);
      setError(JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-page">
      <div className="add-card">

        <h2 className="add-title">Ajouter un Brevet</h2>

        {error && <p className="add-error">{error}</p>}

        {/* ══ Identification ══ */}
        <div className="add-section-label">Identification</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Numéro brevet</label>
            <input name="num_brevet" placeholder="Ex : 2024001" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Titre de l'invention</label>
            <input name="titre" placeholder="Titre complet" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Numéro de dépôt</label>
            <input name="num_depo" placeholder="Ex : 2024001" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Titulaire</label>
            <input name="titulaire" placeholder="Nom du titulaire" onChange={handleChange} />
          </div>
        </div>

        {/* ══ Dates ══ */}
        <div className="add-section-label">Dates</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Date de dépôt</label>
            <input type="date" name="date_depo" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Date sortie</label>
            <input type="date" name="date_sortie" onChange={handleChange} />
          </div>
        </div>

        {/* ══ Statut ══ */}
        <div className="add-section-label">Statut</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Statut</label>
            <select name="statut" onChange={handleChange}>
              <option value="EN_ATTENTE">EN ATTENTE</option>
              <option value="ACCEPTER">ACCEPTER</option>
              <option value="REFUSER">REFUSER</option>
            </select>
          </div>
        </div>

        {/* ══ Déposant ══ */}
        <div className="add-section-label">Déposant</div>
        <div className="personne-card">
          <div className="personne-row">
            <div>
              <label>Nom</label>
              <input
                placeholder="Nom du déposant"
                value={deposant.nom_dep}
                onChange={(e) =>
                  setDeposant({ ...deposant, nom_dep: e.target.value })
                }
              />
            </div>
            <div>
              <label>Prénom</label>
              <input
                placeholder="Prénom du déposant"
                value={deposant.prenom_dep}
                onChange={(e) =>
                  setDeposant({ ...deposant, prenom_dep: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* ══ Inventeurs ══ */}
        <div className="add-section-label">Inventeurs</div>

        {inventeurs.map((inv, index) => (
          <div key={index} className="personne-card">
            <div className="personne-card-header">
              <span className="personne-card-num">Inventeur {index + 1}</span>
              {inventeurs.length > 1 && (
                <button
                  type="button"
                  className="btn-remove-inv"
                  onClick={() => supprimerInventeur(index)}
                >
                  ✕ Supprimer
                </button>
              )}
            </div>
            <div className="personne-row">
              <div>
                <label>Nom</label>
                <input
                  placeholder="Nom"
                  value={inv.nom_inv}
                  onChange={(e) =>
                    handleInventeurChange(index, "nom_inv", e.target.value)
                  }
                />
              </div>
              <div>
                <label>Prénom</label>
                <input
                  placeholder="Prénom"
                  value={inv.prenom_inv}
                  onChange={(e) =>
                    handleInventeurChange(index, "prenom_inv", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn-add-inv" onClick={ajouterInventeur}>
          + Ajouter un inventeur
        </button>

        {/* ══ Actions ══ */}
        <div className="add-actions">
          <button className="btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button className="btn-cancel" onClick={() => navigate("/agent/brevets")}>
            Annuler
          </button>
        </div>

      </div>
    </div>
  );
}