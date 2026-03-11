"use client"

import { useState, useMemo } from "react"
import {
  Globe,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  MousePointerClick,
  ArrowUpRight,
  RefreshCw,
  Download,
  Settings,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Filter,
  Calendar,
  Search,
  Sparkles,
  Zap,
  Target,
  MapPin,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
} from "recharts"
import { toast } from "sonner"
import { useAuth, canEditModule } from "@/lib/auth-context"
import {
  mockDailyTraffic,
  mockWeeklyTraffic,
  mockGeoTraffic,
  mockPagePerformance,
  mockTrafficSources,
  mockAIInsights,
  mockHeatmapData,
  mockAnalyticsSettings,
  type TrafficData,
  type GeoTrafficData,
  type AIInsight,
} from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const CHART_COLORS = ["#2E7D32", "#8B4513", "#1565C0", "#F57C00", "#7B1FA2"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`)

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const canEdit = user ? canEditModule(user.role, "analytics") : false

  // State
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily")
  const [selectedSource, setSelectedSource] = useState<string>("all")
  const [searchCountry, setSearchCountry] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWhatIf, setShowWhatIf] = useState(false)
  const [whatIfIncrease, setWhatIfIncrease] = useState(20)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Computed data
  const trafficData = timeRange === "weekly" ? mockWeeklyTraffic : mockDailyTraffic
  
  const totalStats = useMemo(() => {
    const totalVisits = trafficData.reduce((acc, d) => acc + d.visits, 0)
    const totalUniqueUsers = trafficData.reduce((acc, d) => acc + d.uniqueUsers, 0)
    const avgBounceRate = trafficData.reduce((acc, d) => acc + d.bounceRate, 0) / trafficData.length
    const avgDuration = trafficData.reduce((acc, d) => acc + d.avgSessionDuration, 0) / trafficData.length
    const totalConversions = trafficData.reduce((acc, d) => acc + d.conversions, 0)
    const conversionRate = (totalConversions / totalVisits) * 100
    
    // Calculate growth (comparing last 7 days to previous 7 days)
    const recent = trafficData.slice(-7).reduce((acc, d) => acc + d.visits, 0)
    const previous = trafficData.slice(-14, -7).reduce((acc, d) => acc + d.visits, 0)
    const growth = previous > 0 ? ((recent - previous) / previous) * 100 : 0
    
    return { totalVisits, totalUniqueUsers, avgBounceRate, avgDuration, totalConversions, conversionRate, growth }
  }, [trafficData])

  const filteredGeoData = useMemo(() => {
    let data = mockGeoTraffic
    if (selectedSource !== "all") {
      data = data.filter(g => g.source === selectedSource)
    }
    if (searchCountry) {
      data = data.filter(g => 
        g.country.toLowerCase().includes(searchCountry.toLowerCase()) ||
        g.region.toLowerCase().includes(searchCountry.toLowerCase())
      )
    }
    return data
  }, [selectedSource, searchCountry])

  const paginatedGeoData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredGeoData.slice(start, start + itemsPerPage)
  }, [filteredGeoData, currentPage])

  const totalPages = Math.ceil(filteredGeoData.length / itemsPerPage)

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Data refreshed", { description: "Analytics data has been updated" })
    }, 1500)
  }

  const handleExport = (format: "pdf" | "csv") => {
    toast.success(`Exporting ${format.toUpperCase()}`, { description: "Your report is being generated..." })
  }

  const handleWhatIfCalculation = () => {
    const projectedVisits = totalStats.totalVisits * (1 + whatIfIncrease / 100)
    const projectedConversions = Math.floor(projectedVisits * (totalStats.conversionRate / 100))
    const projectedRevenue = projectedConversions * 250 // Avg ticket price
    
    toast.success("What-If Analysis Complete", {
      description: `With ${whatIfIncrease}% traffic increase: ~${formatNumber(projectedConversions)} conversions, ~$${formatNumber(projectedRevenue)} projected revenue`
    })
    setShowWhatIf(false)
  }

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "opportunity": return <Lightbulb className="h-5 w-5 text-blue-500" />
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getHeatmapColor = (value: number) => {
    const max = Math.max(...mockHeatmapData.flat())
    const intensity = value / max
    if (intensity < 0.2) return "bg-green-100 dark:bg-green-900/30"
    if (intensity < 0.4) return "bg-green-200 dark:bg-green-800/40"
    if (intensity < 0.6) return "bg-green-400 dark:bg-green-600/50"
    if (intensity < 0.8) return "bg-green-500 dark:bg-green-500/60"
    return "bg-green-700 dark:bg-green-400/70"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Web Traffic Analytics</h1>
          <p className="text-muted-foreground">Monitor website performance and visitor behavior</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <Badge variant={totalStats.growth >= 0 ? "default" : "destructive"} className="text-xs">
                {totalStats.growth >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {Math.abs(totalStats.growth).toFixed(1)}%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{formatNumber(totalStats.totalVisits)}</p>
            <p className="text-sm text-muted-foreground">Total Visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">
                {((totalStats.totalUniqueUsers / totalStats.totalVisits) * 100).toFixed(0)}% unique
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{formatNumber(totalStats.totalUniqueUsers)}</p>
            <p className="text-sm text-muted-foreground">Unique Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <MousePointerClick className="h-5 w-5 text-amber-500" />
              </div>
              <Badge variant={totalStats.avgBounceRate < 40 ? "default" : "secondary"} className="text-xs">
                {totalStats.avgBounceRate < 40 ? "Good" : "Needs Work"}
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{totalStats.avgBounceRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Bounce Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <p className="mt-3 text-2xl font-bold">{formatDuration(Math.round(totalStats.avgDuration))}</p>
            <p className="text-sm text-muted-foreground">Avg. Session</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-3 text-2xl font-bold">{formatNumber(totalStats.totalConversions)}</p>
            <p className="text-sm text-muted-foreground">Conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <Zap className="h-5 w-5 text-indigo-500" />
              </div>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowWhatIf(true)}>
                What-If
              </Button>
            </div>
            <p className="mt-3 text-2xl font-bold">{totalStats.conversionRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Traffic Overview</TabsTrigger>
          <TabsTrigger value="pages">Page Performance</TabsTrigger>
          <TabsTrigger value="geo">Geographic Data</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Traffic Overview Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Traffic Over Time Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Traffic Over Time</CardTitle>
                  <CardDescription>Website visits and conversions</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={(v: "daily" | "weekly" | "monthly") => setTimeRange(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1565C0" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="visits" name="Visits" stroke="#2E7D32" fill="url(#colorVisits)" />
                      <Area type="monotone" dataKey="conversions" name="Conversions" stroke="#1565C0" fill="url(#colorConversions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Traffic Sources</CardTitle>
                <CardDescription>Where visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockTrafficSources}
                        dataKey="visits"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {mockTrafficSources.map((entry, index) => (
                          <Cell key={entry.source} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatNumber(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {mockTrafficSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
                        <span>{source.source}</span>
                      </div>
                      <span className="font-medium">{source.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heatmap Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Peak Traffic Hours</CardTitle>
              <CardDescription>Traffic intensity by day and hour (darker = more traffic)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="flex">
                    <div className="w-16 shrink-0" />
                    {HOURS.filter((_, i) => i % 2 === 0).map((hour) => (
                      <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                        {hour}
                      </div>
                    ))}
                  </div>
                  {DAYS.map((day, dayIndex) => (
                    <div key={day} className="flex items-center">
                      <div className="w-16 shrink-0 text-sm font-medium">{day}</div>
                      <div className="flex flex-1 gap-0.5">
                        {mockHeatmapData[dayIndex].map((value, hourIndex) => (
                          <div
                            key={hourIndex}
                            className={cn("h-6 flex-1 rounded-sm transition-colors", getHeatmapColor(value))}
                            title={`${day} ${hourIndex}:00 - ${value} visits`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Low</span>
                <div className="flex gap-0.5">
                  {["bg-green-100", "bg-green-200", "bg-green-400", "bg-green-500", "bg-green-700"].map((color) => (
                    <div key={color} className={cn("h-3 w-6 rounded-sm", color)} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">High</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Performance Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Pages by Views</CardTitle>
              <CardDescription>Most visited pages on the website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockPagePerformance.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="page" type="category" width={100} className="text-xs" />
                    <Tooltip formatter={(value: number) => formatNumber(value)} />
                    <Bar dataKey="views" fill="#2E7D32" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Page Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Unique Views</TableHead>
                    <TableHead className="text-right">Avg. Time</TableHead>
                    <TableHead className="text-right">Bounce Rate</TableHead>
                    <TableHead className="text-right">Exit Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPagePerformance.map((page) => (
                    <TableRow key={page.page}>
                      <TableCell className="font-medium">{page.page}</TableCell>
                      <TableCell className="text-right">{formatNumber(page.views)}</TableCell>
                      <TableCell className="text-right">{formatNumber(page.uniqueViews)}</TableCell>
                      <TableCell className="text-right">{formatDuration(page.avgTimeOnPage)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={page.bounceRate < 40 ? "default" : page.bounceRate < 50 ? "secondary" : "destructive"}>
                          {page.bounceRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{page.exitRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Data Tab */}
        <TabsContent value="geo" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search country or region..."
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Organic">Organic</SelectItem>
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Regional Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["East Africa", "West Africa", "Europe", "Other"].map((region) => {
              const regionData = mockGeoTraffic.filter(g => 
                region === "Other" 
                  ? !["East Africa", "West Africa", "Europe"].includes(g.region)
                  : g.region === region
              )
              const totalVisits = regionData.reduce((acc, g) => acc + g.visits, 0)
              const totalConversions = regionData.reduce((acc, g) => acc + g.conversions, 0)
              
              return (
                <Card key={region}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{region}</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold">{formatNumber(totalVisits)}</p>
                    <p className="text-sm text-muted-foreground">{formatNumber(totalConversions)} conversions</p>
                    <Progress value={(totalConversions / totalVisits) * 100} className="mt-2 h-1" />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Geo Traffic Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Traffic by Country</CardTitle>
              <CardDescription>Detailed breakdown by geographic location</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Unique Users</TableHead>
                    <TableHead className="text-right">Bounce Rate</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Avg. Duration</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGeoData.map((geo) => (
                    <TableRow key={geo.countryCode}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFlagEmoji(geo.countryCode)}</span>
                          <span className="font-medium">{geo.country}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{geo.region}</TableCell>
                      <TableCell className="text-right font-medium">{formatNumber(geo.visits)}</TableCell>
                      <TableCell className="text-right">{formatNumber(geo.uniqueUsers)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={geo.bounceRate < 40 ? "default" : geo.bounceRate < 50 ? "secondary" : "destructive"}>
                          {geo.bounceRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(geo.conversions)}</TableCell>
                      <TableCell className="text-right">{formatDuration(geo.avgDuration)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{geo.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGeoData.length)} of {filteredGeoData.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI-Powered Insights</CardTitle>
              </div>
              <CardDescription>Automated recommendations based on traffic analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mockAIInsights.map((insight) => (
                  <Card 
                    key={insight.id} 
                    className={cn(
                      "cursor-pointer transition-shadow hover:shadow-md",
                      insight.type === "warning" && "border-amber-200 dark:border-amber-800",
                      insight.type === "opportunity" && "border-blue-200 dark:border-blue-800",
                      insight.type === "success" && "border-green-200 dark:border-green-800"
                    )}
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <p className="font-medium">{insight.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{insight.description}</p>
                          {insight.metric && (
                            <Badge variant="secondary" className="mt-2">{insight.metric}</Badge>
                          )}
                          {insight.region && (
                            <Badge variant="outline" className="mt-2 ml-2">{insight.region}</Badge>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Conversion Funnel</CardTitle>
              <CardDescription>From website visit to registration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stage: "Website Visits", value: totalStats.totalVisits, percentage: 100 },
                  { stage: "Page Engagement", value: Math.floor(totalStats.totalVisits * 0.65), percentage: 65 },
                  { stage: "Exhibitor/Ticket Pages", value: Math.floor(totalStats.totalVisits * 0.35), percentage: 35 },
                  { stage: "Started Registration", value: Math.floor(totalStats.totalVisits * 0.15), percentage: 15 },
                  { stage: "Completed Registration", value: totalStats.totalConversions, percentage: totalStats.conversionRate },
                ].map((stage, index) => (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <div className="w-40 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1">
                      <div className="relative h-8 rounded-lg bg-muted overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary/80 transition-all"
                          style={{ width: `${stage.percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                          {formatNumber(stage.value)} ({stage.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Analytics Settings</DialogTitle>
            <DialogDescription>Configure analytics preferences and integrations</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="integration" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
            </TabsList>
            <TabsContent value="integration" className="space-y-4 pt-4">
              <Field>
                <FieldLabel>Google Analytics 4 API Key</FieldLabel>
                <Input type="password" placeholder="Enter GA4 API key..." />
              </Field>
              <Field>
                <FieldLabel>Refresh Interval (minutes)</FieldLabel>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </TabsContent>
            <TabsContent value="alerts" className="space-y-4 pt-4">
              <Field>
                <FieldLabel>Bounce Rate Alert Threshold</FieldLabel>
                <div className="flex items-center gap-4">
                  <Slider defaultValue={[50]} max={100} step={5} className="flex-1" />
                  <span className="w-12 text-sm">50%</span>
                </div>
              </Field>
              <Field>
                <FieldLabel>Conversion Drop Alert (%)</FieldLabel>
                <div className="flex items-center gap-4">
                  <Slider defaultValue={[20]} max={50} step={5} className="flex-1" />
                  <span className="w-12 text-sm">20%</span>
                </div>
              </Field>
            </TabsContent>
            <TabsContent value="display" className="space-y-4 pt-4">
              <Field>
                <FieldLabel>Default Chart Type</FieldLabel>
                <Select defaultValue="area">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success("Settings saved")
              setShowSettings(false)
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* What-If Modal */}
      <Dialog open={showWhatIf} onOpenChange={setShowWhatIf}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What-If Simulator</DialogTitle>
            <DialogDescription>Project revenue impact from traffic changes</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Field>
              <FieldLabel>Traffic Increase (%)</FieldLabel>
              <div className="flex items-center gap-4">
                <Slider 
                  value={[whatIfIncrease]} 
                  onValueChange={([v]) => setWhatIfIncrease(v)}
                  max={100} 
                  step={5} 
                  className="flex-1" 
                />
                <span className="w-16 text-right font-medium">{whatIfIncrease}%</span>
              </div>
            </Field>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Visits</span>
                <span className="font-medium">{formatNumber(totalStats.totalVisits)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projected Visits</span>
                <span className="font-medium text-primary">{formatNumber(Math.floor(totalStats.totalVisits * (1 + whatIfIncrease / 100)))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projected Conversions</span>
                <span className="font-medium text-primary">{formatNumber(Math.floor(totalStats.totalVisits * (1 + whatIfIncrease / 100) * (totalStats.conversionRate / 100)))}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Projected Revenue</span>
                <span className="font-bold text-green-600">
                  ${formatNumber(Math.floor(totalStats.totalVisits * (1 + whatIfIncrease / 100) * (totalStats.conversionRate / 100) * 250))}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWhatIf(false)}>Close</Button>
            <Button onClick={handleWhatIfCalculation}>Generate Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insight Detail Modal */}
      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedInsight && getInsightIcon(selectedInsight.type)}
              <DialogTitle>{selectedInsight?.title}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">{selectedInsight?.description}</p>
            {selectedInsight?.metric && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Key Metric:</span>
                <Badge>{selectedInsight.metric}</Badge>
              </div>
            )}
            {selectedInsight?.region && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Region:</span>
                <Badge variant="outline">{selectedInsight.region}</Badge>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInsight(null)}>Dismiss</Button>
            {selectedInsight?.action && (
              <Button onClick={() => {
                toast.success("Action initiated", { description: selectedInsight.action })
                setSelectedInsight(null)
              }}>
                {selectedInsight.action}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
