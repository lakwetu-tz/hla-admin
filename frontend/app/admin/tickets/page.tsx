"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Download,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  DollarSign,
  Users,
  AlertTriangle,
  RefreshCw,
  Mail,
  QrCode,
  Settings2,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth, canEditModule } from "@/lib/auth-context"
import {
  mockTickets,
  mockTicketSettings,
  type TicketRegistration,
  type TicketSettings,
} from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const ITEMS_PER_PAGE = 10

const TICKET_TYPES = ["Buyer", "Visitor", "Group", "VIP"] as const
const PAYMENT_STATUSES = ["Paid", "Pending", "Refunded"] as const
const APPROVAL_STATUSES = ["Pending", "Approved", "Rejected"] as const

// Mock sales data for chart
const salesChartData = [
  { date: "Feb 15", buyers: 5, visitors: 12, revenue: 1750 },
  { date: "Feb 18", buyers: 8, visitors: 20, revenue: 3500 },
  { date: "Feb 22", buyers: 12, visitors: 35, revenue: 5625 },
  { date: "Feb 25", buyers: 18, visitors: 42, revenue: 7800 },
  { date: "Feb 28", buyers: 25, visitors: 58, revenue: 10600 },
  { date: "Mar 02", buyers: 32, visitors: 75, revenue: 13625 },
  { date: "Mar 05", buyers: 38, visitors: 89, revenue: 16175 },
  { date: "Mar 09", buyers: 45, visitors: 102, revenue: 18900 },
]

export default function TicketsPage() {
  const { user } = useAuth()
  const canEdit = user && canEditModule(user.role, "tickets")

  const [tickets, setTickets] = useState<TicketRegistration[]>(mockTickets)
  const [settings, setSettings] = useState<TicketSettings>(mockTicketSettings)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [paymentFilter, setPaymentFilter] = useState("All")
  const [approvalFilter, setApprovalFilter] = useState("All")
  const [countryFilter, setCountryFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketRegistration | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [refundReason, setRefundReason] = useState("")
  const [refundAmount, setRefundAmount] = useState("")

  // Get unique countries
  const countries = useMemo(() => {
    const countrySet = new Set(tickets.map((t) => t.country))
    return Array.from(countrySet).sort()
  }, [tickets])

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "All" || t.ticketType === typeFilter
    const matchesPayment = paymentFilter === "All" || t.paymentStatus === paymentFilter
    const matchesApproval = approvalFilter === "All" || t.approvalStatus === approvalFilter
    const matchesCountry = countryFilter === "All" || t.country === countryFilter
    return matchesSearch && matchesType && matchesPayment && matchesApproval && matchesCountry
  })

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Stats
  const totalTickets = tickets.length
  const buyerTickets = tickets.filter((t) => t.ticketType === "Buyer").length
  const visitorTickets = tickets.filter((t) => t.ticketType === "Visitor").length
  const grossRevenue = tickets
    .filter((t) => t.paymentStatus === "Paid")
    .reduce((sum, t) => sum + t.amountPaid, 0)
  const pendingApprovals = tickets.filter((t) => t.approvalStatus === "Pending").length
  const refundedAmount = tickets
    .filter((t) => t.paymentStatus === "Refunded")
    .reduce((sum, t) => sum + t.amountPaid, 0)

  const getTypeBadge = (type: TicketRegistration["ticketType"]) => {
    const styles = {
      Buyer: "bg-primary/10 text-primary border-primary",
      Visitor: "bg-muted text-muted-foreground border-muted",
      Group: "bg-accent/10 text-accent-foreground border-accent",
      VIP: "bg-warning/10 text-warning-foreground border-warning",
    }
    return (
      <Badge variant="outline" className={styles[type]}>
        {type}
      </Badge>
    )
  }

  const getPaymentBadge = (status: TicketRegistration["paymentStatus"]) => {
    const styles = {
      Paid: "bg-success/10 text-success border-success",
      Pending: "bg-warning/10 text-warning-foreground border-warning",
      Refunded: "bg-destructive/10 text-destructive border-destructive",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {status}
      </Badge>
    )
  }

  const getApprovalBadge = (status: TicketRegistration["approvalStatus"]) => {
    const styles = {
      Pending: "bg-warning/10 text-warning-foreground border-warning",
      Approved: "bg-success/10 text-success border-success",
      Rejected: "bg-destructive/10 text-destructive border-destructive",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {status}
      </Badge>
    )
  }

  const handleApprove = (ticket: TicketRegistration) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, approvalStatus: "Approved" } : t
      )
    )
    toast.success("Ticket Approved", {
      description: `Ticket for ${ticket.name} has been approved. Email with QR code sent.`,
    })
  }

  const handleReject = (ticket: TicketRegistration) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, approvalStatus: "Rejected" } : t
      )
    )
    toast.success("Ticket Rejected", {
      description: `Ticket for ${ticket.name} has been rejected.`,
    })
  }

  const handleBulkApprove = () => {
    setTickets((prev) =>
      prev.map((t) =>
        selectedIds.includes(t.id) ? { ...t, approvalStatus: "Approved" } : t
      )
    )
    toast.success("Bulk Approval", {
      description: `${selectedIds.length} tickets have been approved.`,
    })
    setSelectedIds([])
  }

  const handleBulkReject = () => {
    setTickets((prev) =>
      prev.map((t) =>
        selectedIds.includes(t.id) ? { ...t, approvalStatus: "Rejected" } : t
      )
    )
    toast.success("Bulk Rejection", {
      description: `${selectedIds.length} tickets have been rejected.`,
    })
    setSelectedIds([])
  }

  const handleRefund = () => {
    if (!selectedTicket) return

    const amount = parseFloat(refundAmount) || selectedTicket.amountPaid

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, paymentStatus: "Refunded", approvalStatus: "Rejected" }
          : t
      )
    )
    toast.success("Refund Processed", {
      description: `$${amount} refunded to ${selectedTicket.name}. Email notification sent.`,
    })
    setRefundModalOpen(false)
    setRefundReason("")
    setRefundAmount("")
  }

  const handleExportTicket = (ticket: TicketRegistration) => {
    toast.success("PDF Generated", {
      description: `Ticket PDF for ${ticket.name} is downloading...`,
    })
  }

  const handleExportReport = (format: "csv" | "pdf") => {
    if (format === "csv") {
      const csv = [
        ["Ticket ID", "Name", "Email", "Company", "Country", "Type", "Amount", "Payment Status", "Approval Status", "Purchase Date"].join(","),
        ...tickets.map((t) =>
          [t.id, t.name, t.email, t.company, t.country, t.ticketType, t.amountPaid, t.paymentStatus, t.approvalStatus, t.purchaseDate].join(",")
        ),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "ticket-registrations.csv"
      a.click()
    }
    toast.success(`${format.toUpperCase()} Export`, {
      description: "Report is being generated...",
    })
  }

  const handleSaveSettings = () => {
    toast.success("Settings Saved", {
      description: "Ticket pricing and settings have been updated.",
    })
    setSettingsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ticket Sales & Registrations</h1>
          <p className="text-muted-foreground">
            Manage ticket sales, approvals, and registrations
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={() => setSettingsModalOpen(true)}>
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </Button>
          )}
          <Button variant="outline" onClick={() => handleExportReport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExportReport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Overview Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tickets Sold
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {buyerTickets} Buyers / {visitorTickets} Visitors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Generated
            </CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${grossRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross: ${grossRevenue.toLocaleString()} | Refunded: ${refundedAmount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-foreground">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Require industry verification
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales Trend
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23%</div>
            <p className="text-xs text-muted-foreground">
              vs. last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="buyers"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                  name="Buyers"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stackId="1"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.6}
                  name="Visitors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company, or ticket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {TICKET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Payments</SelectItem>
                {PAYMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Approvals</SelectItem>
                {APPROVAL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {canEdit && selectedIds.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" onClick={handleBulkApprove}>
                <Check className="mr-1 h-3 w-3" />
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkReject}>
                <X className="mr-1 h-3 w-3" />
                Reject
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
                      checked={selectedIds.length === paginatedTickets.length && paginatedTickets.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds(paginatedTickets.map((t) => t.id))
                        } else {
                          setSelectedIds([])
                        }
                      }}
                    />
                  </TableHead>
                )}
                <TableHead>Ticket ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Approval</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id} className={ticket.approvalStatus === "Pending" ? "bg-warning/5" : ""}>
                  {canEdit && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(ticket.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds((prev) => [...prev, ticket.id])
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== ticket.id))
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ticket.name}</p>
                      <p className="text-xs text-muted-foreground">{ticket.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.company}</TableCell>
                  <TableCell>{ticket.country}</TableCell>
                  <TableCell>{getTypeBadge(ticket.ticketType)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(ticket.purchaseDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${ticket.amountPaid}
                  </TableCell>
                  <TableCell>{getPaymentBadge(ticket.paymentStatus)}</TableCell>
                  <TableCell>{getApprovalBadge(ticket.approvalStatus)}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setViewModalOpen(true)
                          }}
                          title="View Details"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {ticket.approvalStatus === "Pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(ticket)}
                              title="Approve"
                              className="text-success hover:text-success"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(ticket)}
                              title="Reject"
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {ticket.paymentStatus === "Paid" && ticket.approvalStatus !== "Rejected" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTicket(ticket)
                              setRefundAmount(ticket.amountPaid.toString())
                              setRefundModalOpen(true)
                            }}
                            title="Refund"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        {ticket.approvalStatus === "Approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExportTicket(ticket)}
                            title="Export PDF Ticket"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
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
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)} of{" "}
          {filteredTickets.length} registrations
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              Registration information for {selectedTicket?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket ID</span>
                  <span className="font-mono font-medium">{selectedTicket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{selectedTicket.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedTicket.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedTicket.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{selectedTicket.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium">{selectedTicket.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Type</span>
                  {getTypeBadge(selectedTicket.ticketType)}
                </div>
                {selectedTicket.industryAffiliation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{selectedTicket.industryAffiliation}</span>
                  </div>
                )}
                {selectedTicket.groupSize && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group Size</span>
                    <span className="font-medium">{selectedTicket.groupSize} persons</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium">${selectedTicket.amountPaid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  {getPaymentBadge(selectedTicket.paymentStatus)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approval Status</span>
                  {getApprovalBadge(selectedTicket.approvalStatus)}
                </div>
                {selectedTicket.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-sm">Notes:</span>
                    <p className="mt-1 text-sm">{selectedTicket.notes}</p>
                  </div>
                )}
              </div>

              {selectedTicket.approvalStatus === "Approved" && (
                <div className="flex items-center justify-center rounded-lg border p-4">
                  <div className="text-center">
                    <QrCode className="mx-auto h-16 w-16 text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">QR Code Generated</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedTicket?.approvalStatus === "Approved" && (
              <Button variant="outline" onClick={() => handleExportTicket(selectedTicket)}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            )}
            <Button onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for {selectedTicket?.name}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Amount</span>
                <span className="font-medium">${selectedTicket?.amountPaid}</span>
              </div>
            </div>

            <Field>
              <FieldLabel>Refund Amount ($)</FieldLabel>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={selectedTicket?.amountPaid}
              />
            </Field>

            <Field>
              <FieldLabel>Reason for Refund</FieldLabel>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter the reason for this refund..."
                rows={3}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund} variant="destructive">
              <RefreshCw className="mr-2 h-4 w-4" />
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Settings</DialogTitle>
            <DialogDescription>
              Configure ticket pricing, deadlines, and discount codes
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="pricing">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
              <TabsTrigger value="discounts">Discounts</TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="mt-4">
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Buyer Ticket Price ($)</FieldLabel>
                    <Input
                      type="number"
                      value={settings.buyerPrice}
                      onChange={(e) => setSettings((prev) => ({ ...prev, buyerPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Visitor Ticket Price ($)</FieldLabel>
                    <Input
                      type="number"
                      value={settings.visitorPrice}
                      onChange={(e) => setSettings((prev) => ({ ...prev, visitorPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Group Price (per person) ($)</FieldLabel>
                    <Input
                      type="number"
                      value={settings.groupPrice}
                      onChange={(e) => setSettings((prev) => ({ ...prev, groupPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>VIP Ticket Price ($)</FieldLabel>
                    <Input
                      type="number"
                      value={settings.vipPrice}
                      onChange={(e) => setSettings((prev) => ({ ...prev, vipPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Minimum Group Size</FieldLabel>
                  <Input
                    type="number"
                    value={settings.groupMinSize}
                    onChange={(e) => setSettings((prev) => ({ ...prev, groupMinSize: parseInt(e.target.value) || 5 }))}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="deadlines" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Early Bird Discount (%)</FieldLabel>
                  <Input
                    type="number"
                    value={settings.earlyBirdDiscount}
                    onChange={(e) => setSettings((prev) => ({ ...prev, earlyBirdDiscount: parseFloat(e.target.value) || 0 }))}
                  />
                </Field>
                <Field>
                  <FieldLabel>Early Bird Deadline</FieldLabel>
                  <Input
                    type="date"
                    value={settings.earlyBirdDeadline}
                    onChange={(e) => setSettings((prev) => ({ ...prev, earlyBirdDeadline: e.target.value }))}
                  />
                </Field>
                <Field>
                  <FieldLabel>Registration Deadline</FieldLabel>
                  <Input
                    type="date"
                    value={settings.registrationDeadline}
                    onChange={(e) => setSettings((prev) => ({ ...prev, registrationDeadline: e.target.value }))}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="discounts" className="mt-4">
              <FieldGroup>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Expires</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.discountCodes.map((code, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{code.code}</TableCell>
                          <TableCell>{code.discount}%</TableCell>
                          <TableCell>{new Date(code.expiresAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-muted-foreground">
                  To add or remove discount codes, contact system administrator.
                </p>
              </FieldGroup>
            </TabsContent>
          </Tabs>

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
