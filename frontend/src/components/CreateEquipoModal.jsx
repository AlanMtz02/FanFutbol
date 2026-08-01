import { useEffect, useState } from "react";
import { agregarEquipo } from "../services/servicioTorneo";
import styles from './CreateTorneoModal.module.css';
import { IdCard, Plus, Shield, X } from "lucide-react";
export const CreateEquipoModal = ({
  onRefreshEquipos,
  torneo,
  onClose,
  isOpen,
  modo = "crear",
  equipoInicial = null,
  onEditarEquipo,
}) => {
  const [nombre, setNombre] = useState("");
  const [escudoUrl, setEscudoUrl] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const imagenesGenericas = [
    "https://static.vecteezy.com/system/resources/previews/003/759/974/large_2x/soccer-team-shield-emblem-free-vector.jpg",
    "https://img.freepik.com/vector-premium/plantilla-diseno-logo-vector-club-futbol_430232-401.jpg?w=1380",
    "https://img.freepik.com/premium-vector/vector-soccer-football-badge-logo-design-templates_600323-1623.jpg",
  ];



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre | !escudoUrl) {
      setError("Ingrese todos los campos requeridos");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const datosEquipo = {
        nombre: nombre,
        escudo_url: escudoUrl || imagenesGenericas[0],
      };
      if (modo === "crear") {
        await agregarEquipo(torneo.id, datosEquipo);
      } else {
        await onEditarEquipo(equipoInicial.id, datosEquipo);
      }
      onRefreshEquipos(); //Refresca la lista de equipos
      onClose(); //Cierra el modal
    } catch (error) {
      setError(error.message || "Error al inscribir el equipo");
    } finally {
      setLoading(false);
    }
  };

  //sincroniza cuando cambie equipoInicial o modo
  useEffect(() => {
    if (equipoInicial && modo === "editar") {
      setNombre(equipoInicial.nombre || "");
      setEscudoUrl(equipoInicial.escudo_url || "");
    } else {
      setNombre("");
      setEscudoUrl("");
    }
  }, [equipoInicial, modo]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{modo === "crear" ? "Crear equipo" : "Editar equipo"}</h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18}></X>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <div className={styles.field}>
            <label>Nombre del equipo</label>
            <div className={styles.inputIconWrapper}>
              <Shield size={18} className={styles.inputIcon}></Shield>
              <input
                type="text"
                placeholder="Ej. Real Madrid"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              ></input>
            </div>
          </div>
          <div className={styles.field}>
            <label>Escudo del equipo</label>
            <div className={styles.inputIconWrapper}>
              <IdCard size={18} className={styles.inputIcon}></IdCard>
              <input
                type="url"
                placeholder="https://..."
                value={escudoUrl}
                onChange={(e) => setEscudoUrl(e.target.value)}
              ></input>
            </div>
          </div>
          {/* Vista previa */}
          {escudoUrl && (
            <div className={styles.preview}>
              <img src={escudoUrl} alt="Vista previa escudo" />
            </div>
          )}

          {/* Opciones genéricas */}
          <div className={styles.field}>
            <label>O selecciona un escudo genérico:</label>
            <div className={styles.genericosList}>
              {imagenesGenericas.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt="Escudo genérico"
                  onClick={() => setEscudoUrl(img)}
                  className={
                    escudoUrl === img ? styles.selected : styles.generico
                  }
                />
              ))}
            </div>
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
              {loading
                ? "Creando.."
                : modo === "crear"
                  ? "Guardar equipo"
                  : "Aplicar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};;
