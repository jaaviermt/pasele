import StatusBadge from './StatusBadge'
import { formatCoordinate, formatDateTime } from '../utils/format'

// Tabla con todos los datos de los puestos excepto los IDs.
// Giro, comerciante y usuario se muestran por nombre (vienen con populate).
export default function LocationsTable({ locations, loading }) {
  return (
    <section className="tabla-puestos" aria-labelledby="titulo-tabla">
      <h2 id="titulo-tabla">
        Puestos registrados <span className="contador">({locations.length})</span>
      </h2>

      <div className="tabla__scroll" tabIndex={0} aria-label="Tabla de puestos, se desplaza a los lados">
        <table className="tabla">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Descripción</th>
              <th scope="col">Giro</th>
              <th scope="col">Comerciante</th>
              <th scope="col">Registrado por</th>
              <th scope="col">Longitud</th>
              <th scope="col">Latitud</th>
              <th scope="col">Estado</th>
              <th scope="col">Alta</th>
              <th scope="col">Última edición</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className="tabla__vacia">Cargando puestos…</td>
              </tr>
            )}

            {!loading && locations.length === 0 && (
              <tr>
                <td colSpan={10} className="tabla__vacia">
                  No hay puestos. Haz clic en el mapa para registrar el primero.
                </td>
              </tr>
            )}

            {!loading &&
              locations.map((location) => {
                const [lng, lat] = location.ubicacion.coordinates
                return (
                  <tr key={location.id}>
                    <td>{location.nombre}</td>
                    <td>{location.descripcion}</td>
                    <td>
                      {location.category ? (
                        <span className="chip-giro">
                          <span className="chip-giro__color" style={{ background: location.category.color }}
                            aria-hidden="true" />
                          {location.category.icono} {location.category.nombre}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{location.vendor ? location.vendor.nombre : 'Sin comerciante'}</td>
                    <td>{location.createdBy ? location.createdBy.nombre : '—'}</td>
                    <td>{formatCoordinate(lng)}</td>
                    <td>{formatCoordinate(lat)}</td>
                    <td><StatusBadge estado={location.estado} /></td>
                    <td>{formatDateTime(location.createdAt)}</td>
                    <td>{formatDateTime(location.updatedAt)}</td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
