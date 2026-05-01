import { api } from "/src/contexts/AuthContext.jsx";

export const getDocuments = async () => {
  const res = await api.get("documents/");
  return res.data.results ?? res.data;
};

export const addDocument = async (doc) => {
  const formData = buildFormData(doc);
  const res = await api.post("documents/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateDocument = async (id, doc) => {
  const formData = buildFormData(doc);
  const res = await api.patch(`documents/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteDocument = async (id) => {
  await api.delete(`documents/${id}/`);
};

export const downloadDocument = async (id) => {
  const res = await api.get(`documents/${id}/download/`, {
    responseType: "blob",
  });
  return res;
};

function buildFormData(doc) {
  const formData = new FormData();
  Object.entries(doc).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
}