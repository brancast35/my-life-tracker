import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

function obtenerFechaHoy() {
  return new Date().toISOString().split("T")[0];
}

function formatearFecha(fechaStr) {
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
}

function nombreMesAnio(fecha) {
  return fecha
    .toLocaleDateString("es-PE", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());
}

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function Calendario() {
  const [habitos] = useLocalStorage("habitos", []);
  const [objetivos] = useLocalStorage("objetivos", []);
  const [movimientos] = useLocalStorage("movimientos", []);
  const [historialEntrenamiento] = useLocalStorage("historialEntrenamiento", []);

  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const hoy = obtenerFechaHoy();

  function cambiarMes(delta) {
    const nuevo = new Date(mesActual);
    nuevo.setDate(1);
    nuevo.setMonth(nuevo.getMonth() + delta);
    setMesActual(nuevo);
    setDiaSeleccionado(null);
  }

  function obtenerDiasDelMes() {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasEnMes = ultimoDia.getDate();

    let diaSemanaInicio = primerDia.getDay(); // 0=domingo
    diaSemanaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1; // convertir a que lunes=0

    const dias = [];
    for (let i = 0; i < diaSemanaInicio; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = new Date(year, month, d);
      dias.push(fecha.toISOString().split("T")[0]);
    }
    return dias;
  }

  function obtenerActividadDelDia(fecha) {
    const habitosCompletados = habitos.filter((h) =>
      h.fechasCompletado.includes(fecha)
    );
    const movimientosDelDia = movimientos.filter((m) => m.fecha === fecha);
    const entrenamientosDelDia = historialEntrenamiento.filter(
      (s) => s.fecha === fecha
    );
    const objetivosConVencimiento = objetivos.filter(
      (o) => o.fechaLimite === fecha
    );

    return {
      habitosCompletados,
      movimientosDelDia,
      entrenamientosDelDia,
      objetivosConVencimiento,
    };
  }

  const dias = obtenerDiasDelMes();
  const actividadSeleccionada = diaSeleccionado
    ? obtenerActividadDelDia(diaSeleccionado)
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Calendario</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Vista combinada de toda tu actividad
      </p>

      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => cambiarMes(-1)}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
          >
            ← Anterior
          </button>
          <p className="font-semibold text-slate-800">
            {nombreMesAnio(mesActual)}
          </p>
          <button
            onClick={() => cambiarMes(1)}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
          >
            Siguiente →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {diasSemana.map((d) => (
            <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dias.map((fecha, index) => {
            if (fecha === null) {
              return <div key={`vacio-${index}`} />;
            }

            const actividad = obtenerActividadDelDia(fecha);
            const esHoy = fecha === hoy;
            const esSeleccionado = fecha === diaSeleccionado;
            const numeroDia = fecha.split("-")[2];

            const hayHabitos = actividad.habitosCompletados.length > 0;
            const hayFinanzas = actividad.movimientosDelDia.length > 0;
            const hayEntrenamiento = actividad.entrenamientosDelDia.length > 0;
            const hayObjetivo = actividad.objetivosConVencimiento.length > 0;

            return (
              <button
                key={fecha}
                onClick={() => setDiaSeleccionado(fecha)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative transition-colors ${
                  esSeleccionado
                    ? "bg-blue-600 text-white"
                    : esHoy
                    ? "bg-blue-100 text-blue-700 font-bold"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <span>{numeroDia}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {hayHabitos && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  {hayFinanzas && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  {hayEntrenamiento && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                  {hayObjetivo && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Hábitos
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Finanzas
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Entrenamiento
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Objetivo vence
          </span>
        </div>
      </div>

      {diaSeleccionado && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 mt-4">
          <p className="font-semibold text-slate-800 mb-3">
            {formatearFecha(diaSeleccionado)}
          </p>

          {actividadSeleccionada.habitosCompletados.length === 0 &&
            actividadSeleccionada.movimientosDelDia.length === 0 &&
            actividadSeleccionada.entrenamientosDelDia.length === 0 &&
            actividadSeleccionada.objetivosConVencimiento.length === 0 && (
              <p className="text-slate-400 text-sm">Sin actividad registrada este día.</p>
            )}

          {actividadSeleccionada.habitosCompletados.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-green-600 font-medium mb-1">✅ Hábitos completados</p>
              {actividadSeleccionada.habitosCompletados.map((h) => (
                <p key={h.id} className="text-sm text-slate-600">• {h.nombre}</p>
              ))}
            </div>
          )}

          {actividadSeleccionada.movimientosDelDia.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-orange-600 font-medium mb-1">💰 Movimientos financieros</p>
              {actividadSeleccionada.movimientosDelDia.map((m) => (
                <p key={m.id} className="text-sm text-slate-600">
                  • {m.categoria} — {m.tipo === "ingreso" ? "+" : "-"} S/ {m.monto.toFixed(2)}
                </p>
              ))}
            </div>
          )}

          {actividadSeleccionada.entrenamientosDelDia.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-purple-600 font-medium mb-1">💪 Entrenamiento</p>
              {actividadSeleccionada.entrenamientosDelDia.map((s) => (
                <p key={s.id} className="text-sm text-slate-600">• {s.rutinaNombre}</p>
              ))}
            </div>
          )}

          {actividadSeleccionada.objetivosConVencimiento.length > 0 && (
            <div>
              <p className="text-xs text-red-600 font-medium mb-1">🎯 Objetivos con vencimiento</p>
              {actividadSeleccionada.objetivosConVencimiento.map((o) => (
                <p key={o.id} className="text-sm text-slate-600">• {o.nombre}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Calendario;