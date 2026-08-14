import { useEffect, useState } from "react";
import styles from "./ModalEditarMarcador.module.css";
import { ArrowRight, MapPin, Plus, Trophy, X } from "lucide-react";
import { ModalConfirmarCampeon } from "./ModalConfirmarCampeon";

export const ModalEditarMarcador = ({
  isOpen, 
  partido,
  torneo,
  onClose,
  onSave,
  errorModal,
  onRefreshTorneo,
}) => {
  const [golesLocal, setGolesLocal] = useState("");
  const [golesVisita, setGolesVisita] = useState("");
  const [mostrarModalCampeon,setMostrarModalCampeon]=useState(false);
  const [payloadParaElModal,setPayloadParaElModal]=useState(null);

  const [ganadorPenalesId, setGanadorPenalesId] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);


  //Saber si es final. Apuntando al torneo que es el que tiene ese campo
  const esFinal = torneo?.fase_actual === "final";

  //Preparar el campeon cuando es la final
  let equipoCampeonId = null;
  if (esFinal) {
    //Saber si gano el local o la visita. Importante setearlos a numeros porque vienen como strings
    if (Number(golesLocal) > Number(golesVisita)) {
      equipoCampeonId = partido?.equipo_local?.id; //Asigno el id del local como equipo campeon
    } else if (Number(golesVisita) > Number(golesLocal)) {
      equipoCampeonId = partido?.equipo_visita?.id; //Asigno el id del visitante como equipo campeon
    } else if (ganadorPenalesId) {
      //Hay empate, entonces el campeon se decide a traves del select
      equipoCampeonId = ganadorPenalesId;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      //El equipo campeonId ya lo obtuvimos antes
      const payload = {
        //Convertir a numeros porque vienen como strings por el input y por el useffect
        goles_local: Number(golesLocal),
        goles_visita: Number(golesVisita),
        //Este campo lo mando con un valor (siempre lo mando)
        ganador_penales_id:
          torneo.fase_actual !== "regular" && golesLocal === golesVisita
            ? ganadorPenalesId //Cuando son eliminatorias y se empatan, se asigna el ganador por penales
            : null, //Siempre mando null en cualquier otro caso donde haya ganador normal
        observaciones: observaciones,
        estado: "finalizado",
      };

      //La finalizacion del torneo cuando es final ocurre en el ModalCampeon
      if(esFinal){
        //Seteo el payload porque la finalizacion y el actualizar partido ocurren el otro modal
        setPayloadParaElModal(payload);
        setMostrarModalCampeon(true);// Abrir el modal de confirmar campeon
      }
      else{ //Si no es final , guarda el resultado y cierra el modal de marcador
        await onSave(payload); //Finaliza el partido, actualiza el partido
        onClose(); //cierra el modal

      }
      
    } finally {
      setLoading(false);
    }
  };

  //Se monta cada vez que cambia la variable partido. Esta al pendiente de dicha variable y entonces se ejcuta este useffect
  useEffect(() => {
    //Si no hay partido o isOpen es false, no devuelve nada pero se renderiza de todas formas
    if (!partido || !isOpen) {
      return ;
    }

    //Aqui se sabe que hay partido por lo tanto inicializar valores. Los  goles vienen seteados como string, por lo tanto, aqui tambien los inicializamos como strings.
    //OJO: ?? significa si viene como null conviertelo a 
    setGolesLocal(partido.goles_local?.toString() ?? '');
    setGolesVisita(partido.goles_visita?.toString() ?? '');
    setObservaciones(partido.observaciones ?? '');
    setGanadorPenalesId(partido.ganador_penales_id ?? null);
  }, [partido]);

  //Esta variable es para obtener el equipo campeon (OBJETO COMPLETO) y en base a eso mostrar la card. Ya sea el local o visita, verifico que si ese ID es el mismo que el que asigne en el let equipoCampeonId entonces guardarlo
  const equipoCampeon = [partido?.equipo_local, partido?.equipo_visita].find(
    (e) => e?.id === equipoCampeonId,
  );

  //Validacion necesaria por si aun el partido es nulo, pues directamente no abrir el modal. Al ponerle return null, el modal no se renderiza. Va afuera de useeffect porque este no puede return null y obligar a que no se renderize.
  if (!isOpen || !partido) {
    return null;
  }

  return (
   <> 
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${esFinal ? styles.modalFinal : ""}`}>
        <div className={styles.header}>
          <h2>Editar Resultado</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={18}></X>
          </button>
        </div>
        <div className={styles.partidoCardInfo}>
          <span className={styles.subLabel}>Partido</span>
          <div className={styles.enfrentamiento}>
            <strong>{partido.equipo_local?.nombre}</strong>
            <span className={styles.vs}>vs</span>
            <strong>{partido.equipo_visita?.nombre}</strong>
          </div>
          <div className={styles.cancha}>
            <MapPin size={14} />{partido.cancha}
          </div>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {errorModal && <div className={styles.errorMsg}>{errorModal}</div>}
          <div className={styles.marcadorSection}>
            <div className={styles.inputGroup}>
              <label>{partido.equipo_local?.nombre}</label>
              <input
                type="number"
                value={golesLocal}
                onChange={(e) => setGolesLocal(e.target.value)}
                className={styles.scoreInput}
              />
            </div>

            <span className={styles.dash}>-</span>

            <div className={styles.inputGroup}>
              <label>{partido.equipo_visita?.nombre}</label>
              <input
                type="number"
                value={golesVisita}
                onChange={(e) => setGolesVisita(e.target.value)}
                className={styles.scoreInput}
              />
            </div>
          </div>
          {torneo?.fase_actual !==
            "regular" /*Si estamos en fases eliminatorias y hay empate, Salta el select. Las opciones que se muestran son propias del partido que son el local y visita */ &&
            golesLocal === golesVisita && (
              <div className={styles.penalesSection}>
                <label className={styles.fieldLabel}>Ganador por penales</label>
                <select
                  className={styles.selectPenales}
                  value={ganadorPenalesId}
                  onChange={(e) => setGanadorPenalesId(Number(e.target.value))}
                  required
                >
                  <option value="">Selecciona equipo</option>
                  <option value={partido.equipo_local?.id}>
                    {partido.equipo_local?.nombre}
                  </option>
                  <option value={partido.equipo_visita?.id}>
                    {partido.equipo_visita?.nombre}
                  </option>
                </select>
              </div>
            )}
          <div className={styles.observacionesSection}>
            <label className={styles.fieldLabel}>Observaciones</label>
            <input
              type="text"
              placeholder="Ej: Tarjeta roja para el numero 10 del equipo local"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={styles.textInput}
            />
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {esFinal ? (
                <ArrowRight size={16}></ArrowRight>
              ) : (
                <Plus size={16}></Plus>
              )}
              {loading
                ? "Guardando..."
                : esFinal
                  ? "Continuar"
                  : "Guardar resultado"}
            </button>
          </div>
        </form>
      </div>
    
    </div>
    {/*La validacion de si se muestra o no, ocurre en el modal */}
    <ModalConfirmarCampeon isOpen={mostrarModalCampeon} torneo={torneo} equipoCampeon={equipoCampeon} onClose={()=>setMostrarModalCampeon(false)} onRefreshTorneo={onRefreshTorneo} onSave={onSave} payload={payloadParaElModal} onClose={()=>setMostrarModalCampeon(false)} onCloseEditar={onClose}></ModalConfirmarCampeon>
    </>
    
  )
};
