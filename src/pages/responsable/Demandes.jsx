import { useState, useEffect } from "react";
import "./Demandes.css";

import SearchIcon      from "@mui/icons-material/Search";
import EditIcon        from "@mui/icons-material/Edit";
import PrintIcon       from "@mui/icons-material/Print";
import DownloadIcon    from "@mui/icons-material/Download";
import DeleteIcon      from "@mui/icons-material/Delete";
import VisibilityIcon  from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon      from "@mui/icons-material/Cancel";
import RefreshIcon     from "@mui/icons-material/Refresh";

const KEY_RESP  = "resp_demandes";
const KEY_AGENT = "agent_demandes";
const loadResp  = () => JSON.parse(localStorage.getItem(KEY_RESP)  || "[]");
const loadAgent = () => JSON.parse(localStorage.getItem(KEY_AGENT) || "[]");
const saveResp  = (l) => localStorage.setItem(KEY_RESP,  JSON.stringify(l));
const saveAgent = (l) => localStorage.setItem(KEY_AGENT, JSON.stringify(l));

const EMPTY = {
  nature_brevet:false, nature_pct:false, nature_certificat:false,
  deposant_nom:"", deposant_prenom:"", deposant_denomination:"",
  deposant_adresse:"", deposant_nationalite:"",
  inventeur_nom:"", inventeur_prenom:"", inventeur_adresse:"",
  titre:"",
  mandataire_nom:"", mandataire_prenom:"", mandataire_adresse:"", mandataire_date_pouvoir:"",
  brevet_principal_num:"", brevet_principal_date:"",
  autres_informations:"",
  piece_copie_int:false, piece_memoire_nat:false, piece_memoire_fr:false,
  piece_memoire_fr_dup:false, piece_dessins_orig:false, piece_dessins_dup:false,
  piece_abrege:false, piece_pouvoir:false, piece_priorite:false,
  piece_cession:false, piece_titre:false,
};

const g   = (o,k) => (o&&o[k]!=null?String(o[k]):"");
const br  = (v)   => (v?String(v).replace(/\n/g,"<br/>"):"");
const chk = (v)   => (v===true||v==="true"?"&#9745;":"&#9744;");

function buildAndOpen(demande, mode) {
  const f = demande.data || {};
  const nB=chk(f.nature_brevet), nP=chk(f.nature_pct), nC=chk(f.nature_certificat);
  const dep1=[g(f,"deposant_nom"),g(f,"deposant_prenom")].filter(Boolean).join(" ");
  const dep2=g(f,"deposant_denomination")?"<br/>"+g(f,"deposant_denomination"):"";
  const dep3=br(f.deposant_adresse)?"<br/>"+br(f.deposant_adresse):"";
  const depNat=g(f,"deposant_nationalite");
  const inv1=[g(f,"inventeur_nom"),g(f,"inventeur_prenom")].filter(Boolean).join(" ");
  const inv2=br(f.inventeur_adresse)?"<br/>"+br(f.inventeur_adresse):"";
  const titre=g(f,"titre");
  const mand1=[g(f,"mandataire_nom"),g(f,"mandataire_prenom")].filter(Boolean).join(" ");
  const mand2=br(f.mandataire_adresse)?"<br/>"+br(f.mandataire_adresse):"";
  const mandDate=g(f,"mandataire_date_pouvoir");
  const bretNum=g(f,"brevet_principal_num")||"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  const bretDate=g(f,"brevet_principal_date")||"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  const autresInfo=br(f.autres_informations);
  const pCI=chk(f.piece_copie_int),pMN=chk(f.piece_memoire_nat),pMF=chk(f.piece_memoire_fr);
  const pMFD=chk(f.piece_memoire_fr_dup),pDO=chk(f.piece_dessins_orig),pDD=chk(f.piece_dessins_dup);
  const pAB=chk(f.piece_abrege),pPO=chk(f.piece_pouvoir),pPR=chk(f.piece_priorite);
  const pCS=chk(f.piece_cession),pTI=chk(f.piece_titre);

  const css=`*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Times New Roman",Times,serif;font-size:10pt;color:#000;background:#fff}.tb{background:#1d4ed8;color:#fff;padding:10px 20px;display:flex;gap:12px;align-items:center;font-family:Arial,sans-serif}.tb button{background:#fff;color:#1d4ed8;border:none;padding:7px 16px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px}@media print{.tb{display:none}.pg{margin:0;page-break-after:always}.pg:last-child{page-break-after:auto}body{margin:0}}.pg{width:21cm;min-height:29.7cm;padding:1.4cm 1.7cm;position:relative;margin:0 auto}.hdr{width:100%;border-collapse:collapse;margin-bottom:4px}.hdr td{padding:2px 4px;vertical-align:top}.hl{width:33%;text-align:left}.hm{width:34%;text-align:center;vertical-align:middle}.hr{width:33%;text-align:right}.ar{font-family:Arial,sans-serif;font-size:8.5pt;direction:rtl;line-height:1.5}.ins{font-size:7.5pt;font-weight:bold;line-height:1.4}.lg{display:inline-block;border:3px solid #000;padding:2px 10px;font-size:18pt;font-weight:900;font-family:Arial,sans-serif;letter-spacing:-1px}.lgi{font-style:italic;font-weight:400}.rf{position:absolute;top:1.4cm;right:1.7cm;font-size:7.5pt;text-align:right;line-height:1.5}.nt{border:2.5px solid #000;margin:8px 0 7px}.ntt{text-align:center;font-size:13pt;font-weight:bold;padding:5px 8px;border-bottom:1.5px solid #000}.ntr{width:100%;border-collapse:collapse}.ntr td{padding:5px 14px;font-size:9pt;width:33%}.ck{font-size:13pt;margin-left:4px}.fb{border:1px solid #444;margin-bottom:5px}.ft{font-size:8pt;font-style:italic;padding:3px 7px;color:#333;background:#fafafa}.fv{padding:5px 10px 8px;font-size:10pt;min-height:35px;line-height:1.5}.ff{border-top:1px dashed #aaa;font-size:8pt;font-style:italic;padding:3px 8px;color:#555}.pb{border:1px solid #444;margin-bottom:5px}.pt{width:100%;border-collapse:collapse;font-size:9pt}.pt th{border:1px solid #444;padding:4px 6px;background:#f0f0f0;font-weight:bold;text-align:center}.pt td{border:1px solid #bbb;padding:0;height:24px}.bt{display:flex;border:1px solid #444;margin-top:6px}.bl{flex:1}.dt{width:100%;border-collapse:collapse;font-size:9.5pt}.dt th{border:1px solid #444;padding:4px 6px;background:#f0f0f0;font-weight:bold;text-align:center}.dt td{border:1px solid #bbb;height:28px}.di{border:1px solid #444;border-top:none;padding:5px 8px;font-size:8.5pt;font-style:italic;height:28px}.vs{width:130px;border-left:1px solid #444;display:flex;flex-direction:column;align-items:center;padding-top:8px}.vsl{font-size:9pt;font-weight:bold}.p2h{display:flex;align-items:center;gap:16px;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:10px}.p2l{width:52px;height:52px;border:3px double #000;display:flex;align-items:center;justify-content:center;font-size:24pt;font-weight:900;font-family:Arial,sans-serif}.p2n{flex:1;font-size:13pt;font-weight:bold;text-align:center}.p2m{font-size:9pt;text-align:right;line-height:1.7}.ct{border:1px solid #444;padding:7px 10px;font-size:9.5pt;margin-bottom:7px;min-height:30px}.ul{border-bottom:1px solid #000;display:inline-block;min-width:90px;padding:0 4px}.mw{display:flex;border:1px solid #444;margin-bottom:7px}.ml{flex:1;border-right:1px solid #444;min-height:55px}.mr{width:140px;padding:8px;font-size:9pt;line-height:1.6}.rt{width:100%;border-collapse:collapse;border:1px solid #444;margin-bottom:7px}.rt td{border:1px solid #aaa;padding:8px 10px;font-size:9pt;vertical-align:top}.ab{border:1px solid #444;margin-bottom:7px}.al{font-size:9.5pt;font-weight:bold;padding:4px 8px;border-bottom:1px solid #ccc}.av{padding:5px 10px 8px;min-height:50px;font-size:10pt;line-height:1.5}.brd{border:2px solid #000;padding:8px 12px;margin-bottom:8px}.brt{text-align:center;font-weight:bold;font-size:10pt;text-decoration:underline;margin-bottom:8px}.brc{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}.brc>div>p{font-size:8.5pt;margin-bottom:5px;line-height:1.4}.ftx{font-size:7.5pt;line-height:1.5;margin-bottom:5px;text-align:justify}.coo{font-size:8pt;line-height:1.6;text-align:center;margin:8px 0}.nop{text-align:center;font-weight:bold;font-size:10pt;letter-spacing:2px;margin:7px 0}.ast{font-size:7.5pt;font-style:italic}`;

  const html=`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Demande INAPI</title><style>${css}</style></head><body>
<div class="tb"><span style="font-size:14px;font-weight:700">📄 Formulaire INAPI — R2-FO-03</span><button onclick="window.print()">🖨&nbsp; Imprimer / Enregistrer PDF</button></div>
<div class="pg"><div class="rf">R2-FO-03<br/>E1</div>
<table class="hdr"><tr><td class="hl"><div class="ar">المعهد الوطني الجزائري للملكية الصناعية</div><div class="ins">INSTITUT NATIONAL ALGÉRIEN</div><div class="ins">DE LA PROPRIÉTÉ INDUSTRIELLE</div></td><td class="hm"><div class="lg"><span class="lgi">in</span>&thinsp;pi</div></td><td class="hr"><div class="ar">الجمهورية الجزائرية الديمقراطية الشعبية</div><div class="ins">RÉPUBLIQUE ALGÉRIENNE</div><div class="ins">DÉMOCRATIQUE ET POPULAIRE</div></td></tr></table>
<div class="nt"><div class="ntt">Nature de la demande de protection *</div><table class="ntr"><tr><td>Brevet d'invention <span class="ck">${nB}</span></td><td style="text-align:center">Extension PCT <span class="ck">${nP}</span></td><td style="text-align:right">Certificat d'addition <span class="ck">${nC}</span></td></tr></table></div>
<div class="fb"><div class="ft">[71] - DÉPOSANT(S)</div><div class="fv" style="min-height:58px">${dep1}${dep2}${dep3}</div><div class="ff">Nationalité : ${depNat}</div></div>
<div class="fb"><div class="ft">[72] - INVENTEUR(S)</div><div class="fv" style="min-height:58px">${inv1}${inv2}</div></div>
<div class="fb"><div class="ft">[54] - TITRE DE L'INVENTION</div><div class="fv" style="min-height:42px">${titre}</div></div>
<div class="pb"><div class="ft">[30] – REVENDICATION DE PRIORITÉ</div><table class="pt"><thead><tr><th>[31] N° dépôt</th><th>[32] Date</th><th>[33] Pays</th><th>Nature</th></tr></thead><tbody><tr><td>&nbsp;</td><td></td><td></td><td></td></tr><tr><td>&nbsp;</td><td></td><td></td><td></td></tr></tbody></table></div>
<div class="bt"><div class="bl"><table class="dt"><thead><tr><th>Numéro de dépôt</th><th>Date de dépôt</th><th>Heure</th></tr></thead><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><div class="di">N° demande internationale</div></div><div class="vs"><div class="vsl">Visa</div></div></div>
</div>
<div class="pg">
<div class="p2h"><div class="p2l">S</div><div class="p2n">N° ________ /DG</div><div class="p2m">Classement : 0.003.5/20<br/>Référence : E-063<br/>Page : 3 de 3</div></div>
<div class="ct">Certificat d'addition — brevet n°&nbsp;<span class="ul">${bretNum}</span>&nbsp; du &nbsp;<span class="ul">${bretDate}</span></div>
<div class="mw"><div class="ml"><div class="ft">[74] - MANDATAIRE</div><div class="fv">${mand1}${mand2}</div></div><div class="mr">Date du pouvoir :<br/>${mandDate}</div></div>
<table class="rt"><tr><td style="width:30%">Le préposé à la réception</td><td style="width:35%">Fait à : le :</td><td style="width:35%;font-style:italic;font-size:8.5pt">Signature et cachet</td></tr></table>
<div class="ab"><div class="al">Autres informations</div><div class="av">${autresInfo}</div></div>
<div class="brd"><div class="brt">BORDEREAU DES PIÈCES DÉPOSÉES *</div><div class="brc"><div><p>${pCI} Copie demande internationale</p><p>${pMN} Mémoire national</p><p>${pMF} Mémoire français original</p><p>${pMFD} Mémoire français duplicata</p><p>${pDO} Dessins originaux</p><p>${pDD} Dessins duplicata</p></div><div><p>${pAB} Abrégé</p><p>${pPO} Pouvoir</p><p>${pPR} Document priorité</p><p>${pCS} Cession priorité</p><p>${pTI} Titre/paiement taxes</p></div></div></div>
<div class="nop">A NE PAS PLIER</div><div class="ast">* Cocher les cases correspondantes</div>
</div></body></html>`;

  const blob=new Blob([html],{type:"text/html;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  if(mode==="download"){
    const a=document.createElement("a");a.href=url;a.download="demande_INAPI.html";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  } else { window.open(url,"_blank"); }
}

/* ══════════════════════════════════════════════════════════ */
export default function RespDemandes() {
  const [mesDemandes,   setMesDemandes]   = useState([]);
  const [agentDemandes, setAgentDemandes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({...EMPTY});
  const [searchMes,   setSearchMes]   = useState("");
  const [searchAgent, setSearchAgent] = useState("");
  const [viewDemande, setViewDemande] = useState(null);

  useEffect(() => { setMesDemandes(loadResp()); setAgentDemandes(loadAgent()); }, []);

  const setField = (e) => {
    const {name,value,type,checked}=e.target;
    setForm(f=>({...f,[name]:type==="checkbox"?checked:value}));
  };

  const openAdd  = () => { setEditId(null); setForm({...EMPTY}); setShowModal(true); };
  const openEdit = (d) => { setEditId(d.id); setForm({...EMPTY,...d.data}); setShowModal(true); };

  const handleSave = () => {
    const natureLbl=form.nature_brevet?"Brevet d'invention":form.nature_pct?"Extension PCT":form.nature_certificat?"Certificat d'addition":"—";
    if(editId!==null){
      const u=mesDemandes.map(d=>d.id!==editId?d:{...d,
        deposant:[form.deposant_nom,form.deposant_prenom].filter(Boolean).join(" ")||form.deposant_denomination||d.deposant,
        titre:form.titre||d.titre, nature:natureLbl, data:{...form}});
      saveResp(u); setMesDemandes(u);
    } else {
      const nd={id:Date.now(),
        deposant:[form.deposant_nom,form.deposant_prenom].filter(Boolean).join(" ")||form.deposant_denomination||"—",
        titre:form.titre||"—", nature:natureLbl, statut:"EN_ATTENTE",
        date:new Date().toLocaleDateString("fr-DZ"), data:{...form}};
      const u=[nd,...mesDemandes]; saveResp(u); setMesDemandes(u);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if(!window.confirm("Supprimer ?"))return;
    const u=mesDemandes.filter(d=>d.id!==id); saveResp(u); setMesDemandes(u);
  };

  const changeStatut = (id, statut) => {
    const u=agentDemandes.map(d=>d.id===id?{...d,statut}:d);
    saveAgent(u); setAgentDemandes(u);
  };

  const filteredMes   = mesDemandes.filter(d=>[d.deposant,d.titre,d.nature].some(v=>(v||"").toLowerCase().includes(searchMes.toLowerCase())));
  const filteredAgent = agentDemandes.filter(d=>[d.deposant,d.titre,d.nature].some(v=>(v||"").toLowerCase().includes(searchAgent.toLowerCase())));

  const badgeCls=(s)=>s==="VALIDER"||s==="ACCEPTER"?"badge green":s==="REFUSER"?"badge red":"badge orange";

  return (
    <>
      <div className="dem-page">
        <div className="dem-page-header">
          <h2 className="dem-title">Demandes de Protection</h2>
          <p className="dem-sub">Espace Responsable — INAPI</p>
        </div>

        {/* ── MES DEMANDES ── */}
        <div className="dem-section-header">
          <div className="dem-section-label"><span className="section-dot blue"/>Mes demandes</div>
          <button className="dem-add-btn" onClick={openAdd}>+ Ajouter une demande</button>
        </div>

        <div className="dem-card">
          <div className="dem-toolbar">
            <div className="dem-search-wrap">
              <div style={{position:"absolute",left:11,top:0,bottom:0,display:"flex",alignItems:"center",pointerEvents:"none",color:"#F88F22",zIndex:1}}>
                <SearchIcon sx={{fontSize:18}}/>
              </div>
              <input className="dem-search" placeholder="Rechercher…" value={searchMes} onChange={e=>setSearchMes(e.target.value)}/>
            </div>
            <span className="dem-count">{filteredMes.length} demande(s)</span>
          </div>

          <div className="dem-table-wrap">
            <table className="dem-table">
              <thead><tr><th>Date</th><th>Déposant</th><th>Titre</th><th>Nature</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredMes.length===0
                  ?<tr><td colSpan={6} className="dem-empty">Aucune demande enregistrée</td></tr>
                  :filteredMes.map(d=>(
                    <tr key={d.id}>
                      <td>{d.date}</td><td>{d.deposant}</td>
                      <td className="dem-titre-cell">{d.titre}</td>
                      <td>{d.nature}</td>
                      <td><span className={badgeCls(d.statut)}>{d.statut}</span></td>
                      <td className="dem-actions">
                        <button className="act-btn edit"  title="Modifier"    onClick={()=>openEdit(d)}><EditIcon sx={{fontSize:17}}/></button>
                        <button className="act-btn print" title="Imprimer"    onClick={()=>buildAndOpen(d,"print")}><PrintIcon sx={{fontSize:17}}/></button>
                        <button className="act-btn dl"    title="Télécharger" onClick={()=>buildAndOpen(d,"download")}><DownloadIcon sx={{fontSize:17}}/></button>
                        <button className="act-btn del"   title="Supprimer"   onClick={()=>handleDelete(d.id)}><DeleteIcon sx={{fontSize:17}}/></button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* ── DEMANDES DES AGENTS ── */}
        <div className="dem-section-header" style={{marginTop:32}}>
          <div className="dem-section-label"><span className="section-dot orange"/>Demandes des agents</div>
          <button className="dem-refresh-btn" onClick={()=>setAgentDemandes(loadAgent())}>
            <RefreshIcon sx={{fontSize:16,verticalAlign:"middle",mr:.5}}/> Actualiser
          </button>
        </div>

        <div className="dem-card">
          <div className="dem-toolbar">
            <div className="dem-search-wrap">
              <div style={{position:"absolute",left:11,top:0,bottom:0,display:"flex",alignItems:"center",pointerEvents:"none",color:"#F88F22",zIndex:1}}>
                <SearchIcon sx={{fontSize:18}}/>
              </div>
              <input className="dem-search" placeholder="Rechercher…" value={searchAgent} onChange={e=>setSearchAgent(e.target.value)}/>
            </div>
            <span className="dem-count">{filteredAgent.length} demande(s)</span>
          </div>

          <div className="dem-table-wrap">
            <table className="dem-table">
              <thead><tr><th>Date</th><th>Agent</th><th>Déposant</th><th>Titre</th><th>Nature</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredAgent.length===0
                  ?<tr><td colSpan={7} className="dem-empty">Aucune demande d'agent</td></tr>
                  :filteredAgent.map(d=>(
                    <tr key={d.id}>
                      <td>{d.date}</td>
                      <td><span className="agent-tag">{d.agentNom||"Agent"}</span></td>
                      <td>{d.deposant}</td>
                      <td className="dem-titre-cell">{d.titre}</td>
                      <td>{d.nature}</td>
                      <td><span className={badgeCls(d.statut)}>{d.statut}</span></td>
                      <td className="dem-actions">
                        <button className="act-btn view"    title="Voir"        onClick={()=>setViewDemande(d)}><VisibilityIcon sx={{fontSize:17}}/></button>
                        <button className="act-btn print"   title="Imprimer"    onClick={()=>buildAndOpen(d,"print")}><PrintIcon sx={{fontSize:17}}/></button>
                        <button className="act-btn dl"      title="Télécharger" onClick={()=>buildAndOpen(d,"download")}><DownloadIcon sx={{fontSize:17}}/></button>
                        {d.statut!=="VALIDER"&&<button className="act-btn valider" title="Valider"  onClick={()=>changeStatut(d.id,"VALIDER")}><CheckCircleIcon sx={{fontSize:17}}/></button>}
                        {d.statut!=="REFUSER"&&<button className="act-btn refuser" title="Refuser"  onClick={()=>changeStatut(d.id,"REFUSER")}><CancelIcon sx={{fontSize:17}}/></button>}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL AJOUT / MODIFICATION ── */}
      {showModal&&(
        <div className="dem-overlay" onClick={e=>e.target.classList.contains("dem-overlay")&&setShowModal(false)}>
          <div className="dem-modal">
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-header-icon">📋</div>
                <div><h3>{editId?"Modifier la demande":"Nouvelle demande de protection"}</h3><p>Formulaire officiel INAPI — R2-FO-03</p></div>
              </div>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <Sec num="01" label="Nature de la demande *">
                <div className="check-row">
                  <CL name="nature_brevet"     checked={!!form.nature_brevet}     onChange={setField} label="Brevet d'invention"/>
                  <CL name="nature_pct"        checked={!!form.nature_pct}        onChange={setField} label="Extension PCT"/>
                  <CL name="nature_certificat" checked={!!form.nature_certificat} onChange={setField} label="Certificat d'addition"/>
                </div>
              </Sec>
              <Sec num="71" label="[71] — DÉPOSANT(S)">
                <div className="modal-grid">
                  <F label="Nom"              name="deposant_nom"          value={form.deposant_nom}          onChange={setField}/>
                  <F label="Prénom"           name="deposant_prenom"       value={form.deposant_prenom}       onChange={setField}/>
                  <F label="Dénomination"     name="deposant_denomination" value={form.deposant_denomination} onChange={setField} full/>
                  <F label="Adresse complète" name="deposant_adresse"      value={form.deposant_adresse}      onChange={setField} full area/>
                  <F label="Nationalité"      name="deposant_nationalite"  value={form.deposant_nationalite}  onChange={setField}/>
                </div>
              </Sec>
              <Sec num="72" label="[72] — INVENTEUR(S)">
                <div className="modal-grid">
                  <F label="Nom"     name="inventeur_nom"     value={form.inventeur_nom}     onChange={setField}/>
                  <F label="Prénom"  name="inventeur_prenom"  value={form.inventeur_prenom}  onChange={setField}/>
                  <F label="Adresse" name="inventeur_adresse" value={form.inventeur_adresse} onChange={setField} full area/>
                </div>
              </Sec>
              <Sec num="54" label="[54] — TITRE DE L'INVENTION">
                <div className="modal-grid">
                  <F label="Titre complet" name="titre" value={form.titre} onChange={setField} full area/>
                </div>
              </Sec>
              <Sec num="+" label="Certificat d'addition — Brevet principal">
                <div className="modal-grid">
                  <F label="N° du brevet principal" name="brevet_principal_num"  value={form.brevet_principal_num}  onChange={setField}/>
                  <F label="Date"                   name="brevet_principal_date" value={form.brevet_principal_date} onChange={setField} type="date"/>
                </div>
              </Sec>
              <Sec num="74" label="[74] — MANDATAIRE">
                <div className="modal-grid">
                  <F label="Nom"             name="mandataire_nom"          value={form.mandataire_nom}          onChange={setField}/>
                  <F label="Prénom"          name="mandataire_prenom"       value={form.mandataire_prenom}       onChange={setField}/>
                  <F label="Adresse"         name="mandataire_adresse"      value={form.mandataire_adresse}      onChange={setField} full area/>
                  <F label="Date du pouvoir" name="mandataire_date_pouvoir" value={form.mandataire_date_pouvoir} onChange={setField} type="date"/>
                </div>
              </Sec>
              <Sec num="ℹ" label="Autres informations">
                <div className="modal-grid">
                  <F label="Informations complémentaires" name="autres_informations" value={form.autres_informations} onChange={setField} full area rows={3}/>
                </div>
              </Sec>
              <Sec num="📎" label="Bordereau des pièces déposées *">
                <div className="pieces-grid">
                  {[["piece_copie_int","Copie de la demande internationale"],["piece_memoire_nat","Mémoire descriptif en langue nationale"],["piece_memoire_fr","Mémoire descriptif original (français)"],["piece_memoire_fr_dup","Mémoire descriptif duplicata (français)"],["piece_dessins_orig","Dessin(s) original(aux)"],["piece_dessins_dup","Dessin(s) duplicata(aux)"],["piece_abrege","Abrégé descriptif"],["piece_pouvoir","Pouvoir"],["piece_priorite","Document de priorité"],["piece_cession","Cession de priorité"],["piece_titre","Titre / justification paiement taxes"]].map(([n,lbl])=>(
                    <label key={n} className="piece-item"><input type="checkbox" name={n} checked={!!form[n]} onChange={setField}/><span>{lbl}</span></label>
                  ))}
                </div>
              </Sec>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>setShowModal(false)}>Annuler</button>
              <button className="btn-save"   onClick={handleSave}>{editId?"💾 Enregistrer les modifications":"✅ Enregistrer la demande"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL VUE ── */}
      {viewDemande&&(
        <div className="dem-overlay" onClick={e=>e.target.classList.contains("dem-overlay")&&setViewDemande(null)}>
          <div className="dem-modal">
            <div className="modal-header modal-header-view">
              <div className="modal-header-left">
                <div className="modal-header-icon">👁</div>
                <div><h3>Détail de la demande</h3><p>Lecture seule — Responsable</p></div>
              </div>
              <button className="modal-close" onClick={()=>setViewDemande(null)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                ["Déposant",           viewDemande.deposant],
                ["Titre",              viewDemande.titre],
                ["Nature",             viewDemande.nature],
                ["Date",               viewDemande.date],
                ["Statut",             viewDemande.statut],
                ["Inventeur",          [viewDemande.data?.inventeur_nom,viewDemande.data?.inventeur_prenom].filter(Boolean).join(" ")],
                ["Adresse déposant",   viewDemande.data?.deposant_adresse],
                ["Nationalité",        viewDemande.data?.deposant_nationalite],
                ["Mandataire",         [viewDemande.data?.mandataire_nom,viewDemande.data?.mandataire_prenom].filter(Boolean).join(" ")],
                ["Brevet principal",   viewDemande.data?.brevet_principal_num],
                ["Autres informations",viewDemande.data?.autres_informations],
              ].filter(([,v])=>v).map(([label,value])=>(
                <div key={label} className="view-field">
                  <span className="view-label">{label}</span>
                  <span className="view-value">{value}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>setViewDemande(null)}>Fermer</button>
              <button className="btn-print"  onClick={()=>buildAndOpen(viewDemande,"print")}><PrintIcon sx={{fontSize:15,mr:.5}}/>Imprimer</button>
              <button className="btn-dl"     onClick={()=>buildAndOpen(viewDemande,"download")}><DownloadIcon sx={{fontSize:15,mr:.5}}/>Télécharger</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Sec({num,label,children}){return(<div className="modal-section"><div className="section-title"><span className="section-num">{num}</span>{label}</div>{children}</div>);}
function F({label,name,value,onChange,type="text",full,area,rows=2}){return(<div className={`fg${full?" full":""}`}><label>{label}</label>{area?<textarea name={name} value={value} onChange={onChange} rows={rows}/>:<input type={type} name={name} value={value} onChange={onChange}/>}</div>);}
function CL({name,checked,onChange,label}){return(<label className="chk-label"><input type="checkbox" name={name} checked={checked} onChange={onChange}/><span>{label}</span></label>);}