import { useParams } from "react-router-dom";
import { Navbar } from "./Navbar"
import { useEffect, useState } from "react";
import styles from './TorneoDetallePublic.module.css';
import { EquiposSection } from "./EquiposSection";
import { obtenerEquiposDelTorneo, obtenerEquiposGlobales, obtenerJornadasDelTorneo, obtenerPosicionesDelTorneo, obtenerTorneoPorId } from "../services/servicioTorneo";
import {CalendarioSection} from './CalendarioSection';
import {PosicionesSection} from './PosicionesSection';

export const TorneoDetallePublic=()=>{
  //Obtener el id por URL
  const {id}=useParams();
  const [torneo, setTorneo ] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [activeTab, setActiveTab] = useState("equipos"); // 'equipos', 'calendario', 'posiciones'
    const [error,setError]=useState(null);
    const [equiposDelTorneo,setEquiposDelTorneo]=useState([]);
    const [numEquiposDelTorneo,setNumEquiposDelTorneo]=useState(0);
    const [equiposGlobales,setEquiposGlobales]=useState([]);
    const [jornadasDelTorneo,setJornadasDelTorneo]=useState([]);
    const [posiciones,setPosiciones]=useState([]);

  
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
  
    return (
      <>
        <div className={styles.page}>
          <Navbar
            variant="public"
            torneo={torneo}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          ></Navbar>
          <section className={styles.sectionPublicPage}>
            {activeTab === "equipos" && (
              <EquiposSection
                variant="public"
                torneo={torneo}
                error={error}
                numEquiposDelTorneo={numEquiposDelTorneo}
                equiposDelTorneo={equiposDelTorneo}
                equiposGlobales={equiposGlobales}
              ></EquiposSection>
            )}
            {activeTab === "calendario" && (
              <CalendarioSection
                variant="public"
                torneo={torneo}
                jornadasDelTorneo={jornadasDelTorneo}
              ></CalendarioSection>
            )}
            {activeTab === "posiciones" && (
              <PosicionesSection
                variant="public"
                torneo={torneo}
                posiciones={posiciones}
              ></PosicionesSection>
            )}
          </section>
        </div>
      </>
    );
}