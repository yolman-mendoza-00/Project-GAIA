import React, { useState, useEffect } from "react";
import "../assets/css/calendar.css";

import dayjs from "dayjs";

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function Calendar({ retosActualizados, onRetosActualizadosLeidos }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [retosRealizados, setRetosRealizados] = useState([]);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const goToPreviousMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    const isoDate = dayjs(clickedDate).format("YYYY-MM-DD"); // YYYY-MM-DD
    fetchRetosRealizados(isoDate);
  };

  const fetchRetosRealizados = async (fecha) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/retos-realizados?usuario=${usuario.id}&fecha=${fecha}`
      );
      const data = await res.json();

      if (data.retos_realizados) {
        setRetosRealizados(data.retos_realizados);
      } else {
        setRetosRealizados([]);
      }
    } catch (error) {
      console.error("Error al obtener retos realizados:", error);
      setRetosRealizados([]);
    }
  };

  // ⏱️ Si se guarda un reto, vuelve a cargar la fecha seleccionada
  useEffect(() => {
    if (retosActualizados && selectedDate) {
      const isoDate = dayjs(selectedDate).format("YYYY-MM-DD");
      fetchRetosRealizados(isoDate);
      onRetosActualizadosLeidos(); // Marcamos como leídos
    }
  }, [retosActualizados]);



  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const days = [];

  for (let i = 0; i < firstDayIndex; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    const thisDate = new Date(year, month, d);

    days.push(
      <div
        key={d}
        className={`calendar-day ${isToday ? "today" : ""} ${selectedDate &&
          thisDate.toDateString() === selectedDate.toDateString()
          ? "selected"
          : ""
          }`}
        onClick={() => handleDayClick(d)}
      >
        {d}
      </div>
    );
  }

  return (
    <div className="calendar-component">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth}>&lt;</button>
        <span>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
        </span>
        <button onClick={goToNextMonth}>&gt;</button>
      </div>

      <div className="calendar-weekdays">
        {daysOfWeek.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">{days}</div>

      {selectedDate && (
        <div className="retos-realizados">
          <h3>
            Retos realizados el{" "}
            {selectedDate.toLocaleDateString("es-CO", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          {retosRealizados.length > 0 ? (
            <ul>
              {retosRealizados.map((reto, index) => (
                <li key={index} className="reto-item">
                  <span className="reto-text">{reto.descripcion}</span>
                  <span className="reto-emoji">{reto.emoji}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay retos registrados para esta fecha.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Calendar;
