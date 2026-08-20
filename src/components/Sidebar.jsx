import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/" },
  { name: "Hábitos", path: "/habitos" },
  { name: "Objetivos", path: "/objetivos" },
  { name: "Calendario", path: "/calendario" },
  { name: "Entrenamiento", path: "/entrenamiento" },
  { name: "Finanzas", path: "/finanzas" },
  { name: "Estadísticas", path: "/estadisticas" },
  { name: "Configuración", path: "/configuracion" },
];

function Sidebar({ modoOscuro, alternarModoOscuro }) {
  return (
    <aside className="hidden md:flex flex-col justify-between w-60 h-screen bg-slate-900 text-white p-4 fixed left-0 top-0">
      <h1 className="text-xl font-bold mb-8 mt-2">🚀 Life Tracker</h1>
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
            </nav>

      <button
        onClick={alternarModoOscuro}
        className="mt-auto flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
      >
        {modoOscuro ? "☀️ Modo claro" : "🌙 Modo oscuro"}
      </button>
    </aside>
  );
}

export default Sidebar;