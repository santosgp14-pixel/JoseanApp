import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Movimientos from './pages/Movimientos'
import Clientes from './pages/Clientes'

const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const IconMovimientos = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </svg>
)

const IconClientes = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export default function App() {
  return (
    <div className="app-layout">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>mis <span>finanzas</span></h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconDashboard />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/movimientos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconMovimientos />
            <span>Movimientos</span>
          </NavLink>
          <NavLink to="/clientes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconClientes />
            <span>Clientes</span>
          </NavLink>
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="mobile-topbar">
        <h1>mis <span>finanzas</span></h1>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/clientes" element={<Clientes />} />
        </Routes>
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <IconDashboard />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/movimientos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <IconMovimientos />
          <span>Movimientos</span>
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <IconClientes />
          <span>Clientes</span>
        </NavLink>
      </nav>
    </div>
  )
}
