export const formatMoneda = (monto) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)
}

export const formatFecha = (fecha) => {
  if (!fecha) return ''
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

export const getFechaHoy = () => {
  return new Date().toISOString().split('T')[0]
}

export const getMesActual = () => {
  const hoy = new Date()
  return { mes: hoy.getMonth() + 1, año: hoy.getFullYear() }
}

export const nombreMes = (mes, año) => {
  const fecha = new Date(año, mes - 1, 1)
  return fecha.toLocaleString('es-AR', { month: 'long', year: 'numeric' })
}

export const CATEGORIAS_INGRESO = [
  'Gym', 'Fútbol', 'Clase particular', 'Transferencia', 'Otro ingreso'
]

export const CATEGORIAS_GASTO = [
  'Alquiler', 'Servicios', 'Alimentos', 'Transporte', 'Indumentaria',
  'Salud', 'Entretenimiento', 'Material deportivo', 'Otro gasto'
]
