import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { api } from "./AuthContext";

const NotificationContext = createContext(null);

// Détecte le type de notif selon le message pour garder les icônes/couleurs du Topbar
function detectType(message = "") {
  const m = message.toLowerCase();
  if (m.includes("demande")) return "demande";
  if (m.includes("brevet"))  return "brevet";
  if (m.includes("paiement")) return "warning";
  if (m.includes("document")) return "document";
  if (m.includes("recours"))  return "recours";
  if (m.includes("validée") || m.includes("créée")) return "success";
  if (m.includes("refusée")) return "warning";
  return "success";
}

// Formate la date en "Il y a X min/h/j"
function formatTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return "À l'instant";
  if (mins < 60)  return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Hier" : `Il y a ${days} jours`;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Transforme une notif backend → format attendu par Topbar
  function transform(n) {
    return {
      id:      n.id_notif,
      type:    detectType(n.message),
      title:   n.message.split(".")[0] || "Notification",
      message: n.message,
      time:    formatTime(n.date_notif),
      read:    n.etat,
      // link selon le rôle et le contenu
      link:    detectLink(n.message, user?.role),
    };
  }

  function detectLink(message = "", role = "agent") {
    const m = message.toLowerCase();
    const base = `/${role}`;
    if (m.includes("demande"))  return `${base}/demandes`;
    if (m.includes("brevet"))   return `${base}/brevets`;
    if (m.includes("paiement")) return `${base}/paiements`;
    if (m.includes("document")) return `${base}/documents`;
    if (m.includes("recours"))  return `${base}/recours`;
    return base;
  }

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("notifications/");
      const raw = res.data.results ?? res.data;
      setNotifications(raw.map(transform));
    } catch (err) {
      console.error("Erreur chargement notifications", err);
    }
  }, [user]);

  // Charge au login et toutes les 30 secondes
  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.post(`notifications/${id}/mark_as_read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Erreur mark as read", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post("notifications/mark_all_as_read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Erreur mark all as read", err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}