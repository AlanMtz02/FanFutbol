import { useEffect, useState } from "react";
import { ArrowUpRight, Calendar, Clock, Edit2, MapPin } from "lucide-react";
import styles from "./CalendarioSection.module.css";
import { ModalEditarMarcador } from "./ModalEditarMarcador";
import { ModalFase } from "./ModalFase";
import { obtenerJornadasDelTorneo } from "../services/servicioTorneo";

export const CalendarioSection = ({
  torneo,
  variant,
  onEstructuraCambiada,
}) => {
  // 1. Estados locales de datos y carga
  const [jornadasDelTorneo, setJornadasDelTorneo] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  // 2. Estados de interfaz y modales
  const [isModalOpenMarcador, setIsModalOpenMarcador] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [modalFase, setModalFase] = useState(null);
  const [activeTab, setActiveTab] = useState(
    torneo?.fase_actual?.toLowerCase() || "regular",
  );

  // 3. Función para pedir las jornadas
  const cargarCalendario = async () => {
    try {
      setErrorLocal(null);
      setCargando(true);
      const data = await obtenerJornadasDelTorneo(torneo.id);
      setJornadasDelTorneo(data || []);
    } catch (err) {
      setErrorLocal(err.message || "Error al obtener el calendario.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (torneo?.id) {
      cargarCalendario();
    }
  }, [torneo?.id]);

  // Si el torneo cambia de fase, actualizamos la pestaña
  useEffect(() => {
    if (torneo?.fase_actual) {
      setActiveTab(torneo.fase_actual.toLowerCase());
    }
  }, [torneo?.fase_actual]);

  // Función para filtrar jornadas por la pestaña activa
  const jornadasFiltradas = (fase) => {
    return jornadasDelTorneo.filter((jornada) => jornada.tipo_fase === fase);
  };

  // Filtramos solo las jornadas de fase regular
  const jornadasRegulares = jornadasDelTorneo.filter(
    (j) => j.tipo_fase === "regular",
  );

  // Número de jornadas regulares
  const totalJornadas = jornadasRegulares.length;

  // Contamos solo los partidos que no son descanso
  let totalPartidos = 0;
  for (let j of jornadasRegulares) {
    const partidosValidos = (j.partidos || []).filter(
      (p) => p.estado !== "descanso",
    );
    totalPartidos += partidosValidos.length;
  }
  
  

  // Funciones para abrir y cerrar el modal del marcador
  const handleOpenModalMarcador = (partido) => {
    setPartidoSeleccionado(partido);
    setIsModalOpenMarcador(true);
  };

  const handleCloseModalMarcador = () => {
    setIsModalOpenMarcador(false);
    setPartidoSeleccionado(null);
  };

  const todasJornadasCompletas = (fase) => {
    // Filtramos las jornadas de la fase que nos interesa
    const jornadasFase = jornadasDelTorneo.filter((j) => j.tipo_fase === fase);
    if (jornadasFase.length === 0) return false;

    // Revisamos cada jornada
    for (let j of jornadasFase) {
      // Solo tomamos partidos que no sean descanso
      const partidosValidos = (j.partidos || []).filter(
        (p) => p.estado !== "descanso",
      );

      // Contamos cuántos ya están finalizados
      const finalizados = partidosValidos.filter(
        (p) => p.estado === "finalizado",
      ).length;

      // Si no todos están finalizados, la jornada no está completa
      if (finalizados !== partidosValidos.length) return false;
    }

    // Si todas las jornadas pasaron la prueba, entonces están completas
    return true;
  };


  if (cargando) {
    return <div style={{ padding: "1.5rem" }}>Cargando calendario...</div>;
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Calendario de partidos</h3>
          <span className={styles.subTitle}>
            {totalJornadas} jornadas / {totalPartidos} partidos
          </span>

          <div className={styles.containerTabs}>
            {torneo.estado !== "registro" && (
              <>
                <button
                  type="button"
                  className={`${styles.tab} ${
                    activeTab === "regular" ? styles.activeTab : ""
                  }`}
                  onClick={() => setActiveTab("regular")}
                >
                  Regular
                </button>

                {["cuartos", "semifinal", "final"].includes(
                  torneo.fase_actual,
                ) && (
                  <button
                    type="button"
                    className={`${styles.tab} ${
                      activeTab === "cuartos" ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("cuartos")}
                  >
                    Cuartos
                  </button>
                )}

                {["semifinal", "final"].includes(torneo.fase_actual) && (
                  <button
                    type="button"
                    className={`${styles.tab} ${
                      activeTab === "semifinal" ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("semifinal")}
                  >
                    Semifinales
                  </button>
                )}

                {torneo.fase_actual === "final" && (
                  <button
                    type="button"
                    className={`${styles.tab} ${
                      activeTab === "final" ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("final")}
                  >
                    Final
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className={styles.containerPasarFase}>
          {torneo.fase_actual === "regular" &&
            todasJornadasCompletas("regular") &&
            torneo.estado === "en_curso" &&
            variant === "admin" && (
              <button
                type="button"
                onClick={() => setModalFase("cuartos")}
                className={styles.btnFase}
              >
                <ArrowUpRight size={18} />
                Pasar a cuartos
              </button>
            )}

          {torneo.fase_actual === "cuartos" &&
            todasJornadasCompletas("cuartos") &&
            torneo.estado === "en_curso" &&
            variant === "admin" && (
              <button
                type="button"
                onClick={() => setModalFase("semifinal")}
                className={styles.btnFase}
              >
                <ArrowUpRight size={18} />
                Pasar a semifinales
              </button>
            )}

          {torneo.fase_actual === "semifinal" &&
            todasJornadasCompletas("semifinal") &&
            torneo.estado === "en_curso" &&
            variant === "admin" && (
              <button
                type="button"
                onClick={() => setModalFase("final")}
                className={styles.btnFase}
              >
                <ArrowUpRight size={18} />
                Pasar a la final
              </button>
            )}
        </div>
      </div>

      {errorLocal && <div className={styles.errorBox}>{errorLocal}</div>}

      {torneo?.estado === "registro" && (
        <div className={styles.containerEnRegistro}>
          <div className={styles.infoEnRegistro}>
            <Calendar size={36} />
            <h4>El torneo aún está en registro</h4>
            <span>
              {variant === "admin"
                ? "Presiona el botón Iniciar en la parte superior derecha cuando ya estén los equipos inscritos."
                : "Revisa próximamente cuando el torneo esté en curso."}
            </span>
          </div>
        </div>
      )}

      <div className={styles.containerJornadas}>
        {jornadasFiltradas(activeTab).map((jornada) => {
          const partidos = jornada.partidos || [];

          // Solo partidos que no son descanso
          const partidosValidos = partidos.filter(
            (p) => p.estado !== "descanso",
          );

          // Cuántos ya están finalizados
          const finalizados = partidosValidos.filter(
            (p) => p.estado === "finalizado",
          ).length;

          return (
            <div key={jornada.id} className={styles.jornadaCard}>
              <div className={styles.jornadaHeader}>
                <div className={styles.infoJornada}>
                  <h4>Jornada {jornada.numero_jornada}</h4>
                  <span className={styles.faseBadge}>{jornada.tipo_fase}</span>
                </div>
                <span className={styles.statusJornada}>
                  {finalizados} finalizados/{partidosValidos.length}
                </span>
              </div>

              <div className={styles.containerPartidos}>
                {partidos.map((p) => (
                  <div
                    className={`${styles.partidoRow} ${
                      p.estado === "descanso" ? styles.partidoDescanso : ""
                    }`}
                    key={p.id}
                  >
                    <div className={styles.statusCol}>
                      <span
                        className={
                          p.estado === "finalizado"
                            ? styles.badgeFinalizado
                            : styles.badgePendiente
                        }
                      />
                      {p.ganador_penales_id && (
                        <span className={styles.ganadorPenales}>
                          Ganador en penales:{" "}
                          <b>
                            {
                              [p.equipo_local, p.equipo_visita].find(
                                (equipo) => equipo?.id === p.ganador_penales_id,
                              )?.nombre
                            }
                          </b>
                        </span>
                      )}
                    </div>

                    <div className={styles.equipoLocal}>
                      {p.equipo_local?.nombre}
                    </div>

                    <div className={styles.marcador}>
                      {p.goles_local ?? "-"} - {p.goles_visita ?? "-"}
                    </div>

                    <div className={styles.equipoVisita}>
                      {p.equipo_visita?.nombre || "Descanso"}
                    </div>

                    <div className={styles.actionsCol}>
                      <div className={styles.infoPartido}>
                        <div className={styles.info}>
                          <MapPin size={12} />
                          <span>{p.cancha}</span>
                        </div>
                        <div className={styles.info}>
                          <Clock size={12} />
                          <span>
                            {p.estado === "descanso"
                              ? "Descanso"
                              : new Date(p.fecha_hora).toLocaleString("es-MX", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                          </span>
                        </div>
                      </div>

                      {torneo.estado === "en_curso" &&
                        variant === "admin" &&
                        jornada.tipo_fase === torneo.fase_actual &&
                        p.estado !== "descanso" && (
                          <button
                            type="button"
                            className={styles.btnEditar}
                            onClick={() => handleOpenModalMarcador(p)}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para editar marcador.Validacion doble*/}
      {variant === "admin" && isModalOpenMarcador && (
        <ModalEditarMarcador
          isOpen={isModalOpenMarcador}
          partido={partidoSeleccionado}
          torneo={torneo}
          onClose={handleCloseModalMarcador}
          onSuccess={cargarCalendario}
        />
      )}

      {/* Modal para pasar de fase.Validacion doble*/}
      {variant === "admin" && modalFase && (
        <ModalFase
          fase={modalFase}
          torneo={torneo}
          onClose={() => setModalFase(null)}
          onSuccess={async () => {
            setModalFase(null);
            await cargarCalendario();
            //Actualiza el torneo ya que cambiamos de fase
            if (onEstructuraCambiada) {
              onEstructuraCambiada();
            }
          }}
        />
      )}
    </>
  );
};
