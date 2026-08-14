import { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import styles from "./PublicDashboard.module.css";
import { TorneoCard } from "../../components/TorneoCard";
import {
  obtenerEquiposDelTorneo,
  obtenerTorneos,
} from "../../services/servicioTorneo";

export const PublicDashboard = () => {
  const [equiposPorTorneo, setEquiposPorTorneo] = useState({}); // {torneoId: numEquipos}
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numEquipos, setNumEquipos] = useState([]);
  const [activeTab,setActiveTab]=useState('todos');

  //Variable y ala vez funcion para poder obtener los torneos por su estado
  const torneosFiltrados=torneos.filter((torneo) => {
    //Si la pestaña activa es todos, traer todos los torneos
    if (activeTab === "todos") {
      return true;
    }
    //Regresar cada torneo donde el estado sea en en_curso
    if (activeTab === "en_curso") {
      return torneo.estado === "en_curso";
    }

    if (activeTab === "registro") {
      return torneo.estado === "registro";
    }

    if (activeTab === "finalizado") {
      return torneo.estado === "finalizado";
    }
  })
    
  

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [torneosData] = await Promise.all([obtenerTorneos()]);
      //Actualizar estados
      setTorneos(torneosData);
      setNumEquipos(torneos.length);

      // obtener equipos de cada torneo
      const equiposCounts = {};
      for (const torneo of torneosData) {
        const equipos = await obtenerEquiposDelTorneo(torneo.id);
        equiposCounts[torneo.id] = equipos.length;
      }
      setEquiposPorTorneo(equiposCounts);
    } catch (err) {
      console.error("Error al cargar datos del dashboard: ", err.message);
    } finally {
      setLoading(false);
    }
  };

  //Se ejecuta siempre al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <>
      <div className={styles.pageWrapper}>
        <Navbar variant="public"></Navbar>
        <main className={styles.contentContainer}>
          <div className={styles.sectionHeader}>
            <div>
              <h1 className={styles.sectionTitle}>Torneos Disponibles</h1>
              <p className={styles.sectionSubtitle}>
                Consulta el calendario, resultados y posiciones de cada torneo.
              </p>
              <div className={styles.contenedorTabs}>
                <button
                  className={`${styles.tab} ${activeTab === "todos" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("todos")}
                >
                  Todos
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "en_curso" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("en_curso")}
                >
                  En curso
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "registro" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("registro")}
                >
                  Registro
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "finalizado" ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab("finalizado")}
                >
                  Finalizado
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <p>Cargando información...</p>
          ) : torneosFiltrados.length === 0 ? (
            <div className={styles.sinTorneos}>
              <p>No hay torneos disponibles. Consulta proximamente.</p>
            </div>
          ) : (
            /*ITERO SOBRE LOS TORNEOS FILTRADOS */
            <div className={styles.torneosGrid}>
              {torneosFiltrados.map((torneo) => (
                <TorneoCard
                  variant="public"
                  key={torneo.id}
                  torneo={torneo}
                  numEquipos={equiposPorTorneo[torneo.id] || 0}
                ></TorneoCard>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};
