import { ChipGiro, EstadoVacio, InsigniaEstado, Skeleton } from './ui/ui'
import { formatCoordinate, formatDateTime } from '../utils/format'

const COLUMNS = ['Nombre', 'Descripción', 'Giro', 'Comerciante', 'Registrado por', 'Longitud', 'Latitud', 'Estado', 'Alta', 'Última edición']

// Tabla con todos los datos de los puestos excepto los IDs.
// Giro, comerciante y usuario se muestran por nombre (vienen con populate).
// data-col: en celular cada fila se muestra como tarjeta con el nombre de la columna.
export default function LocationsTable({ locations, loading }) {
  return (
    <div className="p-tabla-wrap">
      <table className="p-tabla p-tabla--cards p-tabla--fija">
        <caption className="p-sr">Puestos del tianguis</caption>
        <thead>
          <tr>{COLUMNS.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 4 }, (_, row) => (
            <tr key={row} aria-hidden>
              {COLUMNS.map((column) => (
                <td key={column} data-col={column}><Skeleton ancho={`${50 + ((row * 7 + column.length * 3) % 45)}%`} /></td>
              ))}
            </tr>
          ))}

          {!loading && locations.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length}>
                <EstadoVacio titulo="No hay puestos con estos filtros"
                  texto="Limpia los filtros o haz clic en el mapa para registrar uno." />
              </td>
            </tr>
          )}

          {!loading && locations.map((location) => {
            const [lng, lat] = location.ubicacion.coordinates
            return (
              <tr key={location.id}>
                <td data-col="Nombre"><b>{location.nombre}</b></td>
                <td data-col="Descripción">{location.descripcion}</td>
                <td data-col="Giro"><ChipGiro giro={location.category} /></td>
                <td data-col="Comerciante">{location.vendor ? location.vendor.nombre : '—'}</td>
                <td data-col="Registrado por">{location.createdBy ? location.createdBy.nombre : '—'}</td>
                <td data-col="Longitud" className="p-num">{formatCoordinate(lng)}</td>
                <td data-col="Latitud" className="p-num">{formatCoordinate(lat)}</td>
                <td data-col="Estado"><InsigniaEstado estado={location.estado} /></td>
                <td data-col="Alta" className="p-num">{formatDateTime(location.createdAt)}</td>
                <td data-col="Última edición" className="p-num">{formatDateTime(location.updatedAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
