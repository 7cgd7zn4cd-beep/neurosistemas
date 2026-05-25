"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Sede, UsuarioAlarma, UsuarioAlarmaForm } from "@/types/database"
import { createUsuario, updateUsuario } from "@/app/actions"

interface UsuarioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sedes: Sede[]
  usuario?: UsuarioAlarma | null
  onSuccess: () => void
}

export function UsuarioFormDialog({
  open,
  onOpenChange,
  sedes,
  usuario,
  onSuccess,
}: UsuarioFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<UsuarioAlarmaForm>({
    sede_id: usuario?.sede_id || "",
    nombre: usuario?.nombre || "",
    cedula: usuario?.cedula || "",
    celular: usuario?.celular || "",
    clave: usuario?.clave || "",
    ticket: usuario?.ticket || "",
    lider_solicitante: usuario?.lider_solicitante || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (usuario) {
        await updateUsuario(usuario.id, formData)
      } else {
        await createUsuario(formData)
      }
      onSuccess()
      onOpenChange(false)
      setFormData({
        sede_id: "",
        nombre: "",
        cedula: "",
        celular: "",
        clave: "",
        ticket: "",
        lider_solicitante: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null)
      if (!usuario) {
        setFormData({
          sede_id: "",
          nombre: "",
          cedula: "",
          celular: "",
          clave: "",
          ticket: "",
          lider_solicitante: "",
        })
      }
    } else if (usuario) {
      setFormData({
        sede_id: usuario.sede_id,
        nombre: usuario.nombre,
        cedula: usuario.cedula,
        celular: usuario.celular,
        clave: usuario.clave,
        ticket: usuario.ticket,
        lider_solicitante: usuario.lider_solicitante,
      })
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {usuario ? "Editar Usuario" : "Nuevo Usuario de Alarma"}
          </DialogTitle>
          <DialogDescription>
            {usuario
              ? "Modifique los datos del usuario de alarma."
              : "Complete el formulario para registrar un nuevo usuario de alarma."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="sede">Sede *</Label>
              <Select
                value={formData.sede_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, sede_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una sede" />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Nombre del usuario"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cedula">Cedula *</Label>
                <Input
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) =>
                    setFormData({ ...formData, cedula: e.target.value })
                  }
                  placeholder="Numero de cedula"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="celular">Celular *</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) =>
                    setFormData({ ...formData, celular: e.target.value })
                  }
                  placeholder="Numero de celular"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clave">Clave de Alarma (4 digitos) *</Label>
                <Input
                  id="clave"
                  value={formData.clave}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setFormData({ ...formData, clave: value })
                  }}
                  placeholder="0000"
                  maxLength={4}
                  pattern="\d{4}"
                  inputMode="numeric"
                  required
                  className="font-mono tracking-widest text-center"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket">Ticket *</Label>
                <Input
                  id="ticket"
                  value={formData.ticket}
                  onChange={(e) =>
                    setFormData({ ...formData, ticket: e.target.value })
                  }
                  placeholder="Numero de ticket"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lider">Lider Solicitante *</Label>
              <Input
                id="lider"
                value={formData.lider_solicitante}
                onChange={(e) =>
                  setFormData({ ...formData, lider_solicitante: e.target.value })
                }
                placeholder="Nombre del lider que solicita"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : usuario ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
