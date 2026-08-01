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
            </div>
          </div>
          {loading ? (
            <p>Cargando información...</p>
          ) : torneos.length === 0 ? (
            <div className={styles.sinTorneos}>
              <p>No hay torneos disponibles. Consulta proximamente.</p>
            </div>
          ) : (
            <div className={styles.torneosGrid}>
              {torneos.map((torneo) => (
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
