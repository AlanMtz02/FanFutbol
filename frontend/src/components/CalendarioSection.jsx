import { ArrowUpRight, Calendar, Clock, Edit2, MapPin } from 'lucide-react';
import styles from './CalendarioSection.module.css';
import { useState } from 'react';
import { editarMarcador } from '../services/servicioTorneo';
import { ModalEditarMarcador } from './ModalEditarMarcador';
import { ModalFase } from './ModalFase';

export const CalendarioSection = ({
  torneo,
  variant,
  error,
  jornadasDelTorneo,
  onRefreshTorneo,
  equiposDelTorneo,
}) => {
  const [isModalOpenMarcador, setIsModalOpenMarcador] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [activeTab,setActiveTab]=useState(torneo.fase_actual?.toLowerCase() || 'regular');


  const [modalFase,setModalFase]=useState(null);

  const jornadasPorFase = (fase) =>jornadasDelTorneo.filter((j) => j.tipo_fase === fase);


  const totalJornadas = Array.isArray(jornadasDelTorneo)
    ? jornadasDelTorneo.length
    : 0;
  const totalPartidos = Array.isArray(jornadasDelTorneo)
    ? jornadasDelTorneo.reduce(
        (acc, jornada) => acc + (jornada.partidos?.length || 0),
        0,
      )
    : 0;

  const handleCloseModal = () => {
    setIsModalOpenMarcador(false);
    setPartidoSeleccionado(null);
  };

  const handleOpenModal = (partido) => {
    setIsModalOpenMarcador(true);
    setPartidoSeleccionado(partido);
  };

  const handleGuardarResultado = async (payload) => {
    setErrorModal(null);
    try {
      await editarMarcador(partidoSeleccionado.id, payload);
      onRefreshTorneo(); //Refresca todo el torneo (es cargarTorneo de detalle admin)
    } catch (error) {
      console.error(error.message);
      setErrorModal(
        error.message || "Error al modificar el resultado.Intenta de nuevo",
      );
    }
  };

  // Función auxiliar para validar que todos los partidos de una jornada esten finalizados
  const todasJornadasCompletas = (fase) => {
    const jornadasFase = jornadasDelTorneo.filter((j) => j.tipo_fase === fase);
    return jornadasFase.every((j) => {
      const finalizados =
        j.partidos?.filter((p) => p.estado === "finalizado").length || 0;
      const total = j.partidos?.length || 0;
      return finalizados === total;
    });
  };

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
                {torneo.estado !== "registro" && (
                  <>
                    {/* Regular siempre que no esté en registro */}
                    <button
                      className={`${styles.tab} ${activeTab === "regular" ? styles.activeTab : ""}`}
                      onClick={() => setActiveTab("regular")}
                    >
                      Regular
                    </button>

                    {/* Mostrar cuartos si la fase actual es cuartos o más adelante */}
                    {["cuartos", "semifinal", "final"].includes(
                      torneo.fase_actual,
                    ) && (
                      <button
                        className={`${styles.tab} ${activeTab === "cuartos" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("cuartos")}
                      >
                        Cuartos
                      </button>
                    )}

                    {/* Mostrar semis si la fase actual es semis o final */}
                    {["semifinal", "final"].includes(torneo.fase_actual) && (
                      <button
                        className={`${styles.tab} ${activeTab === "semifinal" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("semifinal")}
                      >
                        Semifinales
                      </button>
                    )}

                    {/* Mostrar final solo si la fase actual es final */}
                    {torneo.fase_actual === "final" && (
                      <button
                        className={`${styles.tab} ${activeTab === "final" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("final")}
                      >
                        Final
                      </button>
                    )}
                  </>
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
              <>
                <button
                  onClick={() => setModalFase("cuartos")}
                  className={styles.btnFase}
                >
                  <ArrowUpRight size={18}></ArrowUpRight>
                  Pasar a cuartos
                </button>
              </>
            )}
          {torneo.fase_actual === "cuartos" &&
            todasJornadasCompletas("cuartos") &&
            torneo.estado === "en_curso" &&
            variant === "admin" && (
              <>
                <button
                  onClick={() => setModalFase("semifinal")}
                  className={styles.btnFase}
                >
                  <ArrowUpRight size={18}></ArrowUpRight>
                  Pasar a semifinales
                </button>
              </>
            )}
          {torneo.fase_actual === "semifinal" &&
            todasJornadasCompletas("semifinal") &&
            torneo.estado === "en_curso" &&
            variant === "admin" && (
              <>
                <button
                  onClick={() => setModalFase("final")}
                  className={styles.btnFase}
                >
                  <ArrowUpRight size={18}></ArrowUpRight>
                  Pasar a la final
                </button>
              </>
            )}
        </div>
      </div>

      {torneo?.estado === "registro" && (
        <div className={styles.containerEnRegistro}>
          <div className={styles.infoEnRegistro}>
            <Calendar size={36} />
            <h4>El torneo aún está en registro</h4>
            <span>
              {variant === "admin"
                ? "Cuando se tengan más de dos equipos, presiona el botón Iniciar en la parte superior derecha."
                : "Revisa proximamente cuando el torneo este en curso."}
            </span>
          </div>
        </div>
      )}

      <div className={styles.containerJornadas}>
        {Array.isArray(jornadasDelTorneo) &&
          jornadasPorFase(activeTab).map((jornada) => {
            const finalizados =
              jornada.partidos?.filter((p) => p.estado === "finalizado")
                .length || 0;
            const total = jornada.partidos?.length || 0;

            return (
              <div key={jornada.id} className={styles.jornadaCard}>
                {/* Cabecera de la Jornada */}
                <div className={styles.jornadaHeader}>
                  <div className={styles.infoJornada}>
                    <h4>Jornada {jornada.numero_jornada}</h4>
                    <span className={styles.faseBadge}>
                      {jornada.tipo_fase}
                    </span>
                  </div>
                  <span className={styles.statusJornada}>
                    {finalizados} finalizados/{total}
                  </span>
                </div>

                {/* Lista de Partidos */}
                <div className={styles.containerPartidos}>
                  {jornada.partidos?.map((p) => (
                    <div className={styles.partidoRow} key={p.id}>
                      {/* 1. Indicador de estado */}
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
                            
                            Ganador en penales: <b> {[p.equipo_local,p.equipo_visita].find(
                              (equipo)=>equipo.id===p.ganador_penales_id)?.nombre
                            } </b>
                          </span>
                        )}
                      </div>

                      {/* 2. Equipo Local */}
                      <div className={styles.equipoLocal}>
                        {p.equipo_local?.nombre}
                      </div>

                      {/* 3. Marcador */}
                      <div className={styles.marcador}>
                        {p.goles_local ?? "-"} - {p.goles_visita ?? "-"}
                      </div>

                      {/* 4. Equipo Visita */}
                      <div className={styles.equipoVisita}>
                        {p.equipo_visita?.nombre || "Descanso"}
                      </div>

                      {/* 5. Info adicional y acciones */}
                      <div className={styles.actionsCol}>
                        <div className={styles.infoPartido}>
                          <div className={styles.info}>
                            <MapPin size={12} />
                            <span>{p.cancha}</span>
                          </div>
                          <div className={styles.info}>
                            <Clock size={12}></Clock>
                            <span>
                              {new Date(p.fecha_hora).toLocaleString("es-MX", {
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
                           (p.estado!=='finalizado' || torneo.fase_actual=='en_curso') && (
                            <button
                              type="button"
                              className={styles.btnEditar}
                              onClick={() => handleOpenModal(p)}
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
      {/*Modal para editar marcador */}
      {variant === "admin" && (
        <>
          <ModalEditarMarcador
            isOpen={isModalOpenMarcador}
            partido={partidoSeleccionado}
            torneo={torneo}
            onClose={handleCloseModal}
            onSave={handleGuardarResultado}
            errorModal={errorModal}
            onRefreshTorneo={onRefreshTorneo}
          ></ModalEditarMarcador>

          {modalFase && (
            <ModalFase
              fase={modalFase}
              torneo={torneo}
              equiposDelTorneo={equiposDelTorneo}
              onClose={() => setModalFase(null)}
              onRefreshTorneo={onRefreshTorneo}
            ></ModalFase>
          )}
        </>
      )}
    </>
  );
};