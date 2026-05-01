import { api } from "/src/contexts/AuthContext.jsx";

export const getPaiements = async () => {
  const res = await api.get("paiements/");
  return res.data.results ?? res.data;
};

export const getPaiementById = async (id) => {
  const res = await api.get(`paiements/${id}/`);
  return res.data;
};

export const addPaiement = async (paiement) => {
  const res = await api.post("paiements/", paiement);
  return res.data;
};

export const updatePaiement = async (id, paiement) => {
  const res = await api.patch(`paiements/${id}/`, paiement);
  return res.data;
};

export const deletePaiement = async (id) => {
  await api.delete(`paiements/${id}/`);
};