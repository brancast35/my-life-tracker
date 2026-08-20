import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import Dashboard from "./pages/Dashboard";

import Habitos from "./pages/Habitos";
import Objetivos from "./pages/Objetivos";
import Finanzas from "./pages/Finanzas";
import Entrenamiento from "./pages/Entrenamiento";
import Estadisticas from "./pages/Estadisticas";
import Calendario from "./pages/Calendario";
import Configuracion from "./pages/Configuracion";
import useDarkMode from "./hooks/useDarkMode";
function App() {
  const [modoOscuro, alternarModoOscuro] = useDarkMode();

  return (
    <BrowserRouter>
      <div className="flex dark:bg-slate-900 min-h-screen">
        <Sidebar modoOscuro={modoOscuro} alternarModoOscuro={alternarModoOscuro} />

        <main className="flex-1 md:ml-60 p-6 pb-20 md:pb-6 min-h-screen bg-slate-50 dark:bg-slate-900">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habitos" element={<Habitos />} />
            <Route path="/objetivos" element={<Objetivos />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/entrenamiento" element={<Entrenamiento />} />
            <Route path="/finanzas" element={<Finanzas />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Routes>
        </main>

        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

export default App;