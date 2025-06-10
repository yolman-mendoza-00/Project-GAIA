import React, { useState } from "react";
import { createPortal } from "react-dom";
import "../assets/css/Main.css";

import planetImg from "../assets/img/Planeta.png";
import defaultAvatar from "../assets/img/user.png";
import habitantesIcon from "../assets/img/habitantes.png";
import progresoIcon from "../assets/img/progreso.png";

import Calendar from "./Calendar";
import RegistroRetos from "./RegistroRetos";

// Modal para editar usuario
function UsuarioModal({ usuario, onClose }) {
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [imagen, setImagen] = useState(usuario?.imagen || defaultAvatar);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagen(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const guardarCambios = () => {
    const actualizado = { ...usuario, nombre, imagen };
    localStorage.setItem("usuario", JSON.stringify(actualizado));
    onClose();
    window.location.reload(); // Refresca para ver los cambios
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Perfil</h2>
        <label>
          Nombre:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>

        <label>
          Imagen de perfil:
          <input type="file" accept="image/*" onChange={handleImagenChange} />
        </label>
        {imagen && (
          <img
            src={imagen}
            alt="Vista previa"
            style={{ width: "100px", height: "100px", borderRadius: "50%", marginTop: "8px" }}
          />
        )}

        <div className="modal-buttons">
          <button onClick={guardarCambios}>Guardar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Modal para configuración (idioma y tema)
function ConfigModal({ idiomaInicial = "es", temaInicial = "claro", onClose, onGuardar }) {
  const [idioma, setIdioma] = useState(idiomaInicial);
  const [tema, setTema] = useState(temaInicial);

  const guardarCambios = () => {
    onGuardar({ idioma, tema });
    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Configuración</h2>

        <div className="modal-option">
          <label htmlFor="language-select">Idioma</label>
          <select
            id="language-select"
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>

        <div className="modal-option">
          <label>Tema</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="tema"
                value="claro"
                checked={tema === "claro"}
                onChange={() => setTema("claro")}
              />{" "}
              Claro
            </label>
            <label>
              <input
                type="radio"
                name="tema"
                value="oscuro"
                checked={tema === "oscuro"}
                onChange={() => setTema("oscuro")}
              />{" "}
              Oscuro
            </label>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="confirm" onClick={guardarCambios}>Guardar</button>
          <button className="cancel" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Main() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [mostrarConfigModal, setMostrarConfigModal] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Carga configuración guardada o default
  const [config, setConfig] = useState(() => {
    const confGuardada = JSON.parse(localStorage.getItem("configuracion"));
    return confGuardada || { idioma: "es", tema: "claro" };
  });

  return (
    <div className="container">
      {/* Panel Izquierdo */}
      <div className="left-panel">
        <h2>Tu planeta</h2>

        <div className="section-banner">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`star star-${i + 1}`}>
              <div className="curved-corner-star">
                <div className="corner-bottomright" />
                <div className="corner-bottomleft" />
              </div>
              <div className="curved-corner-star">
                <div className="corner-topright" />
                <div className="corner-topleft" />
              </div>
            </div>
          ))}
        </div>

        <div className="stats">
          <div className="stat-item">
            <img src={habitantesIcon} alt="Habitantes" className="stat-icon" />
            <div>
              <p className="bold">Habitantes</p>
              <p className="population">8,622,898,362</p>
            </div>
          </div>

          <div className="stat-item">
            <img src={progresoIcon} alt="Progreso" className="stat-icon" />
            <div style={{ width: "100%" }}>
              <p className="bold mt-2">Progreso</p>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: "75%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Central */}
      <div className="center-panel">
        <Calendar />
      </div>

      {/* Panel Derecho */}
      <div className="right-panel">
        <div className="cardUser">
          <div className="user-info">
            <div>
              <p className="bold">
                {usuario ? `Bienvenido/a ${usuario.nombre}` : "Bienvenida Invitado"}
              </p>
            </div>

            <div className="avatar-wrapper" onClick={() => setMostrarModal(true)}>
              <img
                className="avatar"
                src={usuario?.imagen || defaultAvatar}
                alt="avatar"
              />
              <div className="edit-icon">✏️</div>
            </div>
          </div>

          <div className="buttons">
            <button onClick={() => setMostrarConfigModal(true)}>
              ⚙️ Configuraciones
            </button>
          </div>
        </div>

        <RegistroRetos />
      </div>

      {mostrarModal && (
        <UsuarioModal usuario={usuario} onClose={() => setMostrarModal(false)} />
      )}

      {mostrarConfigModal && (
        <ConfigModal
          idiomaInicial={config.idioma}
          temaInicial={config.tema}
          onClose={() => setMostrarConfigModal(false)}
          onGuardar={(nuevaConfig) => {
            setConfig(nuevaConfig);
            localStorage.setItem("configuracion", JSON.stringify(nuevaConfig));
            setMostrarConfigModal(false);
          }}
        />
      )}
    </div>
  );
}
