import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRespBrevets } from "./RespBrevetsContext";
import "../agent/addBrevet.css";

export default function RespAddBrevet() {
  const navigate = useNavigate();
  const { addBrevet } = useRespBrevets();

  const [form, setForm] = useState({
    num_brevet: "", titre: "", num_depo: "",
    date_depo: "", date_sortie: "", titulaire: "",
    nom_inventeur: "", nom_deposant: "",
    status: "EN_ATTENTE", documents: [],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFiles  = (e) => {
    const files = Array.from(e.target.files).map((f) => f.name);
    setForm({ ...form, documents: [...form.documents, ...files] });
  };
  const handleSubmit = () => { addBrevet(form); navigate("/responsable/brevets"); };

  return (
    <div className="brevet-page">
      <div className="brevet-card">
        <h2 className="brevet-title">Ajouter un brevet</h2>

        <div className="brevet-grid">
          <div className="form-group">
            <label>Num brevet</label>
            <input name="num_brevet" value={form.num_brevet} onChange={handleChange} placeholder="BR-2024-001" />
          </div>
          <div className="form-group">
            <label>Titre</label>
            <input name="titre" value={form.titre} onChange={handleChange} placeholder="Titre du brevet" />
          </div>
          <div className="form-group">
            <label>Num dépôt</label>
            <input name="num_depo" value={form.num_depo} onChange={handleChange} placeholder="ND-001" />
          </div>
          <div className="form-group">
            <label>Titulaire</label>
            <input name="titulaire" value={form.titulaire} onChange={handleChange} placeholder="Nom du titulaire" />
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
            <input name="nom_inventeur" value={form.nom_inventeur} onChange={handleChange} placeholder="Nom de l'inventeur" />
          </div>
          <div className="form-group">
            <label>Déposant</label>
            <input name="nom_deposant" value={form.nom_deposant} onChange={handleChange} placeholder="Nom du déposant" />
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
            <label>Documents</label>
            <div className="docs-box">
              <input type="file" multiple onChange={handleFiles} />
              {form.documents.map((doc, i) => (
                <div key={i} className="doc-item">{doc}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="brevet-actions">
          <button className="btn-save"   onClick={handleSubmit}>Enregistrer</button>
          <button className="btn-cancel" onClick={() => navigate("/responsable/brevets")}>Annuler</button>
        </div>
      </div>
    </div>
  );
}