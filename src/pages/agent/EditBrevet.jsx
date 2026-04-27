import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./editBrevet.css"
import { updateBrevet, getBrevetById } from "../../features/brevets/brevetApi";
import { getDocumentsByBrevet, updateDocument, deleteDocument, addDocument } from "../../features/documents/documentApi";
import Brevets from "./Brevets";

export default function EditBrevet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const[docs, setDocs]=useState([]);
  const[editingDoc, setEditingDoc]=useState(null);
  const [loading, setLoading] = useState(true)
  const [error, setError]=useState()
  const [docError, setDocError] = useState("")

  useEffect(() => {
    const fetchBrevet = async () => {
      try{
        setLoading(true)
        const data = await getBrevetById(id)
        setForm(data)
        const res = await getDocumentsByBrevet(id)
        setDocs(res.results ?? res)
      } catch{
        setError("Erreur de chergement")
      } finally{
        setLoading(false)
      }
    }
    fetchBrevet()
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await updateBrevet(id, {
        ...form,
        num_brevet: Number(form.num_brevet),
        num_depo: Number(form.num_depo),
      })
      navigate("/agent/brevets")
    } catch {
      setError("Erreur lors de la modification.")
    }
  }

  const reloadDocs = async () => {
    const res = await getDocumentsByBrevet(id)
    setDocs(res.results ?? res)
  }

  const handleAddFile = async (e) => {
    const files = Array.from(e.target.files)
    setDocError("")
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append("nom_document", file.name)
        formData.append("fichier", file)
        formData.append("id_brevet", id)
        await addDocument(formData)
      } catch (err) {
        console.log(err)
        setDocError("Erreur ajout fichier.")
      }
    }
    await reloadDocs()
    // réinitialise l'input file
    e.target.value = ""
  }

  const handleUpdateDoc = async (docId, updatedDoc) => {
  try {
     if (updatedDoc.fichier instanceof File) {
      const formData = new FormData() //objet special pour envoyer des fichiers(feuille vide pour stocker les champs du formulaire)
      formData.append("nom_document", updatedDoc.nom_document) //.append: ajouter un champ au formData (remplir la feuille vide)
      formData.append("fichier", updatedDoc.fichier)
      formData.append("id_brevet", id);
      await updateDocument(docId, formData) 
      /*Json marche avec tu texte  normal mais pas avec des fichiers donc on utilise formDta pour transporter les fichiers au backend*/
  } else {
      await updateDocument(docId, { nom_document: updatedDoc.nom_document, id_brevet: id})
    }
    const res = await getDocumentsByBrevet(id)
    setDocs(res.results ?? res)
    setEditingDoc(null)
  } catch {
    setError("Erreur modification document.")
  }
}

const handleDeleteDoc = async (docId) => {
  try {
    setDocError("")
    await deleteDocument(docId)
    setDocs(docs.filter(d => d.id_document !== docId))
  } catch {
    setDocError("Erreur suppression document.")
  }
}

const handleFile = async (e) => {
  const files = Array.from(e.target.files)
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append("nom_document", file.name)
      formData.append("type_document", selectedType)
      formData.append("fichier", file)
      formData.append("date_ajout", file.date_ajout)
      formData.append("id_brevet", id)  // ← lie au brevet
      await addDocument(formData)
    } catch (err) {
      console.log(err)
      setDocError("Erreur ajout fichier.")
    }
  }
  // recharge les documents après ajout
  const res = await getDocumentsByBrevet(id)
  setDocs(res.results ?? res)
}


  if (loading) return <p>Chargement...</p>
  if (error)   return <p style={{ color: "red" }}>{error}</p>
  if (!form)   return <p>Brevet introuvable</p>

  return (
    <div className="brevet-page">
    <div className="brevet-card">
      <h2 className="brevet-title">Modifier le brevet</h2>

    <div className="brevet-grid">

     <label> Num brevet </label>
     <input name="num_brevet" value={form.num_brevet ?? ""} onChange={handleChange} />

     <label>Titre</label>
     <input name="titre" value={form.titre ?? ""} onChange={handleChange} />

     <label>Num dépôt</label>
     <input name="num_depo" value={form.num_depo ?? ""} onChange={handleChange} />

     <label>Date dépôt</label>
     <input type="date" name="date_depo" value={form.date_depo ?? ""} onChange={handleChange} />

     <label>Date sortie</label>
     <input type="date" name="date_sortie" value={form.date_sortie ?? ""} onChange={handleChange} />

     <label>Titulaire</label>
     <input name="titulaire" value={form.titulaire ?? ""} onChange={handleChange} />

     <label>Inventeur</label>
     <input name="nom_inventeur" value={form.nom_inventeur ?? ""} onChange={handleChange} />

     <label>Déposant</label>
     <input name="nom_deposant" value={form.nom_deposant ?? ""} onChange={handleChange} />

      <div className="form-group">
        <label>Statut</label>
        <select name="statut" value={form.statut} onChange={handleChange}>
          <option value="EN_ATTENTE">EN ATTENTE</option>
          <option value="ACCEPTER">ACCEPTER</option>
          <option value="REFUSER">REFUSER</option>
        </select>
      </div>
    </div>
    <div className="container_btn">
      <button className="btn-save"type="submit" onClick={handleSubmit}>Enregistrer</button>
    </div>
  </div>
  </div>
  );
}