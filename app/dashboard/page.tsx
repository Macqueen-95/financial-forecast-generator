"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp, Users, DollarSign, Target, Building2 } from "lucide-react"
import * as XLSX from "xlsx"
import axios from "axios"

const mockData = {
  assumptions: {
    average_cac: 1250,
    conversion_rate: 0.04,
    deals_per_salesperson: null,
    initial_salespeople: 2,
    large_customer_revenue_per_month: 6000,
    marketing_spend_per_month: 200000,
    months: 10,
    salespeople_added_per_month: 1,
    sme_customer_revenue_per_month: 11000,
  },
  forecast: [
    {
      large_customers: 2,
      month: "M1",
      revenue_large: 12000,
      revenue_sme: 70400,
      salespeople: 2,
      sme_customers: 6,
      total_revenue: 82400,
      total_revenue_mn: 0.08,
    },
    {
      large_customers: 5,
      month: "M2",
      revenue_large: 30000,
      revenue_sme: 140800,
      salespeople: 3,
      sme_customers: 12,
      total_revenue: 170800,
      total_revenue_mn: 0.17,
    },
    {
      large_customers: 9,
      month: "M3",
      revenue_large: 54000,
      revenue_sme: 211200,
      salespeople: 4,
      sme_customers: 19,
      total_revenue: 265200,
      total_revenue_mn: 0.27,
    },
    {
      large_customers: 14,
      month: "M4",
      revenue_large: 84000,
      revenue_sme: 281600,
      salespeople: 5,
      sme_customers: 25,
      total_revenue: 365600,
      total_revenue_mn: 0.37,
    },
    {
      large_customers: 20,
      month: "M5",
      revenue_large: 120000,
      revenue_sme: 352000,
      salespeople: 6,
      sme_customers: 32,
      total_revenue: 472000,
      total_revenue_mn: 0.47,
    },
    {
      large_customers: 27,
      month: "M6",
      revenue_large: 162000,
      revenue_sme: 422400,
      salespeople: 7,
      sme_customers: 38,
      total_revenue: 584400,
      total_revenue_mn: 0.58,
    },
    {
      large_customers: 35,
      month: "M7",
      revenue_large: 210000,
      revenue_sme: 492800,
      salespeople: 8,
      sme_customers: 44,
      total_revenue: 702800,
      total_revenue_mn: 0.7,
    },
    {
      large_customers: 44,
      month: "M8",
      revenue_large: 264000,
      revenue_sme: 563200,
      salespeople: 9,
      sme_customers: 51,
      total_revenue: 827200,
      total_revenue_mn: 0.83,
    },
    {
      large_customers: 54,
      month: "M9",
      revenue_large: 324000,
      revenue_sme: 633600,
      salespeople: 10,
      sme_customers: 57,
      total_revenue: 957600,
      total_revenue_mn: 0.96,
    },
    {
      large_customers: 65,
      month: "M10",
      revenue_large: 390000,
      revenue_sme: 704000,
      salespeople: 11,
      sme_customers: 63,
      total_revenue: 1094000,
      total_revenue_mn: 1.09,
    },
  ],
}

export default function Dashboard() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [data, setData] = useState(mockData)
  const [chatText, setChatText] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string|null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("forecastData")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed?.forecast)) {
          setData(parsed)
          // Persist initial assumptions once
          if (!sessionStorage.getItem("forecastInitial")) {
            sessionStorage.setItem("forecastInitial", JSON.stringify(parsed.assumptions || {}))
          }
          // Initialize merged assumptions baseline
          if (!sessionStorage.getItem("forecastMerged")) {
            sessionStorage.setItem("forecastMerged", JSON.stringify(parsed.assumptions || {}))
          }
        }
      } catch {}
    }
  }, [])

  const latestData = data.forecast[data.forecast.length - 1]
  const monthsCount = (data as any).assumptions?.months ?? (mockData as any).assumptions.months
  const totalRevenue = latestData.total_revenue
  const totalRevenueMn = latestData.total_revenue_mn
  const largeCustomers = latestData.large_customers
  const smeCustomers = latestData.sme_customers
  const salespeople = latestData.salespeople
  const revenuePerSalesperson = Math.round(totalRevenue / salespeople)

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const pieData = [
    { name: "Large Customers", value: latestData.revenue_large, color: "#1e40af" },
    { name: "SME Customers", value: latestData.revenue_sme, color: "#059669" },
  ]

  const salesEfficiencyData = data.forecast.map((item) => ({
    month: item.month,
    salespeople: item.salespeople,
    revenuePerSalesperson: Math.round(item.total_revenue / item.salespeople),
  }))

  // Acquisition funnel (Leads -> Demos -> Signups per month)
  const aMkt = (data as any).assumptions?.marketing_spend_per_month ?? (mockData as any).assumptions.marketing_spend_per_month
  const aCAC = (data as any).assumptions?.average_cac ?? (mockData as any).assumptions.average_cac
  const aConv = (data as any).assumptions?.conversion_rate ?? (mockData as any).assumptions.conversion_rate
  const monthlyLeads = aCAC ? Math.round(aMkt / aCAC) : 0
  const funnelData = data.forecast.map((m) => ({
    month: m.month,
    leads: monthlyLeads,
    demos: monthlyLeads, // simplify: leads == demos
    signups: Math.round(monthlyLeads * aConv),
  }))

  const sortedData = [...data.forecast].sort((a, b) => {
    if (!sortField) return 0
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Chat refine: send natural-language delta to backend to re-parse and rebuild
  const handleChatSubmit = async () => {
    const text = chatText.trim()
    if (!text) return
    setChatLoading(true)
    setChatError(null)
    try {
        const res = await axios.post("http://13.228.225.19:8000/forecast", {
        query: text,
        // Provide current assumptions as context so the model can reuse unchanged values
        context: { previous_assumptions: (data as any).assumptions },
      })
      if (res.data?.error) {
        setChatError(res.data.error)
      } else if (res.data?.forecast) {
        // Merge assumptions: fill any MISSING_* from current assumptions
        const baseline = sessionStorage.getItem("forecastMerged") || sessionStorage.getItem("forecastInitial")
        const prevA: any = baseline ? JSON.parse(baseline) : ((data as any).assumptions || {})
        const nextA: any = res.data.assumptions || {}
        const keys = [
          "months",
          "initial_salespeople",
          "salespeople_added_per_month",
          "deals_per_salesperson",
          "large_customer_revenue_per_month",
          "marketing_spend_per_month",
          "average_cac",
          "conversion_rate",
          "sme_customer_revenue_per_month",
          "overrides",
        ]
        const merged: any = {}
        for (const k of keys) {
          const v = nextA[k]
          const isMissing = typeof v === "string" && v.startsWith("MISSING_")
          merged[k] = isMissing || v === undefined || v === null || Number.isNaN(v) ? prevA[k] : v
        }
        // Merge overrides by month+field to prevent stacking duplicates
        const prevOv: any[] = Array.isArray(prevA.overrides) ? prevA.overrides : []
        const nextOv: any[] = Array.isArray(nextA.overrides) ? nextA.overrides : []
        if (prevOv.length || nextOv.length) {
          const byKey = new Map<string, any>()
          for (const o of prevOv) {
            if (!o) continue
            const key = `${o.field}:${o.month}`
            byKey.set(key, { ...o })
          }
          for (const o of nextOv) {
            if (!o) continue
            const key = `${o.field}:${o.month}`
            // Last user instruction wins to avoid accidental double-adding when the model repeats an event
            byKey.set(key, { ...o })
          }
          merged.overrides = Array.from(byKey.values())
        }
        res.data.assumptions = merged
        // Persist merged for subsequent edits
        sessionStorage.setItem("forecastMerged", JSON.stringify(merged))
        sessionStorage.setItem("forecastData", JSON.stringify(res.data))
        setData(res.data)
        setChatText("")
      }
    } catch (e: any) {
      setChatError(e?.response?.data?.error || e?.message || "Request failed")
    } finally {
      setChatLoading(false)
    }
  }

  // Build matrix-style monthly table like the screenshot
  const months = useMemo(() => data.forecast.map((f) => f.month), [data])
  const seriesSalespeople = useMemo(() => data.forecast.map((f) => f.salespeople), [data])
  const seriesLargeCum = useMemo(() => data.forecast.map((f) => f.large_customers), [data])
  const seriesSMECum = useMemo(() => data.forecast.map((f) => f.sme_customers), [data])
  const seriesLargeNew = useMemo(() => data.forecast.map((f, i, arr) => i === 0 ? f.large_customers : f.large_customers - arr[i-1].large_customers), [data])
  const seriesSMENew = useMemo(() => data.forecast.map((f, i, arr) => i === 0 ? f.sme_customers : f.sme_customers - arr[i-1].sme_customers), [data])
  const a = data.assumptions || (mockData as any).assumptions
  const toNum = (x: any, d: number) => {
    if (x === null || x === undefined) return d
    if (typeof x === "number") return x
    if (typeof x === "string") {
      if (x.startsWith("MISSING_")) return d
      const s = x.replace(/[$,%\s,]/g, "")
      const n = Number(s)
      return Number.isFinite(n) ? n : d
    }
    return d
  }

  const numberRow = (label: string, values: (number|string)[], unit?: string) => ({ label, unit, values })

  const matrixRows = useMemo(() => {
    const dealsPerSales = toNum(a?.deals_per_salesperson, 1)
    const largeRevPer = toNum(a?.large_customer_revenue_per_month, 0)
    const mkt = toNum(a?.marketing_spend_per_month, 0)
    const cac = Math.max(toNum(a?.average_cac, 1), 1)
    const conv = toNum(a?.conversion_rate, 0)
    const smeRevPer = toNum(a?.sme_customer_revenue_per_month, 0)
    const leadsPerMonth = cac ? mkt / cac : 0

    return [
      numberRow("# of sales people", seriesSalespeople, "#"),
      numberRow("# of large customer accounts they can sign per month/ sales person", months.map(() => dealsPerSales), "#"),
      numberRow("# of large customer accounts onboarded per month", seriesLargeNew, "#"),
      numberRow("Cumulative # of paying large customers", seriesLargeCum, "#"),
      numberRow("Average revenue per customer", months.map(() => largeRevPer), "$ per month"),
      numberRow("Digital Marketing spend per month", months.map(() => mkt), "$ per month"),
      numberRow("Average Customer Acquisition Cost (CAC)", months.map(() => cac), "$"),
      
      numberRow("% conversions from demo to sign ups", months.map(() => `${Math.round(conv*100)}%`), "%"),
      numberRow("# of paying SME customers onboarded", seriesSMENew, "#"),
      numberRow("Cumulative number of paying SME customers", seriesSMECum, "#"),
      numberRow("Average revenue per SME customer", months.map(() => smeRevPer), "$ per customer"),
      numberRow("Revenue from large clients", data.forecast.map((f) => f.revenue_large), "$ per month"),
      numberRow("Revenue from small and medium clients", data.forecast.map((f) => f.revenue_sme), "$ per month"),
      numberRow("Total Revenues", data.forecast.map((f) => f.total_revenue), "$ per month"),
      numberRow("Total Revenues", data.forecast.map((f) => f.total_revenue_mn), "$ Mn per month"),
    ]
  }, [a, data, months, seriesLargeCum, seriesLargeNew, seriesSMECum, seriesSMENew, seriesSalespeople])

  // Download Excel in matrix layout
  const downloadExcel = async () => {
    setIsDownloading(true)
    try {
      const header = ["", ...months]
      const unitRow = ["", ...months.map(() => "")]
      const aoa: (string|number)[][] = [header]
      matrixRows.forEach((r) => {
        aoa.push([`${r.label}${r.unit ? `  (${r.unit})` : ""}`, ...r.values])
      })

      const worksheet = XLSX.utils.aoa_to_sheet(aoa)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Forecast")
      XLSX.writeFile(workbook, "forecast-matrix.xlsx")
    } catch (error) {
      console.error("Error downloading Excel file:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background video */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <video
          className="w-full h-full object-cover opacity-30"
          autoPlay
          loop
          muted
          playsInline
          src="/bg.mp4"
        />
      </div>
      <div className="container mx-auto p-6 pb-28 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SaaS Revenue Forecast</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{monthsCount}-month revenue and customer growth projections</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => history.back()} variant="outline">Back</Button>
            <Button
            onClick={downloadExcel}
            disabled={isDownloading}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Export Data"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">${totalRevenueMn.toFixed(2)}M</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Large Customers</CardTitle>
              <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{largeCustomers}</div>
              <Badge variant="secondary" className="mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Growing
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">SME Customers</CardTitle>
              <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{smeCustomers}</div>
              <Badge variant="secondary" className="mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Growing
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Salespeople</CardTitle>
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{salespeople}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">+1 per month</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Revenue/Salesperson
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(revenuePerSalesperson)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Monthly</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stacked Revenue Chart */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Revenue Trends</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Large vs SME revenue over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.forecast} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="1 1" stroke="#e5e7eb" strokeWidth={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
                <Area
                    type="monotone"
                    dataKey="revenue_large"
                    stackId="1"
                    stroke="#1e40af"
                    fill="#1e40af"
                  fillOpacity={0.8}
                  dot={{ r: 2, stroke: "#1e40af", strokeWidth: 1, fill: "#1e40af" }}
                  activeDot={{ r: 4, fill: "#1e40af" }}
                    name="Large Customers"
                    strokeWidth={1}
                  />
                <Area
                    type="monotone"
                    dataKey="revenue_sme"
                    stackId="1"
                    stroke="#059669"
                    fill="#059669"
                  fillOpacity={0.6}
                  dot={{ r: 2, stroke: "#059669", strokeWidth: 1, fill: "#059669" }}
                  activeDot={{ r: 4, fill: "#059669" }}
                    name="SME Customers"
                    strokeWidth={1}
                  />
                {/* Markers for latest data point */}
                <ReferenceLine x={latestData.month} stroke="#9ca3af" strokeDasharray="3 3" />
                <ReferenceDot x={latestData.month} y={latestData.revenue_large} r={4} fill="#1e40af" stroke="white" strokeWidth={1} />
                <ReferenceDot x={latestData.month} y={latestData.revenue_sme} r={4} fill="#059669" stroke="white" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Total Revenue Line Chart */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Total Revenue Growth</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Monthly total revenue with $1M milestone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.forecast} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="1 1" stroke="#e5e7eb" strokeWidth={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Total Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_revenue"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props
                      return payload.total_revenue >= 1000000 ? (
                        <circle cx={cx} cy={cy} r={6} fill="#7c3aed" stroke="#ffffff" strokeWidth={2} />
                      ) : (
                        <circle cx={cx} cy={cy} r={3} fill="#7c3aed" />
                      )
                    }}
                    activeDot={{ r: 5, fill: "#7c3aed", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Growth */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Customer Growth</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Large vs SME customer acquisition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.forecast} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="1 1" stroke="#e5e7eb" strokeWidth={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
                  <Line
                    type="monotone"
                    dataKey="large_customers"
                    stroke="#1e40af"
                    strokeWidth={2}
                    name="Large Customers"
                    dot={{ fill: "#1e40af", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#1e40af", strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sme_customers"
                    stroke="#059669"
                    strokeWidth={2}
                    name="SME Customers"
                    dot={{ fill: "#059669", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#059669", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales Team Efficiency */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Sales Team Efficiency</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Salespeople count and revenue per salesperson
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={salesEfficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="1 1" stroke="#e5e7eb" strokeWidth={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "revenuePerSalesperson" ? formatCurrency(value) : value,
                      name === "revenuePerSalesperson" ? "Revenue/Salesperson" : "Salespeople",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="salespeople"
                    fill="#374151"
                    name="Salespeople"
                    fillOpacity={0.7}
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenuePerSalesperson"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    name="Revenue/Salesperson"
                    dot={{ fill: "#7c3aed", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#7c3aed", strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Revenue Split (Latest Month)</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Large vs SME customer revenue contribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={false}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "12px", color: "#6b7280", marginTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acquisition Funnel */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Acquisition Funnel</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Leads → Demos → Signups per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={funnelData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="1 1" stroke="#e5e7eb" strokeWidth={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
                <Bar dataKey="leads" name="Leads" fill="#60a5fa" />
                <Bar dataKey="demos" name="Demos" fill="#34d399" />
                <Bar dataKey="signups" name="Signups" fill="#7c3aed" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Detailed Forecast Matrix</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Month-by-month values across all key drivers and totals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2 w-72">&nbsp;</th>
                    {months.map((m) => (
                      <th key={m} className="text-left px-3 py-2 text-gray-600 dark:text-gray-400">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixRows.map((row) => (
                    <tr key={row.label} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                        {row.label}
                        {row.unit ? <span className="ml-1 text-xs text-gray-500">({row.unit})</span> : null}
                      </td>
                      {row.values.map((v, i) => (
                        <td key={i} className="px-3 py-2 text-gray-800 dark:text-gray-300">
                          {typeof v === 'number' ? (row.unit?.includes('Mn') ? `${v.toFixed(2)}M` : row.unit?.startsWith('$') ? formatCurrency(v) : v.toLocaleString()) : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Bottom fixed chat box */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-6xl px-4 pb-4">
          <div className="rounded-2xl border bg-white/80 backdrop-blur dark:bg-neutral-900/80 shadow-md p-3 flex items-end gap-2">
            <textarea
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="e.g., Show 12 months forecast. Or: add 50 reps in month 7."
              className="flex-1 resize-none h-12 max-h-32 outline-none bg-transparent text-sm"
            />
            <Button onClick={handleChatSubmit} disabled={chatLoading || !chatText.trim()} className="shrink-0">
              {chatLoading ? "Updating..." : "Apply"}
            </Button>
          </div>
          {chatError && (
            <div className="mt-2 text-sm text-red-600">{chatError}</div>
          )}
        </div>
      </div>
    </div>
  )
}
