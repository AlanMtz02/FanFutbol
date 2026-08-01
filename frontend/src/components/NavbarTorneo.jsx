import { ChevronLeft, Users } from 'lucide-react';
import styles from './NavbarTorneo.module.css';
export const NavBarTorneo=({torneo,activeTab,onTabChange,OnIniciarTorneo,onFinalizarTorneo})=>{
    return (
      <header className={styles.navbar}>
        <div className={styles.topBar}>
          <ChevronLeft size={18}></ChevronLeft>
        </div>
        <h2 className={styles.torneoName}>{torneo.nombre}</h2>
        <div className={styles.infoTorneo}>
          <span
            className={`${styles.torneoType} ${torneo.estado === "registro" ? styles.registro : torneo.estado === "en_curso" ? styles.enCurso : styles.finalizado}`}
          >
            {torneo.estado === "registro" && (
              <>
                <Users size={16}></Users>
                Registro
              </>
            )}
          </span>
        </div>
      </header>
    );


}