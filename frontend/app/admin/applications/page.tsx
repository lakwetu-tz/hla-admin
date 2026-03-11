"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth, canEditModule } from "@/lib/auth-context"
import { mockApplications, type Application } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

const ITEMS_PER_PAGE = 10
const CATEGORIES = ["All", "Fruits", "Vegetables", "Grains", "Machinery", "Seeds"]
const COUNTRIES = ["All", "Kenya", "Nigeria", "South Africa", "Ethiopia", "Ghana", "Morocco", "Tanzania", "Uganda"]
const STATUSES = ["All", "pending", "approved", "rejected", "offer_sent"]

type SortField = "companyName" | "country" | "category" | "standSize" | "submittedAt"
type SortDirection = "asc" | "desc"

export default function ApplicationsPage() {
  const { user } = useAuth()
  const canEdit = user && canEditModule(user.role, "applications")

  // State
  const [applications, setApplications] = useState<Application[]>(mockApplications)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [countryFilter, setCountryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("submittedAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Modals
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // Filtered and sorted applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === "All" || app.category === categoryFilter
        const matchesCountry = countryFilter === "All" || app.country === countryFilter
        const matchesStatus = statusFilter === "All" || app.status === statusFilter
        return matchesSearch && matchesCategory && matchesCountry && matchesStatus
      })
      .sort((a, b) => {
        let comparison = 0
        if (sortField === "submittedAt") {
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        } else if (sortField === "standSize") {
          comparison = a.standSize - b.standSize
        } else {
          comparison = a[sortField].localeCompare(b[sortField])
        }
        return sortDirection === "asc" ? comparison : -comparison
      })
  }, [applications, searchQuery, categoryFilter, countryFilter, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE)
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleApprove = () => {
    if (!selectedApp) return
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id ? { ...app, status: "approved" as const } : app
      )
    )
    toast.success("Application Approved", {
      description: `${selectedApp.companyName} has been approved. Offer will be generated.`,
    })
    setApproveModalOpen(false)
    setSelectedApp(null)
  }

  const handleReject = () => {
    if (!selectedApp || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id ? { ...app, status: "rejected" as const } : app
      )
    )
    toast.error("Application Rejected", {
      description: `${selectedApp.companyName} has been rejected.`,
    })
    setRejectModalOpen(false)
    setRejectReason("")
    setSelectedApp(null)
  }

  const handleExportCSV = () => {
    toast.success("Export Started", {
      description: "Your CSV file is being generated...",
    })
  }

  const getStatusBadge = (status: Application["status"]) => {
    const styles = {
      pending: "bg-warning/10 text-warning-foreground border-warning",
      approved: "bg-success/10 text-success border-success",
      rejected: "bg-destructive/10 text-destructive border-destructive",
      offer_sent: "bg-primary/10 text-primary border-primary",
    }
    const labels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      offer_sent: "Offer Sent",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground">
            Manage exhibitor applications ({filteredApplications.length} total)
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by company name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "All" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("companyName")}>
                    Company <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("country")}>
                    Country <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("category")}>
                    Category <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("standSize")}>
                    Stand (m²) <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApplications.map((app) => (
                <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{app.companyName}</TableCell>
                  <TableCell>{app.country}</TableCell>
                  <TableCell>{app.category}</TableCell>
                  <TableCell className="text-right">{app.standSize}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedApp(app)
                            setViewModalOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit && app.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedApp(app)
                                setApproveModalOpen(true)
                              }}
                              className="text-success"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedApp(app)
                                setRejectModalOpen(true)
                              }}
                              className="text-destructive"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredApplications.length)} of{" "}
          {filteredApplications.length} applications
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

      {/* View Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Application ID: {selectedApp?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                  <p className="text-foreground">{selectedApp.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Country</p>
                  <p className="text-foreground">{selectedApp.country}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-foreground">{selectedApp.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stand Size</p>
                  <p className="text-foreground">{selectedApp.standSize} m²</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                  <p className="text-foreground">{selectedApp.contactName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                  <p className="text-foreground">{selectedApp.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
                  <p className="text-foreground">{selectedApp.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedApp.status)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-foreground">{selectedApp.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p className="text-foreground">
                  {new Date(selectedApp.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the application from{" "}
              <strong>{selectedApp?.companyName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will automatically generate an offer and notify the exhibitor.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-success text-success-foreground hover:bg-success/90">
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the application from{" "}
              <strong>{selectedApp?.companyName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reject-reason">Rejection Reason</FieldLabel>
              <Textarea
                id="reject-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} variant="destructive">
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
