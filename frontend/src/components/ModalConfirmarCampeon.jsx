import styles from "./ModalConfirmarCampeon.module.css";
import { finalizarTorneo } from "../services/servicioTorneo";
import { useNavigate } from "react-router-dom";
import { Check, Trophy, X } from "lucide-react";
export const ModalConfirmarCampeon = ({
  isOpen,
  torneo,
  equipoCampeon,
  onClose,
  onRefreshTorneo,
  payload,
  onSave,
  onCloseEditar
}) => {
  const navegacion = useNavigate();

  //La validacion de si se muestra o no, ocurre aqui recibiendo la variable isOpen
  //Ademas una validacion extra de la que depende este modal que seria que exista un equipoCampeon que le pase el modal de editar marcador
  if (!isOpen || !equipoCampeon) {
    return null; //Al devolver null, NO SE RENDERIZA
  }

  const handleFinalizar = async () => {
    //Guarda el resultado de la final
    await onSave(payload)

    //Finalizar el torneo
    await finalizarTorneo(torneo.id,equipoCampeon.id)

    //Refrescar torneo
    await onRefreshTorneo();

    alert(`Torneo finalizado. Campeón: ${equipoCampeon.nombre}`);

    //Limpiar estados.
    //Cierro primero el modal de campeon.Funcion con set mostra modal campeon false
    onClose();

    //Despues cierro el modal de editar marcador.Funcion con set mostrar modal editar marcador false y set partido seleccionado null.
    onCloseEditar();


    navegacion('/admin/dashboard')
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Finalizar torneo</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18}></X>
          </button>
        </div>
        <div className={styles.previewCard}>
          <span className={styles.nombreCampeon}>{equipoCampeon.nombre}</span>

          <span className={styles.nombreTorneo}>
            <Trophy size={16}></Trophy>
            Campeón del torneo: {torneo.nombre}
          </span>

          <img
            src={equipoCampeon.escudo_url}
            alt={equipoCampeon.nombre}
            className={styles.escudo}
          />
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelBtn}>Volver</button>
          <button onClick={handleFinalizar} className={styles.submitBtn}>
            <Check size={16}></Check>
            Finalizar torneo
          </button>
        </div>
      </div>
    </div>
  );
};
