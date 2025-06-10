import { createPortal } from "react-dom";
import "../assets/css/Main.css";
import { useEffect, useState } from "react";

import PlanetViewer from "./PlanetViewer";
import defaultAvatar from "../assets/img/user.png";
import habitantesIcon from "../assets/img/habitantes.png";
import progresoIcon from "../assets/img/progreso.png";
import Calendar from "./Calendar";
import RegistroRetos from "./RegistroRetos";

import dayjs from "dayjs";

// Modal para editar usuario
function UsuarioModal({ usuario, onClose }) {
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [email, setEmail] = useState(usuario.email || usuario.correo || "");
  const [password, setPassword] = useState(usuario?.password || "");
  const [imagen, setImagen] = useState(usuario?.imagen || defaultAvatar);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagen(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const guardarCambios = async () => {
    const actualizado = { nombre, correo: email, contraseña: password, foto: imagen };

    try {
      const res = await fetch(`${API_URL}/api/actualizar/usuario/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(actualizado),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar el usuario.");
      }

      const data = await res.json();

      localStorage.setItem("usuario", JSON.stringify(data.usuario || data));
      onClose();
      window.location.reload();

    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  const eliminarCuenta = async () => {
    try {
      const res = await fetch(`${API_URL}/api/eliminar/usuario/${usuario.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la cuenta.");
      }

      // Limpiar datos del cliente
      localStorage.removeItem("usuario");
      onClose();
      window.location.href = "/auth"; // Redirección tras eliminar

    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      alert("Hubo un error al eliminar tu cuenta.");
    }
  };


  return createPortal(
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Editar Perfil</h2>

          <label className="perfil-label">
            Imagen de perfil:
            <input type="file" accept="image/*" onChange={handleImagenChange} />
            {imagen && (
              <img
                src={imagen}
                alt="Vista previa"
                className="preview-imagen"
              />
            )}
          </label>

          <label>
            Nombre:
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Contraseña:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="modal-buttons">
            <button onClick={guardarCambios}>Guardar</button>
            <button onClick={onClose}>Cancelar</button>
          </div>

          <div className="eliminar-cuenta-wrapper">
            <button
              className="btn-eliminar-cuenta"
              onClick={() => setMostrarConfirmacion(true)}
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>

      {mostrarConfirmacion && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <p>¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.</p>
            <div className="modal-botones">
              <button className="btn-aceptar" onClick={eliminarCuenta}>Sí, eliminar</button>
              <button className="btn-cancelar" onClick={() => setMostrarConfirmacion(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

export default function Main() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [mostrarConfigModal, setMostrarConfigModal] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [porcentajeProgreso, setPorcentajeProgreso] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;
  const poblacionMaxima = 8622898362;
  const poblacionActual = Math.floor((porcentajeProgreso / 100) * poblacionMaxima);

  // Estado levantado para sincronizar retos
  const [retosActualizados, setRetosActualizados] = useState(false);

  useEffect(() => {
    const obtenerYActualizarProgreso = async () => {
      if (!usuario?.id) return;

      const hoy = dayjs();
      const esLunes = hoy.day() === 1; // lunes = 1
      const fechaActual = hoy.format("YYYY-MM-DD");

      const ultimaActualizacion = localStorage.getItem("ultimaActualizacionProgreso");

      // Obtener el progreso SIEMPRE
      try {
        const resProgreso = await fetch(`${API_URL}/api/progreso/${usuario.id}`);
        const dataProgreso = await resProgreso.json();
        setPorcentajeProgreso(Number(dataProgreso.progreso || 0));
      } catch (err) {
        console.error("Error al obtener progreso:", err);
      }

      // Solo actualizar si es lunes Y no se ha actualizado hoy
      if (esLunes && ultimaActualizacion !== fechaActual) {
        try {
          const res = await fetch(`${API_URL}/api/progreso/actualizar/${usuario.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fecha: fechaActual }),
          });

          const data = await res.json();

          const nuevoProgreso = data.usuario?.progreso ?? data.progreso ?? 0;
          setPorcentajeProgreso(Number(nuevoProgreso));

          // Guardar la fecha en localStorage para evitar múltiples actualizaciones hoy
          localStorage.setItem("ultimaActualizacionProgreso", fechaActual);
        } catch (error) {
          console.error("Error al actualizar progreso:", error);
        }
      }
    };

    obtenerYActualizarProgreso();
  }, [usuario]);

  // Carga configuración guardada o default
  const [config, setConfig] = useState(() => {
    const confGuardada = JSON.parse(localStorage.getItem("configuracion"));
    return confGuardada || { idioma: "es", tema: "claro" };
  });


  return (
    <div className="container">
      <div className="left-panel">
        <h2>Tu planeta</h2>
        <div className="section-banner">
          <PlanetViewer percentage={porcentajeProgreso} />
        </div>
        <div className="stats">
          <div className="stat-item">
            <img src={habitantesIcon} alt="Habitantes" className="stat-icon" />
            <div>
              <p className="bold">Habitantes</p>
              <p className="population">{poblacionActual.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-item">
            <img src={progresoIcon} alt="Progreso" className="stat-icon" />
            <div style={{ width: "100%" }}>
              <p className="bold mt-2">Progreso</p>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${porcentajeProgreso}%` }}></div>
              </div>
              <div><p>{porcentajeProgreso}%</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Central */}
      <div className="center-panel">
        <Calendar
          retosActualizados={retosActualizados}
          onRetosActualizadosLeidos={() => setRetosActualizados(false)}
        />
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
              <img className="avatar" src={usuario?.imagen || defaultAvatar} alt="avatar" />
              <div className="edit-icon">✏️</div>
            </div>
          </div>
        </div>

        <RegistroRetos onRetosGuardados={() => setRetosActualizados(true)} />
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
