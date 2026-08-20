import useLocalStorage from "../hooks/useLocalStorage";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORES_CATEGORIAS = ["#3b82f6", "#f97316", "#22c55e", "#eab308", "#a855f7", "#ef4444", "#06b6d4"];

function obtenerUltimosNDias(n) {
  const dias = [];
  for (let i = n - 1; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    dias.push(fecha.toISOString().split("T")[0]);
  }
  return dias;
}

function formatearDiaCorto(fechaStr) {
  const fecha = new Date(fechaStr + "T00:00:00");
  return fecha.toLocaleDateString("es-PE", { weekday: "short" });
}

function Estadisticas() {
  const [habitos] = useLocalStorage("habitos", []);
  const [movimientos] = useLocalStorage("movimientos", []);
  const [historialEntrenamiento] = useLocalStorage("historialEntrenamiento", []);

  const ultimos7Dias = obtenerUltimosNDias(7);

  // --- Datos para: Cumplimiento de hábitos (últimos 7 días) ---
  const datosHabitos = ultimos7Dias.map((fecha) => {
    const totalHabitos = habitos.length;
    const completados = habitos.filter((h) =>
      h.fechasCompletado.includes(fecha)
    ).length;
    const porcentaje = totalHabitos === 0 ? 0 : Math.round((completados / totalHabitos) * 100);

    return {
      dia: formatearDiaCorto(fecha),
      cumplimiento: porcentaje,
    };
  });

  // --- Datos para: Gastos por categoría ---
  const gastosPorCategoria = {};
  movimientos
    .filter((m) => m.tipo === "gasto")
    .forEach((m) => {
      gastosPorCategoria[m.categoria] = (gastosPorCategoria[m.categoria] || 0) + m.monto;
    });

  const datosCategorias = Object.entries(gastosPorCategoria).map(([nombre, valor]) => ({
    nombre,
    valor,
  }));

  // --- Datos para: Evolución financiera (últimos 7 días) ---
  const datosFinancieros = ultimos7Dias.map((fecha) => {
    const ingresosDia = movimientos
      .filter((m) => m.tipo === "ingreso" && m.fecha === fecha)
      .reduce((suma, m) => suma + m.monto, 0);
    const gastosDia = movimientos
      .filter((m) => m.tipo === "gasto" && m.fecha === fecha)
      .reduce((suma, m) => suma + m.monto, 0);

    return {
      dia: formatearDiaCorto(fecha),
      ingresos: ingresosDia,
      gastos: gastosDia,
    };
  });

  // --- Datos para: Sesiones de entrenamiento por fecha ---
  const sesionesPorFecha = {};
  historialEntrenamiento.forEach((sesion) => {
    sesionesPorFecha[sesion.fecha] = (sesionesPorFecha[sesion.fecha] || 0) + 1;
  });

  const datosEntrenamiento = ultimos7Dias.map((fecha) => ({
    dia: formatearDiaCorto(fecha),
    sesiones: sesionesPorFecha[fecha] || 0,
  }));

  const hayDatos = habitos.length > 0 || movimientos.length > 0 || historialEntrenamiento.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Estadísticas</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Visualiza tu progreso en todos los módulos
      </p>

      {!hayDatos && (
        <p className="text-slate-400 mb-6">
          Todavía no hay suficientes datos para mostrar estadísticas. Usa la app unos días y vuelve aquí.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cumplimiento de hábitos */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-700 mb-4">
            Cumplimiento de hábitos (7 días)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosHabitos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dia" fontSize={12} />
              <YAxis fontSize={12} unit="%" />
              <Tooltip />
              <Bar dataKey="cumplimiento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gastos por categoría */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-700 mb-4">Gastos por categoría</p>
          {datosCategorias.length === 0 ? (
            <p className="text-slate-400 text-sm">Sin gastos registrados todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={datosCategorias}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.nombre}
                >
                  {datosCategorias.map((_, index) => (
                    <Cell key={index} fill={COLORES_CATEGORIAS[index % COLORES_CATEGORIAS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Evolución financiera */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-700 mb-4">
            Evolución financiera (7 días)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={datosFinancieros}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dia" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Evolución del entrenamiento */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-700 mb-4">
            Sesiones de entrenamiento (7 días)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosEntrenamiento}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dia" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sesiones" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Estadisticas;