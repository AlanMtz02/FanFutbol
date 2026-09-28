import styles from "./PosicionesSection.module.css";
import { Trophy } from "lucide-react";

export const TablaDePosiciones = ({ torneo, posiciones = [] }) => {
  return (
    <div className={styles.posicionesWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th className={styles.textoIzq}>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th className={styles.headerPts}>PTS</th>
          </tr>
        </thead>
        <tbody>
          {torneo?.estado === "registro" || posiciones.length === 0 ? (
            <tr>
              <td colSpan="10" className={styles.noResults}>
                Sin resultados aún. Ingresa resultados en la pestaña Calendario.
              </td>
            </tr>
          ) : (
            posiciones.map((eq, index) => {
              const equipoId = eq.equipo_id;
              const nombreEquipo = eq.nombre_equipo;
              const posicionNum = eq.posicion;
              const esCampeon = torneo?.equipo_campeon_id === equipoId;

              return (
                <tr
                  key={equipoId || index}
                  className={`${styles.rowEquipo} ${
                    esCampeon ? styles.equipoCampeon : ""
                  }`}
                  title={
                    posicionNum === 1 && eq.desempate_directo_aplicado
                      ? eq.detalle_desempate
                      : posicionNum === 1
                        ? "Primer lugar"
                        : ""
                  }
                >
                  <td>{posicionNum}</td>
                  <td className={styles.equipoCell}>
                    {esCampeon && <Trophy size={18} color="#eab308" />}
                    {eq.escudo_url && (
                      <img
                        src={eq.escudo_url}
                        alt={nombreEquipo}
                        className={styles.escudo}
                      />
                    )}
                    {nombreEquipo}
                  </td>
                  <td>{eq.pj}</td>
                  <td>{eq.pg}</td>
                  <td>{eq.pe }</td>
                  <td>{eq.pp }</td>
                  <td>{eq.gf }</td>
                  <td>{eq.gc}</td>
                  <td>{eq.dg}</td>
                  <td className={styles.pts}>{eq.pts}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
