
import React, { useEffect, useState } from "react";
import FolderIcon from "@mui/icons-material/Folder";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import ImageIcon from "@mui/icons-material/Image";
import DataTable3 from "../../components/DataTable3";
import { getDocuments, downloadDocument } from "../../features/documents/documentApi"; // ← adapte le chemin

const TYPE_LABEL = { brevet: "Brevet", demande: "Demande", recours: "Recours", paiement: "Paiement" };

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

async function handleDownload(row) {
  if (!row.fichier) { alert("Aucun fichier disponible."); return; }
  try {
    const res  = await downloadDocument(row.id_document);
    const blob = new Blob([res.data], { type: res.headers["content-type"] });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const nom  = row.fichier.split("/").pop();
    a.href = url; a.download = nom; a.click();
    URL.revokeObjectURL(url);
  } catch {
    alert("Erreur lors du téléchargement.");
  }
}

const COLUMNS = [
  {
    key: "brevet_lie",
    label: "Brevet lié",
    sortable: true,
    render: (r) => {
      const titre = r.brevet_info?.titre;
      return titre
        ? <span title={titre}>{titre.length > 35 ? titre.slice(0, 35) + "…" : titre}</span>
        : <span className="dt3-muted">—</span>;
    },
  },
  { key: "nom_document",  label: "Nom document", sortable: true },
  {
    key: "type_document",
    label: "Type",
    sortable: true,
    render: (r) => TYPE_LABEL[r.type_document] ?? r.type_document,
  },
  { key: "date_ajout", label: "Date ajout", sortable: true },
  {
    key: "fichier",
    label: "Fichier",
    sortable: false,
    render: (r) => r.fichier ? (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FileIcon fichier={r.fichier} />
        <span style={{ fontSize: 12, color: "#555" }}>{r.fichier.split("/").pop()}</span>
      </div>
    ) : <span className="dt3-muted">—</span>,
  },
  {
    key: "_dl",
    label: "Télécharger",
    sortable: false,
    render: (r) => r.fichier ? (
      <button className="dt3-btn dt3-btn-dl" onClick={() => handleDownload(r)} title="Télécharger">
        <DownloadIcon style={{ fontSize: 14 }} /> Télécharger
      </button>
    ) : <span className="dt3-muted">—</span>,
  },
];

export default function DirDocuments() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getDocuments()
      .then((rows) => setData(rows))
      .catch((err) => {
        console.error("Erreur chargement documents :", err);
        setError("Impossible de charger les documents.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Chargement des documents…</p>;
  if (error)   return <p style={{ padding: 24, color: "red" }}>{error}</p>;

  return (
    <DataTable3
      icon={<FolderIcon />}
      title="Documents"
      subtitle="Consultation et téléchargement des documents — lecture seule"
      stats={[]}
      columns={COLUMNS}
      data={data}
      searchKeys={["nom_document", "type_document", "date_ajout"]}
      statusKey=""
      statusList={["Tous"]}
      pdfTitle="Registre des Documents — Directeur"
      pdfColumns={["Brevet lié", "Nom document", "Type", "Date ajout", "Fichier"]}
      pdfRow={(r) => [
        r.brevet_info?.titre ?? "—",
        r.nom_document,
        TYPE_LABEL[r.type_document] ?? r.type_document,
        r.date_ajout,
        r.fichier?.split("/").pop() ?? "—",
      ]}
      excelRow={(r) => ({
        "Brevet lié":   r.brevet_info?.titre ?? "—",
        "Nom document": r.nom_document,
        Type:           TYPE_LABEL[r.type_document] ?? r.type_document,
        "Date ajout":   r.date_ajout,
        Fichier:        r.fichier?.split("/").pop() ?? "—",
      })}
      fileName="documents"
    />
  );
}