import { useState, useEffect } from 'react'
import { movimientosService } from '../services/movimientos'
import { clientesService } from '../services/clientes'
import { formatMoneda, formatFecha, getMesActual } from '../utils/formatters'
import MovimientoForm from '../components/MovimientoForm'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Movimientos() {
  const { mes: mesActual, año: añoActual } = getMesActual()
  const [mes, setMes] = useState(mesActual)
  const [año, setAño] = useState(añoActual)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [movimientos, setMovimientos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [saving, setSaving] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const [movs, cls] = await Promise.all([
        movimientosService.getAll({ mes, año, tipo: filtroTipo || undefined }),
        clientesService.getAll()
      ])
      setMovimientos(movs)
      setClientes(cls)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [mes, año, filtroTipo])

  const handleCrear = async (data) => {
    setSaving(true)
    try {
      await movimientosService.create(data)
      setShowForm(false)
      cargar()
    } finally {
      setSaving(false)
    }
  }

  const handleEditar = async (data) => {
    setSaving(true)
    try {
      await movimientosService.update(editando.id, data)
      setEditando(null)
      cargar()
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async () => {
    setSaving(true)
    try {
      await movimientosService.delete(eliminando.id)
      setEliminando(null)
      cargar()
    } finally {
      setSaving(false)
    }
  }

  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i, 1).toLocaleString('es-AR', { month: 'long' })
  }))

  const años = [añoActual - 1, añoActual, añoActual + 1]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Movimientos</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo movimiento
        </button>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={mes} onChange={e => setMes(Number(e.target.value))}>
          {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select className="filter-select" value={año} onChange={e => setAño(Number(e.target.value))}>
          {años.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="filter-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Todos</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto">Gastos</option>
        </select>
        <span style={{color:'var(--text-muted)', fontSize:'0.8125rem', marginLeft:'auto'}}>
          {movimientos.length} resultado{movimientos.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : movimientos.length === 0 ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{margin:'0 auto', opacity:0.3}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>No hay movimientos con estos filtros</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Cliente</th>
                  <th>Descripción</th>
                  <th style={{textAlign:'right'}}>Monto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map(m => (
                  <tr key={m.id}>
                    <td style={{color:'var(--text-muted)', whiteSpace:'nowrap'}}>{formatFecha(m.fecha)}</td>
                    <td><span className={`badge badge-${m.tipo}`}>{m.tipo}</span></td>
                    <td>{m.categoria}</td>
                    <td style={{color:'var(--text-muted)'}}>{m.clientes?.nombre || '—'}</td>
                    <td style={{color:'var(--text-muted)', maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                      {m.descripcion || '—'}
                    </td>
                    <td style={{textAlign:'right', whiteSpace:'nowrap'}} className={`monto-${m.tipo}`}>
                      {m.tipo === 'gasto' ? '−' : '+'}{formatMoneda(m.monto)}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Editar"
                          onClick={() => setEditando(m)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          title="Eliminar"
                          onClick={() => setEliminando(m)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <MovimientoForm
          clientes={clientes}
          onSubmit={handleCrear}
          onClose={() => setShowForm(false)}
          loading={saving}
        />
      )}

      {editando && (
        <MovimientoForm
          movimiento={editando}
          clientes={clientes}
          onSubmit={handleEditar}
          onClose={() => setEditando(null)}
          loading={saving}
        />
      )}

      {eliminando && (
        <ConfirmDialog
          mensaje={`¿Eliminás este movimiento de ${formatMoneda(eliminando.monto)}?`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={saving}
        />
      )}
    </div>
  )
}
