import { Clock, Plus, Trophy, X } from "lucide-react";
import { finalizarTorneo, pasarCuartos, pasarFinal, pasarSemis } from "../services/servicioTorneo";
import styles from './ModalFase.module.css';
import { useEffect, useState } from "react";

export const ModalFase=({fase,torneo,equiposDelTorneo,onClose,onRefreshTorneo})=>{
    const [hora, setHora] = useState("");
    const [equipoCampeon, setEquipoCampeon] = useState("");
    const [errorLocal,setErrorLocal]=useState(null);
    const [loading,setLoading]=useState(false);

    

    useEffect(()=>{
        if(torneo){
            setHora(torneo.hora_inicio);
            if(torneo.equipo_campeon_id){
                setEquipoCampeon(torneo.equipo_campeon_id);
            }
        }
        else{
            setHora("");
            setEquipoCampeon("");
        }
    },[torneo])

    //Ejecutar diferentes endpoints dependiendo la fase
    const handleSubmit=async (e)=>{
        setLoading(true);
        setErrorLocal(null);
        e.preventDefault();
        try{
            //El torneo ID ya lo converti a number directamente en el select
            if(fase==='cuartos'){
                await pasarCuartos(torneo.id,hora);
            }
            else if(fase==='semifinal'){
                await pasarSemis(torneo.id,hora);
            }
            else if (fase==='final'){
                await pasarFinal(torneo.id,hora)
            }

            alert(`Accion completada. Fase actual ${fase}.`)
            onRefreshTorneo();//Refresca todo el torneo (viene desde torneoAdminDetalle)
            onClose();//Cerrar el modal
        
        }
        catch(e){
            setErrorLocal(e.message || 'Error no se pudo completar la accion.')
            console.error(e);
        }
        finally{
            setLoading(false);
        }

    }

    //La validacion de si se renderiza o no, ocurre en el padre
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
              <>
                <div className={styles.field}>
                  <label>Selecciona la hora de inicio</label>
                  <div className={styles.inputIconWrapper}>
                    <Clock size={18} className={styles.inputIcon}></Clock>
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                    ></input>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.selectWrapper}>
                  <label>Selecciona el equipo campeón </label>
                  <select
                    value={equipoCampeon}
                    onChange={(e) => setEquipoCampeon(Number(e.target.value))}
                  >
                    <option value="">--Selecciona un equipo--</option>
                    {equiposDelTorneo.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {equipoCampeon && (
                  <div className={styles.previewCampeon}>
                    {/** Buscar el equipo seleccionado */}
                    {(() => {
                      const eq = equiposDelTorneo.find(
                        (e) => e.id === equipoCampeon,
                      );
                      if (!eq) return null;
                      return (
                        <div className={styles.previewCard}>
                          <span className={styles.nombreCampeon}>{eq.nombre}</span>
                          <span className={styles.nombreTorneo}>
                            <Trophy size={24}></Trophy> Campeon del Torneo : {torneo.nombre}
                          </span>
                          <img
                            src={eq.escudo_url}
                            alt={eq.nombre}
                            className={styles.escudo}
                          />
                        </div>
                      );
                    })()}
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
                <Plus size={16}></Plus>
                {loading
                  ? "Creando.."
                  : fase !== "finalizar"
                    ? `Iniciar ${fase}`
                    : "Finalizar torneo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}