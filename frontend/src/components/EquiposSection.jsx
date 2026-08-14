import { CheckCircle2, Edit2, Plus, Shield, Trash2 } from "lucide-react";
import styles from "./EquiposSection.module.css";
import { useState } from "react";
import { CreateEquipoModal } from "./CreateEquipoModal";
import { agregarEquipo } from "../services/servicioTorneo";

export const EquiposSection = ({
  torneo,
  variant,
  error,
  numEquiposDelTorneo,
  onRefreshEquipos,
  equiposDelTorneo,
  equiposGlobales,
  onEditarEquipo,
  onEliminarEquipo,
}) => {
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [mostrarModalEquipo, setMostrarModalEquipo] = useState(false);
  const [equipoEnEdicion, setEquipoEnEdicion] = useState(null);

  //Filtrar equipos globales que no estén ya inscritos en el torneo
  //Puede ser ID o  por Nombre
  const equiposDisponibles = equiposGlobales.filter(
    (eqGlobal) =>
      !equiposDelTorneo.some((eqTorneo) => eqTorneo.nombre === eqGlobal.nombre),
  );

  const inscribirEquipoEnTorneo = async () => {
    if (!equipoSeleccionado) return;
    try {
      // Buscar el equipo seleccionado en la lista global
      const equipo = equiposGlobales.find(
        (eq) => eq.id === parseInt(equipoSeleccionado),
      );
      if (!equipo) return;

      // Mandar nombre y escudo_url al endpoint
      await agregarEquipo(torneo.id, {
        nombre: equipo.nombre,
        escudo_url: equipo.escudo_url,
      });

      onRefreshEquipos(); // refresca lista del torneo
      setEquipoSeleccionado(""); // limpia selección
    } catch (err) {
      console.error("Error al inscribir equipo:", err.message);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h3 className={styles.title}>Equipos inscritos</h3>
            <span className={styles.subTitle}>
              {numEquiposDelTorneo} equipos inscritos en este torneo
            </span>
          </div>
          {equiposGlobales.length > 0 &&
            torneo.estado === "registro" &&
            variant === "admin" && (
              <div className={styles.selectWrapper}>
                <label>Selecciona un equipo:</label>
                <select
                  value={equipoSeleccionado}
                  onChange={(e) => setEquipoSeleccionado(e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {equiposDisponibles.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nombre}
                    </option>
                  ))}
                </select>
                {equipoSeleccionado && (
                  <button
                    type="button"
                    className={styles.inscribirSelect}
                    onClick={inscribirEquipoEnTorneo}
                  >
                    <CheckCircle2></CheckCircle2> Inscribir equipo
                  </button>
                )}
              </div>
            )}
        </div>
        {variant === "admin" && torneo.estado === "registro" && (
          <button
            className={styles.btnAgregarEquipo}
            onClick={() => {
              setEquipoEnEdicion(null);
              setMostrarModalEquipo(true);
            }}
          >
            <Plus size={20}></Plus> Agregar equipo
          </button>
        )}
      </div>
      {error && <div className={styles.errorBox}>{error}</div>}
      {numEquiposDelTorneo === 0 ? (
        <div className={styles.containerSinEquipos}>
          <div className={styles.infoSinEquipos}>
            <Shield size={36}></Shield>
            <h4>Sin equipos inscritos</h4>
            <span>
              {variant === "admin"
                ? "Agrega al menos dos equipos para generar el calendario."
                : "El torneo aun esta en registro. Regresa mas tarde."}
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.gridEquipos}>
          {equiposDelTorneo.map((equipo) => (
            <div key={equipo.id} className={styles.cardEquipo}>
              <div className={styles.infoEquipo}>
                <div className={styles.containerImgEquipo}>
                  <img
                    className={styles.imgEquipo}
                    src={equipo.escudo_url}
                    alt={equipo.nombre}
                  />
                </div>
                <h3 className={styles.nombreEquipo}>{equipo.nombre}</h3>
              </div>
              <div className={styles.actionsEquipo}>
                {variant === "admin" && (
                  <button
                    type="button"
                    className={styles.btnEditar}
                    onClick={() => {
                      setEquipoEnEdicion(equipo);
                      setMostrarModalEquipo(true);
                    }}
                  >
                    <Edit2 size={20}></Edit2>
                  </button>
                )}

                {variant === "admin" && torneo.estado === "registro" && (
                  <button
                    type="button"
                    className={styles.btnEliminar}
                    onClick={() => onEliminarEquipo(equipo.id)}
                  >
                    <Trash2 size={20}></Trash2>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/*Falta lista de equipos */}
      {variant === "admin" && (
        <CreateEquipoModal
          modo={equipoEnEdicion ? "editar" : "crear"}
          onEditarEquipo={onEditarEquipo}
          equipoInicial={equipoEnEdicion}
          onRefreshEquipos={onRefreshEquipos}
          torneo={torneo}
          onClose={() => {
            setMostrarModalEquipo(false);
            setEquipoEnEdicion(null);
          }}
          isOpen={mostrarModalEquipo}
        ></CreateEquipoModal>
      )}
    </>
  );
};
