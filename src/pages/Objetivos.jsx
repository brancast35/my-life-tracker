import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const prioridadStyles = {
  alta: "bg-red-100 text-red-700",
  media: "bg-yellow-100 text-yellow-700",
  baja: "bg-green-100 text-green-700",
};

function obtenerEstado(progreso) {
  if (progreso >= 100) return { texto: "Completado", clase: "bg-green-500" };
  if (progreso > 0) return { texto: "En progreso", clase: "bg-blue-500" };
  return { texto: "Pendiente", clase: "bg-slate-400" };
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return "Sin fecha";
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
}

function Objetivos() {
  const [objetivos, setObjetivos] = useLocalStorage("objetivos", []);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [fechaNueva, setFechaNueva] = useState("");
  const [prioridadNueva, setPrioridadNueva] = useState("media");
  const [periodoNuevo, setPeriodoNuevo] = useState("mensual");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");

  function agregarObjetivo(e) {
    e.preventDefault();
    if (nombreNuevo.trim() === "") return;

    const nuevoObjetivo = {
      id: Date.now(),
      nombre: nombreNuevo,
      fechaLimite: fechaNueva,
      prioridad: prioridadNueva,
      periodo: periodoNuevo,
      progreso: 0,
    };

    setObjetivos([...objetivos, nuevoObjetivo]);
    setNombreNuevo("");
    setFechaNueva("");
    setPrioridadNueva("media");
    setPeriodoNuevo("mensual");
  }

  function eliminarObjetivo(id) {
    setObjetivos(objetivos.filter((o) => o.id !== id));
  }

  function actualizarProgreso(id, nuevoProgreso) {
    setObjetivos(
      objetivos.map((o) =>
        o.id === id ? { ...o, progreso: Number(nuevoProgreso) } : o
      )
    );
  }

  function iniciarEdicion(objetivo) {
    setEditandoId(objetivo.id);
    setNombreEditado(objetivo.nombre);
  }

  function guardarEdicion(id) {
    if (nombreEditado.trim() === "") return;
    setObjetivos(
      objetivos.map((o) => (o.id === id ? { ...o, nombre: nombreEditado } : o))
    );
    setEditandoId(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Objetivos</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Define tus metas y da seguimiento a tu progreso
      </p>

      <form
        onSubmit={agregarObjetivo}
        className="flex flex-col gap-3 mb-6 bg-white p-4 rounded-lg border border-slate-200"
      >
        <input
          type="text"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          placeholder="Ej: Ahorrar para vacaciones"
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">
              Fecha límite
            </label>
            <input
              type="date"
              value={fechaNueva}
              onChange={(e) => setFechaNueva(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">
              Prioridad
            </label>
            <select
              value={prioridadNueva}
              onChange={(e) => setPrioridadNueva(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">
              Período
            </label>
            <select
              value={periodoNuevo}
              onChange={(e) => setPeriodoNuevo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors self-start"
        >
          Crear objetivo
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {objetivos.length === 0 && (
          <p className="text-slate-400">Todavía no tienes objetivos creados.</p>
        )}

        {objetivos.map((objetivo) => {
          const estado = obtenerEstado(objetivo.progreso);
          const enEdicion = editandoId === objetivo.id;

          return (
            <div
              key={objetivo.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {enEdicion ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarEdicion(objetivo.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-700 font-medium">
                        {objetivo.nombre}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadStyles[objetivo.prioridad]}`}
                        >
                          Prioridad {objetivo.prioridad}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 capitalize">
                          {objetivo.periodo}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium text-white ${estado.clase}`}
                        >
                          {estado.texto}
                        </span>
                        <span className="text-xs text-slate-400">
                          📅 {formatearFecha(objetivo.fechaLimite)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {!enEdicion && (
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <button
                      onClick={() => iniciarEdicion(objetivo)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarObjetivo(objetivo.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={objetivo.progreso}
                  onChange={(e) => actualizarProgreso(objetivo.id, e.target.value)}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-600 w-12 text-right">
                  {objetivo.progreso}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${objetivo.progreso}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Objetivos;