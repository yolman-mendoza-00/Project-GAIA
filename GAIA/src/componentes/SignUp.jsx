import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from 'notistack';

const SignUp = ({ onSwitch }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !email || !password) {
      enqueueSnackbar('Por favor completa todos los campos', { variant: 'warning' });
      return;
    }

    if (!termsAccepted) {
      enqueueSnackbar('Debes aceptar los términos y condiciones', { variant: 'warning' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        enqueueSnackbar(data.error || 'Error al registrar', { variant: 'warning' });
        return;
      }

      enqueueSnackbar(data.message || '¡Registro exitoso!', { variant: 'success' });

      setUser('');
      setEmail('');
      setPassword('');
      setTermsAccepted(false);

      onSwitch(); // Cambia a la vista de login
    } catch (err) {
      enqueueSnackbar('Error al registrar', { variant: 'error' });
      console.error(err);
    }
  };

  return (
    <form className="form-wrapper" onSubmit={handleSubmit}>
      <h2>Regístrate</h2>

      <div className="form-group">
        <label htmlFor="user">Usuario</label>
        <input
          type="text"
          id="user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        <label htmlFor="terms">
          Acepto los <a href="/terminos" target="_blank">Términos de uso</a> y la{" "}
          <a href="/privacidad" target="_blank">Política de privacidad</a>
        </label>
      </div>

      <button type="submit">Registrarse</button>

      <div className="register-link">
        ¿Ya tienes cuenta?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}
        >
          Inicia sesión
        </a>
      </div>
    </form>
  );
};

export default SignUp;
