import { useAutenticacion } from "../hooks/useAutenticacion"
import styles from './Navbar.module.css';
import {Eye, LogOut, Trophy} from 'lucide-react';

export const Navbar=({email})=>{
    //Obtener variable de contexto
    const {cerrarSesionUsuario}=useAutenticacion();

    const inicial=email ? email.charAt(0).toUpperCase() : 'AD';

    return (
      <header className={styles.navbar}>
        <div className={styles.logoSection}>
          <div className={styles.brandIcon}>
            <Trophy size={20} color="#eab308"></Trophy>
          </div>
          <span className={styles.brandTitle}>FANFUTBOL</span>
          <span className={styles.subTitle}>Panel de administración</span>
        </div>

        <div className={styles.actionsSection}>
          <button
            className={styles.publicViewbtn}
            onClick={() => window.open("/", "_blank")}
          >
            <Eye size={16}></Eye>
            <span>Vista pública</span>
          </button>
          <div className={styles.userBadge}>
            <div className={styles.avatar}>{inicial}</div>
            <span className={styles.userName}>{email}</span>
          </div>
          <button
            className={styles.logoutbtn}
            onClick={cerrarSesionUsuario}
            title="Cerrar Sesión"
          >
            <LogOut size={18}></LogOut>
          </button>
        </div>
      </header>
    );

}