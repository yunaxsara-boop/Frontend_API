import { useEffect, useState, useRef } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import "./documents.css";
import { api } from "/src/contexts/AuthContext.jsx";

export default function DocumentForm({ onSubmit, editData, onCancel }) {
  const fileRef = useRef();

  const emptyForm = {
    id_brevet:     "",
    nom_document:  "",
    type_document: "",
    description:   "",
    fichier:       null,
  };

  const [form, setForm]       = useState(emptyForm);
  const [brevets, setBrevets] = useState([]);
  const [types, setTypes]     = useState([]);   // [{ value, label }]
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ✅ Charger brevets + types (depuis TYPE_CHOICES du modèle)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brevetRes, typeRes] = await Promise.all([
          api.get("brevets/"),
          api.get("documents/types/"),
        ]);
        setBrevets(brevetRes.data.results ?? brevetRes.data);
        setTypes(typeRes.data); // [{ value: "brevet", label: "Brevet" }, ...]
      } catch {
        console.error("Erreur chargement des données");
      }
    };
    fetchData();
  }, []);

  // ✅ Pré-remplir si édition
  useEffect(() => {
    if (editData) {
      setForm({
        id_brevet:     editData.id_brevet?.id_brevet ?? editData.id_brevet ?? "",
        nom_document:  editData.nom_document  ?? "",
        type_document: editData.type_document ?? "",
        description:   editData.description   ?? "",
        fichier:       null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setForm({ ...form, fichier: file });
  };

  const handleRemoveFile = () => {
    setForm({ ...form, fichier: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({ ...form });
      if (!editData) {
        setForm(emptyForm);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch {
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    if (fileRef.current) fileRef.current.value = "";
    if (onCancel) onCancel();
  };

  const fileName = form.fichier instanceof File ? form.fichier.name : null;
  const existingFile =
    editData?.fichier && typeof editData.fichier === "string"
      ? editData.fichier.split("/").pop()
      : null;

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3>{editData ? "Modifier document" : "Ajouter document"}</h3>

      {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

      {/* ✅ Select brevet */}
      <label className="field-label">Brevet lié</label>
      <select name="id_brevet" value={form.id_brevet} onChange={handleChange}>
        <option value="">-- Aucun brevet --</option>
        {brevets.map((b) => (
          <option key={b.id_brevet} value={b.id_brevet}>
            {b.titre} — N°{b.num_brevet}
          </option>
        ))}
      </select>

      <label className="field-label">Nom document</label>
      <input
        name="nom_document"
        value={form.nom_document}
        onChange={handleChange}
        placeholder="Nom du document"
        required
      />

      {/* ✅ Select type depuis TYPE_CHOICES */}
      <label className="field-label">Type de document</label>
      <select
        name="type_document"
        value={form.type_document}
        onChange={handleChange}
        required
      >
        <option value="">-- Choisir un type --</option>
        {types.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <label className="field-label">Description</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description du document"
        rows="3"
      />

      {/* ✅ Upload fichier */}
      <label className="field-label">Fichier</label>
      <input
        ref={fileRef}
        type="file"
        id="file-upload"
        accept="*/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {!fileName ? (
        <>
          {existingFile && (
            <p style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>
              Fichier actuel : <strong>{existingFile}</strong>
            </p>
          )}
          <label htmlFor="file-upload" className="file-select-btn">
            <AttachFileIcon style={{ fontSize: 16 }} />
            {existingFile ? "Remplacer le fichier" : "Sélectionner un fichier"}
          </label>
        </>
      ) : (
        <div className="file-selected-row">
          <AttachFileIcon style={{ fontSize: 15, color: "#EA6113" }} />
          <span className="file-selected-name">{fileName}</span>
          <label htmlFor="file-upload" className="file-change-btn" title="Changer">
            <ChangeCircleOutlinedIcon style={{ fontSize: 16 }} />
            Changer
          </label>
          <button
            type="button"
            className="file-remove-btn"
            onClick={handleRemoveFile}
            title="Supprimer"
          >
            <DeleteOutlineIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : editData ? "Enregistrer" : "Ajouter"}
      </button>

      {editData && (
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Annuler
        </button>
      )}
    </form>
  );
}