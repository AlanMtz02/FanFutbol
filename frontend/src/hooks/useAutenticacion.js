import { useContext } from "react";
import { ContextoAutenticacion } from "../context/ProveedorAutenticacion";

export function useAutenticacion(){
    const contexto=useContext(ContextoAutenticacion);

    if (!contexto) {
      throw new Error(
        "useAutenticacion debe usarse dentro de un ProveedorAutenticacion",
      );
    }

    return contexto;

}