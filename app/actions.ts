"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { UsuarioAlarmaForm } from "@/types/database"

export async function getSedes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sedes")
    .select("*")
    .order("nombre")

  if (error) throw error
  return data
}

export async function getUsuarios(searchTerm?: string, sedeId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("usuarios_alarma")
    .select(`
      *,
      sede:sedes(id, nombre)
    `)
    .eq("activo", true)
    .order("created_at", { ascending: false })

  if (searchTerm) {
    query = query.or(`nombre.ilike.%${searchTerm}%,cedula.ilike.%${searchTerm}%`)
  }

  if (sedeId && sedeId !== "all") {
    query = query.eq("sede_id", sedeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function createUsuario(formData: UsuarioAlarmaForm) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("usuarios_alarma")
    .insert([formData])
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un usuario con esta cedula")
    }
    throw error
  }

  revalidatePath("/")
  return data
}

export async function updateUsuario(id: string, formData: Partial<UsuarioAlarmaForm>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("usuarios_alarma")
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un usuario con esta cedula")
    }
    throw error
  }

  revalidatePath("/")
  return data
}

export async function deleteUsuario(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("usuarios_alarma")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error

  revalidatePath("/")
}

export async function exportUsuarios(sedeId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("usuarios_alarma")
    .select(`
      *,
      sede:sedes(nombre)
    `)
    .eq("activo", true)
    .order("nombre")

  if (sedeId && sedeId !== "all") {
    query = query.eq("sede_id", sedeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
