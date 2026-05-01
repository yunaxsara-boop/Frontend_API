import { api } from "../../contexts/AuthContext.jsx";

export const getUsers = async () => {
  const res = await api.get("users/utilisateurs/");
  return res.data.results ?? res.data;
};

export const addUser = async (user) => {
  const res = await api.post("users/utilisateurs/", user);
  return res.data;
};

export const updateUser = async (id, user) => {
  const res = await api.patch(`users/utilisateurs/${id}/`, user);
  return res.data;
};

export const deleteUser = async (id) => {
  await api.delete(`users/utilisateurs/${id}/`);
};