import { useState, useEffect } from "react";
import "./UserForm.css";

const GROUPES = ["admin", "agent", "responsable", "directeur"];

export default function UserForm({ onSubmit, editData, onCancel }) {
  const emptyForm = {
    username: "",
    email:    "",
    password: "",
    password_confirm: "",
    groups:   [],
  };

  const [form, setForm]       = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        username:         editData.username ?? "",
        email:            editData.email    ?? "",
        password:         "",
        password_confirm: "",
        groups:           editData.groups   ?? [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGroupChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, groups: val ? [val] : [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!editData && !form.password) {
      setError("Le mot de passe est obligatoire.");
      return;
    }
    if (form.password && form.password !== form.password_confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password && form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username,
        email:    form.email,
        groups:   form.groups,
        ...(form.password && {
          password:         form.password,
          password_confirm: form.password_confirm,
        }),
      };
      await onSubmit(payload);
      if (!editData) setForm(emptyForm);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.password_confirm) {
        setError(data.password_confirm[0]);
      } else if (data?.password) {
        setError(data.password[0]);
      } else {
        setError("Erreur lors de l'enregistrement.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    if (onCancel) onCancel();
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3>{editData ? "Modifier utilisateur" : "Ajouter utilisateur"}</h3>

      {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

      <label>Nom d'utilisateur</label>
      <input
        name="username"
        placeholder="Nom d'utilisateur"
        value={form.username}
        onChange={handleChange}
        required
      />

      <label>Email</label>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <label>{editData ? "Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}</label>
      <input
        name="password"
        type="password"
        placeholder="Mot de passe"
        value={form.password}
        onChange={handleChange}
        required={!editData}
      />

      {(form.password || !editData) && (
        <>
          <label>Confirmer le mot de passe</label>
          <input
            name="password_confirm"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={form.password_confirm}
            onChange={handleChange}
            required={!editData || !!form.password}
            style={{
              borderColor:
                form.password_confirm && form.password !== form.password_confirm
                  ? "red"
                  : form.password_confirm && form.password === form.password_confirm
                  ? "green"
                  : "",
            }}
          />
          {form.password_confirm && (
            <small style={{
              color: form.password === form.password_confirm ? "green" : "red",
              fontSize: "12px",
              marginTop: "-8px",
            }}>
              {form.password === form.password_confirm
                ? "✅ Les mots de passe correspondent"
                : "❌ Les mots de passe ne correspondent pas"}
            </small>
          )}
        </>
      )}

      <label>Groupe</label>
      <select
        value={form.groups[0] ?? ""}
        onChange={handleGroupChange}
        required
      >
        <option value="">-- Sélectionner un groupe --</option>
        {GROUPES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : editData ? "Modifier" : "Ajouter"}
      </button>

      {editData && (
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Annuler
        </button>
      )}
    </form>
  );
}