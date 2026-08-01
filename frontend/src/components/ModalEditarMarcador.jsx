import { useEffect, useState } from "react"
import styles from './ModalEditarMarcador.module.css';
import { MapPin, Plus, X } from "lucide-react";
export const ModalEditarMarcador=({isOpen,partido,torneo,onClose,onSave,errorModal})=>{
    const [golesLocal,setGolesLocal]=useState(partido?.goles_local ?? 0);
    const [golesVisita, setGolesVisita] = useState(partido?.goles_visita ?? 0);
    const [ganadorPenalesId,setGanadorPenalesId]=useState(null);
    const [observaciones,setObservaciones]=useState('');
    const [loading,setLoading]=useState(false);

    const handleSubmit=async (e)=>{
        e.preventDefault();
        setLoading(true);
        try{
          const payload = {
            goles_local: Number(golesLocal || 0),
            goles_visita: Number(golesVisita || 0),
            ganador_penales_id:
              torneo.fase_actual !== "regular" &&
              Number(golesLocal) === Number(golesVisita)
                ? ganadorPenalesId
                : null,
            observaciones: observaciones,
            estado: "finalizado",
          };
          onSave(payload); //Ejecuta la funcion del CalendarioSection
        }
        finally{
            setLoading(false);

        }
        
    }

    useEffect(()=>{
        if(partido){
            setGolesLocal(partido.goles_local);
            setGolesVisita(partido.goles_visita);
        }
        else{
            setGolesLocal(0);
            setGolesVisita(0);
        }
    },[partido])

    if(!isOpen || !partido){
        return null;
    }

    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
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
              <MapPin size={14} /> Cancha {partido.cancha}
            </div>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            {errorModal && <div className={styles.errorMsg}>{errorModal}</div>}
            <div className={styles.marcadorSection}>
              <div className={styles.inputGroup}>
                <label>{partido.equipo_local?.nombre}</label>
                <input
                  type="number"
                  min="0"
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
                  min="0"
                  value={golesVisita}
                  onChange={(e) => setGolesVisita(e.target.value)}
                  className={styles.scoreInput}
                />
              </div>
            </div>
            {torneo?.fase_actual !== "regular" &&
              Number(golesLocal) === Number(golesVisita) && (
                <div className={styles.penalesSection}>
                  <label className={styles.fieldLabel}>
                    Ganador por penales
                  </label>
                  <select
                    className={styles.selectPenales}
                    value={ganadorPenalesId}
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
                <Plus size={16}></Plus>
                {loading ? "Guardando..." : "Guardar resultado"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
    
    
}