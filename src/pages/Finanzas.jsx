import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const categoriasIngreso = ["Salario", "Freelance", "Inversiones", "Otro"];
const categoriasGasto = ["Comida", "Transporte", "Vivienda", "Ocio", "Salud", "Otro"];
const metodosPago = ["Efectivo", "Tarjeta", "Transferencia", "Yape"];

function obtenerFechaHoy() {
  return new Date().toISOString().split("T")[0];
}

function formatearFecha(fechaStr) {
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatearMonto(monto) {
  return monto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Finanzas() {
  const { usuario } = useAuth();
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [tipoNuevo, setTipoNuevo] = useState("gasto");
  const [montoNuevo, setMontoNuevo] = useState("");
  const [categoriaNueva, setCategoriaNueva] = useState(categoriasGasto[0]);
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [metodoNuevo, setMetodoNuevo] = useState("Efectivo");
  const [fechaNueva, setFechaNueva] = useState(obtenerFechaHoy());
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const categoriasDisponibles = tipoNuevo === "ingreso" ? categoriasIngreso : categoriasGasto;

  // Cargar movimientos desde Supabase al montar el componente
  useEffect(() => {
    cargarMovimientos();
  }, []);

  async function cargarMovimientos() {
    setCargando(true);
    const { data, error } = await supabase
      .from("finanzas")
      .select("*")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar movimientos:", error.message);
    } else {
      setMovimientos(data);
    }
    setCargando(false);
  }

  function cambiarTipo(nuevoTipo) {
    setTipoNuevo(nuevoTipo);
    setCategoriaNueva(nuevoTipo === "ingreso" ? categoriasIngreso[0] : categoriasGasto[0]);
  }

  async function agregarMovimiento(e) {
    e.preventDefault();
    if (montoNuevo === "" || Number(montoNuevo) <= 0) return;

     const nuevoMovimiento = {
      user_id: usuario.id,
      tipo: tipoNuevo,
      monto: Number(montoNuevo),
    
      categoria: categoriaNueva,
      descripcion: descripcionNueva,
      metodo_pago: metodoNuevo,
      fecha: fechaNueva,
    };

    const { data, error } = await supabase
      .from("finanzas")
      .insert(nuevoMovimiento)
      .select();

    if (error) {
      console.error("Error al agregar movimiento:", error.message);
      return;
    }

    setMovimientos([data[0], ...movimientos]);
    setMontoNuevo("");
    setDescripcionNueva("");
  }

  async function eliminarMovimiento(id) {
    const { error } = await supabase
      .from("finanzas")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error al eliminar movimiento:", error.message);
      return;
    }

    setMovimientos(movimientos.filter((m) => m.id !== id));
  }

  const totalIngresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((suma, m) => suma + Number(m.monto), 0);

  const totalGastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((suma, m) => suma + Number(m.monto), 0);

  const balance = totalIngresos - totalGastos;

  const movimientosFiltrados =
    filtroTipo === "todos"
      ? movimientos
      : movimientos.filter((m) => m.tipo === filtroTipo);

  if (cargando) {
    return <p className="text-slate-400">Cargando movimientos...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Finanzas</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Controla tus ingresos, gastos y tu balance
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400">Ingresos totales</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            S/ {formatearMonto(totalIngresos)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400">Gastos totales</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            S/ {formatearMonto(totalGastos)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
            S/ {formatearMonto(balance)}
          </p>
        </div>
      </div>

      <form
        onSubmit={agregarMovimiento}
        className="flex flex-col gap-3 mb-6 bg-white p-4 rounded-lg border border-slate-200"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cambiarTipo("ingreso")}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              tipoNuevo === "ingreso"
                ? "bg-green-500 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => cambiarTipo("gasto")}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              tipoNuevo === "gasto"
                ? "bg-red-500 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Gasto
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            step="0.01"
            min="0"
            value={montoNuevo}
            onChange={(e) => setMontoNuevo(e.target.value)}
            placeholder="Monto (S/)"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={categoriaNueva}
            onChange={(e) => setCategoriaNueva(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={metodoNuevo}
            onChange={(e) => setMetodoNuevo(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {metodosPago.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={descripcionNueva}
            onChange={(e) => setDescripcionNueva(e.target.value)}
            placeholder="Descripción (opcional)"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={fechaNueva}
            onChange={(e) => setFechaNueva(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors self-start"
        >
          Registrar movimiento
        </button>
      </form>

      <div className="flex gap-2 mb-3">
        {["todos", "ingreso", "gasto"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltroTipo(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
              filtroTipo === f
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {movimientosFiltrados.length === 0 && (
          <p className="text-slate-400">No hay movimientos registrados.</p>
        )}

        {movimientosFiltrados.map((mov) => (
          <div
            key={mov.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-10 rounded-full ${
                  mov.tipo === "ingreso" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <div>
                <p className="text-slate-700 font-medium">
                  {mov.descripcion || mov.categoria}
                </p>
                <p className="text-xs text-slate-400">
                  {mov.categoria} · {mov.metodo_pago} · {formatearFecha(mov.fecha)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`font-semibold ${
                  mov.tipo === "ingreso" ? "text-green-600" : "text-red-600"
                }`}
              >
                {mov.tipo === "ingreso" ? "+" : "-"} S/ {formatearMonto(mov.monto)}
              </span>
              <button
                onClick={() => eliminarMovimiento(mov.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Finanzas;