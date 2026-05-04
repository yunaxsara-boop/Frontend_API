import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../agent/addBrevet.css";
import { addBrevet, getDemandesDisponibles } from "../../features/brevets/brevetApi";

export default function RespAddBrevet() {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [demandes, setDemandes] = useState([]);

  const [form, setForm] = useState({
    num_brevet:      "",
    titre:           "",
    num_depo:        "",
    date_depo:       "",
    date_sortie:     "",
    titulaire:       "",
    statut:          "EN_ATTENTE",
    id_demande_input: "",   // ✅ demande liée
  });

  const [deposant, setDeposant] = useState({
    nom_dep: "", prenom_dep: "",
  });

  const [inventeurs, setInventeurs] = useState([
    { nom_inv: "", prenom_inv: "" },
  ]);

  // ✅ Charger les demandes validées disponibles
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const data = await getDemandesDisponibles();
        setDemandes(data);
      } catch {
        console.error("Erreur chargement demandes");
      }
    };
    fetchDemandes();
  }, []);

  // ✅ Quand une demande est sélectionnée, pré-remplir num_depo et date_depo
  const handleDemandeChange = (e) => {
    const id = e.target.value;
    const demande = demandes.find((d) => String(d.id_demande) === String(id));
    setForm({
      ...form,
      id_demande_input: id,
      num_depo:  demande ? demande.num_depo  : form.num_depo,
      date_depo: demande ? demande.date_depo : form.date_depo,
      titre:     demande ? demande.titre     : form.titre,
    });
  };

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
        num_brevet:       Number(form.num_brevet),
        titre:            form.titre,
        num_depo:         Number(form.num_depo),
        date_depo:        form.date_depo,
        date_sortie:      form.date_sortie,
        titulaire:        form.titulaire,
        statut:           form.statut,
        id_demande_input: form.id_demande_input ? Number(form.id_demande_input) : null,
        deposant_data:    deposant,
        inventeurs_data:  inventeurs.filter(
          (i) => i.nom_inv.trim() !== "" || i.prenom_inv.trim() !== ""
        ),
      });
      navigate("/responsable/brevets");
    } catch (err) {
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

        {/* ✅ Sélection de la demande liée */}
        <div className="add-section-label">Demande liée</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Sélectionner une demande validée</label>
            <select name="id_demande_input" onChange={handleDemandeChange} value={form.id_demande_input}>
              <option value="">-- Aucune demande --</option>
              {demandes.map((d) => (
                <option key={d.id_demande} value={d.id_demande}>
                  #{d.id_demande} — {d.titre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="add-section-label">Identification</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Numéro brevet</label>
            <input name="num_brevet" placeholder="Ex : 2024001" value={form.num_brevet} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Titre de l'invention</label>
            <input name="titre" placeholder="Titre complet" value={form.titre} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Numéro de dépôt</label>
            <input name="num_depo" placeholder="Ex : 2024001" value={form.num_depo} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Titulaire</label>
            <input name="titulaire" placeholder="Nom du titulaire" value={form.titulaire} onChange={handleChange} />
          </div>
        </div>

        <div className="add-section-label">Dates</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Date de dépôt</label>
            <input type="date" name="date_depo" value={form.date_depo} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Date sortie</label>
            <input type="date" name="date_sortie" value={form.date_sortie} onChange={handleChange} />
          </div>
        </div>

        <div className="add-section-label">Statut</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange}>
              <option value="EN_ATTENTE">EN ATTENTE</option>
              <option value="ACCEPTER">ACCEPTER</option>
              <option value="REFUSER">REFUSER</option>
            </select>
          </div>
        </div>

        <div className="add-section-label">Déposant</div>
        <div className="personne-card">
          <div className="personne-row">
            <div>
              <label>Nom</label>
              <input
                placeholder="Nom du déposant"
                value={deposant.nom_dep}
                onChange={(e) => setDeposant({ ...deposant, nom_dep: e.target.value })}
              />
            </div>
            <div>
              <label>Prénom</label>
              <input
                placeholder="Prénom du déposant"
                value={deposant.prenom_dep}
                onChange={(e) => setDeposant({ ...deposant, prenom_dep: e.target.value })}
              />
            </div>
          </div>
        </div>

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
                  onChange={(e) => handleInventeurChange(index, "nom_inv", e.target.value)}
                />
              </div>
              <div>
                <label>Prénom</label>
                <input
                  placeholder="Prénom"
                  value={inv.prenom_inv}
                  onChange={(e) => handleInventeurChange(index, "prenom_inv", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn-add-inv" onClick={ajouterInventeur}>
          + Ajouter un inventeur
        </button>

        <div className="add-actions">
          <button className="btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button className="btn-cancel" onClick={() => navigate("/responsable/brevets")}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}