import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ✅ mapping groupe Django → role frontend
const GROUP_TO_ROLE = {
  "admin":        "admin",
  "agent":        "agent",
  "responsable":  "responsable",
  "directeur":    "directeur",
};

const ROLE_HOME = {
  admin:       "/admin",
  agent:       "/agent",
  responsable: "/responsable",
  directeur:   "/directeur",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser]   = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email, password) => {
    setError("");
    try {
      const res = await api.post("users/login/", { username: email, password });
      localStorage.setItem("token", res.data.token);

      const me = await api.get("users/me/");
      console.log("me.data:", me.data);

      let role = null;

      // ✅ superuser ou is_staff → role admin automatiquement
      if (me.data.is_superuser || me.data.is_staff) {
        role = "admin";
      } else {
        // ✅ sinon on lit le groupe Django
        const djangoGroup = (me.data.groups?.[0] || "").toLowerCase();
        role = GROUP_TO_ROLE[djangoGroup] || null;
      }

      console.log("role détecté:", role);

      if (!role) {
        setError("Aucun rôle assigné à ce compte.");
        localStorage.removeItem("token");
        return;
      }

      const userData = {
        email,
        role,
        id:           me.data.id,
        is_superuser: me.data.is_superuser,
        is_staff:     me.data.is_staff,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate(ROLE_HOME[role] || "/");

    } catch (err) {
      console.log(err);
      setError("Identifiants incorrects.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}