import { useEffect, useState } from "react";
import { obtenerResumenDashboard, obtenerTorneos } from "../../services/servicioTorneo";
import styles from './AdminDashboard.module.css';
import { useAutenticacion } from "../../hooks/useAutenticacion";
import { Navbar } from "../../components/Navbar";
import { Play, Plus, Trophy, Users } from "lucide-react";
import { TorneoCard } from "../../components/TorneoCard";
import { CreateTorneoModal } from "../../components/CreateTorneoModal";

export const AdminDashboard=()=>{
  //Cargar variables de contexto
  const {usuario}=useAutenticacion();

  const [resumen, setResumen] = useState({
    total_torneos: 0,
    torneos_en_curso: 0,
    total_equipos: 0,
  });
  const [torneos, setTorneos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargarDatos=async ()=>{
    try{
      setLoading(true);
      const [resumenData,torneosData]=await Promise.all([
        obtenerResumenDashboard(),
        obtenerTorneos()
      ]);
      //Actualizar estados
      setResumen(resumenData);
      setTorneos(torneosData);

    }
    catch(err){
      console.error('Error al cargar datos del dashboard: ',err.message);
    }
    finally{
      setLoading(false)
    }
  }

  //Se ejecuta siempre al montar el componente
  useEffect(()=>{
    cargarDatos();
  },[])

  return (
    <div className={styles.pageWrapper}>
      <Navbar email={usuario.email}></Navbar>
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
            <p className={styles.sectionSubtitle}>Gestiona y supervisa tus torneos</p>
          </div>
          <button className={styles.createBtn} onClick={()=>setIsModalOpen(true)}>
            <Plus size={18}></Plus>
            <span>Crear Torneo</span>
          </button>
        </div>
        {/*Grid de torneos */}
        {loading ? (
          <p>Cargando información...</p>
        ) : (
          <div className={styles.torneosGrid}>
            {torneos.map((torneo)=>(
              <TorneoCard key={torneo.id} torneo={torneo}></TorneoCard>
            ))}
          </div>
        )}
        {/*Modal */}
        <CreateTorneoModal
        isOpen={isModalOpen}
        onClose={()=>setIsModalOpen(false)}
        onTorneoCreado={cargarDatos}></CreateTorneoModal>
      </main>
    </div>
  );


}