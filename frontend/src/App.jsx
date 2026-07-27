import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProvedorAutenticacion } from "./context/ProveedorAutenticacion";
import { PaginaLogin } from "./pages/admin/PaginaLogin";
import { RutaProtegida } from "./components/RutaProtegida";

// Vistas temporales de prueba
function DashboardPrueba() {
  return <h1>Dashboard Admin (Protegido con Children)</h1>;
}

function PaginaNoEncontrada() {
  return <h1>404 - Esta página no existe</h1>;
}

export default function App(){
  return(<ProvedorAutenticacion>
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<PaginaLogin></PaginaLogin>}></Route>

        {/* Rutas Privadas envolviendo con RutaProtegida como children */}
        <Route
          path="/admin/dashboard"
          element={
            <RutaProtegida>
              <DashboardPrueba></DashboardPrueba>
            </RutaProtegida>
          }
        ></Route>

        {/* Redirecciones de seguridad */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<PaginaNoEncontrada />} />
        
      </Routes>
    </BrowserRouter>
  </ProvedorAutenticacion>)

}