import {api} from "/src/contexts/AuthContext.jsx";


export const getDocuments = async (id) => {
  const res = await api.get ("documents/");
  return res.data.results ?? res.data;
// "si res.data.results existe → utilise res.data.results"
// "si res.data.results est null ou undefined → utilise res.data"
};


export const addDocument = async (data) => {
  const isFormData = data instanceof FormData;
  const res = await api.post("documents/", data,{
    headers: isFormData ? 
    {"Content-Type": "multipart/form-data"} 
    : {"Content-Type": "application/json"}
  });
  return res.data;
  alert ("document ajouter !")
};


export const updateDocument = async (id, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.patch(`documents/${id}/`, data, {
    headers: isFormData ?
    {"Content-Type": "multipart/form-data"}
    : {"Content-Type": "application/json"}
   },);
  return res.data;
};


export const deleteDocument = async (id) => {
  await api.delete(`documents/${id}/`);
};


export const getDocumentById = async (id) => {
  const res = await api.get (`documents/${id}/`);
  return res.data;
};

export const getDocumentsByBrevet = async (brevetId) => {
  const res = await api.get(`documents/?brevet=${brevetId}`);
  return res.data.results ?? res.data;
};