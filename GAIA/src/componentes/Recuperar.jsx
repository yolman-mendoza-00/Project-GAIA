import React from 'react';
import '../assets/css/Recuperar.css';

const Recuperar = () => {
  return (
    <div className="recuperar-wrapper">
      <div className="recuperar-card">
        <h1>🔐 Recuperar contraseña</h1>
        <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.</p>

        <form className="formulario">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="tucorreo@ejemplo.com"
            required
          />
          <button type="submit" onClick={(e) => e.preventDefault()}>
            Recuperar contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default Recuperar;
