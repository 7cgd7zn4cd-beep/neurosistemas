"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Plus, Search, Shield, Users, LogOut } from "lucide-react"
import type { Sede, UsuarioAlarma } from "@/types/database"
import { getUsuarios, getSedes, exportUsuarios, logout } from "@/app/actions"
import { UsuariosTable } from "./usuarios-table"
import { UsuarioFormDialog } from "./usuario-form-dialog"
import Image from "next/image"

export function ControlAlarmas() {
  const [usuarios, setUsuarios] = useState<UsuarioAlarma[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSede, setSelectedSede] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const [sedesData, usuariosData] = await Promise.all([
          getSedes(),
          getUsuarios(searchTerm, selectedSede),
        ])
        setSedes(sedesData)
        setUsuarios(usuariosData)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    })
  }, [searchTerm, selectedSede])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExport = async () => {
    try {
      const data = await exportUsuarios(selectedSede)
      const csvContent = [
        ["Sede", "Nombre", "Cedula", "Celular", "Clave", "Ticket", "Lider Solicitante", "Fecha Registro"].join(","),
        ...data.map((u) =>
          [
            u.sede?.nombre || "",
            u.nombre,
            u.cedula,
            u.celular,
            u.clave,
            u.ticket,
            u.lider_solicitante,
            new Date(u.fecha_registro).toLocaleDateString("es-CO"),
          ].join(",")
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `usuarios_alarma_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
    } catch (error) {
      console.error("Error exporting:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo_neuromedica.webp"
                alt="Neuromedica"
                width={180}
                height={45}
                priority
                className="h-auto"
              />
              <div className="hidden sm:block border-l pl-4">
                <h1 className="text-lg font-semibold text-foreground">
                  Control de Alarmas
                </h1>
                <p className="text-xs text-muted-foreground">
                  Sistema de gestion de accesos
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesion'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.length}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios activos registrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sedes</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sedes.length}</div>
              <p className="text-xs text-muted-foreground">
                Sedes con sistema de alarma
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ultimo Registro</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usuarios.length > 0
                  ? new Date(usuarios[0].created_at).toLocaleDateString("es-CO", {
                      month: "short",
                      day: "numeric",
                    })
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                Fecha del ultimo usuario agregado
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Usuarios Registrados</CardTitle>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o cedula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedSede} onValueChange={setSelectedSede}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sedes</SelectItem>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            {isPending ? (
              <div className="text-center py-12 text-muted-foreground">
                Cargando usuarios...
              </div>
            ) : (
              <UsuariosTable
                usuarios={usuarios}
                sedes={sedes}
                onRefresh={loadData}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <UsuarioFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        sedes={sedes}
        onSuccess={loadData}
      />
    </div>
  )
}
