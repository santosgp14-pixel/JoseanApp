import { useState, useEffect } from 'react'
import { getFechaHoy, CATEGORIAS_INGRESO, CATEGORIAS_GASTO } from '../utils/formatters'

const defaultForm = {
  tipo: 'ingreso',
  fecha: getFechaHoy(),
  monto: '',
  categoria: '',
  descripcion: '',
  cliente_id: ''
}

export default function MovimientoForm({ movimiento, clientes, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(movimiento ? {
    tipo: movimiento.tipo,
    fecha: movimiento.fecha,
    monto: movimiento.monto,
    categoria: movimiento.categoria,
    descripcion: movimiento.descripcion || '',
    cliente_id: movimiento.cliente_id || ''
  } : defaultForm)

  const [error, setError] = useState('')

  const categorias = form.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO

  useEffect(() => {
    setForm(f => ({ ...f, categoria: '' }))
  }, [form.tipo])

  const handle = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.monto || Number(form.monto) <= 0) {
      setError('El monto debe ser mayor a cero.')
      return
    }
    if (!form.categoria) {
      setError('Seleccioná una categoría.')
      return
    }

    try {
      await onSubmit({
        ...form,
        monto: Number(form.monto),
        cliente_id: form.cliente_id || null
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{movimiento ? 'Editar' : 'Nuevo'} movimiento</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{marginBottom: '1.25rem'}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handle} className="form-select">
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handle} className="form-input" required />
            </div>
          </div>

          <div className="form-grid" style={{marginBottom: '1.25rem'}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Monto ($)</label>
              <input type="number" name="monto" value={form.monto} onChange={handle}
                className="form-input" placeholder="0" min="1" step="1" required />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Categoría</label>
              <select name="categoria" value={form.categoria} onChange={handle} className="form-select" required>
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cliente (opcional)</label>
            <select name="cliente_id" value={form.cliente_id} onChange={handle} className="form-select">
              <option value="">Sin cliente</option>
              {clientes.filter(c => c.activo).map(c => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.tipo}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción (opcional)</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle}
              className="form-textarea" placeholder="Anotá algo..." rows={2} />
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
