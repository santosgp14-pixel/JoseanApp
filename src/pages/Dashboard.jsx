import { useState, useEffect } from 'react'
import { movimientosService } from '../services/movimientos'
import { clientesService } from '../services/clientes'
import { formatMoneda, formatFecha, getMesActual, nombreMes } from '../utils/formatters'
import MovimientoForm from '../components/MovimientoForm'

export default function Dashboard() {
  const { mes: mesActual, año: añoActual } = getMesActual()
  const [mes, setMes] = useState(mesActual)
  const [año, setAño] = useState(añoActual)
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 })
  const [ultimos, setUltimos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const [res, movs, cls] = await Promise.all([
        movimientosService.getResumenMes(mes, año),
        movimientosService.getAll({ mes, año }),
        clientesService.getAll()
      ])
      setResumen(res)
      setUltimos(movs.slice(0, 10))
      setClientes(cls)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [mes, año])

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

  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i, 1).toLocaleString('es-AR', { month: 'long' })
  }))

  const años = [añoActual - 1, añoActual, añoActual + 1]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{color:'var(--text-muted)', marginTop:'0.25rem', fontSize:'0.875rem', textTransform:'capitalize'}}>
            {nombreMes(mes, año)}
          </p>
        </div>
        <div style={{display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap'}}>
          <div style={{display:'flex', gap:'0.5rem'}}>
            <select className="filter-select" value={mes} onChange={e => setMes(Number(e.target.value))}>
              {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select className="filter-select" value={año} onChange={e => setAño(Number(e.target.value))}>
              {años.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar movimiento
          </button>
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card ingreso">
          <div className="stat-label">Ingresos del mes</div>
          <div className="stat-value">{formatMoneda(resumen.ingresos)}</div>
        </div>
        <div className="stat-card gasto">
          <div className="stat-label">Gastos del mes</div>
          <div className="stat-value">{formatMoneda(resumen.gastos)}</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-label">Balance</div>
          <div className="stat-value">{formatMoneda(resumen.balance)}</div>
        </div>
      </div>

      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem'}}>
          <h2 style={{fontFamily:'var(--font-serif)', fontSize:'1.2rem', fontWeight:400}}>
            Últimos movimientos
          </h2>
          <a href="/movimientos" style={{color:'var(--text-muted)', fontSize:'0.8125rem', textDecoration:'none'}}>
            Ver todos →
          </a>
        </div>

        {loading ? (
          <div className="loading">Cargando...</div>
        ) : ultimos.length === 0 ? (
          <div className="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{margin:'0 auto', opacity:0.3}}>
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <p>No hay movimientos este mes</p>
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
                  <th style={{textAlign:'right'}}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {ultimos.map(m => (
                  <tr key={m.id}>
                    <td style={{color:'var(--text-muted)'}}>{formatFecha(m.fecha)}</td>
                    <td><span className={`badge badge-${m.tipo}`}>{m.tipo}</span></td>
                    <td>{m.categoria}</td>
                    <td style={{color:'var(--text-muted)'}}>{m.clientes?.nombre || '—'}</td>
                    <td style={{textAlign:'right'}} className={`monto-${m.tipo}`}>
                      {m.tipo === 'gasto' ? '−' : '+'}{formatMoneda(m.monto)}
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
    </div>
  )
}
