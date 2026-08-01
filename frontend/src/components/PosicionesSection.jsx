import styles from "./PosicionesSection.module.css";
import {Trophy} from 'lucide-react';
export const PosicionesSection = ({ torneo, variant, error, posiciones }) => {
  return (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>Tabla de posiciones</h3>
        <span className={styles.subTitle}>
          Actualizada en tiempo real con los resultados ingresados
        </span>
      </div>
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
            {/* Caso torneo en registro o sin resultados */}
            {torneo.estado === "registro" || posiciones.length === 0 ? (
              <tr>
                <td colSpan="10" className={styles.noResults}>
                  Sin resultados aún. Ingresa resultados en la pestaña
                  Calendario.
                </td>
              </tr>
            ) : (
              posiciones.map((eq) => (
                <tr
                  key={eq.equipo_id}
                  className={`${styles.rowEquipo} ${eq.posicion === 1 ? styles.primerLugar : ""}`}
                  title={eq.posicion===1 && eq.desempate_directo_aplicado ? eq.detalle_desempate : eq.posicion === 1 ? 'Primer lugar' : ''}
                >
                  <td>{eq.posicion}</td>
                  <td className={styles.equipoCell}>
                    {eq.posicion === 1 && (
                      <Trophy size={18} color="#eab308"></Trophy>
                    )}
                    <img
                      src={eq.escudo_url}
                      alt={eq.nombre_equipo}
                      className={styles.escudo}
                    />
                    {eq.nombre_equipo}
                  </td>
                  <td>{eq.pj}</td>
                  <td>{eq.pg}</td>
                  <td>{eq.pe}</td>
                  <td>{eq.pp}</td>
                  <td>{eq.gf}</td>
                  <td>{eq.gc}</td>
                  <td>{eq.dg}</td>
                  <td className={styles.pts}>{eq.pts}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
