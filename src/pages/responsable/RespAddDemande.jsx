import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "/src/contexts/AuthContext.jsx";
import { addDemande } from "../../features/demandes/demandeApi";
import "../agent/AddDemande.css";

const EMPTY_FORM = {
  nature_brevet: false, nature_pct: false, nature_certificat: false,
  titre: "",
  num_depot: "", priorite_date: "", priorite_pays: "", priorite_nature: "",
  brevet_principal_num: "", brevet_principal_date: "",
  mandataire_nom: "", mandataire_date_pouvoir: "",
  autres_informations: "",
  piece_copie_int: false, piece_memoire_nat: false, piece_memoire_fr: false,
  piece_memoire_fr_dup: false, piece_dessins_orig: false, piece_dessins_dup: false,
  piece_abrege: false, piece_pouvoir: false, piece_priorite: false,
  piece_cession: false, piece_titre: false,
};

const PIECES = [
  ["piece_copie_int",      "Copie de la demande internationale"],
  ["piece_memoire_nat",    "Mémoire descriptif en langue nationale"],
  ["piece_memoire_fr",     "Mémoire descriptif original (français)"],
  ["piece_memoire_fr_dup", "Mémoire descriptif duplicata (français)"],
  ["piece_dessins_orig",   "Dessin(s) original(aux)"],
  ["piece_dessins_dup",    "Dessin(s) duplicata(aux)"],
  ["piece_abrege",         "Abrégé descriptif"],
  ["piece_pouvoir",        "Pouvoir"],
  ["piece_priorite",       "Document de priorité"],
  ["piece_cession",        "Cession de priorité"],
  ["piece_titre",          "Titre / justification paiement taxes"],
];

export default function AddDemande() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ✅ Un seul déposant
  const [deposant, setDeposant] = useState({
    nom_dep: "", prenom_dep: "", denomination: "", adresse_dep: "", nationalite: ""
  });

  // Plusieurs inventeurs
  const [inventeurs, setInventeurs] = useState([
    { nom_inv: "", prenom_inv: "", adress_inv: "" }
  ]);

  const setField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const updateDep = (field, val) =>
    setDeposant(d => ({ ...d, [field]: val }));

  const updateInventeur = (i, field, val) => {
    const arr = [...inventeurs];
    arr[i] = { ...arr[i], [field]: val };
    setInventeurs(arr);
  };

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    const natureLbl = form.nature_brevet ? "Brevet d'invention"
      : form.nature_pct ? "Extension PCT"
      : form.nature_certificat ? "Certificat d'addition" : "—";

    const payload = {
      titre:         form.titre || "—",
      nature:        natureLbl,
      num_depo:      Number(form.num_depot) || 0,
      date_depo:     form.priorite_date || null,
      pays_origine:  form.priorite_pays || "",
      numdemande_CA: Number(form.brevet_principal_num) || 0,
      date_CA:       form.brevet_principal_date || null,
      mandataire:    form.mandataire_nom || "",
      date_pouvoir:  form.mandataire_date_pouvoir || null,
      autre_info:    form.autres_informations || "",
      statut:        "non_valider",
      piece_copie_int:      form.piece_copie_int,
      piece_memoire_nat:    form.piece_memoire_nat,
      piece_memoire_fr:     form.piece_memoire_fr,
      piece_memoire_fr_dup: form.piece_memoire_fr_dup,
      piece_dessins_orig:   form.piece_dessins_orig,
      piece_dessins_dup:    form.piece_dessins_dup,
      piece_abrege:         form.piece_abrege,
      piece_pouvoir:        form.piece_pouvoir,
      piece_priorite:       form.piece_priorite,
      piece_cession:        form.piece_cession,
      piece_titre:          form.piece_titre,
    };

    try {
      const nouvelle = await addDemande(payload);
      const currentId = nouvelle?.id_demande;

      if (currentId) {
        // ✅ Un seul déposant
        if (deposant.nom_dep || deposant.prenom_dep) {
          await api.post("deposants/", { ...deposant, id_demande: currentId });
        }
        // Plusieurs inventeurs — FK simple
        for (const inv of inventeurs) {
          if (inv.nom_inv || inv.prenom_inv) {
            await api.post("inventeurs/", { ...inv, id_demande: currentId });
          }
        }
      }
      navigate("/responsable/demandes");
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Erreur enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-dem-page">
      <div className="add-dem-card">
        <div className="add-dem-header">
          <div className="add-dem-header-icon">📋</div>
          <div>
            <h2>Nouvelle demande de protection</h2>
            <p>Formulaire officiel INAPI — R2-FO-03</p>
          </div>
        </div>

        {error && <div className="add-dem-error">{error}</div>}

        {/* Nature */}
        <Section num="01" label="Nature de la demande *">
          <div className="check-row">
            {[
              ["nature_brevet",     "Brevet d'invention"],
              ["nature_pct",        "Extension PCT"],
              ["nature_certificat", "Certificat d'addition"],
            ].map(([n, lbl]) => (
              <label key={n} className="chk-label">
                <input type="checkbox" name={n} checked={!!form[n]} onChange={setField} />
                <span>{lbl}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* ✅ Un seul déposant — pas de liste, pas de bouton ajouter */}
        <Section num="71" label="[71] — DÉPOSANT">
          <div className="personne-card">
            <div className="modal-grid">
              <F label="Nom"          value={deposant.nom_dep}      onChange={e => updateDep("nom_dep", e.target.value)} />
              <F label="Prénom"       value={deposant.prenom_dep}   onChange={e => updateDep("prenom_dep", e.target.value)} />
              <F label="Dénomination" value={deposant.denomination} onChange={e => updateDep("denomination", e.target.value)} full />
              <F label="Adresse"      value={deposant.adresse_dep}  onChange={e => updateDep("adresse_dep", e.target.value)} full area />
              <F label="Nationalité"  value={deposant.nationalite}  onChange={e => updateDep("nationalite", e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Inventeurs — plusieurs possibles */}
        <Section num="72" label="[72] — INVENTEUR(S)">
          {inventeurs.map((inv, i) => (
            <div key={i} className="personne-card">
              <div className="personne-card-header">
                <span className="personne-num">Inventeur {i + 1}</span>
                {inventeurs.length > 1 && (
                  <button type="button" className="btn-remove"
                    onClick={() => setInventeurs(inventeurs.filter((_, j) => j !== i))}>
                    ✕ Supprimer
                  </button>
                )}
              </div>
              <div className="modal-grid">
                <F label="Nom"     value={inv.nom_inv}    onChange={e => updateInventeur(i, "nom_inv", e.target.value)} />
                <F label="Prénom"  value={inv.prenom_inv} onChange={e => updateInventeur(i, "prenom_inv", e.target.value)} />
                <F label="Adresse" value={inv.adress_inv} onChange={e => updateInventeur(i, "adress_inv", e.target.value)} full area />
              </div>
            </div>
          ))}
          <button type="button" className="btn-add-more"
            onClick={() => setInventeurs([...inventeurs, { nom_inv: "", prenom_inv: "", adress_inv: "" }])}>
            + Ajouter un inventeur
          </button>
        </Section>

        {/* Titre */}
        <Section num="54" label="[54] — TITRE DE L'INVENTION">
          <div className="modal-grid">
            <F label="Titre complet" name="titre" value={form.titre} onChange={setField} full area />
          </div>
        </Section>

        {/* Priorité */}
        <Section num="30" label="[30] — REVENDICATION DE PRIORITÉ">
          <div className="modal-grid">
            <F label="N° de dépôt"    name="num_depot"       value={form.num_depot}       onChange={setField} type="number" />
            <F label="Date de dépôt"  name="priorite_date"   value={form.priorite_date}   onChange={setField} type="date" />
            <F label="Pays d'origine" name="priorite_pays"   value={form.priorite_pays}   onChange={setField} />
            <F label="Nature"         name="priorite_nature" value={form.priorite_nature} onChange={setField} />
          </div>
        </Section>

        {/* Brevet principal */}
        <Section num="+" label="Certificat d'addition — Brevet principal">
          <div className="modal-grid">
            <F label="N° brevet principal" name="brevet_principal_num"  value={form.brevet_principal_num}  onChange={setField} />
            <F label="Date"                name="brevet_principal_date" value={form.brevet_principal_date} onChange={setField} type="date" />
          </div>
        </Section>

        {/* Mandataire */}
        <Section num="74" label="[74] — MANDATAIRE">
          <div className="modal-grid">
            <F label="Nom / Dénomination" name="mandataire_nom"          value={form.mandataire_nom}          onChange={setField} full />
            <F label="Date du pouvoir"    name="mandataire_date_pouvoir" value={form.mandataire_date_pouvoir} onChange={setField} type="date" />
          </div>
        </Section>

        {/* Autres infos */}
        <Section num="ℹ" label="Autres informations">
          <div className="modal-grid">
            <F label="Informations complémentaires" name="autres_informations" value={form.autres_informations} onChange={setField} full area rows={3} />
          </div>
        </Section>

        {/* Pièces */}
        <Section num="📎" label="Bordereau des pièces déposées *">
          <div className="pieces-grid">
            {PIECES.map(([n, lbl]) => (
              <label key={n} className="piece-item">
                <input type="checkbox" name={n} checked={!!form[n]} onChange={setField} />
                <span>{lbl}</span>
              </label>
            ))}
          </div>
        </Section>

        <div className="add-dem-actions">
          <button className="btn-cancel" onClick={() => navigate("/responsable/demandes")}>Annuler</button>
          <button className="btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement…" : " Enregistrer la demande"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ num, label, children }) {
  return (
    <div className="modal-section">
      <div className="section-title"><span className="section-num">{num}</span>{label}</div>
      {children}
    </div>
  );
}

function F({ label, name, value, onChange, type = "text", full, area, rows = 2 }) {
  return (
    <div className={`fg${full ? " full" : ""}`}>
      <label>{label}</label>
      {area
        ? <textarea name={name} value={value} onChange={onChange} rows={rows} />
        : <input type={type} name={name} value={value} onChange={onChange} />
      }
    </div>
  );
}