// Campos del puesto, compartidos por el alta y la edición dentro del popup.
// `idPrefix` evita ids repetidos si hay más de un formulario en la página.
export default function LocationFields({ form, errors, onChange, categories, vendors, idPrefix }) {
  const id = (name) => `${idPrefix}-${name}`
  const errorProps = (name) =>
    errors[name]
      ? { 'aria-invalid': true, 'aria-describedby': id(`${name}-error`) }
      : { 'aria-invalid': false }

  return (
    <>
      <div className="campo">
        <label htmlFor={id('nombre')}>Nombre</label>
        <input id={id('nombre')} name="nombre" value={form.nombre} onChange={onChange}
          maxLength={80} {...errorProps('nombre')} />
        {errors.nombre && <small id={id('nombre-error')} className="campo__error">{errors.nombre}</small>}
      </div>

      <div className="campo">
        <label htmlFor={id('descripcion')}>Descripción</label>
        <textarea id={id('descripcion')} name="descripcion" rows={2} value={form.descripcion}
          onChange={onChange} maxLength={250} {...errorProps('descripcion')} />
        {errors.descripcion && (
          <small id={id('descripcion-error')} className="campo__error">{errors.descripcion}</small>
        )}
      </div>

      <div className="campo">
        <label htmlFor={id('category')}>Giro</label>
        <select id={id('category')} name="category" value={form.category} onChange={onChange}
          {...errorProps('category')}>
          <option value="">Elige un giro…</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icono} {category.nombre}
            </option>
          ))}
        </select>
        {errors.category && <small id={id('category-error')} className="campo__error">{errors.category}</small>}
        {categories.length === 0 && (
          <small>No hay giros registrados. Agrégalos primero en el Padrón.</small>
        )}
      </div>

      <div className="campo">
        <label htmlFor={id('vendor')}>Comerciante (opcional)</label>
        <select id={id('vendor')} name="vendor" value={form.vendor} onChange={onChange}>
          <option value="">Sin comerciante</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.nombre}{vendor.apodo ? ` (${vendor.apodo})` : ''}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
