import { useEffect, useState } from "react";
import styles from "./Bracket.module.css";
import { obtenerJornadasDelTorneo } from "../services/servicioTorneo";

export const Bracket = ({ torneo }) => {
  // Guardamos las listas de partidos según la fase en estados sencillos
  const [partidosCuartos, setPartidosCuartos] = useState([]);
  const [partidosSemis, setPartidosSemis] = useState([]);
  const [partidoFinal, setPartidoFinal] = useState(null);

  // Estados simples para controlar cuando se están cargando los datos
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Función que trae las jornadas desde el backend
    const cargarDatos = async () => {
      if (!torneo?.id) return;

      try {
        setCargando(true);

        // Hacemos la petición al backend con la función de servicios
        const jornadas = await obtenerJornadasDelTorneo(torneo.id);

        // Recorremos la lista de jornadas que nos regresó la API
        for (let i = 0; i < jornadas.length; i++) {
          const jornada = jornadas[i];

          // Revisamos la columna 'tipo_fase' de la tabla 'jornadas'
          if (jornada.tipo_fase === "cuartos") {
            setPartidosCuartos(jornada.partidos || []);
          }

          if (jornada.tipo_fase === "semifinal") {
            setPartidosSemis(jornada.partidos || []);
          }

          if (jornada.tipo_fase === "final") {
            // La final solo tiene 1 partido, así que tomamos la primera posición [0]
            if (jornada.partidos && jornada.partidos.length > 0) {
              setPartidoFinal(jornada.partidos[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener la liguilla:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [torneo?.id]);

  // Si todavía está cargando información de la API, mostramos este texto
  if (cargando) {
    return (
      <p className={styles.textoCargando}>Cargando partidos del árbol...</p>
    );
  }

  // ---- SEPARACIÓN DE PARTIDOS PARA EL ÁRBOOL SIMÉTRICO ----
  // Los 4 partidos de cuartos se dividen en 2 lados:
  // Lado Izquierdo: Primeros 2 partidos (Posiciones 0 y 1)
  const cuartosIzquierda = [partidosCuartos[0], partidosCuartos[1]];
  // Lado Derecho: Últimos 2 partidos (Posiciones 2 y 3)
  const cuartosDerecha = [partidosCuartos[2], partidosCuartos[3]];

  // Las semifinales se dividen en:
  // Semifinal Izquierda: Primer partido (Posición 0)
  const semiIzquierda = partidosSemis[0];
  // Semifinal Derecha: Segundo partido (Posición 1)
  const semiDerecha = partidosSemis[1];

  return (
    <div className={styles.contenedorPrincipal}>
      <div className={styles.gridCincoColumnas}>
        {/* ================================================================= */}
        {/* COLUMNA 1: CUARTOS DE FINAL - LADO IZQUIERDO */}
        {/* ================================================================= */}
        <div className={styles.columna}>
          <h4 className={styles.tituloColumna}>Cuartos de Final</h4>

          <div className={styles.contenedorPartidos}>
            {cuartosIzquierda.map((partido, index) => (
              <div key={partido?.id || index} className={styles.tarjetaPartido}>
                {/* Fila del Equipo Local */}
                <div className={styles.filaEquipo}>
                  <div className={styles.infoEquipo}>
                    {partido?.equipo_local?.escudo_url && (
                      <div className={styles.containerImagen}>
                        <img
                          src={partido.equipo_local.escudo_url}
                          alt="Escudo"
                          className={styles.imagenEscudo}
                        />
                      </div>
                    )}
                    <span>
                      {partido?.equipo_local?.nombre || "Por definir"}
                    </span>
                  </div>
                  <span className={styles.textoGoles}>
                    {partido?.goles_local !== null &&
                    partido?.goles_local !== undefined
                      ? partido.goles_local
                      : "-"}
                  </span>
                </div>

                <div className={styles.lineaSeparadora}></div>

                {/* Fila del Equipo Visitante */}
                <div className={styles.filaEquipo}>
                  <div className={styles.infoEquipo}>
                    {partido?.equipo_visita?.escudo_url && (
                      <div className={styles.containerImagen}>
                        <img
                          src={partido.equipo_visita.escudo_url}
                          alt="Escudo"
                          className={styles.imagenEscudo}
                        />
                      </div>
                    )}
                    <span>
                      {partido?.equipo_visita?.nombre || "Por definir"}
                    </span>
                  </div>
                  <span className={styles.textoGoles}>
                    {partido?.goles_visita !== null &&
                    partido?.goles_visita !== undefined
                      ? partido.goles_visita
                      : "-"}
                  </span>
                </div>
                {partido?.ganador_penales_id && (
                  <span className={styles.badgePenales}>
                    {partido.ganador_penales_id === partido?.equipo_local?.id
                      ? `${partido.equipo_local?.nombre} ganó por penales`
                      : `${partido.equipo_visita?.nombre} ganó por penales`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* COLUMNA 2: SEMIFINAL - LADO IZQUIERDO */}
        {/* ================================================================= */}
        <div className={styles.columna}>
          <h4 className={styles.tituloColumna}>Semifinal</h4>

          <div className={styles.contenedorPartidos}>
            <div className={styles.tarjetaPartido}>
              {/* Equipo Local */}
              <div className={styles.filaEquipo}>
                <div className={styles.infoEquipo}>
                  {semiIzquierda?.equipo_local?.escudo_url && (
                    <div className={styles.containerImagen}>
                      <img
                        src={semiIzquierda.equipo_local.escudo_url}
                        alt="Escudo"
                        className={styles.imagenEscudo}
                      />
                    </div>
                  )}
                  <span>
                    {semiIzquierda?.equipo_local?.nombre || "Por definir"}
                  </span>
                </div>
                <span className={styles.textoGoles}>
                  {semiIzquierda?.goles_local !== null &&
                  semiIzquierda?.goles_local !== undefined
                    ? semiIzquierda.goles_local
                    : "-"}
                </span>
              </div>

              <div className={styles.lineaSeparadora}></div>

              {/* Equipo Visitante */}
              <div className={styles.filaEquipo}>
                <div className={styles.infoEquipo}>
                  {semiIzquierda?.equipo_visita?.escudo_url && (
                    <div className={styles.containerImagen}>
                      <img
                        src={semiIzquierda.equipo_visita.escudo_url}
                        alt="Escudo"
                        className={styles.imagenEscudo}
                      />
                    </div>
                  )}
                  <span>
                    {semiIzquierda?.equipo_visita?.nombre || "Por definir"}
                  </span>
                </div>
                <span className={styles.textoGoles}>
                  {semiIzquierda?.goles_visita !== null &&
                  semiIzquierda?.goles_visita !== undefined
                    ? semiIzquierda.goles_visita
                    : "-"}
                </span>
              </div>
              {semiIzquierda?.ganador_penales_id && (
                <span className={styles.badgePenales}>
                  {semiIzquierda.ganador_penales_id ===
                  semiIzquierda?.equipo_local?.id
                    ? `${semiIzquierda.equipo_local?.nombre} ganó por penales`
                    : `${semiIzquierda.equipo_visita?.nombre} ganó por penales`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* COLUMNA 3: GRAN FINAL - CENTRO */}
        {/* ================================================================= */}
        <div className={styles.columna}>
          <h4 className={styles.tituloFinal}>🏆 Gran Final</h4>

          <div className={styles.contenedorPartidos}>
            <div
              className={`${styles.tarjetaPartido} ${styles.tarjetaEspecialFinal}`}
            >
              {/* Equipo Local */}
              <div className={styles.filaEquipoFinal}>
                <div className={styles.infoEquipo}>
                  {partidoFinal?.equipo_local?.escudo_url && (
                    <div className={styles.containerImagen}>
                      <img
                        src={partidoFinal.equipo_local.escudo_url}
                        alt="Escudo"
                        className={styles.imagenEscudo}
                      />
                    </div>
                  )}
                  <span>
                    {partidoFinal?.equipo_local?.nombre || "Por definir"}
                  </span>
                </div>
                <span className={styles.textoGoles}>
                  {partidoFinal?.goles_local !== null &&
                  partidoFinal?.goles_local !== undefined
                    ? partidoFinal.goles_local
                    : "-"}
                </span>
              </div>

              <div className={styles.lineaSeparadora}></div>

              {/* Equipo Visitante */}
              <div className={styles.filaEquipoFinal}>
                <div className={styles.infoEquipo}>
                  {partidoFinal?.equipo_visita?.escudo_url && (
                    <div className={styles.containerImagen}>
                      <img
                        src={partidoFinal.equipo_visita.escudo_url}
                        alt="Escudo"
                        className={styles.imagenEscudo}
                      />
                    </div>
                  )}
                  <span>
                    {partidoFinal?.equipo_visita?.nombre || "Por definir"}
                  </span>
                </div>
                <span className={styles.textoGoles}>
                  {partidoFinal?.goles_visita !== null &&
                  partidoFinal?.goles_visita !== undefined
                    ? partidoFinal.goles_visita
                    : "-"}
                </span>
              </div>
              {partidoFinal?.ganador_penales_id && (
                <span className={styles.badgePenales}>
                  {partidoFinal.ganador_penales_id ===
                  partidoFinal?.equipo_local?.id
                    ? `${partidoFinal.equipo_local?.nombre} 🏆 Campeón por penales`
                    : `${partidoFinal.equipo_visita?.nombre} 🏆 Campeón por penales`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* COLUMNA 4: SEMIFINAL - LADO DERECHO */}
        {/* ================================================================= */}
        <div className={styles.columna}>
          <h4 className={styles.tituloColumna}>Semifinal</h4>

          <div className={styles.contenedorPartidos}>
            <div className={styles.tarjetaPartido}>
              {/* Equipo Local */}
              <div className={styles.filaEquipo}>
                <div className={styles.infoEquipo}>
                  {semiDerecha?.equipo_local?.escudo_url && (
                    <div className={styles.containerImagen}>
                      <img
                        src={semiDerecha.equipo_local.escudo_url}
                        alt="Escudo"
                        className={styles.imagenEscudo}
                      />
                    </div>
                  )}
                  <span>
                    {semiDerecha?.equipo_local?.nombre || "Por definir"}
                  </span>
                </div>
                <span className={styles.textoGoles}>
                  {semiDerecha?.goles_local !== null &&
                  semiDerecha?.goles_local !== undefined
                    ? semiDerecha.goles_local
                    : "-"}
                </span>
              </div>

              <div className={styles.lineaSeparadora}></div>

              {/* Equipo Visitante */}
              <div className={styles.filaEquipo}>
                <div className={styles.infoEquipo}>
                  {semiDerecha?.equipo_visita?.escudo_url && (
                    <div className={styles.containerImagen}>
                      <img
                        src={semiDerecha.equipo_visita.escudo_url}
                        alt="Escudo"
                        className={styles.imagenEscudo}
                      />
                    </div>
                  )}
                  <span>
                    {semiDerecha?.equipo_visita?.nombre || "Por definir"}
                  </span>
                </div>
                <span className={styles.textoGoles}>
                  {semiDerecha?.goles_visita !== null &&
                  semiDerecha?.goles_visita !== undefined
                    ? semiDerecha.goles_visita
                    : "-"}
                </span>
              </div>
              {semiDerecha?.ganador_penales_id && (
                <span className={styles.badgePenales}>
                  {semiDerecha.ganador_penales_id ===
                  semiDerecha?.equipo_local?.id
                    ? `${semiDerecha.equipo_local?.nombre} ganó por penales`
                    : `${semiDerecha.equipo_visita?.nombre} ganó por penales`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* COLUMNA 5: CUARTOS DE FINAL - LADO DERECHO */}
        {/* ================================================================= */}
        <div className={styles.columna}>
          <h4 className={styles.tituloColumna}>Cuartos de Final</h4>

          <div className={styles.contenedorPartidos}>
            {cuartosDerecha.map((partido, index) => (
              <div key={partido?.id || index} className={styles.tarjetaPartido}>
                {/* Fila del Equipo Local */}
                <div className={styles.filaEquipo}>
                  <div className={styles.infoEquipo}>
                    {partido?.equipo_local?.escudo_url && (
                      <div className={styles.containerImagen}>
                        <img
                          src={partido.equipo_local.escudo_url}
                          alt="Escudo"
                          className={styles.imagenEscudo}
                        />
                      </div>
                    )}
                    <span>
                      {partido?.equipo_local?.nombre || "Por definir"}
                    </span>
                  </div>
                  <span className={styles.textoGoles}>
                    {partido?.goles_local !== null &&
                    partido?.goles_local !== undefined
                      ? partido.goles_local
                      : "-"}
                  </span>
                </div>

                <div className={styles.lineaSeparadora}></div>

                {/* Fila del Equipo Visitante */}
                <div className={styles.filaEquipo}>
                  <div className={styles.infoEquipo}>
                    {partido?.equipo_visita?.escudo_url && (
                      <div className={styles.containerImagen}>
                        <img
                          src={partido.equipo_visita.escudo_url}
                          alt="Escudo"
                          className={styles.imagenEscudo}
                        />
                      </div>
                    )}
                    <span>
                      {partido?.equipo_visita?.nombre || "Por definir"}
                    </span>
                  </div>
                  <span className={styles.textoGoles}>
                    {partido?.goles_visita !== null &&
                    partido?.goles_visita !== undefined
                      ? partido.goles_visita
                      : "-"}
                  </span>
                </div>
                {partido?.ganador_penales_id && (
                  <span className={styles.badgePenales}>
                    {partido.ganador_penales_id === partido?.equipo_local?.id
                      ? `${partido.equipo_local?.nombre} ganó por penales`
                      : `${partido.equipo_visita?.nombre} ganó por penales`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
