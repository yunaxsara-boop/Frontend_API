import { api } from "../../contexts/AuthContext.jsx";

export const sendMessage = async (messages) => {
  const res = await api.post("api/chatbot/chat/", { messages }); // ← ajoute api/
  return res.data.reply;
};