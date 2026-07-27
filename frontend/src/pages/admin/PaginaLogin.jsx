import { useState } from "react";
import { useAutenticacion } from "../../hooks/useAutenticacion";
import estilos from './PaginaLogin.module.css';
import { useNavigate } from "react-router-dom";
import {Lock, LogIn, Mail, MailIcon} from 'lucide-react';

export function PaginaLogin() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [errorMensaje, setErrorMensaje] = useState("");
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  const { iniciarSesionUsuario } = useAutenticacion();
  const navegacion = useNavigate();

  async function manejarEnvioFormulario(evento) {
    evento.preventDefault(); //Evita recargar la pagina en formularios
    setErrorMensaje("");
    setCargandoEnvio(true);

    try {
      await iniciarSesionUsuario(correo, contraseña);
      // Redirige al panel del administrador si todo salió bien
      navegacion("/admin/dashboard");
    } catch (error) {
      // Muestra el mensaje exacto que respondió el Backend o un error genérico
      setErrorMensaje(error.message || "Ocurrió un error al intentar iniciar sesión.");
    } finally {
      setCargandoEnvio(false);
    }
  }

  return (
    <div className={estilos.contenedorLogin}>
      <h2 className={estilos.titulo}>Iniciar Sesión - FanFutbol</h2>
      {errorMensaje && <div className={estilos.cajaError}>{errorMensaje}</div>}
      <form onSubmit={manejarEnvioFormulario}>
        <div className={estilos.grupoInput}>
          <label className={estilos.label}>
            <MailIcon size={16} className={estilos.iconoLabel}></MailIcon>Correo
            Electrónico:{" "}
          </label>
          <input
            className={estilos.input}
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="admin@fanfutbol.com"
            required
          ></input>
        </div>
        <div className={estilos.grupoInput}>
          <label className={estilos.label}>
            <Lock size={16} className={estilos.iconoLabel}></Lock>
            Contraseña:{" "}
          </label>
          <input
            className={estilos.input}
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            placeholder="••••••••"
            required
          ></input>
        </div>
        <button
          type="submit"
          className={estilos.botonEnviar}
          disabled={cargandoEnvio}
        >
          <LogIn size={18}></LogIn>
          <span>{cargandoEnvio ? "Validando..." : "Entrar al panel"}</span>
        </button>
      </form>
    </div>
  );
}
