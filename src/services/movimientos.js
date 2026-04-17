import { supabase } from './supabase'

export const movimientosService = {
  async getAll({ mes, año, tipo } = {}) {
    let query = supabase
      .from('movimientos')
      .select('*, clientes(nombre, tipo)')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })

    if (mes && año) {
      const inicio = `${año}-${String(mes).padStart(2, '0')}-01`
      const fin = new Date(año, mes, 0).toISOString().split('T')[0]
      query = query.gte('fecha', inicio).lte('fecha', fin)
    }

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async create(movimiento) {
    const { data, error } = await supabase
      .from('movimientos')
      .insert([movimiento])
      .select('*, clientes(nombre, tipo)')
      .single()
    if (error) throw error
    return data
  },

  async update(id, cambios) {
    const { data, error } = await supabase
      .from('movimientos')
      .update(cambios)
      .eq('id', id)
      .select('*, clientes(nombre, tipo)')
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('movimientos')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getResumenMes(mes, año) {
    const inicio = `${año}-${String(mes).padStart(2, '0')}-01`
    const fin = new Date(año, mes, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('movimientos')
      .select('tipo, monto')
      .gte('fecha', inicio)
      .lte('fecha', fin)

    if (error) throw error

    const ingresos = data.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + Number(m.monto), 0)
    const gastos = data.filter(m => m.tipo === 'gasto').reduce((acc, m) => acc + Number(m.monto), 0)

    return { ingresos, gastos, balance: ingresos - gastos }
  }
}
