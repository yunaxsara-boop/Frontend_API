import { api } from "/src/contexts/AuthContext.jsx";

export const getBrevets = async () => {
  const res = await api.get("brevets/");
  return res.data.results ?? res.data;
};

export const getBrevetById = async (id) => {
  const res = await api.get(`brevets/${id}/`);
  return res.data;
};

export const addBrevet = async (brevet) => {
  const res = await api.post("brevets/", brevet);
  return res.data; // ✅ alert() supprimé (était après return = code mort)
};

export const updateBrevet = async (id, brevet) => {
  const res = await api.patch(`brevets/${id}/`, brevet);
  return res.data;
};

export const deleteBrevet = async (id) => {
  await api.delete(`brevets/${id}/`);
};
export const getDemandesDisponibles = async () => {
  const response = await api.get("/brevets/demandes-disponibles/");
  return response.data;
};
