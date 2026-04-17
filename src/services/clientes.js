import { supabase } from './supabase'

export const clientesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data
  },

  async create(cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, cambios) {
    const { data, error } = await supabase
      .from('clientes')
      .update(cambios)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async toggleActivo(id, activo) {
    return clientesService.update(id, { activo })
  }
}
