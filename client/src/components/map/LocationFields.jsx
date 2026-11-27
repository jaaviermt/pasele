import { AreaTexto, Campo, Selector } from '../ui/ui'

// Campos del puesto, compartidos por el alta y la edición dentro del popup.
export default function LocationFields({ form, errors, onChange, categories, vendors }) {
  const categoryOptions = categories.map((category) => ({
    valor: category.id,
    texto: `${category.icono} ${category.nombre}`,
  }))
  const vendorOptions = vendors.map((vendor) => ({
    valor: vendor.id,
    texto: vendor.apodo ? `${vendor.nombre} (${vendor.apodo})` : vendor.nombre,
  }))

  return (
    <>
      <Campo label="Nombre" name="nombre" value={form.nombre} onChange={onChange} maxLength={80}
        error={errors.nombre} />
      <AreaTexto label="Descripción" name="descripcion" value={form.descripcion} onChange={onChange}
        maxLength={250} rows={2} error={errors.descripcion} />
      <Selector label="Giro" name="category" value={form.category} onChange={onChange}
        vacio="Elige un giro" opciones={categoryOptions} error={errors.category}
        ayuda={categories.length === 0 ? 'No hay giros. Agrégalos primero en el Padrón.' : undefined} />
      <Selector label="Comerciante (opcional)" name="vendor" value={form.vendor} onChange={onChange}
        vacio="Sin asignar" opciones={vendorOptions} />
    </>
  )
}
