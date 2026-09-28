import styles from "./ModalConfirmarCampeon.module.css";
import { finalizarTorneo } from "../services/servicioTorneo";
import { useNavigate } from "react-router-dom";
import { Check, Trophy, X } from "lucide-react";

export const ModalConfirmarCampeon = ({
  isOpen,
  torneo,
  equipoCampeon,
  payload,
  onClose,
  onCloseEditar,
  onSaveMarcador,
  onRefreshTorneo,
  partidoId,
}) => {
  const navegacion = useNavigate();

  if (!isOpen || !equipoCampeon) {
    return null;
  }

  const handleFinalizar = async () => {
    try {
      // 1. Guardar el marcador del partido si se pasó guardadora
      if (onSaveMarcador && payload) {
        await onSaveMarcador(partidoId,payload);//Requiere el id del partido y el payload. Es la funcion editarMarcador de services
      }

      // 2. Finalizar el torneo en Backend
      await finalizarTorneo(torneo.id, equipoCampeon.id);

      alert(`Torneo finalizado. Campeón: ${equipoCampeon.nombre}`);


      // 3. Refrescar estado global del torneo / calendario
      if (onRefreshTorneo) {
        await onRefreshTorneo();
      }


      // 4. Cerrar modales
      onClose();
      if (onCloseEditar) {
        onCloseEditar();
      }

      // 5. Redireccionar
      navegacion("/admin/dashboard");
    } catch (err) {
      console.error("Error al finalizar el torneo:", err);
      alert(err.message || "No se pudo finalizar el torneo.");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Finalizar torneo</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.previewCard}>
          <span className={styles.nombreCampeon}>{equipoCampeon.nombre}</span>

          <span className={styles.nombreTorneo}>
            <Trophy size={16} />
            Campeón del torneo: {torneo.nombre}
          </span>

          {equipoCampeon.escudo_url && (
            <img
              src={equipoCampeon.escudo_url}
              alt={equipoCampeon.nombre}
              className={styles.escudo}
            />
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Volver
          </button>
          <button onClick={handleFinalizar} className={styles.submitBtn}>
            <Check size={16} />
            Finalizar torneo
          </button>
        </div>
      </div>
    </div>
  );
};
