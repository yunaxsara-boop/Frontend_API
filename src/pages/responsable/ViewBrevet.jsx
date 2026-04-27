import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRespBrevets } from "./RespBrevetsContext";
import "../agent/viewBrevet.css";

export default function RespViewBrevet() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { getBrevetById } = useRespBrevets();
  const [data, setData]   = useState(null);

  useEffect(() => { setData(getBrevetById(id)); }, [id]);

  if (!data) return <p>Chargement...</p>;

  const statusClass = {
    EN_ATTENTE: "en-attente",
    ACCEPTER:   "accepter",
    REFUSER:    "refuser",
  }[data.status] ?? "en-attente";

  return (
    <div className="view-page">
      <div className="view-card-wrapper">
        <h2 className="view-title">Détails du brevet</h2>

        <div className="view-info-grid">
          <div className="view-info-item">
            <div className="view-info-label">Num brevet</div>
            <div className="view-info-value">{data.num_brevet}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Num dépôt</div>
            <div className="view-info-value">{data.num_depo}</div>
          </div>
          <div className="view-info-item full-width">
            <div className="view-info-label">Titre</div>
            <div className="view-info-value">{data.titre}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Date dépôt</div>
            <div className="view-info-value">{data.date_depo}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Date sortie</div>
            <div className="view-info-value">{data.date_sortie}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Titulaire</div>
            <div className="view-info-value">{data.titulaire}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Inventeur</div>
            <div className="view-info-value">{data.nom_inventeur}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Déposant</div>
            <div className="view-info-value">{data.nom_deposant}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Statut</div>
            <span className={`view-status ${statusClass}`}>{data.status}</span>
          </div>
        </div>

        <div className="view-section-label">Documents</div>
        <div className="view-docs-box">
          {data.documents?.length > 0 ? (
            data.documents.map((doc, i) => (
              <div key={i} className="view-doc-item">{doc}</div>
            ))
          ) : (
            <p className="view-no-docs">Aucun document joint</p>
          )}
        </div>

        <button className="view-btn-back" onClick={() => navigate(-1)}>
          ← Retour
        </button>
      </div>
    </div>
  );
}