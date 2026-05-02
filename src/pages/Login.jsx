import React, { useState } from "react";
import "./Login.css";
import user_icon from "../assets/person.png";
import password_icon from "../assets/password.png";
import Background from "../components/Background";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin =async (e) => {
    e.preventDefault()
    await login(email, password)
  }
  return (
    <Background>
      <div className="login-container">
        <div className="login-header">
          <h2>Connexion</h2>
          <div className="underline"></div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="login-inputs">
          <div className="input">
            <img src={user_icon} alt="user" />
            <input
              type="text"
              placeholder="Nom utilisateur"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={password_icon} alt="password" />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="submit-container">
          <button className="submit-btn" onClick={handleLogin}>
            SE CONNECTER
          </button>
        </div>
      </div>
    </Background>
  );
}