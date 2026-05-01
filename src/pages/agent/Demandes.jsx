import { useState, useEffect } from "react";
import "./Demandes.css";

import SearchIcon   from "@mui/icons-material/Search";
import EditIcon     from "@mui/icons-material/Edit";
import PrintIcon    from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon   from "@mui/icons-material/Delete";

import {
  getDemandes,
  addDemande,
  updateDemande,
  deleteDemande,
} from "../../features/demandes/demandeApi";

/* ─── LocalStorage ─────────────────────────────────────────────────────── */
const LS_KEY = "inapi_demandes_form";

const lsSave = (id, data) => {
  if (!id) return;
  const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  all[String(id)] = data;
  localStorage.setItem(LS_KEY, JSON.stringify(all));
};

const lsGet = (id) => {
  const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  return all[String(id)] || null;
};

const lsDel = (id) => {
  const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  delete all[String(id)];
  localStorage.setItem(LS_KEY, JSON.stringify(all));
};

/* ─── Empty form ───────────────────────────────────────────────────────── */
const EMPTY = {
  nature_brevet: false, nature_pct: false, nature_certificat: false,
  deposant_nom: "", deposant_prenom: "", deposant_denomination: "",
  deposant_adresse: "", deposant_nationalite: "",
  inventeur_nom: "", inventeur_prenom: "", inventeur_adresse: "",
  titre: "",
  num_depo: "", date_depo: "",
  priorite_num_depot: "", priorite_date: "", priorite_pays: "", priorite_nature: "",
  mandataire_nom: "", mandataire_prenom: "",
  mandataire_adresse: "", mandataire_date_pouvoir: "",
  brevet_principal_num: "", brevet_principal_date: "",
  autres_informations: "",
  piece_copie_int: false, piece_memoire_nat: false, piece_memoire_fr: false,
  piece_memoire_fr_dup: false, piece_dessins_orig: false, piece_dessins_dup: false,
  piece_abrege: false, piece_pouvoir: false, piece_priorite: false,
  piece_cession: false, piece_titre: false,
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const g   = (obj, key) => (obj && obj[key] != null ? String(obj[key]) : "");
const br  = (v) => (v ? String(v).replace(/\n/g, "<br/>") : "");
const chk = (v) => (v === true || v === "true" ? "&#9745;" : "&#9744;");

/* ─── Build HTML impression ────────────────────────────────────────────── */
function buildAndOpen(demande, mode) {
  // ✅ Récupérer DIRECTEMENT depuis localStorage par id
  const f = lsGet(demande.id_demande) || demande._formData || {};

  const nBrevet     = chk(f.nature_brevet);
  const nPct        = chk(f.nature_pct);
  const nCertificat = chk(f.nature_certificat);

  // ✅ Tous les champs depuis localStorage
  const depNom   = g(f, "deposant_nom");
  const depPren  = g(f, "deposant_prenom");
  const depDenom = g(f, "deposant_denomination");
  const depAdr   = br(f.deposant_adresse);
  const depNat   = g(f, "deposant_nationalite");
  const invNom   = g(f, "inventeur_nom");
  const invPren  = g(f, "inventeur_prenom");
  const invAdr   = br(f.inventeur_adresse);
  const titre    = g(f, "titre")    || demande.titre    || "";
  const mandNom  = g(f, "mandataire_nom");
  const mandPren = g(f, "mandataire_prenom");
  const mandAdr  = br(f.mandataire_adresse);
  const mandDate = g(f, "mandataire_date_pouvoir") || demande.date_pouvoir || "";
  const bretNum  = g(f, "brevet_principal_num")    || String(demande.numdemande_CA || "");
  const bretDate = g(f, "brevet_principal_date")   || demande.date_CA || "";
  const numDepo  = g(f, "num_depo")  || String(demande.num_depo  || "");
  const dateDepo = g(f, "date_depo") || demande.date_depo || "";
  const paysOri  = g(f, "priorite_pays");
  const priNum   = g(f, "priorite_num_depot");
  const priDate  = g(f, "priorite_date");
  const priNat   = g(f, "priorite_nature");
  const autresInfo = br(f.autres_informations || demande.autre_info || "");

  const dep1  = [depNom, depPren].filter(Boolean).join(" ");
  const dep2  = depDenom ? "<br/>" + depDenom : "";
  const dep3  = depAdr   ? "<br/>" + depAdr   : "";
  const inv1  = [invNom, invPren].filter(Boolean).join(" ");
  const inv2  = invAdr ? "<br/>" + invAdr : "";
  const mand1 = [mandNom, mandPren].filter(Boolean).join(" ");
  const mand2 = mandAdr ? "<br/>" + mandAdr : "";

  const pCI  = chk(f.piece_copie_int);
  const pMN  = chk(f.piece_memoire_nat);
  const pMF  = chk(f.piece_memoire_fr);
  const pMFD = chk(f.piece_memoire_fr_dup);
  const pDO  = chk(f.piece_dessins_orig);
  const pDD  = chk(f.piece_dessins_dup);
  const pAB  = chk(f.piece_abrege);
  const pPO  = chk(f.piece_pouvoir);
  const pPR  = chk(f.piece_priorite);
  const pCS  = chk(f.piece_cession);
  const pTI  = chk(f.piece_titre);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Demande INAPI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Times New Roman",Times,serif;font-size:10pt;color:#000;background:#fff}
.toolbar{background:#1d4ed8;color:#fff;padding:10px 20px;display:flex;gap:12px;align-items:center;font-family:Arial,sans-serif}
.toolbar button{background:#fff;color:#1d4ed8;border:none;padding:7px 16px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px}
@media print{.toolbar{display:none}}
.page{width:21cm;min-height:29.7cm;padding:1.4cm 1.7cm;position:relative;margin:0 auto}
@media print{body{margin:0}.page{margin:0;page-break-after:always}.page:last-child{page-break-after:auto}}
.hdr{width:100%;border-collapse:collapse;margin-bottom:4px}
.hdr td{padding:2px 4px;vertical-align:top}
.hl{width:33%;text-align:left}.hm{width:34%;text-align:center;vertical-align:middle}.hr{width:33%;text-align:right}
.arabic{font-family:Arial,sans-serif;font-size:8.5pt;direction:rtl;line-height:1.5}
.inst{font-size:7.5pt;font-weight:bold;line-height:1.4}
.logo{display:inline-block;border:3px solid #000;padding:2px 10px;font-size:18pt;font-weight:900;font-family:Arial,sans-serif;letter-spacing:-1px}
.logoi{font-style:italic;font-weight:400}
.ref{position:absolute;top:1.4cm;right:1.7cm;font-size:7.5pt;text-align:right;line-height:1.5}
.nat{border:2.5px solid #000;margin:8px 0 7px}
.nat-t{text-align:center;font-size:13pt;font-weight:bold;padding:5px 8px;border-bottom:1.5px solid #000}
.nat-r{width:100%;border-collapse:collapse}.nat-r td{padding:5px 14px;font-size:9pt;width:33%}
.ck{font-size:13pt;margin-left:4px}
.fb{border:1px solid #444;margin-bottom:5px}
.ft{font-size:8pt;font-style:italic;padding:3px 7px;color:#333;background:#fafafa}
.fv{padding:5px 10px 8px;font-size:10pt;min-height:35px;line-height:1.5}
.ff{border-top:1px dashed #aaa;font-size:8pt;font-style:italic;padding:3px 8px;color:#555}
.pb{border:1px solid #444;margin-bottom:5px}
.pt{width:100%;border-collapse:collapse;font-size:9pt}
.pt th{border:1px solid #444;padding:4px 6px;background:#f0f0f0;font-weight:bold;text-align:center}
.pt td{border:1px solid #bbb;padding:4px 6px;height:24px}
.bot{display:flex;border:1px solid #444;margin-top:6px}.botl{flex:1}
.dt{width:100%;border-collapse:collapse;font-size:9.5pt}
.dt th{border:1px solid #444;padding:4px 6px;background:#f0f0f0;font-weight:bold;text-align:center}
.dt td{border:1px solid #bbb;height:28px;padding:4px 6px}
.di{border:1px solid #444;border-top:none;padding:5px 8px;font-size:8.5pt;font-style:italic;height:28px}
.vis{width:130px;border-left:1px solid #444;display:flex;flex-direction:column;align-items:center;padding-top:8px}
.visl{font-size:9pt;font-weight:bold}
.cert{border:1px solid #444;padding:7px 10px;font-size:9.5pt;margin-bottom:7px;min-height:30px}
.ul{border-bottom:1px solid #000;display:inline-block;min-width:90px;padding:0 4px}
.mw{display:flex;border:1px solid #444;margin-bottom:7px}
.ml{flex:1;border-right:1px solid #444;min-height:55px}
.mr{width:140px;padding:8px;font-size:9pt;line-height:1.6}
.rt{width:100%;border-collapse:collapse;border:1px solid #444;margin-bottom:7px}
.rt td{border:1px solid #aaa;padding:8px 10px;font-size:9pt;vertical-align:top}
.ab{border:1px solid #444;margin-bottom:7px}
.al{font-size:9.5pt;font-weight:bold;padding:4px 8px;border-bottom:1px solid #ccc}
.av{padding:5px 10px 8px;min-height:50px;font-size:10pt;line-height:1.5}
.brd{border:2px solid #000;padding:8px 12px;margin-bottom:8px}
.brt{text-align:center;font-weight:bold;font-size:10pt;text-decoration:underline;margin-bottom:8px}
.brc{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}
.brc>div>p{font-size:8.5pt;margin-bottom:5px;line-height:1.4}
.ftx{font-size:7.5pt;line-height:1.5;margin-bottom:5px;text-align:justify}
.coo{font-size:8pt;line-height:1.6;text-align:center;margin:8px 0}
.nop{text-align:center;font-weight:bold;font-size:10pt;letter-spacing:2px;margin:7px 0}
.ast{font-size:7.5pt;font-style:italic}
</style>
</head>
<body>
<div class="toolbar">
  <span style="font-size:14px;font-weight:700">📄 Formulaire INAPI — R2-FO-03</span>
  <button onclick="window.print()">🖨&nbsp; Imprimer / Enregistrer PDF</button>
</div>

<!-- PAGE 1 -->
<div class="page">
  <div class="ref">R2-FO-03<br/>E1</div>
  <table class="hdr"><tr>
    <td class="hl">
      <div class="arabic">المعهد الوطني الجزائري للملكية الصناعية</div>
      <div class="inst">INSTITUT NATIONAL ALGÉRIEN</div>
      <div class="inst">DE LA PROPRIÉTÉ INDUSTRIELLE</div>
    </td>
    <td class="hm">
      <div class="logo"><span class="logoi">in</span>&thinsp;pi</div>
      <div style="font-size:6pt;margin-top:3px;font-family:Arial,sans-serif">Institut National Algérien de la Propriété Industrielle</div>
    </td>
    <td class="hr">
      <div class="arabic">الجمهورية الجزائرية الديمقراطية الشعبية</div>
      <div class="inst">RÉPUBLIQUE ALGÉRIENNE</div>
      <div class="inst">DÉMOCRATIQUE ET POPULAIRE</div>
    </td>
  </tr></table>

  <div class="nat">
    <div class="nat-t">Nature de la demande de protection *</div>
    <table class="nat-r"><tr>
      <td>Brevet d'invention <span class="ck">${nBrevet}</span></td>
      <td style="text-align:center">Extension PCT <span class="ck">${nPct}</span></td>
      <td style="text-align:right">Certificat d'addition <span class="ck">${nCertificat}</span></td>
    </tr></table>
  </div>

  <div class="fb">
    <div class="ft">[71] - DÉPOSANT(S) : <em>Nom, Prénom [dénomination], Adresse complète</em></div>
    <div class="fv" style="min-height:58px">${dep1}${dep2}${dep3}</div>
    <div class="ff">Nationalité du ou des déposants : ${depNat}</div>
  </div>

  <div class="fb">
    <div class="ft">[72] - INVENTEUR(S) : <em>Nom, Prénom, Adresse</em></div>
    <div class="fv" style="min-height:58px">${inv1}${inv2}</div>
  </div>

  <div class="fb">
    <div class="ft">[54] - TITRE DE L'INVENTION :</div>
    <div class="fv" style="min-height:42px">${titre}</div>
  </div>

  <div class="pb">
    <div class="ft">[30] – REVENDICATION DE PRIORITÉ (S)</div>
    <table class="pt">
      <thead><tr>
        <th>[31] - N°(s) de dépôt</th>
        <th>[32] - date(s)</th>
        <th>[33] - pays d'origine</th>
        <th>Nature de la demande</th>
      </tr></thead>
      <tbody>
        <tr><td>${priNum}</td><td>${priDate}</td><td>${paysOri}</td><td>${priNat}</td></tr>
        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
      </tbody>
    </table>
  </div>

  <div class="bot">
    <div class="botl">
      <table class="dt">
        <thead><tr>
          <th>Numéro de dépôt</th>
          <th>Date de dépôt</th>
          <th>Heure</th>
        </tr></thead>
        <tbody><tr>
          <td>${numDepo}</td>
          <td>${dateDepo}</td>
          <td>&nbsp;</td>
        </tr></tbody>
      </table>
      <div class="di">N° de la demande internationale et date internationale de dépôt</div>
    </div>
    <div class="vis"><div class="visl">Visa</div></div>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page">
  <div class="cert">
    Demande de certificat d'addition rattachée au brevet principal n°&nbsp;
    <span class="ul">${bretNum}</span>&nbsp;&nbsp; du &nbsp;
    <span class="ul">${bretDate}</span>
  </div>

  <div class="mw">
    <div class="ml">
      <div class="ft">[74] - MANDATAIRE : <em>Nom, Prénom, Adresse</em></div>
      <div class="fv">${mand1}${mand2}</div>
    </div>
    <div class="mr">Date du pouvoir :<br/>${mandDate}</div>
  </div>

  <table class="rt">
    <tr>
      <td style="width:30%">Le préposé à la réception</td>
      <td style="width:35%">Fait à :&nbsp;&nbsp;&nbsp; le :</td>
      <td style="width:35%;font-style:italic;font-size:8.5pt;line-height:1.6">
        Signature et cachet<br/>
        <small>Qualité du signataire pour les personnes morales</small>
      </td>
    </tr>
  </table>

  <div class="ab">
    <div class="al">Autres informations</div>
    <div class="av">${autresInfo}</div>
  </div>

  <div class="brd">
    <div class="brt">BORDEREAU DES PIÈCES DÉPOSÉES *</div>
    <div class="brc">
      <div>
        <p>${pCI} Copie de la demande internationale</p>
        <p>${pMN} Mémoire descriptif en langue nationale</p>
        <p>${pMF} Mémoire descriptif original en langue française &nbsp; Planche(s)</p>
        <p>${pMFD} Mémoire descriptif duplicata en langue française &nbsp; Planche(s)</p>
        <p>${pDO} Dessin(s) original (aux) &nbsp; Planche(s)</p>
        <p>${pDD} Dessin(s) duplicata (aux) &nbsp; Planche(s)</p>
      </div>
      <div>
        <p>${pAB} Abrégé descriptif</p>
        <p>${pPO} Pouvoir</p>
        <p>${pPR} Document de priorité</p>
        <p>${pCS} Cession de priorité</p>
        <p>${pTI} Titre ou justification du paiement de taxes</p>
      </div>
    </div>
  </div>

  <p class="ftx">Les demandes doivent être remises ou adressées par pli postal recommandé avec demande d'avis de réception, à l'Institut National Algérien de la Propriété Industrielle (INAPI).</p>
  <p class="ftx">Le paiement des taxes exigibles peut être effectué soit directement auprès de la caisse de l'INAPI soit par virement bancaire au compte : BEA 12 Avenue AMIROUCHE, Alger : n° 00200012120326641801</p>

  <div class="coo">
    <strong>Coordonnées de l'INAPI :</strong><br/>
    Adresse : 42, rue Larbi BEN MHIDI, 5ème étage, B.P. 403 Alger Gare<br/>
    Tél : (021) 73 55 74 &nbsp; Fax : (021) 73 96 44 et (021) 73 55 81<br/>
    E-mail : brevet@inapi.dz, info@inapi.dz — Web : www.inapi.dz
  </div>
  <div class="nop">A NE PAS PLIER</div>
  <div class="ast">* Cocher les cases correspondantes</div>
</div>

</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);

  if (mode === "download") {
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `demande_INAPI_${demande.id_demande || Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    window.open(url, "_blank");
  }
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function AgentDemandes() {
  const [demandes, setDemandes]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState({ ...EMPTY });
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getDemandes();
      // ✅ Enrichir chaque demande avec les données localStorage
      const enriched = res.map((d) => ({
        ...d,
        _formData: lsGet(d.id_demande) || {},
      }));
      setDemandes(enriched);
    } catch {
      setError("Erreur chargement des demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY });
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditId(d.id_demande);
    // ✅ Récupérer depuis localStorage directement
    const fd = lsGet(d.id_demande) || {};
    setForm({
      ...EMPTY,
      ...fd,
      titre:                   fd.titre    || d.titre    || "",
      num_depo:                fd.num_depo  || String(d.num_depo  || ""),
      date_depo:               fd.date_depo || d.date_depo || "",
      nature_brevet:           d.nature === "Brevet d'invention",
      nature_pct:              d.nature === "Extension PCT",
      nature_certificat:       d.nature === "Certificat d'addition",
      mandataire_nom:          fd.mandataire_nom || "",
      mandataire_prenom:       fd.mandataire_prenom || "",
      mandataire_date_pouvoir: fd.mandataire_date_pouvoir || d.date_pouvoir || "",
      brevet_principal_num:    fd.brevet_principal_num  || String(d.numdemande_CA || ""),
      brevet_principal_date:   fd.brevet_principal_date || d.date_CA || "",
      autres_informations:     fd.autres_informations   || d.autre_info || "",
    });
    setShowModal(true);
  };

  const getNature = () =>
    form.nature_brevet ? "Brevet d'invention"
    : form.nature_pct  ? "Extension PCT"
    : form.nature_certificat ? "Certificat d'addition"
    : "";

  const handleSave = async () => {
    setError("");
    try {
      const today = new Date().toISOString().split("T")[0];

      const payload = {
        titre:         form.titre || "—",
        nature:        getNature(),
        num_depo:      Number(form.num_depo) || 0,
        date_depo:     form.date_depo || today,
        pays_origine:  form.priorite_pays || "",
        numdemande_CA: Number(form.brevet_principal_num) || 0,
        date_CA:       form.brevet_principal_date || today,
        mandataire:    [form.mandataire_nom, form.mandataire_prenom].filter(Boolean).join(" "),
        date_pouvoir:  form.mandataire_date_pouvoir || today,
        autre_info:    form.autres_informations || "",
      };

      if (editId !== null) {
        await updateDemande(editId, payload);
        // ✅ Sauvegarder TOUT le formulaire dans localStorage
        lsSave(editId, { ...form });
      } else {
        const created = await addDemande(payload);
        const newId = created?.id_demande;
        if (newId) {
          // ✅ Sauvegarder TOUT le formulaire dans localStorage
          lsSave(newId, { ...form });
        }
      }

      await load();
      setShowModal(false);
    } catch (err) {
      console.log("ERREUR:", err.response?.data);
      setError(JSON.stringify(err.response?.data) || "Erreur enregistrement.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette demande ?")) return;
    try {
      await deleteDemande(id);
      lsDel(id);
      await load();
    } catch {
      setError("Erreur suppression.");
    }
  };

  const filtered = demandes.filter((d) => {
    const fd = d._formData || {};
    return [
      d.titre, d.nature, d.statut, d.mandataire,
      fd.deposant_nom, fd.deposant_prenom,
      fd.inventeur_nom, fd.inventeur_prenom,
    ].some((v) => (v || "").toLowerCase().includes(search.toLowerCase()));
  });

  const badgeCls = (s) =>
    s === "valider" ? "badge green"
    : s === "non_valider" ? "badge red"
    : "badge orange";

  if (loading) return <p>Chargement...</p>;

  return (
    <>
      <div className="dem-page">
        <div className="dem-header">
          <div>
            <h2 className="dem-title">Demandes de Protection</h2>
            <p className="dem-sub">Gestion des demandes de brevets — INAPI</p>
          </div>
          <button className="dem-add-btn" onClick={openAdd}>+ Ajouter une demande</button>
        </div>

        {error && <p style={{ color: "red", padding: "8px 16px" }}>{error}</p>}

        <div className="dem-card">
          <div className="dem-toolbar">
            <div className="dem-search-wrap">
              <span style={{
                position: "absolute", left: 11, top: "50%",
                transform: "translateY(-50%)", display: "flex",
                alignItems: "center", pointerEvents: "none", color: "#F88F22",
              }}>
                <SearchIcon sx={{ fontSize: 18 }} />
              </span>
              <input
                className="dem-search"
                placeholder="Rechercher titre, déposant, inventeur…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="dem-count">{filtered.length} demande(s)</span>
          </div>

          <div className="dem-table-wrap">
            <table className="dem-table">
              <thead>
                <tr>
                  <th>Date dépôt</th>
                  <th>Titre</th>
                  <th>Nature</th>
                  <th>Déposant</th>
                  <th>Inventeur</th>
                  <th>Mandataire</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="dem-empty">Aucune demande enregistrée</td>
                  </tr>
                ) : (
                  filtered.map((d) => {
                    // ✅ Toujours lire depuis localStorage directement
                    const fd = lsGet(d.id_demande) || d._formData || {};

                    const deposant = [fd.deposant_nom, fd.deposant_prenom]
                      .filter(Boolean).join(" ") || "—";

                    const inventeur = [fd.inventeur_nom, fd.inventeur_prenom]
                      .filter(Boolean).join(" ") || "—";

                    return (
                      <tr key={d.id_demande}>
                        <td>{d.date_depo}</td>
                        <td className="dem-titre-cell">{d.titre}</td>
                        <td>{d.nature}</td>
                        <td>{deposant}</td>
                        <td>{inventeur}</td>
                        <td>{d.mandataire}</td>
                        <td>
                          <span className={badgeCls(d.statut)}>{d.statut}</span>
                        </td>
                        <td className="dem-actions">
                          <button className="act-btn edit" title="Modifier"
                            onClick={() => openEdit(d)}>
                            <EditIcon sx={{ fontSize: 17 }} />
                          </button>
                          <button className="act-btn print" title="Imprimer"
                            onClick={() => buildAndOpen(d, "print")}>
                            <PrintIcon sx={{ fontSize: 17 }} />
                          </button>
                          <button className="act-btn dl" title="Télécharger"
                            onClick={() => buildAndOpen(d, "download")}>
                            <DownloadIcon sx={{ fontSize: 17 }} />
                          </button>
                          <button className="act-btn del" title="Supprimer"
                            onClick={() => handleDelete(d.id_demande)}>
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div
          className="dem-overlay"
          onClick={(e) => e.target.classList.contains("dem-overlay") && setShowModal(false)}
        >
          <div className="dem-modal">
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-header-icon">📋</div>
                <div>
                  <h3>{editId ? "Modifier la demande" : "Nouvelle demande de protection"}</h3>
                  <p>Formulaire officiel INAPI — R2-FO-03</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">

              <Sec num="01" label="Nature de la demande *">
                <div className="check-row">
                  <CL name="nature_brevet"     checked={!!form.nature_brevet}     onChange={setField} label="Brevet d'invention" />
                  <CL name="nature_pct"        checked={!!form.nature_pct}        onChange={setField} label="Extension PCT" />
                  <CL name="nature_certificat" checked={!!form.nature_certificat} onChange={setField} label="Certificat d'addition" />
                </div>
              </Sec>

              <Sec num="📁" label="Informations de dépôt">
                <div className="modal-grid">
                  <F label="Numéro de dépôt *" name="num_depo"  value={form.num_depo}  onChange={setField} type="number" />
                  <F label="Date de dépôt *"   name="date_depo" value={form.date_depo} onChange={setField} type="date" />
                </div>
              </Sec>

              <Sec num="71" label="[71] — DÉPOSANT(S)">
                <div className="modal-grid">
                  <F label="Nom"              name="deposant_nom"          value={form.deposant_nom}          onChange={setField} />
                  <F label="Prénom"           name="deposant_prenom"       value={form.deposant_prenom}       onChange={setField} />
                  <F label="Dénomination"     name="deposant_denomination" value={form.deposant_denomination} onChange={setField} full />
                  <F label="Adresse complète" name="deposant_adresse"      value={form.deposant_adresse}      onChange={setField} full area />
                  <F label="Nationalité"      name="deposant_nationalite"  value={form.deposant_nationalite}  onChange={setField} />
                </div>
              </Sec>

              <Sec num="72" label="[72] — INVENTEUR(S)">
                <div className="modal-grid">
                  <F label="Nom"     name="inventeur_nom"     value={form.inventeur_nom}     onChange={setField} />
                  <F label="Prénom"  name="inventeur_prenom"  value={form.inventeur_prenom}  onChange={setField} />
                  <F label="Adresse" name="inventeur_adresse" value={form.inventeur_adresse} onChange={setField} full area />
                </div>
              </Sec>

              <Sec num="54" label="[54] — TITRE DE L'INVENTION">
                <div className="modal-grid">
                  <F label="Titre complet *" name="titre" value={form.titre} onChange={setField} full area />
                </div>
              </Sec>

              <Sec num="30" label="[30] — REVENDICATION DE PRIORITÉ">
                <div className="modal-grid">
                  <F label="N° de dépôt" name="priorite_num_depot" value={form.priorite_num_depot} onChange={setField} />
                  <F label="Date"        name="priorite_date"      value={form.priorite_date}      onChange={setField} type="date" />
                  <F label="Pays"        name="priorite_pays"      value={form.priorite_pays}      onChange={setField} />
                  <F label="Nature"      name="priorite_nature"    value={form.priorite_nature}    onChange={setField} />
                </div>
              </Sec>

              <Sec num="+" label="Certificat d'addition — Brevet principal">
                <div className="modal-grid">
                  <F label="N° du brevet principal" name="brevet_principal_num"  value={form.brevet_principal_num}  onChange={setField} />
                  <F label="Date"                   name="brevet_principal_date" value={form.brevet_principal_date} onChange={setField} type="date" />
                </div>
              </Sec>

              <Sec num="74" label="[74] — MANDATAIRE">
                <div className="modal-grid">
                  <F label="Nom"             name="mandataire_nom"          value={form.mandataire_nom}          onChange={setField} />
                  <F label="Prénom"          name="mandataire_prenom"       value={form.mandataire_prenom}       onChange={setField} />
                  <F label="Adresse"         name="mandataire_adresse"      value={form.mandataire_adresse}      onChange={setField} full area />
                  <F label="Date du pouvoir" name="mandataire_date_pouvoir" value={form.mandataire_date_pouvoir} onChange={setField} type="date" />
                </div>
              </Sec>

              <Sec num="ℹ" label="Autres informations">
                <div className="modal-grid">
                  <F label="Informations complémentaires" name="autres_informations" value={form.autres_informations} onChange={setField} full area rows={3} />
                </div>
              </Sec>

              <Sec num="📎" label="Bordereau des pièces déposées *">
                <div className="pieces-grid">
                  {[
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
                  ].map(([n, lbl]) => (
                    <label key={n} className="piece-item">
                      <input type="checkbox" name={n} checked={!!form[n]} onChange={setField} />
                      <span>{lbl}</span>
                    </label>
                  ))}
                </div>
              </Sec>

            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-save" onClick={handleSave}>
                {editId ? "Enregistrer les modifications" : "Enregistrer la demande"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Helpers composants ── */
function Sec({ num, label, children }) {
  return (
    <div className="modal-section">
      <div className="section-title">
        <span className="section-num">{num}</span>{label}
      </div>
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

function CL({ name, checked, onChange, label }) {
  return (
    <label className="chk-label">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}