"use client"

import { useState } from "react"
import {
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ExternalLink,
  Settings2,
  MousePointerClick,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth, canEditModule } from "@/lib/auth-context"
import {
  mockPlacements,
  mockPlacementSettings,
  type SponsoredPlacement,
  type PlacementSettings,
} from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

const ITEMS_PER_PAGE = 10

const CATEGORIES = ["Accommodation", "Travel", "Visa", "Local Logistics", "Finance"] as const
const LOCATIONS = ["Sidebar Carousel", "Below Results", "Resource Hub"] as const
const STATUSES = ["Active", "Inactive", "Pending", "Expired"] as const

export default function PlacementsPage() {
  const { user } = useAuth()
  const canEdit = user && canEditModule(user.role, "placements")

  const [placements, setPlacements] = useState<SponsoredPlacement[]>(mockPlacements)
  const [settings, setSettings] = useState<PlacementSettings>(mockPlacementSettings)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("placements")

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [selectedPlacement, setSelectedPlacement] = useState<SponsoredPlacement | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState<Partial<SponsoredPlacement>>({
    partnerName: "",
    website: "",
    contactEmail: "",
    contactName: "",
    category: "Accommodation",
    placementLocation: "Sidebar Carousel",
    status: "Pending",
    startDate: "",
    endDate: "",
    feeAmount: 0,
    paymentStatus: "Pending",
    adTitle: "",
    adDescription: "",
    adImage: "",
    ctaText: "",
    ctaLink: "",
    priority: 1,
    maxImpressions: undefined,
    notes: "",
  })

  // Filtered placements
  const filteredPlacements = placements.filter((p) => {
    const matchesSearch =
      p.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.adTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter
    const matchesStatus = statusFilter === "All" || p.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalPages = Math.ceil(filteredPlacements.length / ITEMS_PER_PAGE)
  const paginatedPlacements = filteredPlacements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Stats
  const totalRevenue = placements.reduce((sum, p) => sum + (p.paymentStatus === "Paid" ? p.feeAmount : 0), 0)
  const totalImpressions = placements.reduce((sum, p) => sum + p.impressions, 0)
  const totalClicks = placements.reduce((sum, p) => sum + p.clicks, 0)
  const activePlacements = placements.filter((p) => p.status === "Active").length

  const getStatusBadge = (status: SponsoredPlacement["status"]) => {
    const styles = {
      Active: "bg-success/10 text-success border-success",
      Inactive: "bg-muted text-muted-foreground border-muted",
      Pending: "bg-warning/10 text-warning-foreground border-warning",
      Expired: "bg-destructive/10 text-destructive border-destructive",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {status}
      </Badge>
    )
  }

  const getPaymentBadge = (status: SponsoredPlacement["paymentStatus"]) => {
    const styles = {
      Paid: "bg-success/10 text-success border-success",
      Pending: "bg-warning/10 text-warning-foreground border-warning",
      Overdue: "bg-destructive/10 text-destructive border-destructive",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {status}
      </Badge>
    )
  }

  const handleCreatePlacement = () => {
    const newPlacement: SponsoredPlacement = {
      id: `PL${String(placements.length + 1).padStart(3, "0")}`,
      partnerName: formData.partnerName || "",
      website: formData.website || "",
      contactEmail: formData.contactEmail || "",
      contactName: formData.contactName || "",
      category: formData.category as SponsoredPlacement["category"],
      placementLocation: formData.placementLocation as SponsoredPlacement["placementLocation"],
      status: "Pending",
      startDate: formData.startDate || "",
      endDate: formData.endDate || "",
      impressions: 0,
      clicks: 0,
      feeAmount: formData.feeAmount || 0,
      paymentStatus: "Pending",
      adTitle: formData.adTitle || "",
      adDescription: formData.adDescription || "",
      adImage: formData.adImage || "/placeholder.svg",
      ctaText: formData.ctaText || "",
      ctaLink: formData.ctaLink || "",
      priority: formData.priority || 1,
      maxImpressions: formData.maxImpressions,
      notes: formData.notes,
    }

    setPlacements((prev) => [...prev, newPlacement])
    toast.success("Placement Created", {
      description: `${newPlacement.partnerName} has been added with Pending status.`,
    })
    setCreateModalOpen(false)
    resetForm()
  }

  const handleEditPlacement = () => {
    if (!selectedPlacement) return

    setPlacements((prev) =>
      prev.map((p) =>
        p.id === selectedPlacement.id
          ? {
              ...p,
              ...formData,
            }
          : p
      )
    )
    toast.success("Placement Updated", {
      description: `${formData.partnerName} has been updated.`,
    })
    setEditModalOpen(false)
    resetForm()
  }

  const handleApprovePlacement = (placement: SponsoredPlacement) => {
    setPlacements((prev) =>
      prev.map((p) =>
        p.id === placement.id ? { ...p, status: "Active" } : p
      )
    )
    toast.success("Placement Activated", {
      description: `${placement.partnerName} is now active in the directory.`,
    })
  }

  const handleToggleStatus = (placement: SponsoredPlacement) => {
    const newStatus = placement.status === "Active" ? "Inactive" : "Active"
    setPlacements((prev) =>
      prev.map((p) =>
        p.id === placement.id ? { ...p, status: newStatus } : p
      )
    )
    toast.success(`Placement ${newStatus}`, {
      description: `${placement.partnerName} has been ${newStatus.toLowerCase()}.`,
    })
  }

  const handleDeletePlacement = (placement: SponsoredPlacement) => {
    setPlacements((prev) => prev.filter((p) => p.id !== placement.id))
    toast.success("Placement Deleted", {
      description: `${placement.partnerName} has been removed.`,
    })
  }

  const handleBulkAction = (action: "activate" | "deactivate") => {
    const newStatus = action === "activate" ? "Active" : "Inactive"
    setPlacements((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id) ? { ...p, status: newStatus } : p
      )
    )
    toast.success(`Bulk ${action}`, {
      description: `${selectedIds.length} placements have been ${newStatus.toLowerCase()}.`,
    })
    setSelectedIds([])
  }

  const handleExport = () => {
    const csv = [
      ["Partner Name", "Category", "Location", "Status", "Start Date", "End Date", "Fee", "Payment Status", "Impressions", "Clicks"].join(","),
      ...placements.map((p) =>
        [p.partnerName, p.category, p.placementLocation, p.status, p.startDate, p.endDate, p.feeAmount, p.paymentStatus, p.impressions, p.clicks].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sponsored-placements.csv"
    a.click()
    toast.success("Export Complete", { description: "CSV file has been downloaded." })
  }

  const handleSaveSettings = () => {
    toast.success("Settings Saved", {
      description: "Placement settings have been updated.",
    })
    setSettingsModalOpen(false)
  }

  const resetForm = () => {
    setFormData({
      partnerName: "",
      website: "",
      contactEmail: "",
      contactName: "",
      category: "Accommodation",
      placementLocation: "Sidebar Carousel",
      status: "Pending",
      startDate: "",
      endDate: "",
      feeAmount: 0,
      paymentStatus: "Pending",
      adTitle: "",
      adDescription: "",
      adImage: "",
      ctaText: "",
      ctaLink: "",
      priority: 1,
      maxImpressions: undefined,
      notes: "",
    })
    setSelectedPlacement(null)
  }

  const openEditModal = (placement: SponsoredPlacement) => {
    setSelectedPlacement(placement)
    setFormData({ ...placement })
    setEditModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sponsored Placements</h1>
          <p className="text-muted-foreground">
            Manage partner advertisements and placements
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button variant="outline" onClick={() => setSettingsModalOpen(true)}>
                <Settings2 className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Placement
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlacements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clicks
            </CardTitle>
            <MousePointerClick className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              CTR: {totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by partner or ad title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Bulk Actions */}
          {canEdit && selectedIds.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                <Power className="mr-1 h-3 w-3" />
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                <PowerOff className="mr-1 h-3 w-3" />
                Deactivate
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {canEdit && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === paginatedPlacements.length && paginatedPlacements.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds(paginatedPlacements.map((p) => p.id))
                        } else {
                          setSelectedIds([])
                        }
                      }}
                    />
                  </TableHead>
                )}
                <TableHead className="w-8"></TableHead>
                <TableHead>Partner Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead>Payment</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPlacements.map((placement) => (
                <TableRow key={placement.id}>
                  {canEdit && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(placement.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds((prev) => [...prev, placement.id])
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== placement.id))
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{placement.partnerName}</p>
                      <p className="text-xs text-muted-foreground">{placement.adTitle}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{placement.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{placement.placementLocation}</TableCell>
                  <TableCell>{getStatusBadge(placement.status)}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>{new Date(placement.startDate).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">to {new Date(placement.endDate).toLocaleDateString()}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{placement.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{placement.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">${placement.feeAmount.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentBadge(placement.paymentStatus)}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPlacement(placement)
                            setPreviewModalOpen(true)
                          }}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(placement)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {placement.status === "Pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprovePlacement(placement)}
                            title="Approve"
                            className="text-success hover:text-success"
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                        {(placement.status === "Active" || placement.status === "Inactive") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(placement)}
                            title={placement.status === "Active" ? "Deactivate" : "Activate"}
                          >
                            {placement.status === "Active" ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePlacement(placement)}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredPlacements.length)} of{" "}
          {filteredPlacements.length} placements
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create/Edit Placement Modal */}
      <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateModalOpen(false)
          setEditModalOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editModalOpen ? "Edit Placement" : "Create New Placement"}</DialogTitle>
            <DialogDescription>
              {editModalOpen ? "Update the placement details below." : "Add a new sponsored placement to the directory."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="partner" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="partner">Partner</TabsTrigger>
              <TabsTrigger value="content">Ad Content</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="partner" className="mt-4">
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Partner Name</FieldLabel>
                    <Input
                      value={formData.partnerName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, partnerName: e.target.value }))}
                      placeholder="e.g., Safari Lodge Nairobi"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Website</FieldLabel>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Contact Name</FieldLabel>
                    <Input
                      value={formData.contactName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                      placeholder="Contact person name"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Contact Email</FieldLabel>
                    <Input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as SponsoredPlacement["category"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="content" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Ad Title</FieldLabel>
                  <Input
                    value={formData.adTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, adTitle: e.target.value }))}
                    placeholder="e.g., Exclusive Exhibitor Rates"
                  />
                </Field>
                <Field>
                  <FieldLabel>Ad Description</FieldLabel>
                  <Textarea
                    value={formData.adDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, adDescription: e.target.value }))}
                    placeholder="Brief description of the offer..."
                    rows={3}
                  />
                </Field>
                <Field>
                  <FieldLabel>Image URL</FieldLabel>
                  <Input
                    value={formData.adImage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, adImage: e.target.value }))}
                    placeholder="/images/ad-banner.jpg"
                  />
                  {formData.adImage && (
                    <div className="mt-2 overflow-hidden rounded-lg border">
                      <img
                        src={formData.adImage}
                        alt="Ad preview"
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  )}
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>CTA Button Text</FieldLabel>
                    <Input
                      value={formData.ctaText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="e.g., Book Now"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>CTA Button Link</FieldLabel>
                    <Input
                      value={formData.ctaLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
                      placeholder="https://example.com/offer"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="targeting" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Display Location</FieldLabel>
                  <Select
                    value={formData.placementLocation}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, placementLocation: value as SponsoredPlacement["placementLocation"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Priority Rank (1 = highest)</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.priority}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Start Date</FieldLabel>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>End Date</FieldLabel>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Max Impressions (optional)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.maxImpressions || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxImpressions: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Leave empty for unlimited"
                  />
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="pricing" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Fee Amount ($)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.feeAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, feeAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </Field>
                <Field>
                  <FieldLabel>Payment Status</FieldLabel>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentStatus: value as SponsoredPlacement["paymentStatus"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes about this placement..."
                    rows={3}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setCreateModalOpen(false)
              setEditModalOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={editModalOpen ? handleEditPlacement : handleCreatePlacement}>
              {editModalOpen ? "Save Changes" : "Create Placement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ad Preview</DialogTitle>
            <DialogDescription>
              Preview how this ad will appear in the {selectedPlacement?.placementLocation}
            </DialogDescription>
          </DialogHeader>

          {selectedPlacement && (
            <div className="rounded-lg border bg-card p-4">
              <Badge className="mb-3 bg-primary/10 text-primary">Sponsored</Badge>
              {selectedPlacement.adImage && (
                <div className="mb-3 overflow-hidden rounded-lg">
                  <img
                    src={selectedPlacement.adImage}
                    alt={selectedPlacement.adTitle}
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
              <h3 className="mb-1 font-semibold">{selectedPlacement.adTitle}</h3>
              <p className="mb-3 text-sm text-muted-foreground">{selectedPlacement.adDescription}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{selectedPlacement.partnerName}</span>
                <Button size="sm">
                  {selectedPlacement.ctaText}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Placement Settings</DialogTitle>
            <DialogDescription>
              Configure global settings for sponsored placements
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel>Max Ads - Sidebar Carousel</FieldLabel>
              <Input
                type="number"
                value={settings.maxAdsPerLocation["Sidebar Carousel"]}
                onChange={(e) => setSettings((prev) => ({
                  ...prev,
                  maxAdsPerLocation: {
                    ...prev.maxAdsPerLocation,
                    "Sidebar Carousel": parseInt(e.target.value) || 0,
                  },
                }))}
              />
            </Field>
            <Field>
              <FieldLabel>Max Ads - Below Results</FieldLabel>
              <Input
                type="number"
                value={settings.maxAdsPerLocation["Below Results"]}
                onChange={(e) => setSettings((prev) => ({
                  ...prev,
                  maxAdsPerLocation: {
                    ...prev.maxAdsPerLocation,
                    "Below Results": parseInt(e.target.value) || 0,
                  },
                }))}
              />
            </Field>
            <Field>
              <FieldLabel>Max Ads - Resource Hub</FieldLabel>
              <Input
                type="number"
                value={settings.maxAdsPerLocation["Resource Hub"]}
                onChange={(e) => setSettings((prev) => ({
                  ...prev,
                  maxAdsPerLocation: {
                    ...prev.maxAdsPerLocation,
                    "Resource Hub": parseInt(e.target.value) || 0,
                  },
                }))}
              />
            </Field>
            <Field>
              <FieldLabel>Rotation Logic</FieldLabel>
              <Select
                value={settings.rotationLogic}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, rotationLogic: value as "random" | "sequential" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Default Badge Text</FieldLabel>
              <Input
                value={settings.defaultBadgeText}
                onChange={(e) => setSettings((prev) => ({ ...prev, defaultBadgeText: e.target.value }))}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
