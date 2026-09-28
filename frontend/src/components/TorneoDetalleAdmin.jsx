import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  iniciarTorneoLigaMx,
  obtenerTorneoPorId,
} from "../services/servicioTorneo";

import { PaginaNoEncontrada } from "../App";
import styles from "./TorneoDetalleAdmin.module.css";
import { Navbar } from "./Navbar";
import { EquiposSection } from "./EquiposSection";
import { CalendarioSection } from "./CalendarioSection";
import { PosicionesSection } from "./PosicionesSection";

export const TorneoDetalleAdmin = () => {
  const { id } = useParams();

  // 1. EL PADRE SOLO GUARDA EL TORNEO BASE
  const [torneo, setTorneo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("equipos");

  // 2. SOLO CARGA LA ESTRUCTURA DEL TORNEO
  const cargarTorneoBase = async () => {
    try {
      setCargando(true);
      setError(null);
      const dataTorneo = await obtenerTorneoPorId(id);
      setTorneo(dataTorneo);
    } catch (err) {
      setError(err.message || "No se pudo cargar el torneo.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarTorneoBase();
    }
  }, [id]);

  // 3. ACCIÓN GLOBAL: INICIAR TORNEO (Pertenece al Navbar)
  const handleIniciarTorneo = async () => {
    const confirmar = window.confirm("¿Seguro que quieres iniciar el torneo?");
    if (confirmar) {
      try {
        await iniciarTorneoLigaMx(id);
        await cargarTorneoBase(); // Solo actualiza el estado/fase del torneo
        window.alert(`${torneo.nombre} iniciado correctamente.`)
      } catch (err) {
        window.alert(
          err.message || "No se pudo iniciar el torneo. Intenta de nuevo.",
        );
      }
    }
  };

  if (cargando) {
    return <div style={{ padding: "2rem" }}>Cargando torneo...</div>;
  }

  if (!torneo) {
    return <PaginaNoEncontrada />;
  }

  return (
    <div className={styles.page}>
      <Navbar
        variant="admin"
        torneo={torneo}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onIniciarTorneo={handleIniciarTorneo}
      />

      <section className={styles.sectionAdminPage}>
        {/* CADA HIJO SOLO RECIBE EL TORNEO O SU ID */}

        {activeTab === "equipos" && (
          <EquiposSection torneo={torneo} variant="admin" />
        )}

        {activeTab === "calendario" && (
          <CalendarioSection
            torneo={torneo}
            variant="admin"
            onEstructuraCambiada={cargarTorneoBase} // Por si al avanzar de jornada cambia la fase del torneo
          />
        )}

        {activeTab === "posiciones" && (
          <PosicionesSection torneo={torneo} variant="admin" />
        )}
      </section>
    </div>
  );
};
