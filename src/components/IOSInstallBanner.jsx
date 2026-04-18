import { useState, useEffect } from 'react'

export default function IOSInstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isInStandaloneMode = window.navigator.standalone === true
    const dismissed = localStorage.getItem('ios-banner-dismissed')

    if (isIOS && !isInStandaloneMode && !dismissed) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('ios-banner-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="ios-banner">
      <div className="ios-banner-content">
        <div className="ios-banner-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#060D1C"/>
            <text x="16" y="22" fontSize="18" textAnchor="middle" fill="#C9A84C" fontFamily="Georgia, serif">₣</text>
          </svg>
        </div>
        <div className="ios-banner-text">
          <strong>Agregar a inicio</strong>
          <p>Tocá <ShareIcon /> luego <em>"Agregar a pantalla de inicio"</em></p>
        </div>
        <button className="ios-banner-close" onClick={dismiss} aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="ios-banner-arrow" />
    </div>
  )
}

const ShareIcon = () => (
  <svg
    width="13" height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }}
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)
