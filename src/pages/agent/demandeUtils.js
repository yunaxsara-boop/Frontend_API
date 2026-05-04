const g   = (obj, key) => (obj && obj[key] != null ? String(obj[key]) : "");
const br  = (v) => (v ? String(v).replace(/\n/g, "<br/>") : "");
const chk = (v) => (v === true || v === "true" || v === 1 ? "&#9745;" : "&#9744;");

export function buildAndOpen(demande, mode) {
  const f = demande;

  const nBrevet     = chk(f.nature === "Brevet d'invention");
  const nPct        = chk(f.nature === "Extension PCT");
  const nCertificat = chk(f.nature === "Certificat d'addition");

  const dep      = Array.isArray(f.deposant) ? f.deposant[0] || {} : {};
  const depNom   = g(dep, "nom_dep");
  const depPren  = g(dep, "prenom_dep");
  const depDenom = g(dep, "denomination");
  const depAdr   = br(dep.adresse_dep);
  const depNat   = g(dep, "nationalite");

  const dep1 = [depNom, depPren].filter(Boolean).join(" ");
  const dep2 = depDenom ? "<br/>" + depDenom : "";
  const dep3 = depAdr   ? "<br/>" + depAdr   : "";

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
<title>Demande INAPI — ${f.id_demande}</title>
<style>
@page{
  size: A4 portrait;
  margin: 0;
}
table{width:100%;table-layout:fixed}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Times New Roman",Times,serif;font-size:10pt;color:#000;background:#fff}
.toolbar{background:#1d4ed8;color:#fff;padding:10px 20px;display:flex;gap:12px;align-items:center;font-family:Arial,sans-serif}
.toolbar button{background:#fff;color:#1d4ed8;border:none;padding:7px 16px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px}

/* Écran — affichage avec bordure et espace */
.page{
  width:21cm;
  min-height:29.7cm;
  padding:1.4cm 1.7cm;
  position:relative;
  overflow:hidden;
  margin:0 auto 20px;
  border:2px solid #000;
  background:#fff;
}

/* Impression — pleine page A4 sans marges */
@media print{
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html,body{margin:0;padding:0;width:21cm;height:29.7cm;background:#fff}
  .toolbar{display:none}
  .page{
    margin:0;
    padding:1.4cm 1.7cm;
    width:21cm;
    height:29.7cm;
    min-height:unset;
    border:none;
    page-break-after:always;
    page-break-inside:avoid;
    position:relative;
    overflow:hidden;
  }
  .page:last-child{page-break-after:auto}
}

.hdr{width:100%;border-collapse:collapse;margin-bottom:8px}
.hdr td{padding:10px 4px;vertical-align:middle}
.hl{width:33%;text-align:left}
.hm{width:34%;text-align:center}
.hr{width:33%;text-align:right}
.arabic{font-family:Arial,sans-serif;font-size:13px;direction:rtl;line-height:1.4}
.inst{font-size:11px;font-weight:bold;line-height:1.3}
.img{width:90px;height:90px;object-fit:contain}
.ref{font-size:7.5pt;text-align:right;line-height:1.5;margin-bottom:4px;color:#555}
.nat{border:2.5px solid #000;margin:8px 0}
.nat-t{text-align:center;font-size:15px;font-weight:bold;padding:4px 8px;border-bottom:1.5px solid #000}
.nat-r{width:100%;border-collapse:collapse}
.nat-r td{padding:5px 14px;font-size:12px;width:33%}
.ck{font-size:13pt;margin-left:5px}
.fb{border:1px solid #444;margin-bottom:8px}
.ft{font-size:10px;font-style:italic;padding:3px 7px;color:#333;background:#f5f5f5;border-bottom:1px solid #ddd}
.fv{padding:5px 10px 7px;font-size:10pt;min-height:36px;line-height:1.5}
.ff{border-top:1px dashed #aaa;font-size:9px;font-style:italic;padding:3px 8px;color:#555}
.pb{border:1px solid #444;margin-bottom:8px}
.pt{width:100%;border-collapse:collapse;font-size:9pt}
.pt th{border:1px solid #444;padding:4px 6px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px}
.pt td{border:1px solid #bbb;padding:4px 6px;height:26px;text-align:center}
.bot{display:flex;margin-top:6px;gap:6px}
.botl{flex:1}
.dt{width:100%;border-collapse:collapse;font-size:9pt}
.dt th{border:1px solid #444;padding:4px 6px;background:#f0f0f0;font-weight:bold;text-align:center;font-size:9px}
.dt td{border:1px solid #bbb;padding:4px 6px;height:26px;text-align:center}
.di{border:1px solid #444;border-top:none;padding:5px 8px;font-size:8pt;font-style:italic;min-height:30px}
.vis{width:150px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:8px;border:1px solid #444}
.visl{font-size:9pt;font-weight:bold;margin-bottom:4px}
.cert{border:1px solid #444;padding:7px 12px;font-size:9.5pt;margin-bottom:8px;min-height:30px}
.ul{border-bottom:1px solid #000;display:inline-block;min-width:100px;padding:0 4px;text-align:center}
.mw{display:flex;border:1px solid #444;margin-bottom:8px}
.ml{flex:1;border-right:1px solid #444;min-height:52px}
.mr{width:160px;padding:7px;font-size:9pt;line-height:1.7}
.rt{width:100%;border-collapse:collapse;border:1px solid #444;margin-bottom:8px}
.rt td{border:1px solid #aaa;padding:8px 10px;font-size:9pt;vertical-align:top;min-height:46px}
.ab{border:1px solid #444;margin-bottom:8px}
.al{font-size:9.5pt;font-weight:bold;padding:4px 8px;border-bottom:1px solid #ccc;background:#f5f5f5}
.av{padding:5px 10px 7px;min-height:46px;font-size:10pt;line-height:1.5}
.brd{border:2px solid #000;padding:8px 12px;margin-bottom:8px}
.brt{text-align:center;font-weight:bold;font-size:10pt;text-decoration:underline;margin-bottom:8px}
.brc{display:grid;grid-template-columns:1fr 1fr;gap:4px 22px}
.brc>div>p{font-size:9pt;margin-bottom:5px;line-height:1.4}
.ftx{font-size:7.8pt;line-height:1.55;margin-bottom:5px;text-align:justify}
.coo{font-size:8pt;line-height:1.6;text-align:center;margin:8px 0;border-top:1px solid #ccc;padding-top:6px}
.nop{text-align:center;font-weight:bold;font-size:10pt;letter-spacing:3px;margin:6px 0}
.ast{font-size:7.5pt;font-style:italic;color:#555}
</style>
</head>
<body>

<div class="toolbar">
  <span style="font-size:14px;font-weight:700">📄 Formulaire INAPI — R2-FO-03 &nbsp;|&nbsp; Demande N° ${f.id_demande}</span>
  <button onclick="window.print()">🖨&nbsp; Imprimer / PDF</button>
</div>

<!-- ══ PAGE 1 ══ -->
<div class="page">
  <div class="ref">Réf : R2-FO-03</div>

  <table class="hdr"><tr>
    <td class="hl">
      <div class="arabic">المعهد الوطني الجزائري للملكية الصناعية</div>
      <div class="inst">INSTITUT NATIONAL ALGÉRIEN</div>
      <div class="inst">DE LA PROPRIÉTÉ INDUSTRIELLE</div>
    </td>
    <td class="hm">
      <img class="img" src="/logoinapii.png" alt="INAPI Logo"/>
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
      <td style="text-align:center">Extension de la demande internationale selon le PCT <span class="ck">${nPct}</span></td>
      <td style="text-align:right">Certificat d'addition <span class="ck">${nCertificat}</span></td>
    </tr></table>
  </div>

  <div class="fb">
    <div class="ft">[71] — DÉPOSANT(S) : <em>Nom, Prénom [dénomination], et Adresse complète</em></div>
    <div class="fv" style="min-height:55px">${dep1}${dep2}${dep3}</div>
    <div class="ff">Nationalité du ou des déposants : <strong>${depNat}</strong></div>
  </div>

  <div class="fb">
    <div class="ft">[72] — INVENTEUR(S) : <em>Nom, Prénom, Adresse</em></div>
    <div class="fv" style="min-height:55px">${invBlock || "&nbsp;"}</div>
  </div>

  <div class="fb">
    <div class="ft">[54] — TITRE DE L'INVENTION :</div>
    <div class="fv" style="min-height:40px">${titre}</div>
  </div>

  <div class="pb">
    <div class="ft">[30] — REVENDICATION(S) DE PRIORITÉ</div>
    <table class="pt">
      <thead><tr>
        <th>[31] N°(s) de dépôt</th>
        <th>[32] Date(s)</th>
        <th>[33] Pays d'origine</th>
        <th>Nature de la demande</th>
      </tr></thead>
      <tbody>
        <tr><td>${num_depo}</td><td>${date_depo}</td><td>${pays_origine}</td><td>${nature}</td></tr>
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
    <div class="vis"><div class="visl">Visa du préposé</div></div>
  </div>
</div>

<!-- ══ PAGE 2 ══ -->
<div class="page">
  <div class="cert">
    Demande de certificat d'addition rattachée au brevet principal
    n°&nbsp;<span class="ul">${bretNum || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</span>
    &nbsp;&nbsp;du&nbsp;
    <span class="ul">${date_CA || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</span>
  </div>

  <div class="mw">
    <div class="ml">
      <div class="ft">[74] — MANDATAIRE : <em>Nom, Prénom, Adresse</em></div>
      <div class="fv">${mandataire || "&nbsp;"}</div>
    </div>
    <div class="mr">
      Date du pouvoir :<br/>
      <strong>${date_pouvoir || "—"}</strong>
    </div>
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
        <p>${pMF}&nbsp; Mémoire descriptif original en langue française &nbsp; Planche(s)</p>
        <p>${pMFD}&nbsp; Mémoire descriptif duplicata en langue française &nbsp; Planche(s)</p>
        <p>${pDO}&nbsp; Dessin(s) original(aux) &nbsp; Planche(s)</p>
        <p>${pDD}&nbsp; Dessin(s) duplicata(aux) &nbsp; Planche(s)</p>
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

  <p class="ftx">Les demandes doivent être remises ou adressées par pli postal recommandé avec demande d'avis de réception, à l'Institut National Algérien de la Propriété Industrielle (INAPI) dont les coordonnées sont indiquées ci-dessous.</p>
  <p class="ftx">Le paiement des taxes exigibles peut être effectué soit directement auprès de la caisse de l'INAPI soit par virement bancaire au compte : BEA 12 Avenue AMIROUCHE, Alger : n° 00200012120326641801</p>

  <div class="coo">
    <strong>Coordonnées de l'INAPI :</strong><br/>
    Adresse : 42, rue Larbi BEN MHIDI, 5ème étage, B.P. 403 Alger Gare<br/>
    Tél : (021) 73 55 74 &nbsp;|&nbsp; Fax : (021) 73 96 44 et (021) 73 55 81<br/>
    E-mail : brevet@inapi.dz, info@inapi.dz — Web : www.inapi.dz
  </div>

  <div class="nop">A NE PAS PLIER</div>
  <div class="ast">* Cocher les cases correspondantes</div>
</div>

</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Autorisez les popups pour imprimer."); return; }
  win.document.write(html);
  win.document.close();

  if (mode === "download") {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `demande_INAPI_${f.id_demande}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    setTimeout(() => win.print(), 500);
  }
}