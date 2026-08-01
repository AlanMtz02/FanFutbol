import { useState } from "react";

export function ModalFinalizarTorneo({isOpen,onClose,equipos,onConfirmar}){
    const [equipoSeleccionado,setEquipoSeleccionado]=useState('');
    if(!isOpen){
        return null;
    }

    const handleSubmit=(e)=>{
        e.preventDefault();
        if(!equipoSeleccionado){
            alert('Por favor selecciona el equipo campeón.')
        }
        onConfirmar(Number(equipoSeleccionado));//Llama al endpoint para finalizar torneo
        onClose();

    }

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3>🏆 Finalizar Torneo Oficialmente</h3>
          <p>Selecciona al equipo campeón para registrarlo en el Palmarés:</p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Equipo Campeón</label>
              <select
                value={equipoSeleccionado}
                onChange={(e) => setEquipoSeleccionado(e.target.value)}
                required
              >
                <option value="">-- Selecciona un equipo --</option>
                {equipos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.btnCancelar}
              >
                Cancelar
              </button>
              <button type="submit" className={styles.btnGuardar}>
                Confirmar Campeón y Finalizar
              </button>
            </div>
          </form>
        </div>
      </div>
    );

}