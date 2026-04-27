import { useEffect, useState, useRef } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import "./documents.css";

const TYPES_DOCUMENT = [
  "Mémoire descriptif", "Reçu paiement", "Demande brevet",
  "Recours", "Rapport d'examen", "Certificat", "Autre",
];

const BREVETS = [
  "Brevet FR-2024-001", "Brevet FR-2024-002", "Brevet FR-2024-003",
];

export default function DocumentForm({ onSubmit, editData, onCancel, brevetPreselect }) {
  const fileRef = useRef();

  const [form, setForm] = useState({
    brevet_lie: "", nom_document: "", type_document: "",
    description: "", date_ajout: "", fichier: null,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        brevet_lie:    editData.brevet_lie    || "",
        nom_document:  editData.nom_document  || "",
        type_document: editData.type_document || "",
        description:   editData.description   || "",
        date_ajout:    editData.date_ajout    || "",
        fichier:       editData.fichier       || null,
      });
    } else {
      setForm({ brevet_lie: brevetPreselect || "", nom_document: "", type_document: "", description: "", date_ajout: "", fichier: null });
    }
  }, [editData, brevetPreselect]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setForm({ ...form, fichier: file });
  };

  const handleRemoveFile = () => {
    setForm({ ...form, fichier: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ id: editData ? editData.id : Date.now(), ...form });
    if (!editData) {
      setForm({ brevet_lie: "", nom_document: "", type_document: "", description: "", date_ajout: "", fichier: null });
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setForm({ brevet_lie: "", nom_document: "", type_document: "", description: "", date_ajout: "", fichier: null });
    if (onCancel) onCancel();
  };

  const fileName = form.fichier instanceof File
    ? form.fichier.name
    : typeof form.fichier === "string" && form.fichier !== ""
    ? form.fichier
    : null;

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3>{editData ? "Modifier document" : "Ajouter document"}</h3>

      <label className="field-label">Brevet lié</label>
      <select name="brevet_lie" value={form.brevet_lie} onChange={handleChange} required disabled={!!editData}>
        <option value="">Sélectionner un brevet</option>
        {BREVETS.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      <label className="field-label">Nom document</label>
      <input name="nom_document" value={form.nom_document} onChange={handleChange} placeholder="Nom du document" required />

      <label className="field-label">Type de document</label>
      <select name="type_document" value={form.type_document} onChange={handleChange} required>
        <option value="">Sélectionner un type</option>
        {TYPES_DOCUMENT.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <label className="field-label">Description</label>
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description du document" rows="3" />

      <label className="field-label">Date ajout</label>
      <input type="date" name="date_ajout" value={form.date_ajout} onChange={handleChange} required />

      <label className="field-label">Fichier</label>
      <input ref={fileRef} type="file" id="file-upload" style={{ display: "none" }} onChange={handleFile} />

      {!fileName ? (
        <label htmlFor="file-upload" className="file-select-btn">
          <AttachFileIcon style={{ fontSize: 16 }} />
          Sélectionner un fichier
        </label>
      ) : (
        <div className="file-selected-row">
          <AttachFileIcon style={{ fontSize: 15, color: "#EA6113" }} />
          <span className="file-selected-name">{fileName}</span>
          <label htmlFor="file-upload" className="file-change-btn" title="Changer le fichier">
            <ChangeCircleOutlinedIcon style={{ fontSize: 16 }} />
            Changer
          </label>
          <button type="button" className="file-remove-btn" onClick={handleRemoveFile} title="Supprimer le fichier">
            <DeleteOutlineIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      <button type="submit">{editData ? "Enregistrer" : "Ajouter"}</button>

      {editData && (
        <button type="button" className="cancel-btn" onClick={handleCancel}>Annuler</button>
      )}
    </form>
  );
}