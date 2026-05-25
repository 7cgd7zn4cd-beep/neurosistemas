"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import type { UsuarioAlarma, Sede } from "@/types/database"
import { deleteUsuario } from "@/app/actions"
import { UsuarioFormDialog } from "./usuario-form-dialog"

interface UsuariosTableProps {
  usuarios: UsuarioAlarma[]
  sedes: Sede[]
  onRefresh: () => void
}

export function UsuariosTable({ usuarios, sedes, onRefresh }: UsuariosTableProps) {
  const [editingUsuario, setEditingUsuario] = useState<UsuarioAlarma | null>(null)
  const [deletingUsuario, setDeletingUsuario] = useState<UsuarioAlarma | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [visibleClaves, setVisibleClaves] = useState<Set<string>>(new Set())

  const toggleClaveVisibility = (id: string) => {
    setVisibleClaves(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleDelete = async () => {
    if (!deletingUsuario) return
    setDeleting(true)
    try {
      await deleteUsuario(deletingUsuario.id)
      onRefresh()
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setDeleting(false)
      setDeletingUsuario(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (usuarios.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No se encontraron usuarios registrados
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sede</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Cedula</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Clave</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>Lider</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">
                  {usuario.sede?.nombre || "N/A"}
                </TableCell>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.cedula}</TableCell>
                <TableCell>{usuario.celular}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">
                      {visibleClaves.has(usuario.id) ? usuario.clave : '****'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleClaveVisibility(usuario.id)}
                    >
                      {visibleClaves.has(usuario.id) ? (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {visibleClaves.has(usuario.id) ? 'Ocultar clave' : 'Mostrar clave'}
                      </span>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{usuario.ticket}</TableCell>
                <TableCell>{usuario.lider_solicitante}</TableCell>
                <TableCell>{formatDate(usuario.fecha_registro)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingUsuario(usuario)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingUsuario(usuario)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UsuarioFormDialog
        open={!!editingUsuario}
        onOpenChange={(open) => !open && setEditingUsuario(null)}
        sedes={sedes}
        usuario={editingUsuario}
        onSuccess={onRefresh}
      />

      <AlertDialog open={!!deletingUsuario} onOpenChange={(open) => !open && setDeletingUsuario(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminacion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro de eliminar al usuario{" "}
              <strong>{deletingUsuario?.nombre}</strong>? Esta accion no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
