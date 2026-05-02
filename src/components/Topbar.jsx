import React, { useState, useRef, useEffect, useMemo } from "react";
import "./Topbar.css";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const TYPE_CONFIG = {
  user:     { emoji: "👤", color: "#7c3aed", bg: "#f3e8ff" },
  warning:  { emoji: "⚠️", color: "#f59e0b", bg: "#fef3c7" },
  role:     { emoji: "🔄", color: "#2196f3", bg: "#e3f2fd" },
  success:  { emoji: "✅", color: "#10b981", bg: "#d1fae5" },
  document: { emoji: "📄", color: "#2196f3", bg: "#e3f2fd" },
  recours:  { emoji: "⚖️", color: "#ef5350", bg: "#ffeaea" },
  brevet:   { emoji: "🏅", color: "#ff7a18", bg: "#fff3e0" },
  demande:  { emoji: "📋", color: "#7c3aed", bg: "#f3e8ff" },
};

// ── Pages accessibles par rôle ──────────────────────────────
const PAGES_BY_ROLE = {
  admin: [
    { label: "Utilisateurs",       path: "/admin/utilisateurs",  emoji: "👤" },
    { label: "Brevets",            path: "/admin/brevets",        emoji: "🏅" },
    { label: "Demandes",           path: "/admin/demandes",       emoji: "📋" },
    { label: "Paiements",          path: "/admin/paiements",      emoji: "💳" },
    { label: "Recours",            path: "/admin/recours",        emoji: "⚖️" },
    { label: "Documents",          path: "/admin/documents",      emoji: "📄" },
  ],
  directeur: [
    { label: "Brevets",            path: "/directeur/brevets",    emoji: "🏅" },
    { label: "Demandes",           path: "/directeur/demandes",   emoji: "📋" },
    { label: "Paiements",          path: "/directeur/paiements",  emoji: "💳" },
    { label: "Recours",            path: "/directeur/recours",    emoji: "⚖️" },
    { label: "Documents",          path: "/directeur/documents",  emoji: "📄" },
  ],
  responsable: [
    { label: "Brevets",            path: "/responsable/brevets",  emoji: "🏅" },
    { label: "Demandes",           path: "/responsable/demandes", emoji: "📋" },
    { label: "Paiements",          path: "/responsable/paiements",emoji: "💳" },
    { label: "Recours",            path: "/responsable/recours",  emoji: "⚖️" },
    { label: "Documents",          path: "/responsable/documents",emoji: "📄" },
  ],
  agent: [
    { label: "Brevets",            path: "/agent/brevets",        emoji: "🏅" },
    { label: "Demandes",           path: "/agent/demandes",       emoji: "📋" },
    { label: "Paiements",          path: "/agent/paiements",      emoji: "💳" },
    { label: "Recours",            path: "/agent/recours",        emoji: "⚖️" },
    { label: "Documents",          path: "/agent/documents",      emoji: "📄" },
  ],
};

export default function Topbar({ collapsed, setCollapsed }) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [panelOpen, setPanelOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen]   = useState(false);
  const panelRef  = useRef(null);
  const searchRef = useRef(null);

  // Ferme le panel notif si clic en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setPanelOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Résultats de recherche filtrés selon le rôle
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !user?.role) return [];
    const pages = PAGES_BY_ROLE[user.role] || [];
    const q = searchQuery.toLowerCase();
    return pages.filter((p) => p.label.toLowerCase().includes(q));
  }, [searchQuery, user?.role]);

  function handleNotifClick(notif) {
    markAsRead(notif.id);
    setPanelOpen(false);
    navigate(notif.link);
  }

  function handleSearchSelect(path) {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(path);
  }

  return (
    <div className={`topbar ${collapsed ? "collapsed" : ""}`}>
      <div className="topbarConteneur">

        <div className="topleft">
          <MenuIcon className="menuIcon" onClick={() => setCollapsed(!collapsed)} />
          <span className="logo">Mon espace</span>
        </div>

        <div className="topright">

          {/* SEARCH GLOBAL */}
          <div className="searchContainer" ref={searchRef} style={{ position: "relative" }}>
            <SearchIcon style={{ color: "#F88F22" }} />
            <input
              type="text"
              placeholder="Rechercher une page..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
            />
            {/* Dropdown résultats */}
            {searchOpen && searchResults.length > 0 && (
              <div className="searchDropdown">
                {searchResults.map((p) => (
                  <div
                    key={p.path}
                    className="searchDropdownItem"
                    onClick={() => handleSearchSelect(p.path)}
                  >
                    <span className="searchDropdownEmoji">{p.emoji}</span>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
            )}
            {searchOpen && searchQuery && searchResults.length === 0 && (
              <div className="searchDropdown">
                <div className="searchDropdownEmpty">Aucun résultat</div>
              </div>
            )}
          </div>

          {/* CLOCHE NOTIFICATIONS */}
          <div className="notifWrapper" ref={panelRef}>
            <div
              className={`topbarIconsContainer ${panelOpen ? "active" : ""}`}
              onClick={() => setPanelOpen((v) => !v)}
            >
              <NotificationsIcon />
              {unreadCount > 0 && (
                <span className="topiconBag">{unreadCount}</span>
              )}
            </div>

            {panelOpen && (
              <div className="notifPanel">
                <div className="notifPanelHeader">
                  <div className="notifPanelTitle">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notifBadgeCount">{unreadCount} nouvelles</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button className="markAllBtn" onClick={markAllAsRead}>Tout lire</button>
                  )}
                </div>

                <div className="notifList">
                  {notifications.length === 0 ? (
                    <div className="notifEmpty">
                      <span className="notifEmptyIcon">🔔</span>
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.success;
                      return (
                        <div
                          key={notif.id}
                          className={`notifItem ${notif.read ? "read" : "unread"}`}
                          onClick={() => handleNotifClick(notif)}
                        >
                          {!notif.read && <div className="unreadDot" />}
                          <div className="notifIcon" style={{ background: cfg.bg, color: cfg.color }}>
                            <span>{cfg.emoji}</span>
                          </div>
                          <div className="notifContent">
                            <p className="notifTitle">{notif.title}</p>
                            <p className="notifMessage">{notif.message}</p>
                            <p className="notifTime">{notif.time}</p>
                          </div>
                          <div className="notifArrow" style={{ color: cfg.color }}>›</div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="notifPanelFooter">
                  <span>{notifications.filter((n) => n.read).length} / {notifications.length} lues</span>
                </div>
              </div>
            )}
          </div>

          {/* USER — affiche le username réel */}
          <div className="userContainer">
            <AccountCircleIcon className="userIcon" />
            <div className="userInfo">
              <span className="username">{user?.username ?? user?.email}</span>
              <span className="userRole">{user?.role}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}