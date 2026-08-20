import useLocalStorage from "../hooks/useLocalStorage";

function obtenerFechaHoy() {
  return new Date().toISOString().split("T")[0];
}

function formatearFechaLarga() {
  const opciones = { weekday: "long", day: "numeric", month: "long" };
  return new Date().toLocaleDateString("es-PE", opciones);
}

function formatearFecha(fechaStr) {
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatearMonto(monto) {
  return monto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function Dashboard() {
  const [habitos] = useLocalStorage("habitos", []);
  const [objetivos] = useLocalStorage("objetivos", []);
  const [movimientos] = useLocalStorage("movimientos", []);
  const [historialEntrenamiento] = useLocalStorage("historialEntrenamiento", []);

  const hoy = obtenerFechaHoy();

  // --- Cálculos de Hábitos ---
  const totalHabitos = habitos.length;
  const habitosCompletadosHoy = habitos.filter((h) =>
    h.fechasCompletado.includes(hoy)
  ).length;
  const porcentajeHabitos =
    totalHabitos === 0 ? 0 : Math.round((habitosCompletadosHoy / totalHabitos) * 100);
  const rachaMasAlta = habitos.reduce(
    (max, h) => Math.max(max, calcularRacha(h.fechasCompletado)),
    0
  );

  // --- Cálculos de Objetivos ---
  const totalObjetivos = objetivos.length;
  const objetivosCompletados = objetivos.filter((o) => o.progreso >= 100).length;
  const objetivosEnProgreso = objetivos.filter(
    (o) => o.progreso > 0 && o.progreso < 100
  ).length;

  // --- Cálculos de Finanzas ---
  const totalIngresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((suma, m) => suma + m.monto, 0);
  const totalGastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((suma, m) => suma + m.monto, 0);
  const balance = totalIngresos - totalGastos;

  // --- Cálculos de Entrenamiento ---
  const totalSesiones = historialEntrenamiento.length;
  const ultimaSesion = historialEntrenamiento[0]; // ya están ordenadas, la más nueva primero

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
        {formatearFechaLarga()}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Resumen general de tu día</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Hábitos */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400">Hábitos hoy</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {habitosCompletadosHoy}/{totalHabitos}
          </p>
          <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${porcentajeHabitos}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{porcentajeHabitos}% completado</p>
        </div>

        {/* Racha */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400">Mejor racha activa</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">
            🔥 {rachaMasAlta} {rachaMasAlta === 1 ? "día" : "días"}
          </p>
        </div>

        {/* Objetivos */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400">Objetivos</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {objetivosCompletados}/{totalObjetivos}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {objetivosEnProgreso} en progreso
          </p>
        </div>

        {/* Balance */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            S/ {formatearMonto(balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Resumen de Finanzas */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-700 mb-3">Finanzas</p>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Ingresos totales</span>
            <span className="text-green-600 font-medium">S/ {formatearMonto(totalIngresos)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Gastos totales</span>
            <span className="text-red-600 font-medium">S/ {formatearMonto(totalGastos)}</span>
          </div>
          {movimientos.length === 0 && (
            <p className="text-slate-400 text-sm mt-2">Sin movimientos registrados.</p>
          )}
        </div>

        {/* Resumen de Entrenamiento */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-700 mb-3">Entrenamiento</p>
          {ultimaSesion ? (
            <>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Última sesión</span>
                <span className="text-slate-700 font-medium">{ultimaSesion.rutinaNombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Fecha</span>
                <span className="text-slate-700 font-medium">
                  {formatearFecha(ultimaSesion.fecha)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {totalSesiones} {totalSesiones === 1 ? "sesión registrada" : "sesiones registradas"} en total
              </p>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Todavía no registraste entrenamientos.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;