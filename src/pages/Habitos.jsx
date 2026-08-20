import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

function obtenerFechaHoy() {
  return new Date().toISOString().split("T")[0];
}

function obtenerFechasSemanaActual() {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes...
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + offset);

  const fechas = [];
  for (let i = 0; i < 7; i++) {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + i);
    fechas.push(dia.toISOString().split("T")[0]);
  }
  return fechas;
}

function obtenerUltimosNDias(n) {
  const dias = [];
  for (let i = n - 1; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    dias.push(fecha.toISOString().split("T")[0]);
  }
  return dias;
}

function calcularRacha(fechasCompletado) {
  if (fechasCompletado.length === 0) return 0;

  const fechasOrdenadas = [...fechasCompletado].sort().reverse();
  let racha = 0;
  let fechaEsperada = new Date();

  for (const fecha of fechasOrdenadas) {
    const fechaEsperadaStr = fechaEsperada.toISOString().split("T")[0];
    if (fecha === fechaEsperadaStr) {
      racha++;
      fechaEsperada.setDate(fechaEsperada.getDate() - 1);
    } else {
      break;
    }
  }

  return racha;
}

function Habitos() {
  const [habitos, setHabitos] = useLocalStorage("habitos", []);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [frecuenciaNueva, setFrecuenciaNueva] = useState("diario");
  const [vecesPorSemanaNueva, setVecesPorSemanaNueva] = useState(3);
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [historialAbiertoId, setHistorialAbiertoId] = useState(null);

  const hoy = obtenerFechaHoy();
  const fechasSemana = obtenerFechasSemanaActual();
  const ultimos14Dias = obtenerUltimosNDias(14);

  function agregarHabito(e) {
    e.preventDefault();
    if (nombreNuevo.trim() === "") return;

    const nuevoHabito = {
      id: Date.now(),
      nombre: nombreNuevo,
      frecuencia: frecuenciaNueva,
      vecesPorSemana: frecuenciaNueva === "semanal" ? Number(vecesPorSemanaNueva) : null,
      fechasCompletado: [],
    };

    setHabitos([...habitos, nuevoHabito]);
    setNombreNuevo("");
    setFrecuenciaNueva("diario");
    setVecesPorSemanaNueva(3);
  }

  function eliminarHabito(id) {
    setHabitos(habitos.filter((h) => h.id !== id));
  }

  function toggleCompletadoHoy(id) {
    setHabitos(
      habitos.map((h) => {
        if (h.id !== id) return h;
        const yaCompletado = h.fechasCompletado.includes(hoy);
        const nuevasFechas = yaCompletado
          ? h.fechasCompletado.filter((f) => f !== hoy)
          : [...h.fechasCompletado, hoy];
        return { ...h, fechasCompletado: nuevasFechas };
      })
    );
  }

  function iniciarEdicion(habito) {
    setEditandoId(habito.id);
    setNombreEditado(habito.nombre);
  }

  function guardarEdicion(id) {
    if (nombreEditado.trim() === "") return;
    setHabitos(
      habitos.map((h) => (h.id === id ? { ...h, nombre: nombreEditado } : h))
    );
    setEditandoId(null);
  }

  function cancelarEdicion() {
    setEditandoId(null);
  }

  function toggleHistorial(id) {
    setHistorialAbiertoId(historialAbiertoId === id ? null : id);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hábitos</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Crea y da seguimiento a tus hábitos diarios y semanales
      </p>

      <form onSubmit={agregarHabito} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          placeholder="Ej: Beber 2L de agua"
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={frecuenciaNueva}
          onChange={(e) => setFrecuenciaNueva(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="diario">Diario</option>
          <option value="semanal">Semanal</option>
        </select>

        {frecuenciaNueva === "semanal" && (
          <select
            value={vecesPorSemanaNueva}
            onChange={(e) => setVecesPorSemanaNueva(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}x por semana
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agregar
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {habitos.length === 0 && (
          <p className="text-slate-400">Todavía no tienes hábitos creados.</p>
        )}

        {habitos.map((habito) => {
          const completadoHoy = habito.fechasCompletado.includes(hoy);
          const esSemanal = habito.frecuencia === "semanal";
          const completadosEstaSemana = habito.fechasCompletado.filter((f) =>
            fechasSemana.includes(f)
          ).length;
          const racha = calcularRacha(habito.fechasCompletado);
          const enEdicion = editandoId === habito.id;
          const historialAbierto = historialAbiertoId === habito.id;

          return (
            <div
              key={habito.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCompletadoHoy(habito.id)}
                    className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                      completadoHoy
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {completadoHoy && "✓"}
                  </button>

                  {enEdicion ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarEdicion(habito.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-700 font-medium">
                        {habito.nombre}
                      </span>

                      {esSemanal ? (
                        <div className="mt-1">
                          <p className="text-xs text-blue-600 font-medium">
                            {completadosEstaSemana}/{habito.vecesPorSemana} esta semana
                          </p>
                          <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (completadosEstaSemana / habito.vecesPorSemana) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        racha > 0 && (
                          <p className="text-xs text-orange-500 font-medium mt-1">
                            🔥 {racha} {racha === 1 ? "día" : "días"} de racha
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>

                {!enEdicion && (
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <button
                      onClick={() => toggleHistorial(habito.id)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                    >
                      Historial
                    </button>
                    <button
                      onClick={() => iniciarEdicion(habito)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarHabito(habito.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {historialAbierto && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Últimos 14 días</p>
                  <div className="flex gap-1 flex-wrap">
                    {ultimos14Dias.map((fecha) => {
                      const completado = habito.fechasCompletado.includes(fecha);
                      const diaNumero = fecha.split("-")[2];
                      return (
                        <div
                          key={fecha}
                          title={fecha}
                          className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-medium ${
                            completado
                              ? "bg-green-500 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {diaNumero}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Habitos;