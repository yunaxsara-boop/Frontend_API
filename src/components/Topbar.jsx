import React, { useState, useRef, useEffect } from "react";
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

export default function Topbar({ collapsed, setCollapsed }) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  // Ferme le panel si clic en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNotifClick(notif) {
    markAsRead(notif.id);
    setPanelOpen(false);
    navigate(notif.link);
  }

  return (
    <div className={`topbar ${collapsed ? "collapsed" : ""}`}>
      <div className="topbarConteneur">

        <div className="topleft">
          <MenuIcon className="menuIcon" onClick={() => setCollapsed(!collapsed)} />
          <span className="logo">Mon espace</span>
        </div>

        <div className="topright">

          {/* SEARCH */}
          <div className="searchContainer">
            <SearchIcon />
            <input type="text" placeholder="Rechercher..." />
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

            {/* PANEL DROPDOWN */}
            {panelOpen && (
              <div className="notifPanel">

                {/* HEADER */}
                <div className="notifPanelHeader">
                  <div className="notifPanelTitle">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notifBadgeCount">{unreadCount} nouvelles</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button className="markAllBtn" onClick={markAllAsRead}>
                      Tout lire
                    </button>
                  )}
                </div>

                {/* LISTE */}
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

                          <div
                            className="notifIcon"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            <span>{cfg.emoji}</span>
                          </div>

                          <div className="notifContent">
                            <p className="notifTitle">{notif.title}</p>
                            <p className="notifMessage">{notif.message}</p>
                            <p className="notifTime">{notif.time}</p>
                          </div>

                          <div className="notifArrow" style={{ color: cfg.color }}>
                            ›
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* FOOTER */}
                <div className="notifPanelFooter">
                  <span>
                    {notifications.filter((n) => n.read).length} / {notifications.length} lues
                  </span>
                </div>

              </div>
            )}
          </div>

          {/* USER */}
          <div className="userContainer">
            <AccountCircleIcon className="userIcon" />
            <div className="userInfo">
              <span className="username">{user?.nom}</span>
              <span className="userRole">{user?.role}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}