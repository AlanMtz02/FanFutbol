import { createContext, useEffect, useState } from "react";
import { iniciarSesion, obtenerUsuarioActual } from "../services/servicioAutenticacion";

export const ContextoAutenticacion=createContext();

//Se ejecuta al iniciar la aplicacion
export function ProvedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al cargar la página, revisamos si ya hay un token guardado en el navegador
  // Y ese token se lo mandamos al endpoint auth/me que esta en la funcoin obtenerUsuarioActual en servicioAutenticacion.js. La funcion obtenerUsuario actual devuelve id , email , creado_en
  useEffect(() => {
    async function verificarToken() {
      const tokenGuardado = localStorage.getItem("token");
      if (tokenGuardado) {
        try {
          const datosUsuario = await obtenerUsuarioActual();
          setUsuario(datosUsuario);
        } catch (error) {
          console.error("El token ya no es válido:", error);
          localStorage.removeItem("token"); //Remover el token del navegador
          setUsuario(null); //Actualizar el usuario con null
        } finally {
          setCargando(false); //Finalizar la carga siempre
        }
      }
      else{ //Si no hay token finaliza la carga siempre
        setCargando(false)
      }
    }
    //Llamar a la funcion
    verificarToken();
  }, []);

  // Función para procesar el login desde el formulario
  async function iniciarSesionUsuario(correo, contraseña) {
    const respuestaAPI = await iniciarSesion(correo, contraseña);

    //Guardar el token que devuelve la api
    localStorage.setItem("token", respuestaAPI.access_token);

    //Guardar los datos del usuario en su variable
    setUsuario(respuestaAPI.usuario);
    return respuestaAPI;
  }

  // Función para cerrar sesión manualmente
  function cerrarSesionUsuario() {
    localStorage.removeItem("token");
    setUsuario(null);
  }

  return(
    <ContextoAutenticacion.Provider value={{
        usuario,
        cargando,
        iniciarSesionUsuario,
        cerrarSesionUsuario,
    }}>
        {children} 
    </ContextoAutenticacion.Provider>
  )
}