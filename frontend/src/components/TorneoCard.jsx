import {useNavigate} from 'react-router-dom';
import styles from './TorneoCard.module.css';
import { Calendar, Check, CheckCircle2, ChevronRight, Clock, MapPin, Play, Trophy, Users } from 'lucide-react';
export const TorneoCard=({torneo,numEquipos,variant})=>{
    const navegacion=useNavigate();

    const formatearFecha=(fechaStr)=>{
        if (!fechaStr) return "";
        const [year, month, day] = fechaStr.split("-");
        return `${day}/${month}/${year}`;
    }


    return (
      <div
        className={`${styles.card} ${torneo.estado === "en_curso" ? styles.borderEnCurso : torneo.estado === "registro" ? styles.borderRegistro : styles.borderFinalizado}`}
      >
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.title}>{torneo.nombre}</h3>
            <span className={styles.subType}>
              {torneo.fase_actual
                ? torneo.fase_actual.charAt(0).toUpperCase() +
                  torneo.fase_actual.slice(1)
                : ""}
            </span>
          </div>
          {/*Badge de estado */}
          {torneo.estado === "en_curso" && (
            <span className={`${styles.badge} ${styles.badgeEnCurso}`}>
              <Play size={12} fill="currentColor"></Play> En curso
            </span>
          )}
          {torneo.estado === "registro" && (
            <span className={`${styles.badge} ${styles.badgeRegistro}`}>
              <Users size={12}></Users> Registro
            </span>
          )}
          {torneo.estado === "finalizado" && (
            <span className={`${styles.badge} ${styles.badgeFinalizado}`}>
              <CheckCircle2 size={12}></CheckCircle2> Finalizado
            </span>
          )}
        </div>
        {/*Detalles de la card */}
        <div className={styles.cardDetailGrid}>
          <div className={styles.detailItem}>
            <Calendar size={15} className={styles.icon}></Calendar>
            <span>{formatearFecha(torneo.fecha_inicio)}</span>
          </div>
          <div className={styles.detailItem}>
            <Clock size={15} className={styles.icon} />
            <span>{torneo.hora_inicio?.slice(0, 5)}</span>
          </div>
          <div className={styles.detailItem}>
            <MapPin size={15} className={styles.icon} />
            <span>
              {torneo.numero_canchas}
              {torneo.numero_canchas === 1 ? " cancha" : " canchas"}
            </span>
          </div>
          <div className={styles.detailItem}>
            <Users size={15} className={styles.icon} />
            <span>{numEquipos} equipos</span>
          </div>
        </div>
        {/* Campeón */}
        {torneo.estado === "finalizado" && torneo.nombre_campeon && (
          <div className={styles.campeonBanner}>
            <Trophy size={15} className={styles.trophyIcon} />
            <span>
              Campeón: <strong>{torneo.nombre_campeon}</strong>
            </span>
          </div>
        )}

        {/* Footer */}
        <div className={styles.cardFooter}>
          <button
            className={styles.adminLink}
            onClick={() => navegacion(variant==='admin' ? `/admin/torneo/${torneo.id}` : `/public/torneo/${torneo.id}` )}
          >
            <span>{variant==='admin' ? 'Administrar' : 'Ver torneo'}</span> <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
}