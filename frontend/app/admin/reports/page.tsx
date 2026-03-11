"use client"

import { useState } from "react"
import {
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useAuth } from "@/lib/auth-context"
import {
  mockApplications,
  mockInvoices,
  mockPayments,
  getApplicationsByCountry,
  getApplicationsByCategory,
} from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// Revenue forecast data
const revenueData = [
  { month: "Jan", actual: 0, forecast: 0 },
  { month: "Feb", actual: 8800, forecast: 10000 },
  { month: "Mar", actual: 15000, forecast: 25000 },
  { month: "Apr", actual: 0, forecast: 35000 },
  { month: "May", actual: 0, forecast: 45000 },
  { month: "Jun", actual: 0, forecast: 50000 },
]

export default function ReportsPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState("all")

  const countryData = getApplicationsByCountry()
  const categoryData = getApplicationsByCategory()

  // Calculate stats
  const totalApplications = mockApplications.length
  const approvedApplications = mockApplications.filter((a) => a.status === "approved" || a.status === "offer_sent").length
  const totalRevenue = mockPayments.reduce((sum, p) => sum + p.depositAmount + (p.fullPaid ? p.fullAmount - p.depositAmount : 0), 0)
  const pendingRevenue = mockInvoices.reduce((sum, i) => sum + i.amount - i.depositAmount, 0)

  const handleExport = (reportType: string, format: "csv" | "pdf") => {
    toast.success(`Export Started`, {
      description: `Generating ${reportType} report as ${format.toUpperCase()}...`,
    })
  }

  const chartConfig = {
    actual: { label: "Actual", color: "hsl(var(--primary))" },
    forecast: { label: "Forecast", color: "hsl(var(--muted-foreground))" },
    count: { label: "Count", color: "hsl(var(--chart-1))" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View insights and export reports
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {approvedApplications} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Countries Represented
            </CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{countryData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across Africa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Collected
            </CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${pendingRevenue.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((approvedApplications / totalApplications) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Applications to approved
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exhibitors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="exhibitors">Exhibitors</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Exhibitors Tab */}
        <TabsContent value="exhibitors" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* By Country */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Applications by Country</CardTitle>
                  <CardDescription>Distribution across African nations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport("Exhibitors by Country", "csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* By Category */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Applications by Category</CardTitle>
                  <CardDescription>Product categories breakdown</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport("Exhibitors by Category", "csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Full Exhibitor List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Full Exhibitor List</CardTitle>
                <CardDescription>All registered exhibitors</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("Full Exhibitor List", "csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("Full Exhibitor List", "pdf")}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stand Size</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockApplications.slice(0, 5).map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.companyName}</TableCell>
                      <TableCell>{app.country}</TableCell>
                      <TableCell>{app.category}</TableCell>
                      <TableCell className="text-right">{app.standSize} m²</TableCell>
                      <TableCell className="capitalize">{app.status.replace("_", " ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Actual vs projected revenue</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport("Revenue Report", "pdf")}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deposits Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  ${mockPayments.filter(p => p.depositPaid).reduce((sum, p) => sum + p.depositAmount, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Full Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ${mockPayments.filter(p => p.fullPaid).reduce((sum, p) => sum + p.fullAmount, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning-foreground">
                  ${pendingRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Overview of all payments</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("Payment Summary", "csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("Payment Summary", "pdf")}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Deposit Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.invoiceId}</TableCell>
                      <TableCell>{payment.companyName}</TableCell>
                      <TableCell className="text-right">${payment.fullAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {payment.depositPaid ? `$${payment.depositAmount.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        ${(payment.fullAmount - (payment.fullPaid ? payment.fullAmount : payment.depositAmount)).toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">{payment.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
