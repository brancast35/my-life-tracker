import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

function obtenerFechaHoy() {
  return new Date().toISOString().split("T")[0];
}

function formatearFecha(fechaStr) {
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
}

function Entrenamiento() {
  const [rutinas, setRutinas] = useLocalStorage("rutinas", []);
  const [historial, setHistorial] = useLocalStorage("historialEntrenamiento", []);

  const [nombreRutina, setNombreRutina] = useState("");
  const [ejerciciosNuevos, setEjerciciosNuevos] = useState([]);
  const [nombreEjercicio, setNombreEjercicio] = useState("");
  const [seriesEjercicio, setSeriesEjercicio] = useState(3);
  const [repsEjercicio, setRepsEjercicio] = useState(12);

  const [rutinaEnCurso, setRutinaEnCurso] = useState(null);
  const [resultados, setResultados] = useState([]);

  function agregarEjercicioALaRutina(e) {
    e.preventDefault();
    if (nombreEjercicio.trim() === "") return;

    setEjerciciosNuevos([
      ...ejerciciosNuevos,
      {
        id: Date.now(),
        nombre: nombreEjercicio,
        series: Number(seriesEjercicio),
        repeticiones: Number(repsEjercicio),
      },
    ]);
    setNombreEjercicio("");
  }

  function quitarEjercicioNuevo(id) {
    setEjerciciosNuevos(ejerciciosNuevos.filter((ej) => ej.id !== id));
  }

  function guardarRutina(e) {
    e.preventDefault();
    if (nombreRutina.trim() === "" || ejerciciosNuevos.length === 0) return;

    const nuevaRutina = {
      id: Date.now(),
      nombre: nombreRutina,
      ejercicios: ejerciciosNuevos,
    };

    setRutinas([...rutinas, nuevaRutina]);
    setNombreRutina("");
    setEjerciciosNuevos([]);
  }

  function eliminarRutina(id) {
    setRutinas(rutinas.filter((r) => r.id !== id));
  }

  function iniciarSesion(rutina) {
    setRutinaEnCurso(rutina);
    setResultados(
      rutina.ejercicios.map((ej) => ({
        nombre: ej.nombre,
        series: ej.series,
        repeticiones: ej.repeticiones,
        peso: "",
        duracionMin: "",
      }))
    );
  }

  function actualizarResultado(index, campo, valor) {
    setResultados(
      resultados.map((r, i) => (i === index ? { ...r, [campo]: valor } : r))
    );
  }

  function finalizarSesion() {
    const nuevaEntrada = {
      id: Date.now(),
      rutinaNombre: rutinaEnCurso.nombre,
      fecha: obtenerFechaHoy(),
      ejerciciosRealizados: resultados,
    };

    setHistorial([nuevaEntrada, ...historial]);
    setRutinaEnCurso(null);
    setResultados([]);
  }

  function cancelarSesion() {
    setRutinaEnCurso(null);
    setResultados([]);
  }

  function eliminarSesionHistorial(id) {
    setHistorial(historial.filter((h) => h.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Entrenamiento</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Crea rutinas y registra tu progreso
      </p>

      {rutinaEnCurso ? (
        <div className="bg-white p-4 rounded-lg border border-blue-300 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            Registrando: {rutinaEnCurso.nombre}
          </h2>

          <div className="flex flex-col gap-3">
            {resultados.map((res, index) => (
              <div key={index} className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-700 mb-2">{res.nombre}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-slate-400">Series</label>
                    <input
                      type="number"
                      value={res.series}
                      onChange={(e) => actualizarResultado(index, "series", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Repeticiones</label>
                    <input
                      type="number"
                      value={res.repeticiones}
                      onChange={(e) => actualizarResultado(index, "repeticiones", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Peso (kg)</label>
                    <input
                      type="number"
                      value={res.peso}
                      onChange={(e) => actualizarResultado(index, "peso", e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Duración (min)</label>
                    <input
                      type="number"
                      value={res.duracionMin}
                      onChange={(e) => actualizarResultado(index, "duracionMin", e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={finalizarSesion}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Finalizar entrenamiento
            </button>
            <button
              onClick={cancelarSesion}
              className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <form
            onSubmit={guardarRutina}
            className="flex flex-col gap-3 mb-6 bg-white p-4 rounded-lg border border-slate-200"
          >
            <p className="font-semibold text-slate-700">Crear nueva rutina</p>

            <input
              type="text"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              placeholder="Ej: Día de piernas"
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={nombreEjercicio}
                onChange={(e) => setNombreEjercicio(e.target.value)}
                placeholder="Nombre del ejercicio"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={seriesEjercicio}
                onChange={(e) => setSeriesEjercicio(e.target.value)}
                placeholder="Series"
                className="w-full sm:w-24 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={repsEjercicio}
                onChange={(e) => setRepsEjercicio(e.target.value)}
                placeholder="Reps"
                className="w-full sm:w-24 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={agregarEjercicioALaRutina}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                + Ejercicio
              </button>
            </div>

            {ejerciciosNuevos.length > 0 && (
              <div className="flex flex-col gap-1">
                {ejerciciosNuevos.map((ej) => (
                  <div
                    key={ej.id}
                    className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-sm"
                  >
                    <span>
                      {ej.nombre} — {ej.series}x{ej.repeticiones}
                    </span>
                    <button
                      type="button"
                      onClick={() => quitarEjercicioNuevo(ej.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors self-start"
            >
              Guardar rutina
            </button>
          </form>

          <p className="font-semibold text-slate-700 mb-2">Mis rutinas</p>
          <div className="flex flex-col gap-3 mb-8">
            {rutinas.length === 0 && (
              <p className="text-slate-400">Todavía no tienes rutinas creadas.</p>
            )}

            {rutinas.map((rutina) => (
              <div
                key={rutina.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">{rutina.nombre}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => iniciarSesion(rutina)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Iniciar entrenamiento
                    </button>
                    <button
                      onClick={() => eliminarRutina(rutina.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {rutina.ejercicios.map((ej) => `${ej.nombre} (${ej.series}x${ej.repeticiones})`).join(" · ")}
                </p>
              </div>
            ))}
          </div>

          <p className="font-semibold text-slate-700 mb-2">Historial de entrenamientos</p>
          <div className="flex flex-col gap-3">
            {historial.length === 0 && (
              <p className="text-slate-400">Todavía no registraste entrenamientos.</p>
            )}

            {historial.map((sesion) => (
              <div
                key={sesion.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">
                    {sesion.rutinaNombre}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      📅 {formatearFecha(sesion.fecha)}
                    </span>
                    <button
                      onClick={() => eliminarSesionHistorial(sesion.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {sesion.ejerciciosRealizados.map((ej, i) => (
                    <p key={i} className="text-sm text-slate-500">
                      {ej.nombre}: {ej.series} series x {ej.repeticiones} reps
                      {ej.peso ? ` · ${ej.peso} kg` : ""}
                      {ej.duracionMin ? ` · ${ej.duracionMin} min` : ""}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Entrenamiento;