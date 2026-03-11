"use client"

import { useState } from "react"
import {
  Search,
  Download,
  Check,
  AlertTriangle,
  Mail,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth, canEditModule } from "@/lib/auth-context"
import { mockPayments, type Payment } from "@/lib/mock-data"
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
import { Switch } from "@/components/ui/switch"

const ITEMS_PER_PAGE = 10

export default function PaymentsPage() {
  const { user } = useAuth()
  const canEdit = user && canEditModule(user.role, "payments")

  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)

  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [lateFeeModalOpen, setLateFeeModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [lateFeeAmount, setLateFeeAmount] = useState("")

  // Payment form
  const [depositPaid, setDepositPaid] = useState(false)
  const [fullPaid, setFullPaid] = useState(false)

  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      pay.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || pay.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE)
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Stats
  const totalCollected = payments.reduce((sum, p) => sum + p.depositAmount + (p.fullPaid ? p.fullAmount - p.depositAmount : 0), 0)
  const totalOutstanding = payments.reduce((sum, p) => sum + (p.fullPaid ? 0 : p.amount - p.depositAmount), 0)
  const overdueCount = payments.filter((p) => p.status === "overdue").length

  const getStatusBadge = (status: Payment["status"]) => {
    const styles = {
      pending: "bg-muted text-muted-foreground border-muted",
      partial: "bg-warning/10 text-warning-foreground border-warning",
      paid: "bg-success/10 text-success border-success",
      overdue: "bg-destructive/10 text-destructive border-destructive",
    }
    const labels = {
      pending: "Pending",
      partial: "Partial",
      paid: "Paid",
      overdue: "Overdue",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const handleOpenPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setDepositPaid(payment.depositPaid)
    setFullPaid(payment.fullPaid)
    setPaymentModalOpen(true)
  }

  const handleSavePayment = () => {
    if (!selectedPayment) return

    let newStatus: Payment["status"] = "pending"
    let newDepositAmount = selectedPayment.depositAmount

    if (fullPaid) {
      newStatus = "paid"
      newDepositAmount = selectedPayment.fullAmount * 0.4
    } else if (depositPaid) {
      newStatus = "partial"
      newDepositAmount = selectedPayment.fullAmount * 0.4
    }

    // Check if overdue
    if (new Date(selectedPayment.dueDate) < new Date() && !fullPaid) {
      newStatus = "overdue"
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.id === selectedPayment.id
          ? {
              ...p,
              depositPaid,
              fullPaid,
              depositAmount: depositPaid ? newDepositAmount : 0,
              status: newStatus,
              paidDate: fullPaid || depositPaid ? new Date().toISOString() : undefined,
            }
          : p
      )
    )

    toast.success("Payment Updated", {
      description: `Payment status for ${selectedPayment.companyName} has been updated.`,
    })
    setPaymentModalOpen(false)
  }

  const handleApplyLateFee = () => {
    if (!selectedPayment || !lateFeeAmount) {
      toast.error("Please enter a late fee amount")
      return
    }

    const fee = parseFloat(lateFeeAmount)
    if (isNaN(fee) || fee < 0) {
      toast.error("Invalid late fee amount")
      return
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.id === selectedPayment.id
          ? { ...p, lateFee: fee, amount: p.fullAmount + fee }
          : p
      )
    )

    toast.success("Late Fee Applied", {
      description: `$${fee} late fee added to ${selectedPayment.companyName}'s invoice.`,
    })
    setLateFeeModalOpen(false)
    setLateFeeAmount("")
  }

  const handleSendReminder = (payment: Payment) => {
    toast.success("Reminder Sent", {
      description: `Payment reminder sent to ${payment.companyName}.`,
    })
  }

  const handleExport = (format: "csv" | "pdf") => {
    toast.success(`Export Started`, {
      description: `Your ${format.toUpperCase()} file is being generated...`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage payment status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected
            </CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${totalCollected.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
            <DollarSign className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-foreground">
              ${totalOutstanding.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
          </CardContent>
        </Card>
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
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
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
                <TableHead>Invoice ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Deposit</TableHead>
                <TableHead className="text-center">Full Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Late Fee</TableHead>
                <TableHead>Status</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id} className={payment.status === "overdue" ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium">{payment.invoiceId}</TableCell>
                  <TableCell>{payment.companyName}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {payment.depositPaid ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        <Check className="h-3 w-3 mr-1" />
                        ${payment.depositAmount.toLocaleString()}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {payment.fullPaid ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        <Check className="h-3 w-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={payment.status === "overdue" ? "text-destructive font-medium" : ""}>
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {payment.lateFee > 0 ? `+$${payment.lateFee}` : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenPaymentModal(payment)}
                          title="Mark Payment"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        {payment.status === "overdue" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPayment(payment)
                              setLateFeeModalOpen(true)
                            }}
                            title="Apply Late Fee"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {(payment.status === "overdue" || payment.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendReminder(payment)}
                            title="Send Reminder"
                          >
                            <Mail className="h-4 w-4" />
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
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)} of{" "}
          {filteredPayments.length} payments
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

      {/* Mark Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Mark payment status for {selectedPayment?.companyName}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice ID</span>
                <span className="font-medium">{selectedPayment?.invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-medium">${selectedPayment?.fullAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit (40%)</span>
                <span className="font-medium">
                  ${((selectedPayment?.fullAmount || 0) * 0.4).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Deposit Paid</p>
                <p className="text-sm text-muted-foreground">40% of total amount</p>
              </div>
              <Switch checked={depositPaid} onCheckedChange={setDepositPaid} />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Full Payment</p>
                <p className="text-sm text-muted-foreground">100% of total amount</p>
              </div>
              <Switch checked={fullPaid} onCheckedChange={(checked) => {
                setFullPaid(checked)
                if (checked) setDepositPaid(true)
              }} />
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePayment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Late Fee Modal */}
      <Dialog open={lateFeeModalOpen} onOpenChange={setLateFeeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Late Fee</DialogTitle>
            <DialogDescription>
              Add a late fee to {selectedPayment?.companyName}&apos;s invoice
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="late-fee">Late Fee Amount ($)</FieldLabel>
              <Input
                id="late-fee"
                type="number"
                placeholder="Enter amount"
                value={lateFeeAmount}
                onChange={(e) => setLateFeeAmount(e.target.value)}
              />
            </Field>
            <p className="text-sm text-muted-foreground">
              Current invoice amount: ${selectedPayment?.fullAmount.toLocaleString()}
            </p>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLateFeeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyLateFee} variant="destructive">
              Apply Late Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
