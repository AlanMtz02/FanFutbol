import { useState } from "react";
import { crearTorneo } from "../services/servicioTorneo";
import styles from './CreateTorneoModal.module.css';
import { Calendar, Clock, Plus, Trophy, X } from "lucide-react";

export const CreateTorneoModal = ({ isOpen, onClose, onTorneoCreado }) => {
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [numeroCanchas, setNumeroCanchas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if(!isOpen) return null;

  const handleSubmit=async (e)=>{
    e.preventDefault();//Evita recargar formularios
    if(!nombre || !fechaInicio || !horaInicio  || !numeroCanchas ){
        setError('Todos los campos son requeridos.')
        return;
    }

    try{
        setLoading(true);
        setError('');
        //Hacer la llamada al endpoint con el servicioTorneo ->crearTorneo
        await crearTorneo({
          //Mismas claves que el schema espera
            nombre:nombre,
            fecha_inicio:fechaInicio,
            hora_inicio:`${horaInicio}:00`,//Fastapi exige HH:MM:SS
            numero_canchas:parseInt(numeroCanchas,10) //Convierte a base 10
        })

        //Reset de campos
        setNombre("");
        setFechaInicio("");
        setHoraInicio("09:00");
        setNumeroCanchas(1);

        onTorneoCreado(); //Vuelve a llamar al endpoint de listar torneos
        onClose(); //Cierra el modal

    }
    catch(err){
        setError(err.messaage || 'Error al crear el torneo.')
    }
    finally{
        setLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Crear Nuevo Torneo</h2>
          <button onClick={onClose} className={styles.closeBtn} type="button">
            <X size={18}></X>
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <div className={styles.field}>
            <label>Nombre del torneo</label>
            <div className={styles.inputIconWrapper}>
              <Trophy size={18} className={styles.inputIcon}></Trophy>
              <input
                type="text"
                placeholder="Copa Primavera 2026"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              ></input>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Fecha de inicio</label>
              <div className={styles.inputIconWrapper}>
                <Calendar size={18} className={styles.inputIcon}></Calendar>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                ></input>
              </div>
            </div>
            <div className={styles.field}>
              <label>Hora de inicio</label>
              <div className={styles.inputIconWrapper}>
                <Clock size={18} className={styles.inputIcon}></Clock>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                ></input>
              </div>
            </div>
          </div>
          <div className={styles.field}>
            <label>Numero de canchas</label>
            <div className={styles.canchasSelector}>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`${styles.canchaOption} ${numeroCanchas === num ? styles.selectedCancha : ""}`}
                  onClick={(e)=>setNumeroCanchas(num)}
                >
                    {num}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
                <Plus size={16}></Plus>
                {loading ? 'Creando..' : 'Crear Torneo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
