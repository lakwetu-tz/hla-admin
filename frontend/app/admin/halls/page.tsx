"use client"

import { useState } from "react"
import {
  Plus,
  Edit,
  Building2,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth, canEditModule } from "@/lib/auth-context"
import { mockHalls, mockApplications, type Hall, type Stand } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"

export default function HallsPage() {
  const { user } = useAuth()
  const canEdit = user && canEditModule(user.role, "halls")

  const [halls, setHalls] = useState<Hall[]>(mockHalls)
  const [expandedHalls, setExpandedHalls] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Modals
  const [createHallOpen, setCreateHallOpen] = useState(false)
  const [editHallOpen, setEditHallOpen] = useState(false)
  const [assignStandOpen, setAssignStandOpen] = useState(false)
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null)
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null)

  // Form state
  const [hallForm, setHallForm] = useState({ name: "", theme: "", totalArea: 500 })
  const [assignForm, setAssignForm] = useState({ companyId: "", size: 24 })

  const toggleHall = (hallId: string) => {
    setExpandedHalls((prev) =>
      prev.includes(hallId) ? prev.filter((id) => id !== hallId) : [...prev, hallId]
    )
  }

  const getOccupancyColor = (available: number, total: number) => {
    const percentage = ((total - available) / total) * 100
    if (percentage >= 80) return "bg-destructive"
    if (percentage >= 50) return "bg-warning"
    return "bg-success"
  }

  const getStandStatusBadge = (status: Stand["status"]) => {
    const styles = {
      available: "bg-success/10 text-success border-success",
      reserved: "bg-warning/10 text-warning-foreground border-warning",
      occupied: "bg-primary/10 text-primary border-primary",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const approvedApplications = mockApplications.filter((a) => a.status === "approved")

  const handleCreateHall = () => {
    if (!hallForm.name || !hallForm.theme) {
      toast.error("Please fill in all fields")
      return
    }
    const newHall: Hall = {
      id: `HALL${String(halls.length + 1).padStart(3, "0")}`,
      name: hallForm.name,
      theme: hallForm.theme,
      totalArea: hallForm.totalArea,
      availableArea: hallForm.totalArea,
      stands: [],
    }
    setHalls([...halls, newHall])
    toast.success("Hall Created", {
      description: `${hallForm.name} has been added successfully.`,
    })
    setCreateHallOpen(false)
    setHallForm({ name: "", theme: "", totalArea: 500 })
  }

  const handleEditHall = () => {
    if (!selectedHall || !hallForm.name || !hallForm.theme) {
      toast.error("Please fill in all fields")
      return
    }
    setHalls((prev) =>
      prev.map((hall) =>
        hall.id === selectedHall.id
          ? { ...hall, name: hallForm.name, theme: hallForm.theme, totalArea: hallForm.totalArea }
          : hall
      )
    )
    toast.success("Hall Updated", {
      description: `${hallForm.name} has been updated.`,
    })
    setEditHallOpen(false)
    setSelectedHall(null)
  }

  const handleAssignStand = () => {
    if (!selectedStand || !assignForm.companyId) {
      toast.error("Please select a company")
      return
    }
    const company = approvedApplications.find((a) => a.id === assignForm.companyId)
    if (!company) return

    setHalls((prev) =>
      prev.map((hall) => {
        if (hall.stands.some((s) => s.id === selectedStand.id)) {
          const updatedStands = hall.stands.map((s) =>
            s.id === selectedStand.id
              ? { ...s, status: "reserved" as const, assignedCompany: company.companyName, assignedApplicationId: company.id }
              : s
          )
          const usedArea = updatedStands.reduce((sum, s) => s.status !== "available" ? sum + s.size : sum, 0)
          return { ...hall, stands: updatedStands, availableArea: hall.totalArea - usedArea }
        }
        return hall
      })
    )

    toast.success("Stand Assigned", {
      description: `Stand ${selectedStand.number} assigned to ${company.companyName}.`,
    })
    setAssignStandOpen(false)
    setSelectedStand(null)
    setAssignForm({ companyId: "", size: 24 })
  }

  const filteredHalls = halls.filter(
    (hall) =>
      hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hall.theme.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Halls & Stands</h1>
          <p className="text-muted-foreground">
            Manage exhibition halls and stand allocations
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setCreateHallOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Hall
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search halls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Hall Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {halls.map((hall) => {
          const occupancyPercent = Math.round(((hall.totalArea - hall.availableArea) / hall.totalArea) * 100)
          return (
            <Card key={hall.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toggleHall(hall.id)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  {hall.name}
                </CardTitle>
                <CardDescription className="text-xs">{hall.theme}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{occupancyPercent}%</span>
                  </div>
                  <Progress value={occupancyPercent} className={getOccupancyColor(hall.availableArea, hall.totalArea)} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{hall.availableArea} m² available</span>
                    <span>{hall.totalArea} m² total</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Hall Details with Stands */}
      <div className="space-y-4">
        {filteredHalls.map((hall) => (
          <Collapsible key={hall.id} open={expandedHalls.includes(hall.id)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Building2 className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>{hall.name}</CardTitle>
                        <CardDescription>{hall.theme}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{hall.stands.length} Stands</p>
                        <p className="text-xs text-muted-foreground">
                          {hall.stands.filter((s) => s.status === "available").length} available
                        </p>
                      </div>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedHall(hall)
                            setHallForm({ name: hall.name, theme: hall.theme, totalArea: hall.totalArea })
                            setEditHallOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {expandedHalls.includes(hall.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stand Number</TableHead>
                        <TableHead>Size (m²)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Company</TableHead>
                        {canEdit && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hall.stands.map((stand) => (
                        <TableRow key={stand.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                            {stand.number}
                          </TableCell>
                          <TableCell>{stand.size}</TableCell>
                          <TableCell>{getStandStatusBadge(stand.status)}</TableCell>
                          <TableCell>{stand.assignedCompany || "-"}</TableCell>
                          {canEdit && (
                            <TableCell className="text-right">
                              {stand.status === "available" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedStand(stand)
                                    setAssignStandOpen(true)
                                  }}
                                >
                                  Assign
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Create Hall Modal */}
      <Dialog open={createHallOpen} onOpenChange={setCreateHallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Hall</DialogTitle>
            <DialogDescription>
              Add a new exhibition hall to the venue.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="hall-name">Hall Name</FieldLabel>
              <Input
                id="hall-name"
                placeholder="e.g., Central Africa Pavilion"
                value={hallForm.name}
                onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="hall-theme">Theme</FieldLabel>
              <Input
                id="hall-theme"
                placeholder="e.g., Sustainable Agriculture"
                value={hallForm.theme}
                onChange={(e) => setHallForm({ ...hallForm, theme: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Total Area: {hallForm.totalArea} m²</FieldLabel>
              <Slider
                value={[hallForm.totalArea]}
                onValueChange={(value) => setHallForm({ ...hallForm, totalArea: value[0] })}
                min={100}
                max={1000}
                step={50}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateHallOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateHall}>Create Hall</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hall Modal */}
      <Dialog open={editHallOpen} onOpenChange={setEditHallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hall</DialogTitle>
            <DialogDescription>
              Update hall information.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-hall-name">Hall Name</FieldLabel>
              <Input
                id="edit-hall-name"
                value={hallForm.name}
                onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-hall-theme">Theme</FieldLabel>
              <Input
                id="edit-hall-theme"
                value={hallForm.theme}
                onChange={(e) => setHallForm({ ...hallForm, theme: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Total Area: {hallForm.totalArea} m²</FieldLabel>
              <Slider
                value={[hallForm.totalArea]}
                onValueChange={(value) => setHallForm({ ...hallForm, totalArea: value[0] })}
                min={100}
                max={1000}
                step={50}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHallOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditHall}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Stand Modal */}
      <Dialog open={assignStandOpen} onOpenChange={setAssignStandOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Stand {selectedStand?.number}</DialogTitle>
            <DialogDescription>
              Select an approved company to assign this stand.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Company</FieldLabel>
              <Select
                value={assignForm.companyId}
                onValueChange={(value) => setAssignForm({ ...assignForm, companyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {approvedApplications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.companyName} ({app.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Stand Size: <strong>{selectedStand?.size} m²</strong></p>
              <p className="text-sm text-muted-foreground mt-1">
                Available companies: {approvedApplications.length}
              </p>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignStandOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignStand}>Assign Stand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
