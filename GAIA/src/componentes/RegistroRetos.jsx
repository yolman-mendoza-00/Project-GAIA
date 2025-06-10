import React, { useState, useEffect } from "react";
import "../assets/css/registroRetos.css";
import { useSnackbar } from "notistack";

import dayjs from 'dayjs';

export default function RegistroRetos({ onRetosGuardados }) {
  const ahora = dayjs();
  const [retos, setRetos] = useState([]);
  const [completados, setCompletados] = useState({});
  const [bloqueados, setBloqueados] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [descripcionReto, setDescripcionReto] = useState("");

  const { enqueueSnackbar } = useSnackbar();
  const API_URL = import.meta.env.VITE_API_URL;
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const obtenerRetos = async () => {
    if (!usuario) return;

    try {
      let res = await fetch(`${API_URL}/api/retos-diarios?usuario=${usuario.id}`);
      let data = await res.json();

      if (data.retos.length === 0) {
        const asignarRes = await fetch(`${API_URL}/api/retos-diarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario: usuario.id }),
        });
        if (asignarRes.ok) {
          res = await fetch(`${API_URL}/api/retos-diarios?usuario=${usuario.id}`);
          data = await res.json();
        } else {
          const errorData = await asignarRes.json();
          enqueueSnackbar(`Error al asignar retos: ${errorData.error}`, { variant: 'error' });
          return;
        }
      }

      if (data.retos) {
        setRetos(data.retos);

        const completadosObj = {};
        const bloqueadosObj = {};
        data.retos.forEach((reto) => {
          completadosObj[reto.id_reto] = reto.completado || false;
          bloqueadosObj[reto.id_reto] = reto.completado || false;
        });

        setCompletados(completadosObj);
        setBloqueados(bloqueadosObj);
      }
    } catch (error) {
      enqueueSnackbar("Error al obtener retos", { variant: "error" });
      console.error("Error al obtener retos:", error);
    }
  };

  useEffect(() => {
    obtenerRetos();
  }, []);

  const toggleCheckbox = (id) => {
    if (bloqueados[id]) return;

    setCompletados((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const guardarRetosCompletados = async () => {
    if (!usuario) return;

    const nuevosCompletados = Object.entries(completados)
      .filter(([id, hecho]) => hecho && !bloqueados[id])
      .map(([id_reto]) => ({
        id_reto: parseInt(id_reto),
        id_usuario: usuario.id,
        completado: true,
        fecha: ahora.format("YYYY-MM-DD"),//new Date().toLocaleDateString("es-CO"),
      }));

    if (nuevosCompletados.length === 0) {
      enqueueSnackbar("No hay nuevos retos completados para guardar", {
        variant: "info",
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/guardar-retos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registros: nuevosCompletados }),
      });

      if (res.ok) {
        const nuevosBloqueados = { ...bloqueados };
        nuevosCompletados.forEach((r) => {
          nuevosBloqueados[r.id_reto] = true;
        });
        setBloqueados(nuevosBloqueados);

        enqueueSnackbar("Retos guardados correctamente", { variant: "success" });

        // ✅ Notificar al componente padre
        if (onRetosGuardados) {
          onRetosGuardados();
        }
      } else {
        const errorData = await res.json();
        enqueueSnackbar(`Error al guardar: ${errorData.error}`, {
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Error al guardar retos:", err);
      enqueueSnackbar("Error al guardar los retos", { variant: "error" });
    }
  };

  const añadirRetoPersonalizado = async () => {
    if (!descripcionReto.trim()) {
      enqueueSnackbar("La descripción no puede estar vacía", { variant: "warning" });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/retos/personalizado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id,
          descripcion: descripcionReto,
        }),
      });

      if (res.ok) {
        enqueueSnackbar("Reto personalizado añadido", { variant: "success" });
        setMostrarModal(false);
        setDescripcionReto("");
        obtenerRetos();
      } else {
        const data = await res.json();
        enqueueSnackbar(`${data.error}`, { variant: "error" });
      }
    } catch (error) {
      console.error("Error al añadir reto:", error);
      enqueueSnackbar("Error al añadir reto personalizado", { variant: "error" });
    }
  };

  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="reto-container">
      <h2>Registro de Retos</h2>
      <p className="reto-subtitle">¿Qué retos cumpliste hoy?</p>
      <p className="reto-date">{fechaHoy}</p>

      <div className="retos-list">
        {retos.map((reto) => (
          <div className="reto-item" key={reto.id_reto}>
            <div className="reto-left">
              <span className="reto-icon">{reto.emoji}</span>
              <div>
                <span className="reto-title">{reto.categoria}</span>
                <p className="reto-subtext">{reto.descripcion}</p>
              </div>
            </div>
            <input
              type="checkbox"
              className="reto-checkbox"
              checked={!!completados[reto.id_reto]}
              disabled={bloqueados[reto.id_reto]}
              onChange={() => toggleCheckbox(reto.id_reto)}
            />
          </div>
        ))}
      </div>

      <div className="buttons">
        <button onClick={guardarRetosCompletados}>Guardar</button>
        <button onClick={() => setMostrarModal(true)}>Añadir Reto</button>
      </div>

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Nuevo reto personalizado</h3>
            <textarea
              value={descripcionReto}
              onChange={(e) => setDescripcionReto(e.target.value)}
              placeholder="Describe tu reto"
              rows={4}
              style={{ width: "100%", resize: "vertical", marginBottom: "16px" }}
            />
            <div className="modal-buttons">
              <button onClick={añadirRetoPersonalizado}>Guardar</button>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
