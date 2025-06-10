import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import oculto from "../assets/img/oculto.png";
import visible from "../assets/img/visible.png";


const Login = ({ onSwitch }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      enqueueSnackbar("Debes completar todos los campos.", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        enqueueSnackbar(data.error || "Error al iniciar sesión.", { variant: "error" });
      } else {
        enqueueSnackbar("Inicio de sesión exitoso", { variant: "success" });
        localStorage.setItem("usuario", JSON.stringify(data.user));
        navigate("/main");
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Ocurrió un error de red.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Inicia sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="toggle-password-wrapper">
            <button2
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img
                src={showPassword ? oculto : visible}
                alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="eye-icon"
              />

              {showPassword ? "Hide" : "Show"}
            </button2>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Iniciando..." : "Inicia"}
        </button>

        <div className="register-link">
          ¿Aún no tienes cuenta?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitch(); }}>
            Regístrate
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
