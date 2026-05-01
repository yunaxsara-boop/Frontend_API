import { api } from "/src/contexts/AuthContext.jsx";

export const getRecours = async () => {
  const res = await api.get("recours/");
  return res.data.results ?? res.data;
};

export const getRecoursById = async (id) => {
  const res = await api.get(`recours/${id}/`);
  return res.data;
};

export const addRecours = async (recours) => {
  const res = await api.post("recours/", recours);
  return res.data;
};

export const updateRecours = async (id, recours) => {
  const res = await api.patch(`recours/${id}/`, recours);
  return res.data;
};

export const deleteRecours = async (id) => {
  await api.delete(`recours/${id}/`);
};

export const traiterRecours = async (id, statut) => {
  const res = await api.post(`recours/${id}/traiter_recours/`, { statut });
  return res.data;
};