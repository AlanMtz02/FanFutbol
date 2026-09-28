import { useEffect, useState } from "react";
import styles from "./PosicionesSection.module.css";
import { obtenerPosicionesDelTorneo } from "../services/servicioTorneo";
import { TablaDePosiciones } from "./TablaDePosiciones";
import { Bracket } from "./Bracket";

export const PosicionesSection = ({ torneo }) => {
  const [posiciones, setPosiciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLocal, setErrorLocal] = useState(null);
  const [subTab, setSubTab] = useState("tabla"); // "tabla" | "liguilla"

  // Condición: Si el torneo no está en fase regular (ej. está en cuartos, semis o final),
  // se permite ver la pestaña de la Liguilla / Bracket
  const esLiguilla = torneo?.fase_actual !== "regular";

  const cargarPosiciones = async () => {
    if (!torneo?.id) return; //Si no hay torneo, sale de la funcion
    try {
      setCargando(true);
      setErrorLocal(null);
      const data = await obtenerPosicionesDelTorneo(torneo.id);
      setPosiciones(data || []);
    } catch (err) {
      console.error("Error al cargar posiciones:", err);
      setErrorLocal(err.message || "Error al obtener la tabla de posiciones.");
    } finally {
      setCargando(false);
    }
  };

  //Se ejcuta siempre mientras exista un torneo
  useEffect(() => {
    cargarPosiciones();
  }, [torneo?.id]);

  if (cargando) {
    return <div style={{ padding: "2rem" }}>Cargando posiciones...</div>;
  }

  return (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {subTab === "tabla" ? "Tabla de posiciones" : "Fase final / Liguilla"}
        </h3>
        <span className={styles.subTitle}>
          {subTab === "tabla"
            ? "Actualizada en tiempo real con los resultados ingresados."
            : "Árbol de eliminatorias."}
        </span>
      </div>
      {/* Sub-Tabs: Solo se muestran si el torneo ya avanzó a Liguilla */}
      {esLiguilla && (
        <div className={styles.subTabsContainer}>
          <button
            type="button"
            className={`${styles.subTabBtn} ${subTab === "tabla" ? styles.subTabActive : ""}`}
            onClick={() => setSubTab("tabla")}
          >
            Tabla general
          </button>
          <button
            type="button"
            className={`${styles.subTabBtn} ${
              subTab === "liguilla" ? styles.subTabActive : ""
            }`}
            onClick={() => setSubTab("liguilla")}
          >
            Liguilla (Bracket)
          </button>
        </div>
      )}
      {errorLocal ? (
        <>
          <div className={styles.errorBox}>{errorLocal}</div>
        </>
      ) : subTab === "tabla" ? (
        <TablaDePosiciones
          torneo={torneo}
          posiciones={posiciones}
        ></TablaDePosiciones>
      ) : (
        <Bracket torneo={torneo}></Bracket>
      )}
    </>
  )
};
