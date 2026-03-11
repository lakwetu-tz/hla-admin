"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  Send,
  Eye,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth, canEditModule } from "@/lib/auth-context"
import { mockInvoices, mockEventSettings, type Invoice } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { Checkbox } from "@/components/ui/checkbox"

const ITEMS_PER_PAGE = 10

export default function InvoicesPage() {
  const { user } = useAuth()
  const canEdit = user && canEditModule(user.role, "invoices")

  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  // Modals
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getStatusBadge = (status: Invoice["status"]) => {
    const styles = {
      pending: "bg-muted text-muted-foreground border-muted",
      offer_sent: "bg-primary/10 text-primary border-primary",
      deposit_paid: "bg-warning/10 text-warning-foreground border-warning",
      fully_paid: "bg-success/10 text-success border-success",
      overdue: "bg-destructive/10 text-destructive border-destructive",
    }
    const labels = {
      pending: "Pending",
      offer_sent: "Offer Sent",
      deposit_paid: "Deposit Paid",
      fully_paid: "Fully Paid",
      overdue: "Overdue",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const handleSendOffer = (invoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoice.id ? { ...inv, status: "offer_sent" as const } : inv
      )
    )
    toast.success("Offer Sent", {
      description: `Invoice ${invoice.id} has been sent to ${invoice.companyName}.`,
    })
  }

  const handleBulkSend = () => {
    if (selectedInvoices.length === 0) {
      toast.error("No invoices selected")
      return
    }
    setInvoices((prev) =>
      prev.map((inv) =>
        selectedInvoices.includes(inv.id) && inv.status === "pending"
          ? { ...inv, status: "offer_sent" as const }
          : inv
      )
    )
    toast.success("Offers Sent", {
      description: `${selectedInvoices.length} offers have been sent.`,
    })
    setSelectedInvoices([])
  }

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const toggleAllSelection = () => {
    if (selectedInvoices.length === paginatedInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(paginatedInvoices.map((inv) => inv.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">
            Manage offers and invoices ({filteredInvoices.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && selectedInvoices.length > 0 && (
            <Button onClick={handleBulkSend}>
              <Send className="mr-2 h-4 w-4" />
              Send Selected ({selectedInvoices.length})
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by company or invoice ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="offer_sent">Offer Sent</SelectItem>
                <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                <SelectItem value="fully_paid">Fully Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
                {canEdit && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                      onCheckedChange={toggleAllSelection}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                <TableHead>Invoice ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stand</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Deposit</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  {canEdit && (
                    <TableCell>
                      <Checkbox
                        checked={selectedInvoices.includes(invoice.id)}
                        onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                        aria-label={`Select ${invoice.id}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.companyName}</TableCell>
                  <TableCell>
                    {invoice.hallName} - {invoice.standNumber}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${invoice.depositRequired.toLocaleString()} (40%)
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.deadline).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setPreviewOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit && invoice.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSendOffer(invoice)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of{" "}
          {filteredInvoices.length} invoices
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

      {/* Invoice Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Proforma Invoice for {selectedInvoice?.companyName}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary">Horti Logistica Africa</h3>
                  <p className="text-sm text-muted-foreground">{mockEventSettings.eventName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mockEventSettings.eventDates.start} - {mockEventSettings.eventDates.end}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{selectedInvoice.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bill To */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bill To:</p>
                <p className="font-medium">{selectedInvoice.companyName}</p>
              </div>

              {/* Line Items */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        Exhibition Stand - {selectedInvoice.standNumber}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {selectedInvoice.hallName}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{selectedInvoice.standSize} m²</TableCell>
                      <TableCell className="text-right">${mockEventSettings.pricePerSqm}/m²</TableCell>
                      <TableCell className="text-right font-medium">
                        ${selectedInvoice.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Deposit Required (40%)</span>
                    <span>${selectedInvoice.depositRequired.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>${selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="text-sm text-muted-foreground border-t pt-4">
                <p><strong>Payment Terms:</strong></p>
                <p>Deposit of 40% due by {new Date(selectedInvoice.deadline).toLocaleDateString()}</p>
                <p>Balance due 14 days before event start</p>
                <p className="mt-2 text-xs">Late payments subject to {mockEventSettings.lateFeePercentage}% fee</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
