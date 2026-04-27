import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRespBrevets } from "./RespBrevetsContext";
import "../agent/editBrevet.css";

export default function RespEditBrevet() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { getBrevetById, updateBrevet } = useRespBrevets();
  const [form, setForm] = useState(null);

  useEffect(() => { setForm(getBrevetById(id) || null); }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile   = (e) => {
    const files = Array.from(e.target.files).map((f) => f.name);
    setForm({ ...form, documents: [...(form.documents || []), ...files] });
  };
  const handleSave = () => { updateBrevet(id, form); navigate("/responsable/brevets"); };

  if (!form) return <p>Chargement...</p>;

  return (
    <div className="brevet-page">
      <div className="brevet-card">
        <h2 className="brevet-title">Modifier le brevet</h2>

        <div className="brevet-grid">
          <div className="form-group">
            <label>Num brevet</label>
            <input name="num_brevet" value={form.num_brevet} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Titre</label>
            <input name="titre" value={form.titre} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Num dépôt</label>
            <input name="num_depo" value={form.num_depo} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Titulaire</label>
            <input name="titulaire" value={form.titulaire} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Date dépôt</label>
            <input type="date" name="date_depo" value={form.date_depo} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Date sortie</label>
            <input type="date" name="date_sortie" value={form.date_sortie} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Inventeur</label>
            <input name="nom_inventeur" value={form.nom_inventeur} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Déposant</label>
            <input name="nom_deposant" value={form.nom_deposant} onChange={handleChange} />
          </div>

          <div className="brevet-section-label">Statut &amp; Documents</div>

          <div className="form-group">
            <label>Statut</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="EN_ATTENTE">En attente</option>
              <option value="ACCEPTER">Accepté</option>
              <option value="REFUSER">Refusé</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Ajouter documents</label>
            <div className="docs-box">
              <input type="file" multiple onChange={handleFile} />
              {form.documents?.map((doc, i) => (
                <div key={i} className="doc-item">{doc}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="brevet-actions">
          <button className="btn-save"   onClick={handleSave}>Enregistrer</button>
          <button className="btn-cancel" onClick={() => navigate("/responsable/brevets")}>Annuler</button>
        </div>
      </div>
    </div>
  );
}