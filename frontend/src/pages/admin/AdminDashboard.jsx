import { useEffect, useState } from "react";
import {
  obtenerEquiposDelTorneo,
  obtenerResumenDashboard,
  obtenerTorneos,
} from "../../services/servicioTorneo";
import styles from "./AdminDashboard.module.css";
import { useAutenticacion } from "../../hooks/useAutenticacion";
import { Navbar } from "../../components/Navbar";
import { Play, Plus, Trophy, Users } from "lucide-react";
import { TorneoCard } from "../../components/TorneoCard";
import { CreateTorneoModal } from "../../components/CreateTorneoModal";

export const AdminDashboard = () => {
  //Cargar variables de contexto
  const { usuario, cerrarSesionUsuario } = useAutenticacion();

  const [resumen, setResumen] = useState({
    total_torneos: 0,
    torneos_en_curso: 0,
    total_equipos: 0,
  });
  const [equiposPorTorneo, setEquiposPorTorneo] = useState({}); // {torneoId: numEquipos}
  const [torneos, setTorneos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [numEquipos, setNumEquipos] = useState([]);
  const [activeTab, setActiveTab] = useState("todos");

  //Filtrar torneos
  const torneosFiltrados = torneos.filter((torneo) => {
    //Si el menu es todos, mostrar todos los torneos
    if (activeTab === "todos") {
      return true; //Inmediatamente sale porque no importa el estado, todos se muestran
    }
    //Mostrar el torneo dependiendo el estado del menu
    if (activeTab === "en_curso") {
      return torneo.estado === "en_curso";
    }

    if (activeTab === "registro") {
      return torneo.estado === "registro";
    }

    if (activeTab === "finalizado") {
      return torneo.estado === "finalizado";
    }
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resumenData, torneosData] = await Promise.all([
        obtenerResumenDashboard(),
        obtenerTorneos(),
      ]);
      //Actualizar estados
      setResumen(resumenData);
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
    <div className={styles.pageWrapper}>
      <Navbar
        usuario={usuario}
        onCerrarSesion={cerrarSesionUsuario}
        variant="admin"
      ></Navbar>
      <main className={styles.contentContainer}>
        {/*Metricas superiores*/}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statYellow}`}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>TORNEOS</span>
              <Trophy size={18} className={styles.iconYellow}></Trophy>
            </div>
            <span className={styles.statValue}>{resumen.total_torneos}</span>
          </div>
          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>EN CURSO</span>
              <Play size={18} className={styles.iconGreen}></Play>
            </div>
            <span className={styles.statValue}>{resumen.torneos_en_curso}</span>
          </div>
          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>EQUIPOS INSCRITOS</span>
              <Users size={18} className={styles.iconBlue}></Users>
            </div>
            <span className={styles.statValue}>{resumen.total_equipos}</span>
          </div>
        </div>
        {/*Header mis torneos */}
        <div className={styles.sectionHeader}>
          <div>
            <h1 className={styles.sectionTitle}>Mis Torneos</h1>
            <p className={styles.sectionSubtitle}>
              Gestiona y supervisa tus torneos
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
          <button
            className={styles.createBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18}></Plus>
            <span>Crear Torneo</span>
          </button>
        </div>

        {/*Grid de torneos */}
        {loading ? (
          <p>Cargando información...</p>
        ) : torneosFiltrados.length === 0 ? (
          <div className={styles.sinTorneos}>
            <p>No hay torneos disponibles.Consulta proximamente.</p>
          </div>
        ) : (
          <div className={styles.torneosGrid}>
            {torneosFiltrados.map((torneo) => (
              <TorneoCard
                variant="admin"
                key={torneo.id}
                torneo={torneo}
                numEquipos={equiposPorTorneo[torneo.id] || 0}
              ></TorneoCard>
            ))}
          </div>
        )}
        {/*Modal.La validacion de si se muestra o no, ocurre dentro de el */}
        <CreateTorneoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTorneoCreado={cargarDatos}
        ></CreateTorneoModal>
      </main>
    </div>
  );
};
