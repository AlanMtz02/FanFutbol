import { useEffect, useState } from "react";
import styles from "./ModalEditarMarcador.module.css";
import { ArrowRight, MapPin, Plus, X } from "lucide-react";
import { ModalConfirmarCampeon } from "./ModalConfirmarCampeon";
import { editarMarcador } from "../services/servicioTorneo";

export const ModalEditarMarcador = ({
  isOpen,
  partido,
  torneo,
  onClose,
  onSuccess,
}) => {
  const [golesLocal, setGolesLocal] = useState("");
  const [golesVisita, setGolesVisita] = useState("");
  const [ganadorPenalesId, setGanadorPenalesId] = useState(null);
  const [observaciones, setObservaciones] = useState("");

  const [mostrarModalCampeon, setMostrarModalCampeon] = useState(false);
  const [payloadParaElModal, setPayloadParaElModal] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  // Saber si es la final
  const esFinal = torneo?.fase_actual === "final";

  // Determinar quién es el campeón (solo ID) según los goles/penales
  let equipoCampeonId = null;
  if (esFinal) {
    const numLocal = Number(golesLocal);
    const numVisita = Number(golesVisita);

    if (numLocal > numVisita) {
      equipoCampeonId = partido?.equipo_local?.id;
    } else if (numVisita > numLocal) {
      equipoCampeonId = partido?.equipo_visita?.id;
    } else if (ganadorPenalesId) {//Asignar el ganador en penales
      equipoCampeonId = ganadorPenalesId;
    }
  }

  // Buscar el equipo campeón (objeto completo) con un bucle
  let equipoCampeon = null;
  //Validar que exista un equipo campeon ID
  if (equipoCampeonId) {
    if (partido?.equipo_local?.id === equipoCampeonId) {
      equipoCampeon = partido.equipo_local;
    } else if (partido?.equipo_visita?.id === equipoCampeonId) {
      equipoCampeon = partido.equipo_visita;
    }
  }

  useEffect(() => {
    if (!partido || !isOpen) {
      return;
    }

    if (partido.goles_local !== null && partido.goles_local !== undefined) {
      setGolesLocal(partido.goles_local.toString());
    } else {
      setGolesLocal("");
    }

    if (partido.goles_visita !== null && partido.goles_visita !== undefined) {
      setGolesVisita(partido.goles_visita.toString());
    } else {
      setGolesVisita("");
    }

    setObservaciones(partido.observaciones || "");
    setGanadorPenalesId(partido.ganador_penales_id || null);
    setErrorModal(null);
  }, [partido, isOpen]);

  if (!isOpen || !partido) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorModal(null);

    try {
      //Validar que en fases eliminatorias si hay empate, marque un ganador en penales
      if (
        torneo.fase_actual !== "regular" &&
        Number(golesLocal) === Number(golesVisita) &&
        !ganadorPenalesId
      ) {
        setErrorModal(
          "En fases eliminatorias debes seleccionar al ganador de los penales si hay empate.",
        );
        setLoading(false);
        return; //Sale de esta funcion
      }
      //Datos a enviar
      const payload = {
        goles_local: Number(golesLocal),
        goles_visita: Number(golesVisita),
        ganador_penales_id: ganadorPenalesId ? Number(ganadorPenalesId) : null, // Si no hay ID, envía null        
        observaciones: observaciones,
        estado: "finalizado",
      };

      if (esFinal) {
        setPayloadParaElModal(payload);
        setMostrarModalCampeon(true);
      } else {
        await editarMarcador(partido.id, payload);

        if (onSuccess) {
          await onSuccess(); 
        }

        onClose();
      }
    } catch (err) {
      setErrorModal(err.message || "Error al guardar el marcador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.overlay}>
        <div className={`${styles.modal} ${esFinal ? styles.modalFinal : ""}`}>
          <div className={styles.header}>
            <h2>Editar Resultado</h2>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <X size={18} />
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
              <MapPin size={14} />
              {partido.cancha}
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
                  required
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
                  required
                />
              </div>
            </div>

            {torneo?.fase_actual !== "regular" &&
              golesLocal === golesVisita &&
              golesLocal !== "" && (
                <div className={styles.penalesSection}>
                  <label className={styles.fieldLabel}>
                    Ganador por penales
                  </label>
                  <select
                    className={styles.selectPenales}
                    value={ganadorPenalesId || ""}
                    onChange={(e) =>
                      setGanadorPenalesId(Number(e.target.value))
                    }
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
                placeholder="Ej: Tarjeta roja para el número 10"
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
                {esFinal ? <ArrowRight size={16} /> : <Plus size={16} />}
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

      {mostrarModalCampeon && (
        <ModalConfirmarCampeon
          isOpen={mostrarModalCampeon}
          torneo={torneo}
          equipoCampeon={equipoCampeon}
          payload={payloadParaElModal}
          partidoId={partido.id}
          onClose={() => setMostrarModalCampeon(false)}
          onCloseEditar={onClose}
          onSaveMarcador={editarMarcador}
          onRefreshTorneo={onSuccess}
        />
      )}
    </>
  );
};
