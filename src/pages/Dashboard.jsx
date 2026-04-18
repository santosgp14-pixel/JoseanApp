import { useState, useEffect } from 'react'
import { movimientosService } from '../services/movimientos'
import { clientesService } from '../services/clientes'
import { formatMoneda, formatFecha, getMesActual, nombreMes } from '../utils/formatters'
import MovimientoForm from '../components/MovimientoForm'

const NOMBRE_MES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function Dashboard() {
  const { mes: mesActual, año: añoActual } = getMesActual()
  const [mes, setMes] = useState(mesActual)
  const [año, setAño] = useState(añoActual)
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 })
  const [ultimos, setUltimos] = useState([])
  const [clientes, setClientes] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingHistorial, setLoadingHistorial] = useState(true)
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

  const cargarHistorial = async () => {
    setLoadingHistorial(true)
    try {
      const data = await movimientosService.getResumenUltimosMeses(6)
      setHistorial(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingHistorial(false)
    }
  }

  useEffect(() => { cargar() }, [mes, año])
  useEffect(() => { cargarHistorial() }, [])

  const handleCrear = async (data) => {
    setSaving(true)
    try {
      await movimientosService.create(data)
      setShowForm(false)
      cargar()
      cargarHistorial()
    } finally {
      setSaving(false)
    }
  }

  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i, 1).toLocaleString('es-AR', { month: 'long' })
  }))

  const años = [añoActual - 1, añoActual, añoActual + 1]

  // Max value for bar chart scaling
  const maxVal = historial.length > 0
    ? Math.max(...historial.map(h => Math.max(h.ingresos, h.gastos)), 1)
    : 1

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

      {/* Historial comparativo */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <h2 style={{fontFamily:'var(--font-serif)', fontSize:'1.2rem', fontWeight:400, marginBottom:'1.5rem'}}>
          Últimos 6 meses
        </h2>

        {loadingHistorial ? (
          <div className="loading">Cargando...</div>
        ) : (
          <>
            {/* Bar chart */}
            <div className="historial-chart">
              {historial.map((h, i) => (
                <div key={i} className="historial-col">
                  <div className="historial-bars">
                    <div
                      className="historial-bar bar-ingreso"
                      style={{height: `${(h.ingresos / maxVal) * 100}%`}}
                      title={`Ingresos: ${formatMoneda(h.ingresos)}`}
                    />
                    <div
                      className="historial-bar bar-gasto"
                      style={{height: `${(h.gastos / maxVal) * 100}%`}}
                      title={`Gastos: ${formatMoneda(h.gastos)}`}
                    />
                  </div>
                  <div className="historial-mes-label">
                    {NOMBRE_MES_CORTO[h.mes - 1]}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="historial-legend">
              <span className="historial-legend-item ingreso">Ingresos</span>
              <span className="historial-legend-item gasto">Gastos</span>
            </div>

            {/* Table */}
            <div className="table-container" style={{marginTop:'1.25rem'}}>
              <table>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th style={{textAlign:'right'}}>Ingresos</th>
                    <th style={{textAlign:'right'}}>Gastos</th>
                    <th style={{textAlign:'right'}}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historial].reverse().map((h, i) => (
                    <tr key={i}>
                      <td style={{textTransform:'capitalize', fontWeight: h.mes === mesActual && h.año === añoActual ? 500 : 400}}>
                        {h.mes === mesActual && h.año === añoActual
                          ? <span style={{color:'var(--accent-gold-light)'}}>● </span>
                          : null
                        }
                        {NOMBRE_MES_CORTO[h.mes - 1]} {h.año}
                      </td>
                      <td style={{textAlign:'right'}} className="monto-ingreso">
                        {h.ingresos > 0 ? formatMoneda(h.ingresos) : <span style={{color:'var(--text-dim)'}}>—</span>}
                      </td>
                      <td style={{textAlign:'right'}} className="monto-gasto">
                        {h.gastos > 0 ? formatMoneda(h.gastos) : <span style={{color:'var(--text-dim)'}}>—</span>}
                      </td>
                      <td style={{textAlign:'right'}} className={h.balance >= 0 ? 'monto-ingreso' : 'monto-gasto'}>
                        {h.ingresos === 0 && h.gastos === 0
                          ? <span style={{color:'var(--text-dim)'}}>—</span>
                          : (h.balance >= 0 ? '+' : '−') + formatMoneda(Math.abs(h.balance))
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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
