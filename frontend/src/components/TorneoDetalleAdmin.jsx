import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { agregarEquipo, editarEquipo, eliminarEquipo, finalizarTorneo, iniciarTorneo, obtenerEquiposDelTorneo, obtenerEquiposGlobales, obtenerJornadasDelTorneo, obtenerPosicionesDelTorneo, obtenerTorneoPorId } from "../services/servicioTorneo";
import { PaginaNoEncontrada } from "../App";
import styles from './TorneoDetalleAdmin.module.css';
import { Calendar, ChevronLeft, MapPin } from "lucide-react";
import { Navbar } from "./Navbar";
import { EquiposSection } from "./EquiposSection";
import { CalendarioSection } from "./CalendarioSection";
import { PosicionesSection } from "./PosicionesSection";


export const TorneoDetalleAdmin = () => {
  const { id } = useParams(); //Captura el ID de la URL (/admin/torneos/:id)
  const [torneo, setTorneo ] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [activeTab, setActiveTab] = useState("equipos"); // 'equipos', 'calendario', 'posiciones'
  const [error,setError]=useState(null);
  const [equiposDelTorneo,setEquiposDelTorneo]=useState([]);
  const [numEquiposDelTorneo,setNumEquiposDelTorneo]=useState(0);
  const [equiposGlobales,setEquiposGlobales]=useState([]);
  const [jornadasDelTorneo,setJornadasDelTorneo]=useState([]);
  const [posiciones,setPosiciones]=useState([]);

  // Modales
  const [isModalEquipoOpen, setIsModalEquipoOpen] = useState(false);
  const [isModalFinalizarOpen, setIsModalFinalizarOpen] = useState(false);

  const cargarTorneo=async ()=>{
    setError(null);
    try{
        setCargando(true);
        //Informacion del torneo
        const torneo=await obtenerTorneoPorId(id);
        setTorneo(torneo);
        //Equipos globales
        const equiposGlobalesData=await obtenerEquiposGlobales()
        setEquiposGlobales(equiposGlobalesData);

        if (torneo) {
          //Equipos del torneo
          const equiposDelTorneoData = await obtenerEquiposDelTorneo(id);
          setEquiposDelTorneo(equiposDelTorneoData);
          setNumEquiposDelTorneo(equiposDelTorneoData.length);

          //Obtener jornadas del torneo
          const jornadasDelTorneoData = await obtenerJornadasDelTorneo(id);
          setJornadasDelTorneo(jornadasDelTorneoData);

          //Obtener posiciones
          const posicionesDelTorneoData = await obtenerPosicionesDelTorneo(id);
          setPosiciones(posicionesDelTorneoData);

        }

        

    }
    catch(error){
      setError(error.message || 'No se pudo cargar el torneo. Intenta de nuevo.')
      console.error(error.message)
    }
    finally{
        setCargando(false);
    }
  }

  //Se ejcuta siempre mientras haya/cambie un id por url
  useEffect(()=>{
    cargarTorneo();
  },[id])

  const handleIniciarTorneo=async()=>{
    setError(null);
    try{
        await iniciarTorneo(id);
        cargarTorneo();
    }
    catch(error){
        setError(error.message || "No se pudo iniciar el torneo. Intenta de nuevo.",);
        console.error(error.message)
    }
  }

  const handleFinalizarTorneo=async(equipoCampeonId)=>{
    setError(null);
    try{
      await finalizarTorneo(id, equipoCampeonId);
      cargarTorneo(); // Pasa a 'finalizado' y asigna equipo_campeon_id
    }
    catch(error){
      setError(error.message || 'No se pudo finalizar el torneo. Intenta de nuevo.')
      console.error(error.message);
    }
  }

  const handleAgregarEquipo=async(nuevoEquipo)=>{
    setError(null);
    try{
        await agregarEquipo(id,nuevoEquipo);
        cargarTorneo();

    }
    catch(error){
      setError(error.message || 'No se pudo agregar el equipo. Intenta de nuevo')
      console.error(error.message);

    }
  }

  const handleEliminarEquipo = async (equipoId)=>{
    setError(null);
    const confirmar = window.confirm(
        "¿Seguro que quieres eliminar este equipo del torneo?",
      );
    if(confirmar){
      try {
        await eliminarEquipo(id, equipoId);
        cargarTorneo(); //Actualiza la lista
      } catch (error) {
        setError(
          error.message || "No se pudo eliminar el equipo.Intenta de nuevo",
        );
        console.error(error.message);
      }

    }
  }

  const handleEditarEquipo = async (equipoId,datosEquipo) => {
    setError(null);
    try {
      await editarEquipo(equipoId,datosEquipo)
      cargarTorneo(); //Actualiza la lista
    } catch (error) {
      setError(
        error.message || "No se pudo eliminar el equipo.Intenta de nuevo",
      );
      console.error(error.message);
    }
  };



  if (cargando)
    return <div style={{ padding: "2rem" }}>Cargando torneo...</div>;
  if(!torneo){
    return <PaginaNoEncontrada></PaginaNoEncontrada>
  }

  return (
    <div className={styles.page}>
      <Navbar variant="admin" torneo={torneo} activeTab={activeTab} onTabChange={setActiveTab} onIniciarTorneo={handleIniciarTorneo} onFinalizarTorneo={handleFinalizarTorneo}></Navbar>
      <section className={styles.sectionAdminPage}>
        {activeTab==='equipos' && (
          <EquiposSection torneo={torneo} variant='admin' error={error} numEquiposDelTorneo={numEquiposDelTorneo} onRefreshEquipos={cargarTorneo} equiposDelTorneo={equiposDelTorneo} onErrorChange={setError} equiposGlobales={equiposGlobales} onEditarEquipo={handleEditarEquipo} onEliminarEquipo={handleEliminarEquipo}></EquiposSection>
        )}
        {activeTab==='calendario' && (
          <CalendarioSection torneo={torneo} variant='admin' error={error} jornadasDelTorneo={jornadasDelTorneo} onRefreshTorneo={cargarTorneo}></CalendarioSection>
        )}
        {activeTab==='posiciones' && (
          <PosicionesSection torneo={torneo} variant='admin' error={error} posiciones={posiciones}></PosicionesSection>
        )}
      </section>
    </div>
  );
};