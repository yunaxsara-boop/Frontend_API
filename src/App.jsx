import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { RespBrevetsProvider } from "./pages/responsable/RespBrevetsContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

/* ── ADMIN ── */
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers     from "./pages/admin/Users";

/* ── AGENT ── */
import AgentDashboard from "./pages/agent/Dashboard";
import AgentBrevets   from "./pages/agent/Brevets";
import AddBrevet      from "./pages/agent/AddBrevet";
import EditBrevet     from "./pages/agent/EditBrevet";
import ViewBrevet     from "./pages/agent/ViewBrevet";
import AgentDemandes  from "./pages/agent/Demandes";
import AgentPaiements from "./pages/agent/Paiements";
import AgentRecours   from "./pages/agent/Recours";
import AgentDocuments from "./pages/agent/Documents";

/* ── RESPONSABLE ── */
import RespDashboard  from "./pages/responsable/Dashboard";
import RespBrevets    from "./pages/responsable/Brevets";
import RespAddBrevet  from "./pages/responsable/AddBrevet";
import RespEditBrevet from "./pages/responsable/EditBrevet";
import RespViewBrevet from "./pages/responsable/ViewBrevet";
import RespDemandes   from "./pages/responsable/Demandes";
import RespPaiements  from "./pages/responsable/Paiements";
import RespRecours    from "./pages/responsable/Recours";
import RespDocuments  from "./pages/responsable/Documents";

/* ── DIRECTEUR ── */
import DirDashboard from "./pages/directeur/Dashboard";
import DirBrevets   from "./pages/directeur/Brevets";
import DirPaiements from "./pages/directeur/Paiements";
import DirDocuments from "./pages/directeur/Documents";
import DirRecours   from "./pages/directeur/Recours";

const ROLE_HOME = {
  admin:       "/admin",
  agent:       "/agent",
  responsable: "/responsable",
  directeur:   "/directeur",
};

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
}

const RespBrevetRoute = ({ element }) => (
  <ProtectedRoute roles={["responsable"]}>
    <RespBrevetsProvider>
      <Layout>{element}</Layout>
    </RespBrevetsProvider>
  </ProtectedRoute>
);

export default function App() {
  return (
    <NotificationProvider>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/"      element={<HomeRedirect />} />

        {/* ── ADMIN ── */}
        <Route path="/admin"       element={<ProtectedRoute roles={["admin"]}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><Layout><AdminUsers /></Layout></ProtectedRoute>} />

        {/* ── AGENT ── */}
        <Route path="/agent"                  element={<ProtectedRoute roles={["agent"]}><Layout><AgentDashboard /></Layout></ProtectedRoute>} />
        <Route path="/agent/brevets"          element={<ProtectedRoute roles={["agent"]}><Layout><AgentBrevets /></Layout></ProtectedRoute>} />
        <Route path="/agent/brevets/add"      element={<ProtectedRoute roles={["agent"]}><Layout><AddBrevet /></Layout></ProtectedRoute>} />
        <Route path="/agent/brevets/edit/:id" element={<ProtectedRoute roles={["agent"]}><Layout><EditBrevet /></Layout></ProtectedRoute>} />
        <Route path="/agent/brevets/view/:id" element={<ProtectedRoute roles={["agent"]}><Layout><ViewBrevet /></Layout></ProtectedRoute>} />
        <Route path="/agent/demandes"         element={<ProtectedRoute roles={["agent"]}><Layout><AgentDemandes /></Layout></ProtectedRoute>} />
        <Route path="/agent/paiements"        element={<ProtectedRoute roles={["agent"]}><Layout><AgentPaiements /></Layout></ProtectedRoute>} />
        <Route path="/agent/recours"          element={<ProtectedRoute roles={["agent"]}><Layout><AgentRecours /></Layout></ProtectedRoute>} />
        <Route path="/agent/documents"        element={<ProtectedRoute roles={["agent"]}><Layout><AgentDocuments /></Layout></ProtectedRoute>} />

        {/* ── RESPONSABLE ── */}
        <Route path="/responsable"           element={<ProtectedRoute roles={["responsable"]}><Layout><RespDashboard /></Layout></ProtectedRoute>} />
        <Route path="/responsable/demandes"  element={<ProtectedRoute roles={["responsable"]}><Layout><RespDemandes /></Layout></ProtectedRoute>} />
        <Route path="/responsable/paiements" element={<ProtectedRoute roles={["responsable"]}><Layout><RespPaiements /></Layout></ProtectedRoute>} />
        <Route path="/responsable/recours"   element={<ProtectedRoute roles={["responsable"]}><Layout><RespRecours /></Layout></ProtectedRoute>} />
        <Route path="/responsable/documents" element={<ProtectedRoute roles={["responsable"]}><Layout><RespDocuments /></Layout></ProtectedRoute>} />
        <Route path="/responsable/brevets"          element={<RespBrevetRoute element={<RespBrevets />} />} />
        <Route path="/responsable/brevets/add"      element={<RespBrevetRoute element={<RespAddBrevet />} />} />
        <Route path="/responsable/brevets/edit/:id" element={<RespBrevetRoute element={<RespEditBrevet />} />} />
        <Route path="/responsable/brevets/view/:id" element={<RespBrevetRoute element={<RespViewBrevet />} />} />

        {/* ── DIRECTEUR ── */}
        <Route path="/directeur"           element={<ProtectedRoute roles={["directeur"]}><Layout><DirDashboard /></Layout></ProtectedRoute>} />
        <Route path="/directeur/brevets"   element={<ProtectedRoute roles={["directeur"]}><Layout><DirBrevets /></Layout></ProtectedRoute>} />
        <Route path="/directeur/paiements" element={<ProtectedRoute roles={["directeur"]}><Layout><DirPaiements /></Layout></ProtectedRoute>} />
        <Route path="/directeur/documents" element={<ProtectedRoute roles={["directeur"]}><Layout><DirDocuments /></Layout></ProtectedRoute>} />
        <Route path="/directeur/recours"   element={<ProtectedRoute roles={["directeur"]}><Layout><DirRecours /></Layout></ProtectedRoute>} />

        {/* ERRORS */}
        <Route path="/unauthorized" element={<div style={{ padding: 40 }}>Accès refusé</div>} />
        <Route path="*"             element={<Navigate to="/" replace />} />

      </Routes>
    </NotificationProvider>
  );
}