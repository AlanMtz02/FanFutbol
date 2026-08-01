import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProvedorAutenticacion } from "./context/ProveedorAutenticacion";
import { RutaProtegida } from "./components/RutaProtegida";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import PaginaLogin from "./pages/admin/PaginaLogin";
import { TorneoDetalleAdmin } from "./components/TorneoDetalleAdmin";
import { PublicDashboard } from "./pages/public/PublicDashboard";
import { TorneoDetallePublic } from "./components/TorneoDetallePublic";



export function PaginaNoEncontrada() {
  return <h1>404 - Esta página no existe</h1>;
}

export default function App(){
  return (
    <ProvedorAutenticacion>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<PaginaLogin></PaginaLogin>}></Route>

          {/* Rutas Privadas envolviendo con RutaProtegida como children */}
          <Route
            path="/admin/dashboard"
            element={
              <RutaProtegida>
                <AdminDashboard></AdminDashboard>
              </RutaProtegida>
            }
          ></Route>

          {/* RUTA DEL DETALLE DE TORNEO (PROTEGIDA) */}
          <Route
            path="/admin/torneo/:id"
            element={
              <RutaProtegida>
                <TorneoDetalleAdmin />
              </RutaProtegida>
            }
          />

          <Route path="/" element={<PublicDashboard></PublicDashboard>}></Route>

          <Route path="/public/torneo/:id" element={<TorneoDetallePublic></TorneoDetallePublic>}></Route>

          {/* Redirecciones de seguridad */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacion>
  );

}