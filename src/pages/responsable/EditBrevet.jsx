import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../agent/addBrevet.css";
import { updateBrevet, getBrevetById } from "../../features/brevets/brevetApi";

export default function RespEditBrevet() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [form, setForm]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [inventeurs, setInventeurs] = useState([]);
  const [deposant, setDeposant]     = useState({
    id_dep: null, nom_dep: "", prenom_dep: "",
  });

  useEffect(() => {
    const fetchBrevet = async () => {
      try {
        setLoading(true);
        const data = await getBrevetById(id);
        setForm(data);
        if (Array.isArray(data.id_inv)) {
          setInventeurs(data.id_inv.map((i) => ({
            id_inv:     i.id_inv,
            nom_inv:    i.nom_inv,
            prenom_inv: i.prenom_inv,
          })));
        }
        if (data.id_dep) {
          setDeposant({
            id_dep:     data.id_dep.id_dep,
            nom_dep:    data.id_dep.nom_dep,
            prenom_dep: data.id_dep.prenom_dep,
          });
        }
      } catch {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchBrevet();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleInventeurChange = (index, field, value) => {
    const updated = [...inventeurs];
    updated[index] = { ...updated[index], [field]: value };
    setInventeurs(updated);
  };

  const ajouterInventeur = () =>
    setInventeurs([...inventeurs, { id_inv: null, nom_inv: "", prenom_inv: "" }]);

  const supprimerInventeur = (index) =>
    setInventeurs(inventeurs.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      await updateBrevet(id, {
        ...form,
        num_brevet:      Number(form.num_brevet),
        num_depo:        Number(form.num_depo),
        deposant_data:   { nom_dep: deposant.nom_dep, prenom_dep: deposant.prenom_dep },
        inventeurs_data: inventeurs.map((i) => ({
          nom_inv: i.nom_inv, prenom_inv: i.prenom_inv,
        })),
      });
      navigate("/responsable/brevets");
    } catch (err) {
      setError(JSON.stringify(err.response?.data));
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;
  if (!form)   return <p>Brevet introuvable</p>;

  return (
    <div className="add-page">
      <div className="add-card">
        <h2 className="add-title">Modifier le brevet</h2>

        <div className="add-section-label">Identification</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Numéro brevet</label>
            <input name="num_brevet" value={form.num_brevet ?? ""} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Titre</label>
            <input name="titre" value={form.titre ?? ""} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Numéro de dépôt</label>
            <input name="num_depo" value={form.num_depo ?? ""} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Titulaire</label>
            <input name="titulaire" value={form.titulaire ?? ""} onChange={handleChange} />
          </div>
        </div>

        <div className="add-section-label">Dates</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Date de dépôt</label>
            <input type="date" name="date_depo" value={form.date_depo ?? ""} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Date sortie</label>
            <input type="date" name="date_sortie" value={form.date_sortie ?? ""} onChange={handleChange} />
          </div>
        </div>

        <div className="add-section-label">Statut</div>
        <div className="add-grid">
          <div className="form-group">
            <label>Statut</label>
            <select name="statut" value={form.statut ?? "EN_ATTENTE"} onChange={handleChange}>
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
                value={deposant.nom_dep ?? ""}
                onChange={(e) => setDeposant({ ...deposant, nom_dep: e.target.value })}
              />
            </div>
            <div>
              <label>Prénom</label>
              <input
                value={deposant.prenom_dep ?? ""}
                onChange={(e) => setDeposant({ ...deposant, prenom_dep: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="add-section-label">Inventeurs</div>
        {inventeurs.length === 0 && <p>Aucun inventeur</p>}
        {inventeurs.map((inv, index) => (
          <div key={index} className="personne-card">
            <div className="personne-card-header">
              <span className="personne-card-num">Inventeur {index + 1}</span>
              <button
                type="button"
                className="btn-remove-inv"
                onClick={() => supprimerInventeur(index)}
              >
                ✕ Supprimer
              </button>
            </div>
            <div className="personne-row">
              <div>
                <label>Nom</label>
                <input
                  value={inv.nom_inv ?? ""}
                  onChange={(e) => handleInventeurChange(index, "nom_inv", e.target.value)}
                />
              </div>
              <div>
                <label>Prénom</label>
                <input
                  value={inv.prenom_inv ?? ""}
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
          <button className="btn-save" onClick={handleSubmit}>Enregistrer</button>
          <button className="btn-cancel" onClick={() => navigate("/responsable/brevets")}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}