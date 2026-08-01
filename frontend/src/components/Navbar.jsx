import { useNavigate } from "react-router-dom";
import { useAutenticacion } from "../hooks/useAutenticacion";
import styles from "./Navbar.module.css";
import {
  Calendar,
  ChartNoAxesColumnIcon,
  CheckCircle2,
  CheckCircle2Icon,
  ChevronLeft,
  Eye,
  Lock,
  LogOut,
  MapPin,
  Play,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

export const Navbar = ({
  usuario,
  onCerrarSesion,
  variant,
  torneo,
  activeTab,
  onTabChange,
  onIniciarTorneo,
  onFinalizarTorneo,
}) => {
  const navegacion = useNavigate();
  const inicial = usuario?.email ? usuario.email.charAt(0).toUpperCase() : "AD";
  console.log(variant);

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.logoSection}>
          {variant === "admin" && !torneo && (
            <>
              <div className={styles.brandIcon}>
                <Trophy size={20} color="#eab308" />
              </div>
              <span className={styles.brandTitle}>FANFUTBOL</span>
              <span className={styles.subTitle}>Panel de administración</span>
            </>
          )}

          {variant === "public" && !torneo && (
            <>
              <div className={styles.brandIcon}>
                <Trophy size={20} color="#eab308" />
              </div>
              <span className={styles.brandTitle}>FANFUTBOL</span>
              <span className={styles.subTitle}>Torneos Amateurs</span>
            </>
          )}

          {variant === "admin" && torneo && torneo.nombre && (
            <>
              <button
                type="button"
                className={styles.backAdminDashboardBtn}
                onClick={() => navegacion("/admin/dashboard")}
              >
                <ChevronLeft size={20}></ChevronLeft>
              </button>
              <div className={styles.torneoInfo}>
                <h3 className={styles.torneoTitle}>{torneo.nombre}</h3>
                <span
                  className={`${styles.badgeEstadoNav} ${torneo.estado === "registro" ? styles.registro : torneo.estado === "en_curso" ? styles.enCurso : styles.finalizado}`}
                >
                  {torneo.estado === "registro" && (
                    <>
                      <Users size={12}></Users> Registro
                    </>
                  )}
                  {torneo.estado === "en_curso" && (
                    <>
                      <Play size={12}></Play> En Curso
                    </>
                  )}
                  {torneo.estado === "finalizado" && (
                    <>
                      <button
                        type="button"
                        className={styles.backAdminDashboardBtn}
                        /*TIENE QUE EJECUTAR EL ENDPOINT DE FINALIZAR */
                      >
                        <CheckCircle2 size={12}></CheckCircle2> Finalizado
                      </button>
                    </>
                  )}
                </span>
                <span className={styles.subTitle}>
                  {torneo.fase_actual.charAt(0).toUpperCase() +
                    torneo.fase_actual.slice(1)}
                </span>
              </div>
            </>
          )}

          {variant === "public" && torneo && torneo.nombre && (
            <>
              <button
                type="button"
                className={styles.backAdminDashboardBtn}
                onClick={() => navegacion("/")}
              >
                <ChevronLeft size={20}></ChevronLeft>
              </button>
              <div className={styles.torneoInfo}>
                <h3 className={styles.torneoTitle}>{torneo.nombre}</h3>
                <span
                  className={`${styles.badgeEstadoNav} ${torneo.estado === "registro" ? styles.registro : torneo.estado === "en_curso" ? styles.enCurso : styles.finalizado}`}
                >
                  {torneo.estado === "registro" && (
                    <>
                      <Users size={12}></Users> Registro
                    </>
                  )}
                  {torneo.estado === "en_curso" && (
                    <>
                      <Play size={12}></Play> En Curso
                    </>
                  )}
                  {torneo.estado === "finalizado" && (
                    <>
                      <CheckCircle2 size={12}></CheckCircle2> Finalizado
                    </>
                  )}
                </span>
                <span className={styles.subTitle}>
                  {torneo.fase_actual.charAt(0).toUpperCase() +
                    torneo.fase_actual.slice(1)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className={styles.actionsSection}>
          {variant === "admin" && usuario && (
            <>
              <button
                className={styles.publicViewbtn}
                onClick={() => navegacion("/")}
              >
                <Eye size={16}></Eye>
                <span>Vista pública</span>
              </button>
              <div className={styles.userBadge}>
                <div className={styles.avatar}>{inicial}</div>
                <span className={styles.userName}>{usuario.email}</span>
              </div>
              <button
                className={styles.logoutbtn}
                onClick={onCerrarSesion}
                title="Cerrar Sesión"
              >
                <LogOut size={18}></LogOut>
              </button>
            </>
          )}
          {variant === "public" && !torneo && (
            <button
              className={styles.btnAdminPublic}
              type="button"
              onClick={() => navegacion("/login")}
            >
              <Lock size={18}></Lock>
              Administrar
            </button>
          )}
          {variant === "admin" && torneo && (
            <>
              <span className={styles.subTitleActions}>
                <Calendar size={18}></Calendar> {torneo.fecha_inicio}
              </span>

              <span className={styles.subTitleActions}>
                <MapPin size={18}></MapPin>
                {torneo.numero_canchas}{" "}
                {torneo.numero_canchas >= 2 ? "canchas" : "cancha"}
              </span>
              {/*FALTA EL ONCLICK DE LOS BOTONES PARA INICIAR TORNEO Y FINALIZARLO */}
              {torneo.estado === "registro" ? (
                <button
                  className={styles.btnAdminPublic}
                  onClick={onIniciarTorneo}
                >
                  <Play size={18}></Play> Iniciar
                </button>
              ) : (
                <button
                  className={styles.btnAdminPublic}
                  onClick={onFinalizarTorneo}
                >
                  <CheckCircle2Icon size={18}></CheckCircle2Icon> Finalizar
                </button>
              )}
            </>
          )}
        </div>
      </header>
      {torneo && (
        <nav className={styles.tabsNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === "equipos" ? styles.activeTab : ""}`}
            onClick={() => onTabChange("equipos")}
          >
            <Shield size={20}></Shield> Equipos
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === "calendario" ? styles.activeTab : ""}`}
            onClick={() => onTabChange("calendario")}
          >
            <Calendar size={20}></Calendar> Calendario
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "posiciones" ? styles.activeTab : ""}`}
            onClick={() => onTabChange("posiciones")}
          >
            <ChartNoAxesColumnIcon size={20}></ChartNoAxesColumnIcon> Posiciones
          </button>
        </nav>
      )}
    </>
  );
};
