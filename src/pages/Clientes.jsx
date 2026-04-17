import { useState, useEffect } from 'react'
import { clientesService } from '../services/clientes'
import { formatMoneda } from '../utils/formatters'
import ClienteForm from '../components/ClienteForm'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [saving, setSaving] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await clientesService.getAll()
      setClientes(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleCrear = async (data) => {
    setSaving(true)
    try {
      await clientesService.create(data)
      setShowForm(false)
      cargar()
    } finally {
      setSaving(false)
    }
  }

  const handleEditar = async (data) => {
    setSaving(true)
    try {
      await clientesService.update(editando.id, data)
      setEditando(null)
      cargar()
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (cliente) => {
    try {
      await clientesService.toggleActivo(cliente.id, !cliente.activo)
      cargar()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEliminar = async () => {
    setSaving(true)
    try {
      await clientesService.delete(eliminando.id)
      setEliminando(null)
      cargar()
    } finally {
      setSaving(false)
    }
  }

  const activos = clientes.filter(c => c.activo)
  const inactivos = clientes.filter(c => !c.activo)
  const totalMensual = activos.reduce((acc, c) => acc + Number(c.precio_mensual), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          {activos.length > 0 && (
            <p style={{color:'var(--text-muted)', marginTop:'0.25rem', fontSize:'0.875rem'}}>
              {activos.length} activo{activos.length !== 1 ? 's' : ''} — facturación estimada: <span style={{color:'var(--accent-green)'}}>{formatMoneda(totalMensual)}/mes</span>
            </p>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo cliente
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : clientes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{margin:'0 auto', opacity:0.3}}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <p>Todavía no tenés clientes. ¡Agregá el primero!</p>
          </div>
        </div>
      ) : (
        <>
          {activos.length > 0 && (
            <div className="card" style={{marginBottom:'1rem'}}>
              <h3 style={{fontFamily:'var(--font-serif)', fontSize:'1rem', fontWeight:400, marginBottom:'1rem', color:'var(--text-muted)'}}>
                Activos
              </h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th style={{textAlign:'right'}}>Precio mensual</th>
                      <th>Activo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activos.map(c => (
                      <ClienteRow
                        key={c.id}
                        cliente={c}
                        onEditar={setEditando}
                        onEliminar={setEliminando}
                        onToggle={handleToggle}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {inactivos.length > 0 && (
            <div className="card">
              <h3 style={{fontFamily:'var(--font-serif)', fontSize:'1rem', fontWeight:400, marginBottom:'1rem', color:'var(--text-muted)'}}>
                Inactivos
              </h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th style={{textAlign:'right'}}>Precio mensual</th>
                      <th>Activo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactivos.map(c => (
                      <ClienteRow
                        key={c.id}
                        cliente={c}
                        onEditar={setEditando}
                        onEliminar={setEliminando}
                        onToggle={handleToggle}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <ClienteForm
          onSubmit={handleCrear}
          onClose={() => setShowForm(false)}
          loading={saving}
        />
      )}

      {editando && (
        <ClienteForm
          cliente={editando}
          onSubmit={handleEditar}
          onClose={() => setEditando(null)}
          loading={saving}
        />
      )}

      {eliminando && (
        <ConfirmDialog
          mensaje={`¿Eliminás a ${eliminando.nombre}? Se quitará de todos sus movimientos.`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={saving}
        />
      )}
    </div>
  )
}

function ClienteRow({ cliente, onEditar, onEliminar, onToggle }) {
  return (
    <tr style={{opacity: cliente.activo ? 1 : 0.5}}>
      <td style={{fontWeight: 500}}>{cliente.nombre}</td>
      <td>
        <span className={`badge badge-${cliente.tipo}`}>
          {cliente.tipo}
        </span>
      </td>
      <td style={{textAlign:'right', color:'var(--accent-gold)'}}>
        {formatMoneda(cliente.precio_mensual)}
      </td>
      <td>
        <label className="toggle">
          <input
            type="checkbox"
            checked={cliente.activo}
            onChange={() => onToggle(cliente)}
          />
          <div className="toggle-track">
            <div className="toggle-thumb"></div>
          </div>
        </label>
      </td>
      <td>
        <div className="actions-cell">
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEditar(cliente)} title="Editar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="btn btn-danger btn-icon btn-sm" onClick={() => onEliminar(cliente)} title="Eliminar">
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
  )
}
