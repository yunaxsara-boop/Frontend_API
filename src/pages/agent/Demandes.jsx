import { useState, useEffect } from "react";
import "./Demandes.css";
import SearchIcon   from "@mui/icons-material/Search";
import EditIcon     from "@mui/icons-material/Edit";
import PrintIcon    from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon   from "@mui/icons-material/Delete";
import { api } from "/src/contexts/AuthContext.jsx";
import {
  getDemandes, addDemande, updateDemande, deleteDemande,
} from "../../features/demandes/demandeApi";

/* ─── Empty form ─────────────────────────────────────────────────── */
const EMPTY = {
  nature_brevet: false, nature_pct: false, nature_certificat: false,
  deposant_nom: "", deposant_prenom: "", deposant_denomination: "",
  deposant_adresse: "", deposant_nationalite: "",
  inventeur_nom: "", inventeur_prenom: "", inventeur_adresse: "",
  titre: "",
  num_depot: "", priorite_date: "", priorite_pays: "", priorite_nature: "",
  mandataire_nom: "", mandataire_prenom: "",
  mandataire_adresse: "", mandataire_date_pouvoir: "",
  brevet_principal_num: "", brevet_principal_date: "",
  autres_informations: "",
  piece_copie_int: false, piece_memoire_nat: false, piece_memoire_fr: false,
  piece_memoire_fr_dup: false, piece_dessins_orig: false, piece_dessins_dup: false,
  piece_abrege: false, piece_pouvoir: false, piece_priorite: false,
  piece_cession: false, piece_titre: false,
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const g   = (obj, key) => (obj && obj[key] != null ? String(obj[key]) : "");
const br  = (v) => (v ? String(v).replace(/\n/g, "<br/>") : "");
const chk = (v) => (v === true || v === "true" || v === 1 ? "&#9745;" : "&#9744;");

/* ─── Impression HTML ────────────────────────────────────────────── */
function buildAndOpen(demande, mode) {
  // ✅ Toutes les données viennent directement de l'objet API
  const f = demande;

  const nBrevet     = chk(f.nature === "Brevet d'invention");
  const nPct        = chk(f.nature === "Extension PCT");
  const nCertificat = chk(f.nature === "Certificat d'addition");

  // ✅ Déposant depuis API
  const dep    = Array.isArray(f.deposant) ? f.deposant[0] || {} : {};
  const depNom   = g(dep, "nom_dep");
  const depPren  = g(dep, "prenom_dep");
  const depDenom = g(dep, "denomination");
  const depAdr   = br(dep.adresse_dep);
  const depNat   = g(dep, "nationalite");

  // ✅ Inventeurs depuis API — TOUS les inventeurs
  const invBlock = Array.isArray(f.inventeur) && f.inventeur.length > 0
    ? f.inventeur.map(i =>
        `${i.nom_inv || ""} ${i.prenom_inv || ""}${i.adress_inv ? ` — ${i.adress_inv}` : ""}`
      ).join("<br/>")
    : "";

  const titre        = g(f, "titre");
  const mandataire   = g(f, "mandataire");
  const date_pouvoir = g(f, "date_pouvoir");
  const autresInfo   = br(f.autre_info);
  const num_depo     = g(f, "num_depo");
  const date_depo    = g(f, "date_depo");
  const pays_origine = g(f, "pays_origine");
  const nature       = g(f, "nature");
  const bretNum      = g(f, "numdemande_CA");
  const date_CA      = g(f, "date_CA");

  // ✅ Pièces depuis API
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

  const dep1 = [depNom, depPren].filter(Boolean).join(" ");
  const dep2 = depDenom ? "<br/>" + depDenom : "";
  const dep3 = depAdr   ? "<br/>" + depAdr   : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Demande INAPI — ${f.id_demande}</title>
<style>
table{width:100%;table-layout:fixed}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Times New Roman",Times,serif;font-size:10pt;color:#000;background:#fff}
.toolbar{background:#1d4ed8;color:#fff;padding:10px 20px;display:flex;gap:12px;align-items:center;font-family:Arial,sans-serif}
.toolbar button{background:#fff;color:#1d4ed8;border:none;padding:7px 16px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px}
.page{width:21cm;min-height:29.7cm;padding:1.4cm 1.7cm;position:relative;overflow:hidden;margin:0 auto;border:2px solid #000}
@media print{
  .toolbar{display:none}
  .page{margin:0 auto;padding:1.4cm 1.7cm;width:21cm;min-height:29.7cm;page-break-after:always;border:none}
  .page:last-child{page-break-after:auto}
}
.hdr{width:100%;border-collapse:collapse;margin-bottom:8px}
.hdr td{padding:10px 4px;vertical-align:middle}
.hl{width:33%;text-align:left}.hm{width:34%;text-align:center}.hr{width:33%;text-align:right}
.arabic{font-family:Arial,sans-serif;font-size:13px;direction:rtl;line-height:1.4}
.inst{font-size:11px;font-weight:bold;line-height:1.3}
.img{width:90px;height:90px;object-fit:contain}
.nat{border:2.5px solid #000;margin:10px 0}
.nat-t{text-align:center;font-size:16px;font-weight:bold;padding:5px 8px;border-bottom:1.5px solid #000}
.nat-r{width:100%;border-collapse:collapse}
.nat-r td{padding:6px 14px;font-size:12px;width:33%}
.ck{font-size:14pt;margin-left:6px}
.fb{border:1px solid #444;margin-bottom:10px}
.ft{font-size:10px;font-style:italic;padding:3px 7px;color:#333;background:#f5f5f5;border-bottom:1px solid #ddd}
.fv{padding:6px 10px 8px;font-size:10pt;min-height:38px;line-height:1.6}
.ff{border-top:1px dashed #aaa;font-size:9px;font-style:italic;padding:3px 8px;color:#555}
.pb{border:1px solid #444;margin-bottom:10px}
.pt{width:100%;border-collapse:collapse;font-size:9pt}
.pt th{border:1px solid #444;padding:5px 6px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px}
.pt td{border:1px solid #bbb;padding:5px 6px;height:28px;text-align:center}
.bot{display:flex;margin-top:8px;gap:6px}
.botl{flex:1}
.dt{width:100%;border-collapse:collapse;font-size:9pt}
.dt th{border:1px solid #444;padding:5px 6px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px}
.dt td{border:1px solid #bbb;padding:5px 6px;height:28px;text-align:center}
.di{border:1px solid #444;border-top:none;padding:6px 8px;font-size:8pt;font-style:italic;min-height:32px}
.vis{width:150px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:8px;border:1px solid #444}
.visl{font-size:9pt;font-weight:bold;margin-bottom:4px}
.cert{border:1px solid #444;padding:8px 12px;font-size:9.5pt;margin-bottom:10px;min-height:32px}
.ul{border-bottom:1px solid #000;display:inline-block;min-width:100px;padding:0 4px;text-align:center}
.mw{display:flex;border:1px solid #444;margin-bottom:10px}
.ml{flex:1;border-right:1px solid #444;min-height:55px}
.mr{width:160px;padding:8px;font-size:9pt;line-height:1.8}
.rt{width:100%;border-collapse:collapse;border:1px solid #444;margin-bottom:10px}
.rt td{border:1px solid #aaa;padding:10px;font-size:9pt;vertical-align:top;min-height:50px}
.ab{border:1px solid #444;margin-bottom:10px}
.al{font-size:9.5pt;font-weight:bold;padding:5px 8px;border-bottom:1px solid #ccc;background:#f5f5f5}
.av{padding:6px 10px 8px;min-height:50px;font-size:10pt;line-height:1.5}
.brd{border:2px solid #000;padding:10px 14px;margin-bottom:10px}
.brt{text-align:center;font-weight:bold;font-size:10pt;text-decoration:underline;margin-bottom:10px}
.brc{display:grid;grid-template-columns:1fr 1fr;gap:5px 24px}
.brc>div>p{font-size:9pt;margin-bottom:6px;line-height:1.5}
.ftx{font-size:8pt;line-height:1.6;margin-bottom:6px;text-align:justify}
.coo{font-size:8.5pt;line-height:1.7;text-align:center;margin:10px 0;border-top:1px solid #ccc;padding-top:8px}
.nop{text-align:center;font-weight:bold;font-size:10pt;letter-spacing:3px;margin:8px 0}
.ast{font-size:8pt;font-style:italic;color:#555}
</style>
</head>
<body>
<div class="toolbar">
  <span style="font-size:14px;font-weight:700">📄 Formulaire INAPI — R2-FO-03 &nbsp;|&nbsp; Demande N° ${f.id_demande}</span>
  <button onclick="window.print()">🖨&nbsp; Imprimer / PDF</button>
</div>

<!-- ══ PAGE 1 ══ -->
<div class="page">
  <table class="hdr"><tr>
    <td class="hl">
      <div class="arabic">المعهد الوطني الجزائري للملكية الصناعية</div>
      <div class="inst">INSTITUT NATIONAL ALGÉRIEN</div>
      <div class="inst">DE LA PROPRIÉTÉ INDUSTRIELLE</div>
    </td>
    <td class="hm">
      <img class="img" src="/logoinapii.png" alt="INAPI"/>
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
    <div class="ft">[71] — DÉPOSANT(S) : Nom, Prénom, Dénomination, Adresse complète</div>
    <div class="fv" style="min-height:60px">${dep1}${dep2}${dep3}</div>
    <div class="ff">Nationalité du ou des déposants : <strong>${depNat}</strong></div>
  </div>

  <div class="fb">
    <div class="ft">[72] — INVENTEUR(S) : Nom, Prénom, Adresse</div>
    <div class="fv" style="min-height:60px">${invBlock || "&nbsp;"}</div>
  </div>

  <div class="fb">
    <div class="ft">[54] — TITRE DE L'INVENTION</div>
    <div class="fv" style="min-height:44px">${titre}</div>
  </div>

  <div class="pb">
    <div class="ft">[30] — REVENDICATION(S) DE PRIORITÉ</div>
    <table class="pt">
      <thead><tr>
        <th>[31] N° de dépôt</th>
        <th>[32] Date</th>
        <th>[33] Pays d'origine</th>
        <th>Nature de la demande</th>
      </tr></thead>
      <tbody>
        <tr>
          <td>${num_depo}</td>
          <td>${date_depo}</td>
          <td>${pays_origine}</td>
          <td>${nature}</td>
        </tr>
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
          <td>${num_depo}</td>
          <td>${date_depo}</td>
          <td>&nbsp;</td>
        </tr></tbody>
      </table>
      <div class="di">N° de la demande internationale et date internationale de dépôt</div>
    </div>
    <div class="vis">
      <div class="visl">Visa du préposé</div>
    </div>
  </div>
</div>

<!-- ══ PAGE 2 ══ -->
<div class="page">
  <div class="cert">
    Demande de certificat d'addition rattachée au brevet principal
    n°&nbsp;<span class="ul">${bretNum || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</span>
    &nbsp;&nbsp;du&nbsp;
    <span class="ul">${date_CA || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</span>
  </div>

  <div class="mw">
    <div class="ml">
      <div class="ft">[74] — MANDATAIRE : Nom, Prénom, Adresse</div>
      <div class="fv">${mandataire || "&nbsp;"}</div>
    </div>
    <div class="mr">Date du pouvoir :<br/><strong>${date_pouvoir || "—"}</strong></div>
  </div>

  <table class="rt">
    <tr>
      <td style="width:30%">Le préposé à la réception</td>
      <td style="width:35%">Fait à :&nbsp;&nbsp;&nbsp;&nbsp; le :</td>
      <td style="width:35%;font-style:italic;font-size:8.5pt;line-height:1.6">
        Signature et cachet<br/>
        <small>Qualité du signataire pour les personnes morales</small>
      </td>
    </tr>
  </table>

  <div class="ab">
    <div class="al">Autres informations</div>
    <div class="av">${autresInfo || "&nbsp;"}</div>
  </div>

  <div class="brd">
    <div class="brt">BORDEREAU DES PIÈCES DÉPOSÉES *</div>
    <div class="brc">
      <div>
        <p>${pCI}&nbsp; Copie de la demande internationale</p>
        <p>${pMN}&nbsp; Mémoire descriptif en langue nationale</p>
        <p>${pMF}&nbsp; Mémoire descriptif original en langue française</p>
        <p>${pMFD}&nbsp; Mémoire descriptif duplicata en langue française</p>
        <p>${pDO}&nbsp; Dessin(s) original(aux)</p>
        <p>${pDD}&nbsp; Dessin(s) duplicata(aux)</p>
      </div>
      <div>
        <p>${pAB}&nbsp; Abrégé descriptif</p>
        <p>${pPO}&nbsp; Pouvoir</p>
        <p>${pPR}&nbsp; Document de priorité</p>
        <p>${pCS}&nbsp; Cession de priorité</p>
        <p>${pTI}&nbsp; Titre ou justification du paiement de taxes</p>
      </div>
    </div>
  </div>

  <p class="ftx">Les demandes doivent être remises ou adressées par pli postal recommandé avec demande d'avis de réception à l'Institut National Algérien de la Propriété Industrielle (INAPI).</p>
  <p class="ftx">Le paiement des taxes peut être effectué auprès de la caisse de l'INAPI ou par virement bancaire : BEA 12 Avenue AMIROUCHE, Alger — n° 00200012120326641801</p>

  <div class="coo">
    <strong>Coordonnées INAPI :</strong><br/>
    42, rue Larbi BEN MHIDI, 5ème étage, B.P. 403 Alger Gare<br/>
    Tél : (021) 73 55 74 &nbsp;|&nbsp; Fax : (021) 73 96 44 et (021) 73 55 81<br/>
    E-mail : brevet@inapi.dz — Web : www.inapi.dz
  </div>
  <div class="nop">A NE PAS PLIER</div>
  <div class="ast">* Cocher les cases correspondantes</div>
</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Autorisez les popups pour imprimer."); return; }
  win.document.write(html);
  win.document.close();

  if (mode === "download") {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `demande_INAPI_${f.id_demande}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    setTimeout(() => win.print(), 500);
  }
}

/* ══════════════════════════════════════════════════════════════════ */
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
      setLoading(true); setError("");
      const res = await getDemandes();
      setDemandes(res);
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

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY }); setShowModal(true); };

  const openEdit = (d) => {
    setEditId(d.id_demande);
    const dep = Array.isArray(d.deposant)  ? d.deposant[0]  || {} : {};
    const inv = Array.isArray(d.inventeur) ? d.inventeur[0] || {} : {};
    setForm({
      ...EMPTY,
      nature_brevet:           d.nature === "Brevet d'invention",
      nature_pct:              d.nature === "Extension PCT",
      nature_certificat:       d.nature === "Certificat d'addition",
      titre:                   d.titre        || "",
      num_depot:               d.num_depo     || "",
      priorite_date:           d.date_depo    || "",
      priorite_pays:           d.pays_origine || "",
      brevet_principal_num:    d.numdemande_CA || "",
      brevet_principal_date:   d.date_CA      || "",
      mandataire_nom:          d.mandataire   || "",
      mandataire_date_pouvoir: d.date_pouvoir || "",
      autres_informations:     d.autre_info   || "",
      // pièces
      piece_copie_int:         d.piece_copie_int      || false,
      piece_memoire_nat:       d.piece_memoire_nat    || false,
      piece_memoire_fr:        d.piece_memoire_fr     || false,
      piece_memoire_fr_dup:    d.piece_memoire_fr_dup || false,
      piece_dessins_orig:      d.piece_dessins_orig   || false,
      piece_dessins_dup:       d.piece_dessins_dup    || false,
      piece_abrege:            d.piece_abrege         || false,
      piece_pouvoir:           d.piece_pouvoir        || false,
      piece_priorite:          d.piece_priorite       || false,
      piece_cession:           d.piece_cession        || false,
      piece_titre:             d.piece_titre          || false,
      // déposant et inventeur depuis API
      deposant_nom:          dep.nom_dep      || "",
      deposant_prenom:       dep.prenom_dep   || "",
      deposant_denomination: dep.denomination || "",
      deposant_adresse:      dep.adresse_dep  || "",
      deposant_nationalite:  dep.nationalite  || "",
      inventeur_nom:         inv.nom_inv      || "",
      inventeur_prenom:      inv.prenom_inv   || "",
      inventeur_adresse:     inv.adress_inv   || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    const natureLbl = form.nature_brevet     ? "Brevet d'invention"
      : form.nature_pct        ? "Extension PCT"
      : form.nature_certificat ? "Certificat d'addition" : "—";

    const payload = {
      titre:              form.titre || "—",
      nature:             natureLbl,
      num_depo:           Number(form.num_depot) || 0,
      date_depo:          form.priorite_date || null,
      pays_origine:       form.priorite_pays || "",
      numdemande_CA:      Number(form.brevet_principal_num) || 0,
      date_CA:            form.brevet_principal_date || null,
      mandataire:         form.mandataire_nom || "",
      date_pouvoir:       form.mandataire_date_pouvoir || null,
      autre_info:         form.autres_informations || "",
      statut:             "non_valider",
      // ✅ pièces envoyées à Django
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
      let currentId = editId;

      if (editId !== null) {
        await updateDemande(editId, payload);
      } else {
        const nouvelle = await addDemande(payload);
        currentId = nouvelle?.id_demande;
      }

      if (currentId) {
        // ✅ Déposant
        const demandeActuelle = demandes.find(d => d.id_demande === editId);
        const depExistant = demandeActuelle?.deposant?.[0];
        if (depExistant) {
          await api.patch(`deposants/${depExistant.id_dep}/`, {
            nom_dep: form.deposant_nom, prenom_dep: form.deposant_prenom,
            denomination: form.deposant_denomination,
            adresse_dep: form.deposant_adresse, nationalite: form.deposant_nationalite,
          });
        } else {
          await api.post("deposants/", {
            nom_dep: form.deposant_nom, prenom_dep: form.deposant_prenom,
            denomination: form.deposant_denomination,
            adresse_dep: form.deposant_adresse, nationalite: form.deposant_nationalite,
            id_demande: currentId,
          });
        }

        // ✅ Inventeur
        const invExistant = demandeActuelle?.inventeur?.[0];
        if (invExistant) {
          await api.patch(`inventeurs/${invExistant.id_inv}/`, {
            nom_inv: form.inventeur_nom, prenom_inv: form.inventeur_prenom,
            adress_inv: form.inventeur_adresse,
          });
        } else {
          await api.post("inventeurs/", {
            nom_inv: form.inventeur_nom, prenom_inv: form.inventeur_prenom,
            adress_inv: form.inventeur_adresse,
            id_demande: [currentId],  // ManyToMany → tableau
          });
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
    try { await deleteDemande(id); await load(); }
    catch { setError("Erreur suppression."); }
  };

  const filtered = demandes.filter((d) => {
    const depStr = Array.isArray(d.deposant)
      ? d.deposant.map(dep => `${dep.nom_dep} ${dep.prenom_dep}`).join(" ") : "";
    const invStr = Array.isArray(d.inventeur)
      ? d.inventeur.map(inv => `${inv.nom_inv} ${inv.prenom_inv}`).join(" ") : "";
    return [depStr, invStr, d.titre, d.nature]
      .some(v => (v || "").toLowerCase().includes(search.toLowerCase()));
  });

  const badgeCls = (s) =>
    s === "valider" ? "badge green" : s === "non_valider" ? "badge red" : "badge orange";

  if (loading) return <p style={{ padding: 20 }}>Chargement...</p>;

  return (
    <>
      <div className="dem-page">
        <div className="dem-header">
          <div>
            <h2 className="dem-title">Demandes de Protection</h2>
            <p className="dem-sub">Gestion des demandes — INAPI</p>
          </div>
          <button className="dem-add-btn" onClick={openAdd}>+ Ajouter une demande</button>
        </div>

        {error && <p style={{ color:"red", padding:"8px 16px" }}>{error}</p>}

        <div className="dem-card">
          <div className="dem-toolbar">
            <div className="dem-search-wrap">
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center", pointerEvents:"none", color:"#F88F22" }}>
                <SearchIcon sx={{ fontSize: 18 }} />
              </span>
              <input className="dem-search"
                placeholder="Rechercher déposant, inventeur, titre…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="dem-count">{filtered.length} demande(s)</span>
          </div>

          <div className="dem-table-wrap">
            <table className="dem-table">
              <thead>
                <tr>
                  <th>Date dépôt</th>
                  <th>Déposant</th>
                  <th>Inventeur</th>
                  <th>Titre</th>
                  <th>Nature</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="dem-empty">Aucune demande enregistrée</td></tr>
                ) : filtered.map((d) => (
                  <tr key={d.id_demande}>
                    <td>{d.date_depo}</td>
                    <td>{Array.isArray(d.deposant) && d.deposant.length > 0
                      ? d.deposant.map(dep => `${dep.nom_dep} ${dep.prenom_dep}`).join(", ")
                      : "—"}</td>
                    <td>{Array.isArray(d.inventeur) && d.inventeur.length > 0
                      ? d.inventeur.map(inv => `${inv.nom_inv} ${inv.prenom_inv}`).join(", ")
                      : "—"}</td>
                    <td className="dem-titre-cell">{d.titre}</td>
                    <td>{d.nature}</td>
                    <td><span className={badgeCls(d.statut)}>{d.statut}</span></td>
                    <td className="dem-actions">
                      <button className="act-btn edit"  onClick={() => openEdit(d)}><EditIcon sx={{ fontSize:17 }} /></button>
                      <button className="act-btn print" onClick={() => buildAndOpen(d, "print")}><PrintIcon sx={{ fontSize:17 }} /></button>
                      <button className="act-btn dl"    onClick={() => buildAndOpen(d, "download")}><DownloadIcon sx={{ fontSize:17 }} /></button>
                      <button className="act-btn del"   onClick={() => handleDelete(d.id_demande)}><DeleteIcon sx={{ fontSize:17 }} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="dem-overlay"
          onClick={(e) => e.target.classList.contains("dem-overlay") && setShowModal(false)}>
          <div className="dem-modal">
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-header-icon">📋</div>
                <div>
                  <h3>{editId ? "Modifier la demande" : "Nouvelle demande"}</h3>
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
                  <F label="Titre complet" name="titre" value={form.titre} onChange={setField} full area />
                </div>
              </Sec>

              <Sec num="30" label="[30] — REVENDICATION DE PRIORITÉ">
                <div className="modal-grid">
                  <F label="N° de dépôt"    name="num_depot"       value={form.num_depot}       onChange={setField} type="number" />
                  <F label="Date de dépôt"  name="priorite_date"   value={form.priorite_date}   onChange={setField} type="date" />
                  <F label="Pays d'origine" name="priorite_pays"   value={form.priorite_pays}   onChange={setField} />
                  <F label="Nature"         name="priorite_nature" value={form.priorite_nature} onChange={setField} />
                </div>
              </Sec>

              <Sec num="+" label="Certificat d'addition — Brevet principal">
                <div className="modal-grid">
                  <F label="N° brevet principal" name="brevet_principal_num"  value={form.brevet_principal_num}  onChange={setField} />
                  <F label="Date"                name="brevet_principal_date" value={form.brevet_principal_date} onChange={setField} type="date" />
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
                {editId ? "💾 Enregistrer les modifications" : "Enregistrer la demande"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Helpers composants ─────────────────────────────────────────── */
function Sec({ num, label, children }) {
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

function CL({ name, checked, onChange, label }) {
  return (
    <label className="chk-label">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}