


import { useEffect, useState } from "react";
import Datatable2 from "../../components/Datatable2";
import DocumentForm from "./DocumentForm";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import "./documents.css";

export default function RespDocuments() {
  const [data, setData] = useState([]);
  const [editDoc, setEditDoc] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);

  useEffect(() => {
    setData([
      {
        id: 1,
        nom_document:  "Mémoire descriptif",
        type_document: "Mémoire descriptif",
        brevet_lie:    "Brevet FR-2024-001",
        description:   "Description technique complète du brevet",
        fichier:       "memoire_001.pdf",
        date_ajout:    "2024-01-15",
      },
      {
        id: 2,
        nom_document:  "Reçu paiement",
        type_document: "Reçu paiement",
        brevet_lie:    "Brevet FR-2024-001",
        description:   "Reçu du paiement des taxes",
        fichier:       "recu_001.pdf",
        date_ajout:    "2024-01-20",
      },
      {
        id: 3,
        nom_document:  "Formulaire demande",
        type_document: "Demande brevet",
        brevet_lie:    "Brevet FR-2024-002",
        description:   "Formulaire officiel de demande de brevet",
        fichier:       "demande_002.pdf",
        date_ajout:    "2024-02-10",
      },
      {
        id: 4,
        nom_document:  "Recours administratif",
        type_document: "Recours",
        brevet_lie:    "Brevet FR-2024-002",
        description:   "Document de recours suite au refus",
        fichier:       "recours_002.pdf",
        date_ajout:    "2024-03-01",
      },
    ]);
  }, []);

  const handleSubmit = (doc) => {
    if (editDoc) {
      setData((prev) => prev.map((d) => (d.id === editDoc.id ? doc : d)));
      setEditDoc(null);
    } else {
      if (Array.isArray(doc)) {
        setData((prev) => [...prev, ...doc]);
      } else {
        setData((prev) => [...prev, doc]);
      }
    }
  };

  return (
    <>
      <Datatable2
        title="Gestion des documents"
        exportName="documents"
        data={data}
        columns={[
          { key: "brevet_lie",    label: "Brevet lié"    },
          { key: "nom_document",  label: "Nom document"  },
          { key: "type_document", label: "Type"          },
          { key: "description",   label: "Description"   },
          { key: "date_ajout",    label: "Date ajout"    },
        ]}
        form={
          <DocumentForm
            key={editDoc ? editDoc.id : "new"}
            editData={editDoc}
            onSubmit={handleSubmit}
            onCancel={() => setEditDoc(null)}
          />
        }
        onEdit={(row)   => setEditDoc(row)}
        onDelete={(row) => setData((prev) => prev.filter((d) => d.id !== row.id))}
        onView={(row)   => setViewDoc(row)}
      />

      {viewDoc && (
        <ViewDocumentModal
          doc={viewDoc}
          onClose={() => setViewDoc(null)}
        />
      )}
    </>
  );
}

function ViewDocumentModal({ doc, onClose }) {
  const handleDownload = () => {
    if (doc.fichier instanceof File) {
      const url = URL.createObjectURL(doc.fichier);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = doc.fichier.name;
      a.click();
      URL.revokeObjectURL(url);
    } else if (typeof doc.fichier === "string" && doc.fichier !== "") {
      alert(`Le fichier "${doc.fichier}" sera chargé depuis le serveur dans la version finale.`);
    } else {
      alert("Aucun fichier disponible.");
    }
  };

  const fileName =
    doc.fichier instanceof File
      ? doc.fichier.name
      : typeof doc.fichier === "string" && doc.fichier !== ""
      ? doc.fichier
      : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>Détails du document</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="view-doc-grid">

            <div className="view-doc-item">
              <span className="view-doc-label">Brevet lié</span>
              <span className="view-doc-value">{doc.brevet_lie}</span>
            </div>

            <div className="view-doc-item">
              <span className="view-doc-label">Nom document</span>
              <span className="view-doc-value">{doc.nom_document}</span>
            </div>

            <div className="view-doc-item">
              <span className="view-doc-label">Type</span>
              <span className="view-doc-value">{doc.type_document}</span>
            </div>

            <div className="view-doc-item">
              <span className="view-doc-label">Date ajout</span>
              <span className="view-doc-value">{doc.date_ajout}</span>
            </div>

            <div className="view-doc-item full">
              <span className="view-doc-label">Description</span>
              <span className="view-doc-value">{doc.description || "—"}</span>
            </div>

            <div className="view-doc-item full">
              <span className="view-doc-label">Fichier</span>
              {fileName ? (
                <div className="view-file-row">
                  <InsertDriveFileOutlinedIcon style={{ fontSize: 16, color: "#EA6113" }} />
                  <span className="view-file-name">{fileName}</span>
                  <button className="view-dl-btn" onClick={handleDownload}>
                    <DownloadIcon style={{ fontSize: 16 }} />
                    Télécharger
                  </button>
                </div>
              ) : (
                <span className="no-file">Aucun fichier joint</span>
              )}
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button className="dt-btn" onClick={onClose}>Fermer</button>
        </div>

      </div>
    </div>
  );
}