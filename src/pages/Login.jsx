import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { iniciarSesion, registrarse, iniciarSesionConGoogle } = useAuth();

  const [modo, setModo] = useState("login"); // "login" o "registro"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    if (modo === "login") {
      const { error } = await iniciarSesion(email, password);
      if (error) setError(traducirError(error.message));
    } else {
      const { error } = await registrarse(email, password);
      if (error) {
        setError(traducirError(error.message));
      } else {
        setMensaje("✅ Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
      }
    }

    setCargando(false);
  }

  async function manejarGoogle() {
    setError("");
    const { error } = await iniciarSesionConGoogle();
    if (error) setError(traducirError(error.message));
  }

  function traducirError(mensaje) {
    if (mensaje.includes("Invalid login credentials")) {
      return "Correo o contraseña incorrectos.";
    }
    if (mensaje.includes("User already registered")) {
      return "Ya existe una cuenta con este correo.";
    }
    if (mensaje.includes("Password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    return mensaje;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">
          🚀 Life Tracker
        </h1>
        <p className="text-slate-500 text-center mb-6 text-sm">
          {modo === "login" ? "Inicia sesión para continuar" : "Crea tu cuenta"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg mb-4">
            {mensaje}
          </div>
        )}

        <form onSubmit={manejarSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            minLength={6}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={cargando}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {cargando ? "Cargando..." : modo === "login" ? "Iniciar sesión" : "Registrarme"}
          </button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">o</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          onClick={manejarGoogle}
          className="w-full flex items-center justify-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
        >
          🔵 Continuar con Google
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
          {modo === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            onClick={() => {
              setModo(modo === "login" ? "registro" : "login");
              setError("");
              setMensaje("");
            }}
            className="text-blue-600 font-medium hover:underline"
          >
            {modo === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;