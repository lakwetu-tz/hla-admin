"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FileText,
  LayoutGrid,
  DollarSign,
  Building2,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useAuth, canAccessModule } from "@/lib/auth-context"
import {
  getDashboardStats,
  getApplicationsByCountry,
  getApplicationsByCategory,
  mockApplications,
  mockPayments,
} from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()
  const stats = getDashboardStats()
  const countryData = getApplicationsByCountry()
  const categoryData = getApplicationsByCategory()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    toast.success("Dashboard refreshed", {
      description: "All data has been updated",
    })
  }

  const recentApplications = mockApplications
    .filter((a) => a.status === "pending")
    .slice(0, 5)

  const overduePayments = mockPayments.filter((p) => p.status === "overdue")

  const chartConfig = {
    count: { label: "Count" },
    Nigeria: { label: "Nigeria", color: "hsl(var(--chart-1))" },
    Kenya: { label: "Kenya", color: "hsl(var(--chart-2))" },
    "South Africa": { label: "South Africa", color: "hsl(var(--chart-3))" },
    Ethiopia: { label: "Ethiopia", color: "hsl(var(--chart-4))" },
    Ghana: { label: "Ghana", color: "hsl(var(--chart-5))" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here&apos;s your overview.
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/applications">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Applications
              </CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/halls">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Booked Stands
              </CardTitle>
              <LayoutGrid className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBookedArea} m²</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalAvailableArea} m² available
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/payments">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue Collected
              </CardTitle>
              <DollarSign className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                ${stats.expectedRevenue.toLocaleString()} expected
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/halls">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hall Occupancy
              </CardTitle>
              <Building2 className="h-5 w-5 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{stats.hallOccupancy}%</div>
                <Progress value={stats.hallOccupancy} className="flex-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all pavilions
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications by Country */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Country</CardTitle>
            <CardDescription>Distribution of exhibitor applications</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Applications by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Exhibitor product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="category"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications - for Event Manager and Super Admin */}
        {(user?.role === "event_manager" || user?.role === "super_admin") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest pending applications</CardDescription>
              </div>
              <Link href="/admin/applications">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.companyName}</TableCell>
                      <TableCell>{app.country}</TableCell>
                      <TableCell>{app.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning">
                          Pending
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Overdue Payments - for Finance Manager and Super Admin */}
        {(user?.role === "finance_manager" || user?.role === "super_admin") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Overdue Payments
                </CardTitle>
                <CardDescription>Payments requiring attention</CardDescription>
              </div>
              <Link href="/admin/payments">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {overduePayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No overdue payments
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Late Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overduePayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.companyName}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-destructive">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-destructive">
                          +${payment.lateFee}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
