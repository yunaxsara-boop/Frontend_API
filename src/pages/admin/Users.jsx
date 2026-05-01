import { useEffect, useState } from "react";
import Datatable2 from "../../components/Datatable2";
import UserForm from "./UserForm";
import { getUsers, addUser, updateUser, deleteUser } from "../../features/users/userApi";

export default function Users() {
  const [data, setData]         = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getUsers();
      setData(res);
    } catch {
      setError("Erreur chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (user) => {
    try {
      setError("");
      if (editUser) {
        await updateUser(editUser.id, user);
        setEditUser(null);
      } else {
        await addUser(user);
      }
      await load();
    } catch (err) {
      console.error("ERREUR:", err.response?.data);
      setError(JSON.stringify(err.response?.data) || "Erreur enregistrement.");
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteUser(row.id);
      await load();
    } catch {
      setError("Erreur suppression.");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <>
      {error && <p style={{ color: "red", padding: "8px 16px" }}>{error}</p>}
      <Datatable2
        title="Gestion des utilisateurs"
        exportName="utilisateurs"
        data={data}
        columns={[
  { key: "username", label: "Nom utilisateur" },
  { key: "email",    label: "Email" },
  {
    key: "groups",
    label: "Groupe",
    render: (val) =>
      Array.isArray(val) && val.length > 0 ? val[0] : "—",
  },
  { key: "date_ajout", label: "Date ajout" },
]}
        form={
          <UserForm
            key={editUser ? editUser.id : "new"}
            editData={editUser}
            onSubmit={handleSubmit}
            onCancel={() => setEditUser(null)}
          />
        }
        onEdit={(row) => setEditUser(row)}
        onDelete={handleDelete}
      />
    </>
  );
}