import { useState } from 'react'

const defaultForm = {
  nombre: '',
  tipo: 'gym',
  precio_mensual: '',
  activo: true
}

export default function ClienteForm({ cliente, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(cliente ? {
    nombre: cliente.nombre,
    tipo: cliente.tipo,
    precio_mensual: cliente.precio_mensual,
    activo: cliente.activo
  } : defaultForm)

  const [error, setError] = useState('')

  const handle = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim()) {
      setError('El nombre es requerido.')
      return
    }
    if (!form.precio_mensual || Number(form.precio_mensual) <= 0) {
      setError('El precio mensual debe ser mayor a cero.')
      return
    }

    try {
      await onSubmit({ ...form, precio_mensual: Number(form.precio_mensual) })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{cliente ? 'Editar' : 'Nuevo'} cliente</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handle}
              className="form-input" placeholder="Nombre del cliente" required />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handle} className="form-select">
                <option value="gym">Gym</option>
                <option value="futbol">Fútbol</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Precio mensual ($)</label>
              <input type="number" name="precio_mensual" value={form.precio_mensual} onChange={handle}
                className="form-input" placeholder="0" min="1" step="1" required />
            </div>
          </div>

          <div className="form-group">
            <label style={{display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer'}}>
              <input type="checkbox" name="activo" checked={form.activo} onChange={handle}
                style={{width:'16px', height:'16px', accentColor:'var(--accent-green)'}} />
              <span className="form-label" style={{margin:0}}>Cliente activo</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
