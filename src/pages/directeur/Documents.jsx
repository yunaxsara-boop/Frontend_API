
import React from "react";
import FolderIcon from "@mui/icons-material/Folder";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import ImageIcon from "@mui/icons-material/Image";
import DataTable3 from "../../components/DataTable3";

const DATA = [
  { id: 1, brevet_lie: "BR-001", nom_document: "Mémoire descriptif",      type_document: "Mémoire descriptif", description: "Description technique complète du brevet", date_ajout: "2024-01-15", fichier: "memoire_001.pdf"  },
  { id: 2, brevet_lie: "BR-001", nom_document: "Reçu paiement",           type_document: "Reçu paiement",      description: "Reçu du paiement des taxes annuelles",    date_ajout: "2024-01-20", fichier: "recu_001.pdf"      },
  { id: 3, brevet_lie: "BR-002", nom_document: "Formulaire demande",      type_document: "Demande brevet",     description: "Formulaire officiel de demande de brevet", date_ajout: "2024-02-10", fichier: "demande_002.pdf"   },
  { id: 4, brevet_lie: "BR-002", nom_document: "Recours administratif",   type_document: "Recours",            description: "Document de recours suite au refus",       date_ajout: "2024-03-01", fichier: "recours_002.pdf"   },
  { id: 5, brevet_lie: "BR-003", nom_document: "Rapport examen",          type_document: "Rapport d'examen",  description: "Rapport préliminaire d'examen technique",  date_ajout: "2024-03-15", fichier: "rapport_003.pdf"   },
  { id: 6, brevet_lie: "BR-004", nom_document: "Dessin technique",        type_document: "Certificat",        description: "Schéma du capteur avec annotations",       date_ajout: "2024-04-02", fichier: "dessin_004.png"    },
  { id: 7, brevet_lie: "BR-005", nom_document: "Certificat délivrance",   type_document: "Certificat",        description: "Certificat officiel de délivrance",        date_ajout: "2024-04-20", fichier: "certificat_005.pdf"},
];

const TYPE_ICON = {
  ".pdf":  <PictureAsPdfIcon style={{ fontSize: 15, color: "#dc2626" }} />,
  ".docx": <ArticleIcon      style={{ fontSize: 15, color: "#2563eb" }} />,
  ".png":  <ImageIcon        style={{ fontSize: 15, color: "#7c3aed" }} />,
  ".jpg":  <ImageIcon        style={{ fontSize: 15, color: "#7c3aed" }} />,
};

function getExt(fichier) {
  if (!fichier || typeof fichier !== "string") return "";
  return fichier.slice(fichier.lastIndexOf(".")).toLowerCase();
}

function FileIcon({ fichier }) {
  const ext = getExt(fichier);
  return TYPE_ICON[ext] || <InsertDriveFileOutlinedIcon style={{ fontSize: 15, color: "#888" }} />;
}

function handleDownload(fichier) {
  if (!fichier) { alert("Aucun fichier disponible."); return; }
  if (fichier instanceof File) {
    const url = URL.createObjectURL(fichier);
    const a = document.createElement("a");
    a.href = url; a.download = fichier.name; a.click();
    URL.revokeObjectURL(url);
  } else {
    alert(`Le fichier "${fichier}" sera chargé depuis le serveur dans la version finale.`);
  }
}

const COLUMNS = [
  { key: "brevet_lie",    label: "Brevet lié",    sortable: true,  render: (r) => <span className="dt3-ref">{r.brevet_lie}</span> },
  { key: "nom_document",  label: "Nom document",  sortable: true  },
  { key: "type_document", label: "Type",          sortable: true  },
  { key: "description",   label: "Description",   sortable: false, render: (r) => <span style={{ fontSize: 12, color: "#666" }} title={r.description}>{r.description.length > 45 ? r.description.slice(0, 45) + "…" : r.description}</span> },
  { key: "date_ajout",    label: "Date ajout",    sortable: true  },
  {
    key: "fichier", label: "Fichier", sortable: false,
    render: (r) => r.fichier ? (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FileIcon fichier={r.fichier} />
        <span style={{ fontSize: 12, color: "#555" }}>{r.fichier instanceof File ? r.fichier.name : r.fichier}</span>
      </div>
    ) : <span className="dt3-muted">—</span>,
  },
  {
    key: "_dl", label: "Télécharger", sortable: false,
    render: (r) => r.fichier ? (
      <button className="dt3-btn dt3-btn-dl" onClick={() => handleDownload(r.fichier)} title="Télécharger">
        <DownloadIcon style={{ fontSize: 14 }} /> Télécharger
      </button>
    ) : <span className="dt3-muted">—</span>,
  },
];

export default function DirDocuments() {
  return (
    <DataTable3
      icon={<FolderIcon />}
      title="Documents"
      subtitle="Consultation et téléchargement des documents — lecture seule"
      stats={[]}
      columns={COLUMNS}
      data={DATA}
      searchKeys={["brevet_lie", "nom_document", "type_document", "description"]}
      statusKey=""
      statusList={["Tous"]}
      pdfTitle="Registre des Documents — Directeur"
      pdfColumns={["Brevet lié", "Nom document", "Type", "Description", "Date ajout", "Fichier"]}
      pdfRow={(r) => [r.brevet_lie, r.nom_document, r.type_document, r.description.slice(0, 50), r.date_ajout, r.fichier instanceof File ? r.fichier.name : (r.fichier || "—")]}
      excelRow={(r) => ({ "Brevet lié": r.brevet_lie, "Nom document": r.nom_document, Type: r.type_document, Description: r.description, "Date ajout": r.date_ajout, Fichier: r.fichier instanceof File ? r.fichier.name : (r.fichier || "—") })}
      fileName="documents"
    />
  );
}