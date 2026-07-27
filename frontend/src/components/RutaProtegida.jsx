import { useAutenticacion } from "../hooks/useAutenticacion";
import { Navigate } from "react-router-dom";

export function RutaProtegida({ children }) {
  //Obtener variables del contexto. Apunta al hook useAutenticacion
  const { usuario, cargando } = useAutenticacion();

  // Mientras la llamada al backend checa si el token sirve, mostramos un mensaje
  if (cargando) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Cargando sesión del usuario...</p>
      </div>
    );
  }

  // Si no hay usuario logueado, lo mandamos al login
  if (!usuario) {
    return <Navigate to="/login" replace></Navigate>;
  }

  // Si pasó la validación, muestra exactamente el componente hijo envuelto
  return children;
}
