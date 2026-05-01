import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBrevetById } from "../../features/brevets/brevetApi";
import "../agent/viewBrevet.css";

export default function RespViewBrevet() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brevet = await getBrevetById(id);
        setData(brevet);
      } catch {
        setError("Brevet introuvable !");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;
  if (!data)   return <p>Brevet introuvable</p>;

  const initiales = (nom, prenom) =>
    `${nom?.[0] ?? ""}${prenom?.[0] ?? ""}`.toUpperCase();

  const statutClass =
    data.statut === "ACCEPTER" ? "accepter"
    : data.statut === "REFUSER" ? "refuser"
    : "en-attente";

  return (
    <div className="view-page">
      <div className="view-card">
        <h2 className="view-title">Détails du brevet</h2>

        <div className="view-section-label">Identification</div>
        <div className="view-info-grid">
          <div className="view-info-item">
            <div className="view-info-label">N° Brevet</div>
            <div className="view-info-value">{data.num_brevet}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">N° Dépôt</div>
            <div className="view-info-value">{data.num_depo}</div>
          </div>
          <div className="view-info-item full-width">
            <div className="view-info-label">Titre</div>
            <div className="view-info-value">{data.titre}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Titulaire</div>
            <div className="view-info-value">{data.titulaire}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Statut</div>
            <div className="view-info-value">
              <span className={`view-status ${statutClass}`}>{data.statut}</span>
            </div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Date dépôt</div>
            <div className="view-info-value">{data.date_depo}</div>
          </div>
          <div className="view-info-item">
            <div className="view-info-label">Date sortie</div>
            <div className="view-info-value">{data.date_sortie}</div>
          </div>
        </div>

        <div className="view-section-label">Déposant</div>
        <div className="view-personnes-grid">
          {data.id_dep ? (
            <div className="view-personne-card">
              <div className="view-personne-avatar">
                {initiales(data.id_dep.nom_dep, data.id_dep.prenom_dep)}
              </div>
              <div>
                <div className="view-personne-name">
                  {data.id_dep.nom_dep} {data.id_dep.prenom_dep}
                </div>
                <div className="view-personne-sub">Déposant</div>
              </div>
            </div>
          ) : (
            <p className="view-empty">Aucun déposant</p>
          )}
        </div>

        <div className="view-section-label">
          Inventeurs
          {Array.isArray(data.id_inv) && data.id_inv.length > 0 && (
            <span className="view-count">{data.id_inv.length}</span>
          )}
        </div>
        <div className="view-personnes-grid">
          {Array.isArray(data.id_inv) && data.id_inv.length > 0 ? (
            data.id_inv.map((inv) => (
              <div key={inv.id_inv} className="view-personne-card">
                <div className="view-personne-avatar">
                  {initiales(inv.nom_inv, inv.prenom_inv)}
                </div>
                <div>
                  <div className="view-personne-name">
                    {inv.nom_inv} {inv.prenom_inv}
                  </div>
                  <div className="view-personne-sub">Inventeur</div>
                </div>
              </div>
            ))
          ) : (
            <p className="view-empty">Aucun inventeur</p>
          )}
        </div>

        <button className="view-btn-back" onClick={() => navigate(-1)}>
          ← Retour
        </button>
      </div>
    </div>
  );
}