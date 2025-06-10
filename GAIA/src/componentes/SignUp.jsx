import React from 'react';
import '../assets/css/signUp.css';
import visibleIcon from '../assets/img/visible.png';

const SignUp = ({ onSwitch }) => {
  return (
    <form className="form-wrapper">
      <h2>Regístrate</h2>

      <div className="form-group">
        <label htmlFor="user">Usuario</label>
        <input type="text" id="user"  />
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo</label>
        <input type="email" id="email"  />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input type="password" id="password"  />
        <div className="toggle-password-wrapper">
          <button2 type="button" className="toggle-password" >
            <img src={visibleIcon} alt="Mostrar contraseña" className="eye-icon" />
            Show
          </button2>
        </div>
      </div>

      <div className="checkbox-group">
        <input type="checkbox" id="terms"  />
        <label htmlFor="terms">
          Acepto los <a href="/terminos" target="_blank">Términos de uso</a> y la{" "}
          <a href="/privacidad" target="_blank">Política de privacidad</a>
        </label>
      </div>

      <button type="submit" >Registrarse</button>

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
