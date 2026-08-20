import { NavLink } from "react-router-dom";

const mobileItems = [
  { name: "Inicio", path: "/", icon: "🏠" },
  { name: "Hábitos", path: "/habitos", icon: "✅" },
  { name: "Metas", path: "/objetivos", icon: "🎯" },
  { name: "Finanzas", path: "/finanzas", icon: "💰" },
  { name: "Más", path: "/configuracion", icon: "⚙️" },
];

function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-50">
      {mobileItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs px-2 py-1 rounded-lg ${
              isActive ? "text-blue-600" : "text-slate-500"
            }`
          }
        >
          <span className="text-lg">{item.icon}</span>
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNav;