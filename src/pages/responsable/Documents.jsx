import { useEffect, useState } from "react";
import Datatable2 from "../../components/Datatable2";
import DocumentForm from "./DocumentForm";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import "./documents.css";
import {
  getDocuments,
  deleteDocument,
  addDocument,
  updateDocument,
  downloadDocument,
} from "../../features/documents/documentApi";

export default function RespDocuments() {
  const [data, setData]       = useState([]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getDocuments();
      setData(res);
    } catch {
      setError("Erreur de chargement des documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (doc) => {
    setError("");
    setLoading(true);
    try {
      if (editDoc) {
        await updateDocument(editDoc.id_document, doc);
        setEditDoc(null);
      } else {
        await addDocument(doc);
      }
      await load();
    } catch (err) {
      console.error("ERREUR:", err.response?.data);
      setError(
        JSON.stringify(err.response?.data) || "Erreur lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteDocument(row.id_document);
      await load();
    } catch {
      setError("Erreur de suppression.");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <>
      {error && <p style={{ color: "red", padding: "8px 16px" }}>{error}</p>}
      <Datatable2
        title="Gestion des documents"
        exportName="documents"
        data={data}
        columns={[
          { key: "nom_document", label: "Nom document" },
          { key: "type_document", label: "Type" },
          {
            key: "brevet_info",
            label: "Brevet",
            render: (val) => val ? `${val.titre} — N°${val.num_brevet}` : "—",
          },
          { key: "date_ajout", label: "Date ajout" },
        ]}
        form={
          <DocumentForm
            key={editDoc ? editDoc.id_document : "new"}
            editData={editDoc}
            onSubmit={handleSubmit}
            onCancel={() => setEditDoc(null)}
          />
        }
        onEdit={(row) => setEditDoc(row)}
        onDelete={handleDelete}
        onView={(row) => setViewDoc(row)}
      />

      {viewDoc && (
        <ViewDocumentModal doc={viewDoc} onClose={() => setViewDoc(null)} />
      )}
    </>
  );
}

function ViewDocumentModal({ doc, onClose }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!doc.fichier) {
      alert("Aucun fichier disponible.");
      return;
    }
    try {
      setDownloading(true);
      const res = await downloadDocument(doc.id_document);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement("a");
      a.href     = url;
      a.download = doc.fichier.split("/").pop();
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement.");
    } finally {
      setDownloading(false);
    }
  };

  const fileName   = doc.fichier ? doc.fichier.split("/").pop() : null;
  const brevetLabel = doc.brevet_info
    ? `${doc.brevet_info.titre} — N°${doc.brevet_info.num_brevet}`
    : "—";

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
              <span className="view-doc-value">{brevetLabel}</span>
            </div>

            <div className="view-doc-item">
              <span className="view-doc-label">Nom document</span>
              <span className="view-doc-value">{doc.nom_document}</span>
            </div>

            <div className="view-doc-item">
              <span className="view-doc-label">Type</span>
              <span className="view-doc-value">{doc.type_document || "—"}</span>
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
                  <button
                    className="view-dl-btn"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    <DownloadIcon style={{ fontSize: 16 }} />
                    {downloading ? "..." : "Télécharger"}
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