import React from "react";
import "../assets/css/login.css"; 
import visible from "../assets/img/visible.png";


const Login = ({ onSwitch }) => {
  return (
    <div className="containerLogin">


      <div className="form-sectionLogin">
        <div className="form-wrapper">
          <h2>Inicia sesión</h2>
          <form>
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input
                type="email"
                id="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
              />
              <div className="toggle-password-wrapper">
                <button2
                  type="button"
                  className="toggle-password"
                  
                >
                  <img
                    src={visible}
                    alt="Mostrar contraseña"
                    className="eye-icon"
                  />
                  Show
                </button2>
              </div>
            </div>

            <button type="submit" >
              Inicia
            </button>

            <div className="register-link">
              ¿Aún no tienes cuenta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitch(); 
                }}
              >
                Regístrate
              </a>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
