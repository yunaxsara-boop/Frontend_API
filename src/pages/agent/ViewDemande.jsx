import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDemandeById } from "../../features/demandes/demandeApi";
import { buildAndOpen } from "./demandeUtils"; // helper print/download
import "./ViewDemande.css";

const PIECES_LABELS = {
  piece_copie_int:      "Copie de la demande internationale",
  piece_memoire_nat:    "Mémoire descriptif en langue nationale",
  piece_memoire_fr:     "Mémoire descriptif original (français)",
  piece_memoire_fr_dup: "Mémoire descriptif duplicata (français)",
  piece_dessins_orig:   "Dessin(s) original(aux)",
  piece_dessins_dup:    "Dessin(s) duplicata(aux)",
  piece_abrege:         "Abrégé descriptif",
  piece_pouvoir:        "Pouvoir",
  piece_priorite:       "Document de priorité",
  piece_cession:        "Cession de priorité",
  piece_titre:          "Titre / justification paiement taxes",
};

export default function ViewDemande() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDemandeById(id)
      .then(setData)
      .catch(() => setError("Demande introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: 24 }}>Chargement…</p>;
  if (error)   return <p style={{ padding: 24, color: "red" }}>{error}</p>;
  if (!data)   return null;

  const initiales = (a, b) => `${a?.[0] ?? ""}${b?.[0] ?? ""}`.toUpperCase();
  const badgeCls  = data.statut === "valider" ? "vd-badge green" : "vd-badge red";
  const deposedPieces = Object.entries(PIECES_LABELS).filter(([key]) => data[key]);

  return (
    <div className="vd-page">
      <div className="vd-card">

        {/* Header */}
        <div className="vd-header">
          <div className="vd-header-left">
            <div className="vd-icon">📋</div>
            <div>
              <h2>Demande #{data.id_demande}</h2>
              <p>Formulaire INAPI — R2-FO-03</p>
            </div>
          </div>
          <div className="vd-header-actions">
            <span className={badgeCls}>{data.statut === "valider" ? "✓ Validée" : "✗ Non validée"}</span>
            <button className="vd-btn print" onClick={() => buildAndOpen(data, "print")}>🖨 Imprimer</button>
            <button className="vd-btn dl"    onClick={() => buildAndOpen(data, "download")}>⬇ Télécharger</button>
          </div>
        </div>

        {/* Nature */}
        <Section label="Nature de la demande">
          <div className="vd-nature-badge">{data.nature || "—"}</div>
        </Section>

        {/* Identification */}
        <Section label="Identification">
          <div className="vd-info-grid">
            <Info label="Titre" value={data.titre} full />
            <Info label="N° de dépôt"    value={data.num_depo} />
            <Info label="Date de dépôt"  value={data.date_depo} />
            <Info label="Pays d'origine" value={data.pays_origine} />
            <Info label="N° demande CA"  value={data.numdemande_CA} />
            <Info label="Date CA"        value={data.date_CA} />
            <Info label="Mandataire"     value={data.mandataire} />
            <Info label="Date pouvoir"   value={data.date_pouvoir} />
          </div>
        </Section>

        {/* Déposants */}
        <Section label={`Déposant(s) ${data.deposant?.length ? `(${data.deposant.length})` : ""}`}>
          {Array.isArray(data.deposant) && data.deposant.length > 0 ? (
            <div className="vd-personnes">
              {data.deposant.map(dep => (
                <div key={dep.id_dep} className="vd-personne-card">
                  <div className="vd-avatar">{initiales(dep.nom_dep, dep.prenom_dep)}</div>
                  <div className="vd-personne-info">
                    <div className="vd-personne-name">{dep.nom_dep} {dep.prenom_dep}</div>
                    {dep.denomination && <div className="vd-personne-sub">{dep.denomination}</div>}
                    {dep.adresse_dep  && <div className="vd-personne-sub">📍 {dep.adresse_dep}</div>}
                    {dep.nationalite  && <div className="vd-personne-sub">🌐 {dep.nationalite}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="vd-empty">Aucun déposant enregistré</p>}
        </Section>

        {/* Inventeurs */}
        <Section label={`Inventeur(s) ${data.inventeur?.length ? `(${data.inventeur.length})` : ""}`}>
          {Array.isArray(data.inventeur) && data.inventeur.length > 0 ? (
            <div className="vd-personnes">
              {data.inventeur.map(inv => (
                <div key={inv.id_inv} className="vd-personne-card">
                  <div className="vd-avatar inv">{initiales(inv.nom_inv, inv.prenom_inv)}</div>
                  <div className="vd-personne-info">
                    <div className="vd-personne-name">{inv.nom_inv} {inv.prenom_inv}</div>
                    {inv.adress_inv && <div className="vd-personne-sub">📍 {inv.adress_inv}</div>}
                    <div className="vd-personne-role">Inventeur</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="vd-empty">Aucun inventeur enregistré</p>}
        </Section>

        {/* Autres infos */}
        {data.autre_info && (
          <Section label="Autres informations">
            <p className="vd-autres">{data.autre_info}</p>
          </Section>
        )}

        {/* Pièces */}
        <Section label="Bordereau des pièces déposées">
          {deposedPieces.length > 0 ? (
            <div className="vd-pieces">
              {deposedPieces.map(([, lbl]) => (
                <div key={lbl} className="vd-piece-item">✓ {lbl}</div>
              ))}
            </div>
          ) : <p className="vd-empty">Aucune pièce cochée</p>}
        </Section>

        {/* Actions */}
        <div className="vd-footer">
          <button className="vd-btn-back" onClick={() => navigate(-1)}>← Retour</button>
          <button className="vd-btn edit" onClick={() => navigate(`/agent/demandes/edit/${id}`)}>✏ Modifier</button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="vd-section">
      <div className="vd-section-title">{label}</div>
      {children}
    </div>
  );
}

function Info({ label, value, full }) {
  return (
    <div className={`vd-info-item${full ? " full" : ""}`}>
      <div className="vd-info-label">{label}</div>
      <div className="vd-info-value">{value || "—"}</div>
    </div>
  );
}