import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const CLAVES_DATOS = ["habitos", "objetivos", "movimientos", "rutinas", "historialEntrenamiento"];

function Configuracion() {
  const [nombreUsuario, setNombreUsuario] = useLocalStorage("nombreUsuario", "");
  const [moneda, setMoneda] = useLocalStorage("monedaPreferida", "S/");
  const [mensaje, setMensaje] = useState("");
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  function exportarDatos() {
    const datosCompletos = {};
    CLAVES_DATOS.forEach((clave) => {
      const valor = localStorage.getItem(clave);
      datosCompletos[clave] = valor ? JSON.parse(valor) : [];
    });

    const blob = new Blob([JSON.stringify(datosCompletos, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `my-life-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    enlace.click();
    URL.revokeObjectURL(url);

    setMensaje("✅ Datos exportados correctamente.");
    setTimeout(() => setMensaje(""), 3000);
  }

  function importarDatos(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (evento) => {
      try {
        const datos = JSON.parse(evento.target.result);
        CLAVES_DATOS.forEach((clave) => {
          if (datos[clave]) {
            localStorage.setItem(clave, JSON.stringify(datos[clave]));
          }
        });
        setMensaje("✅ Datos importados correctamente. Recargando...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        setMensaje("❌ El archivo no es válido.");
        setTimeout(() => setMensaje(""), 3000);
      }
    };
    lector.readAsText(archivo);
  }

  function restablecerTodo() {
    CLAVES_DATOS.forEach((clave) => localStorage.removeItem(clave));
    window.location.reload();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Configuración</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Personaliza tu experiencia</p>

      {mensaje && (
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {mensaje}
        </div>
      )}

      {/* Datos personales */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
        <p className="font-semibold text-slate-700 mb-3">Datos personales</p>
        <label className="text-xs text-slate-500 mb-1 block">Tu nombre</label>
        <input
          type="text"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
          placeholder="Ej: Carlos"
          className="w-full sm:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Preferencias */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
        <p className="font-semibold text-slate-700 mb-3">Preferencias</p>
        <label className="text-xs text-slate-500 mb-1 block">Símbolo de moneda</label>
        <select
          value={moneda}
          onChange={(e) => setMoneda(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="S/">S/ (Sol peruano)</option>
          <option value="$">$ (Dólar)</option>
          <option value="€">€ (Euro)</option>
        </select>
        <p className="text-xs text-slate-400 mt-2">
          Nota: por ahora esta preferencia se guarda, pero el módulo de Finanzas todavía usa "S/" fijo — podemos conectarlo en otra fase.
        </p>
      </div>

      {/* Respaldo de datos */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
        <p className="font-semibold text-slate-700 mb-1">Respaldo de datos</p>
        <p className="text-xs text-slate-400 mb-3">
          Descarga toda tu información o restáurala desde un archivo de respaldo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportarDatos}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ⬇️ Exportar mis datos
          </button>

          <label className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer text-center">
            ⬆️ Importar datos
            <input
              type="file"
              accept="application/json"
              onChange={importarDatos}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Zona peligrosa */}
      <div className="bg-white p-4 rounded-lg border border-red-200">
        <p className="font-semibold text-red-600 mb-1">Zona peligrosa</p>
        <p className="text-xs text-slate-400 mb-3">
          Esto borra permanentemente todos tus hábitos, objetivos, movimientos, rutinas e historial.
        </p>

        {!confirmandoReset ? (
          <button
            onClick={() => setConfirmandoReset(true)}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            Restablecer toda la app
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-red-600 font-medium">
              ¿Estás seguro? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={restablecerTodo}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sí, borrar todo
              </button>
              <button
                onClick={() => setConfirmandoReset(false)}
                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Configuracion;