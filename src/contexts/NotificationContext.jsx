import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

const NOTIFICATIONS_BY_ROLE = {
  admin: [
    {
      id: "a1",
      type: "user",
      title: "Nouvel utilisateur inscrit",
      message: "Alice Martin vient de rejoindre la plateforme.",
      link: "/admin/users",
      time: "Il y a 2 min",
      read: false,
    },
    {
      id: "a2",
      type: "warning",
      title: "Compte inactif détecté",
      message: "3 comptes agents sont inactifs depuis 30 jours.",
      link: "/admin/users",
      time: "Il y a 1h",
      read: false,
    },
    {
      id: "a3",
      type: "role",
      title: "Changement de rôle",
      message: "Le rôle de Bob Dupont a été modifié en Directeur.",
      link: "/admin/users",
      time: "Il y a 3h",
      read: true,
    },
    {
      id: "a4",
      type: "success",
      title: "Statistiques disponibles",
      message: "Les statistiques mensuelles sont prêtes.",
      link: "/admin",
      time: "Hier",
      read: true,
    },
  ],

  directeur: [
    {
      id: "d1",
      type: "document",
      title: "Nouveau document soumis",
      message: "Un rapport trimestriel a été déposé pour validation.",
      link: "/directeur/documents",
      time: "Il y a 5 min",
      read: false,
    },
    {
      id: "d2",
      type: "recours",
      title: "Recours en attente",
      message: "2 recours nécessitent votre approbation urgente.",
      link: "/directeur/recours",
      time: "Il y a 30 min",
      read: false,
    },
    {
      id: "d3",
      type: "brevet",
      title: "Brevet approuvé",
      message: "Le brevet #BR-042 a été validé avec succès.",
      link: "/directeur/brevets",
      time: "Il y a 2h",
      read: true,
    },
    {
      id: "d4",
      type: "warning",
      title: "Paiement non reçu",
      message: "Un paiement de 3 100 DZD est en suspens.",
      link: "/directeur/paiements",
      time: "Hier",
      read: true,
    },
  ],

  responsable: [
    {
      id: "r1",
      type: "demande",
      title: "Nouvelle demande agent",
      message: "Clara Leroy a soumis une demande de congé.",
      link: "/responsable/demandes",
      time: "Il y a 10 min",
      read: false,
    },
    {
      id: "r2",
      type: "recours",
      title: "Recours soumis",
      message: "Un agent a déposé un recours — à traiter.",
      link: "/responsable/recours",
      time: "Il y a 45 min",
      read: false,
    },
    {
      id: "r3",
      type: "warning",
      title: "Paiement en attente",
      message: "5 paiements de l'équipe sont en suspens.",
      link: "/responsable/paiements",
      time: "Il y a 2h",
      read: false,
    },
    {
      id: "r4",
      type: "document",
      title: "Document expirant",
      message: "Le contrat de David Cohen expire dans 7 jours.",
      link: "/responsable/documents",
      time: "Hier",
      read: true,
    },
  ],

  agent: [
    {
      id: "ag1",
      type: "brevet",
      title: "Statut brevet mis à jour",
      message: "Votre brevet #BR-018 est passé à EN_COURS.",
      link: "/agent/brevets",
      time: "Il y a 15 min",
      read: false,
    },
    {
      id: "ag2",
      type: "warning",
      title: "Paiement dû",
      message: "Une échéance de paiement arrive dans 3 jours.",
      link: "/agent/paiements",
      time: "Il y a 1h",
      read: false,
    },
    {
      id: "ag3",
      type: "success",
      title: "Document approuvé",
      message: "Votre document #DOC-007 a été validé.",
      link: "/agent/documents",
      time: "Il y a 4h",
      read: true,
    },
    {
      id: "ag4",
      type: "recours",
      title: "Recours traité",
      message: "Votre recours a reçu une réponse de la direction.",
      link: "/agent/recours",
      time: "Hier",
      read: true,
    },
  ],
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(
    user && NOTIFICATIONS_BY_ROLE[user.role]
      ? NOTIFICATIONS_BY_ROLE[user.role]
      : []
  );

  // Recharge les notifs quand le rôle change (ex: après login)
  const loadForRole = useCallback((role) => {
    setNotifications(NOTIFICATIONS_BY_ROLE[role] || []);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        loadForRole,
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