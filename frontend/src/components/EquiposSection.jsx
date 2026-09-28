import { useEffect, useState } from "react";
import { CheckCircle2, Edit2, Plus, Shield, Trash2 } from "lucide-react";
import styles from "./EquiposSection.module.css";
import { CreateEquipoModal } from "./CreateEquipoModal";
import {
  agregarEquipo,
  eliminarEquipo,
  obtenerEquiposDelTorneo,
  obtenerEquiposGlobales,
} from "../services/servicioTorneo";

export const EquiposSection = ({ torneo, variant }) => {
  // 1. ESTADOS LOCALES DE DATOS
  const [equiposDelTorneo, setEquiposDelTorneo] = useState([]);
  const [equiposGlobales, setEquiposGlobales] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 2. ESTADOS LOCALES DE INTERFAZ
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [mostrarModalEquipo, setMostrarModalEquipo] = useState(false);
  const [equipoEnEdicion, setEquipoEnEdicion] = useState(null);
  const [errorLocal, setErrorLocal] = useState(null);
  const [loadingAccion, setLoadingAccion] = useState(false);

  // 3. FUNCIÓN DE CARGA AUTÓNOMA DE EQUIPOS
  const cargarEquipos = async () => {
    try {
      setCargando(true);
      setErrorLocal(null);

      // Si es admin, traemos también los globales para el select de inscripción
      if (variant === "admin") {
        const [torneoData, globalesData] = await Promise.all([
          obtenerEquiposDelTorneo(torneo.id),
          obtenerEquiposGlobales(),
        ]);
        setEquiposDelTorneo(torneoData);
        setEquiposGlobales(globalesData);
      } else {
        const torneoData = await obtenerEquiposDelTorneo(torneo.id);
        setEquiposDelTorneo(torneoData);
      }
    } catch (err) {
      setErrorLocal(err.message || "Error al obtener la lista de equipos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (torneo?.id) {
      cargarEquipos();
    }
  }, [torneo?.id]);

  const numEquipos = equiposDelTorneo.length;

  // Filtrar equipos globales que no estén ya inscritos en el torneo
  const equiposDisponibles = equiposGlobales.filter(
    (eqGlobal) =>
      !equiposDelTorneo.some((eqTorneo) => eqTorneo.nombre === eqGlobal.nombre),
  );

  // ACCIÓN 1: Inscribir equipo de la lista global
  const handleInscribirEquipo = async () => {
    if (!equipoSeleccionado) return;
    setErrorLocal(null);
    setLoadingAccion(true);

    try {
      //Encontrar al equipo que se quiere inscribir de los equipos globales
      const equipo = equiposGlobales.find(
        (eq) => eq.id === parseInt(equipoSeleccionado),
      );

      if (!equipo) return;

      await agregarEquipo(torneo.id, {
        nombre: equipo.nombre,
        escudo_url: equipo.escudo_url,
      });

      setEquipoSeleccionado("");
      await cargarEquipos(); // Refresca únicamente esta sección
    } catch (err) {
      setErrorLocal(err.message || "No se pudo inscribir el equipo.");
    } finally {
      setLoadingAccion(false);
    }
  };

  // ACCIÓN 2: Eliminar equipo del torneo
  const handleEliminarEquipo = async (equipoId) => {
    setErrorLocal(null);
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar este equipo del torneo?",
    );

    if (confirmar) {
      try {
        await eliminarEquipo(torneo.id, equipoId);
        await cargarEquipos(); // Refresca únicamente esta sección
      } catch (err) {
        setErrorLocal(err.message || "No se pudo eliminar el equipo.");
      }
    }
  };

  if (cargando) {
    return <div style={{ padding: "1.5rem" }}>Cargando equipos...</div>;
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h3 className={styles.title}>Equipos inscritos</h3>
            <span className={styles.subTitle}>
              {numEquipos}{" "}
              {numEquipos === 1 ? "equipo inscrito" : "equipos inscritos"} en
              este torneo
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
                  disabled={loadingAccion}
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
                    onClick={handleInscribirEquipo}
                    disabled={loadingAccion}
                  >
                    <CheckCircle2 size={16} />
                    {loadingAccion ? "Inscribiendo..." : "Inscribir equipo"}
                  </button>
                )}
              </div>
            )}
        </div>

        {variant === "admin" && torneo.estado === "registro" && (
          <button
            type="button"
            className={styles.btnAgregarEquipo}
            onClick={() => {
              setEquipoEnEdicion(null);
              setMostrarModalEquipo(true);
            }}
          >
            <Plus size={20} /> Agregar equipo
          </button>
        )}
      </div>

      {errorLocal && <div className={styles.errorBox}>{errorLocal}</div>}

      {numEquipos === 0 ? (
        <div className={styles.containerSinEquipos}>
          <div className={styles.infoSinEquipos}>
            <Shield size={36} />
            <h4>Sin equipos inscritos</h4>
            <span>
              {variant === "admin"
                ? "Agrega equipos para poder iniciar el torneo."
                : "El torneo aún está en registro. Regresa más tarde."}
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
                    <Edit2 size={20} />
                  </button>
                )}

                {variant === "admin" && torneo.estado === "registro" && (
                  <button
                    type="button"
                    className={styles.btnEliminar}
                    onClick={() => handleEliminarEquipo(equipo.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PARA CREAR O EDITAR CON VALIDACION DOBLE*/}
      {variant === "admin" && mostrarModalEquipo && (
        <CreateEquipoModal
          isOpen={mostrarModalEquipo}
          modo={equipoEnEdicion ? "editar" : "crear"}
          equipoInicial={equipoEnEdicion}
          torneo={torneo}
          onSuccess={() => {
            setMostrarModalEquipo(false);
            setEquipoEnEdicion(null);
            cargarEquipos();
          }}
          onClose={() => {
            setMostrarModalEquipo(false);
            setEquipoEnEdicion(null);
          }}
        />
      )}
    </>
  );
};
