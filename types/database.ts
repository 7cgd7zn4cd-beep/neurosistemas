export interface Sede {
  id: string
  nombre: string
  created_at: string
}

export interface UsuarioAlarma {
  id: string
  sede_id: string
  nombre: string
  cedula: string
  celular: string
  clave: string
  ticket: string
  lider_solicitante: string
  fecha_registro: string
  activo: boolean
  created_at: string
  updated_at: string
  sede?: Sede
}

export interface UsuarioAlarmaForm {
  sede_id: string
  nombre: string
  cedula: string
  celular: string
  clave: string
  ticket: string
  lider_solicitante: string
}
