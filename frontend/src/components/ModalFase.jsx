import { useEffect, useState } from "react";
import { Clock, Plus, Trophy } from "lucide-react";
import styles from "./ModalFase.module.css";
import {
  pasarCuartos,
  pasarFinal,
  pasarSemis,
  obtenerEquiposDelTorneo,
} from "../services/servicioTorneo";

export const ModalFase = ({ fase, torneo, onClose, onSuccess }) => {
  const [hora, setHora] = useState("");
  const [equipoCampeon, setEquipoCampeon] = useState("");
  const [equiposLocales, setEquiposLocales] = useState([]);

  const [errorLocal, setErrorLocal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (torneo) {
      setHora(torneo.hora_inicio || "");
      if (torneo.equipo_campeon_id) {
        setEquipoCampeon(torneo.equipo_campeon_id);
      }
    }
  }, [torneo]);

  // Si la acción es finalizar, pide los equipos para el select
  useEffect(() => {
    const cargarEquiposLocal = async () => {
      if (fase === "finalizar" && torneo?.id) {
        try {
          const lista = await obtenerEquiposDelTorneo(torneo.id);
          setEquiposLocales(lista || []);
        } catch (err) {
          console.error("Error al obtener los equipos:", err);
        }
      }
    };

    cargarEquiposLocal();
  }, [fase, torneo?.id]);

  // Búsqueda del equipo seleccionado
  let equipoEncontrado = null;
  if (equipoCampeon) {
    for (let i = 0; i < equiposLocales.length; i++) {
      if (equiposLocales[i].id === equipoCampeon) {
        equipoEncontrado = equiposLocales[i];
        break;//Terminar una vez se encuentre el equipo
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorLocal(null);

    try {
      if (fase === "cuartos") {
        await pasarCuartos(torneo.id, hora);
      } else if (fase === "semifinal") {
        await pasarSemis(torneo.id, hora);
      } else if (fase === "final") {
        await pasarFinal(torneo.id, hora);
      }

      alert(`Acción completada. Fase actual: ${fase}`);

      // Ejecuta todo lo que definió CalendarioSection (cargarCalendario + onEstructuraCambiada + cerrar modal)
      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      setErrorLocal(err.message || "Error: no se pudo completar la acción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>
            {fase !== "finalizar"
              ? `Definir hora de inicio de ${fase}`
              : "Finalizar torneo"}
          </h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorLocal && <div className={styles.errorMsg}>{errorLocal}</div>}

          {fase !== "finalizar" ? (
            <div className={styles.field}>
              <label>Selecciona la hora de inicio</label>
              <div className={styles.inputIconWrapper}>
                <Clock size={18} className={styles.inputIcon} />
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div className={styles.selectWrapper}>
                <label>Selecciona el equipo campeón</label>
                <select
                  value={equipoCampeon}
                  onChange={(e) => setEquipoCampeon(Number(e.target.value))}
                  required
                >
                  <option value="">-- Selecciona un equipo --</option>
                  {equiposLocales.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {equipoEncontrado && (
                <div className={styles.previewCampeon}>
                  <div className={styles.previewCard}>
                    <span className={styles.nombreCampeon}>
                      {equipoEncontrado.nombre}
                    </span>
                    <span className={styles.nombreTorneo}>
                      <Trophy size={24} /> Campeón del Torneo: {torneo.nombre}
                    </span>
                    <img
                      src={equipoEncontrado.escudo_url}
                      alt={equipoEncontrado.nombre}
                      className={styles.escudo}
                    />
                  </div>
                </div>
              )}
            </>
          )}

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
              <Plus size={16} />
              {loading
                ? "Guardando..."
                : fase !== "finalizar"
                  ? `Iniciar ${fase}`
                  : "Finalizar torneo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
