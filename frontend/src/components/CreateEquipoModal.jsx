import { useEffect, useState } from "react";
import { IdCard, Plus, Shield, X } from "lucide-react";
import styles from "./CreateTorneoModal.module.css";
import { agregarEquipo, editarEquipo } from "../services/servicioTorneo";

export const CreateEquipoModal = ({
  isOpen,
  modo = "crear",
  equipoInicial = null,
  torneo,
  onSuccess,
  onClose,
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

  // Sincroniza campos cuando cambia el estado de apertura o las props
  useEffect(() => {
    //Si esta abierto
    if (isOpen) {
      setError(null);
      //Setear valores dependiendo del modo
      if (equipoInicial && modo === "editar") {
        setNombre(equipoInicial.nombre || "");
        setEscudoUrl(equipoInicial.escudo_url || "");
      } else {
        setNombre("");
        setEscudoUrl("");
      }
    }
  }, [equipoInicial, modo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Limpiar errores pasados
    setError(null);
    //Validar que el campo nombre sea llenado
    if (!nombre.trim()) {
      setError("El nombre del equipo es obligatorio.");
      return;
    }
    //Iniciar carga
    setLoading(true);

    try {
      //Armar el objeto de los datos a enviar (son los mismos para crear y editar)
      const datosEquipo = {
        nombre: nombre.trim(),
        escudo_url: escudoUrl.trim() || imagenesGenericas[0],
      };

      //Determinar a que endpoint pegarle dependiendo el modo
      if (modo === "crear") {
        await agregarEquipo(torneo.id, datosEquipo);
      } else {
        await editarEquipo(torneo.id, equipoInicial.id, datosEquipo);
      }

      // Notifica a EquiposSection que se guardó con éxito para refrescar y cerrar
      if (onSuccess) {
        await onSuccess();//Cierra el modal, pone null el equipo en edicion y llama a la funcion cargar equipos de equipos section
      }
    } catch (err) {
      setError(
        err.message || "Ocurrió un error al procesar la solicitud del equipo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{modo === "crear" ? "Crear equipo" : "Editar equipo"}</h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.field}>
            <label>Nombre del equipo</label>
            <div className={styles.inputIconWrapper}>
              <Shield size={18} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Ej. Real Madrid"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Escudo del equipo</label>
            <div className={styles.inputIconWrapper}>
              <IdCard size={18} className={styles.inputIcon} />
              <input
                type="url"
                placeholder="https://..."
                value={escudoUrl}
                onChange={(e) => setEscudoUrl(e.target.value)}
                disabled={loading}
              />
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
                  onClick={() => !loading && setEscudoUrl(img)}
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
              disabled={loading}
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
                : modo === "crear"
                  ? "Guardar equipo"
                  : "Aplicar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
