import { api } from "/src/contexts/AuthContext.jsx";

export const getDemandes = async () => {
  const res = await api.get("demandes/");
  return res.data.results ?? res.data;
};

export const getDemandeById = async (id) => {
  const res = await api.get(`demandes/${id}/`);
  return res.data;
};

export const addDemande = async (demande) => {
  const res = await api.post("demandes/", demande);
  return res.data;
};

export const updateDemande = async (id, demande) => {
  const res = await api.patch(`demandes/${id}/`, demande);
  return res.data;
};

export const deleteDemande = async (id) => {
  await api.delete(`demandes/${id}/`);
};

export const validerDemande = async (id) => {
  const res = await api.post(`demandes/${id}/valider_demande/`);
  return res.data;
};

export const refuserDemande = async (id) => {
  const res = await api.post(`demandes/${id}/refuser_demande/`);
  return res.data;
};