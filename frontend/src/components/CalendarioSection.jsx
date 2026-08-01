import { Calendar, Clock, Edit2, MapPin } from 'lucide-react';
import styles from './CalendarioSection.module.css';
import { useState } from 'react';
import { editarMarcador } from '../services/servicioTorneo';
import { ModalEditarMarcador } from './ModalEditarMarcador';

export const CalendarioSection=({torneo,variant,error,jornadasDelTorneo,onRefreshTorneo})=>{

  const [isModalOpen,setIsModalOpen]=useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [errorModal,setErrorModal]=useState(null);

  const totalJornadas = Array.isArray(jornadasDelTorneo)
    ? jornadasDelTorneo.length
    : 0;
  const totalPartidos = Array.isArray(jornadasDelTorneo)
    ? jornadasDelTorneo.reduce(
        (acc, jornada) => acc + (jornada.partidos?.length || 0),
        0,
      )
    : 0;


  const handleCloseModal=()=>{
    setIsModalOpen(false);
    setPartidoSeleccionado(null);

  }

  const handleOpenModal=(partido)=>{
    setIsModalOpen(true);
    setPartidoSeleccionado(partido);
    
  }

  const handleGuardarResultado=async(payload)=>{
    setErrorModal(null)
    try{
      await editarMarcador(partidoSeleccionado.id,payload)
      onRefreshTorneo(); //Refresca todo el torneo (es cargarTorneo de detalle admin)
      handleCloseModal(); //Cierra el modal y partidoseleccionado se vuelve null
    }
    catch(error){
      console.error(error.message);
      setErrorModal(error.message || 'Error al modificar el resultado.Intenta de nuevo')

    }
  }

    return (
      <>
        <div className={styles.header}>
          <h3 className={styles.title}>Calendario de partidos</h3>
          <span className={styles.subTitle}>
            {totalJornadas} jornadas / {totalPartidos} partidos
          </span>
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
            jornadasDelTorneo.map((jornada) => {
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
                                {new Date(p.fecha_hora).toLocaleString(
                                  "es-MX",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>

                          {torneo.estado === "en_curso" &&
                            variant === "admin" && (
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
          <ModalEditarMarcador
            isOpen={isModalOpen}
            partido={partidoSeleccionado}
            torneo={torneo}
            onClose={handleCloseModal}
            onSave={handleGuardarResultado}
            errorModal={errorModal}
          ></ModalEditarMarcador>
        )}
      </>
    );
}