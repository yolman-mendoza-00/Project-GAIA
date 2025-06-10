import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import "../assets/css/auth.css";
import "../assets/css/login.css";
import "../assets/css/signUp.css";

import PlanetLogin from "../assets/img/planet.png";
import PlanetRegister from "../assets/img/Planet2.png";

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const toggleForm = () => setIsRegistering(!isRegistering);

  return (
    <div className={`auth-container ${isRegistering ? "register-mode" : "login-mode"}`}>
      {/* Imagen */}
      <div className="image-section-auth">
        <img
          src={isRegistering ? PlanetRegister : PlanetLogin}
          alt="Planeta"
          className="auth-image"
        />
      </div>

      {/* Formulario */}
      <div className="form-section-auth">
        {isRegistering ? (
          <SignUp onSwitch={toggleForm} />
        ) : (
          <Login onSwitch={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default Auth;

