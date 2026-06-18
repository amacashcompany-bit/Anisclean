"use client"

import { useI18n } from "@/components/providers/i18n-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  ShoppingCart,
  Euro,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react"
import type { orders } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"

type Order = InferSelectModel<typeof orders>

interface Props {
  analytics: {
    orderStats: {
      total: number
      completed: number
      inProgress: number
      canceled: number
      revenue: number
    }
    userStats: { total: number }
    invoiceStats: { total: number; paid: number; pending: number }
    monthlyOrders: { month: string; count: number; revenue: number }[]
    byStatus: { status: string; count: number }[]
  }
  recentOrders: Order[]
}

const STATUS_COLORS: Record<string, string> = {
  new: "oklch(0.7 0.13 232)",
  confirmed: "oklch(0.72 0.18 140)",
  in_progress: "oklch(0.78 0.16 65)",
  completed: "oklch(0.6 0.14 155)",
  canceled: "oklch(0.577 0.245 27.325)",
}

const chartConfig = {
  count: { label: "Commandes", color: "var(--color-chart-1)" },
  revenue: { label: "Revenus (€)", color: "var(--color-chart-2)" },
}

export function AdminDashboardClient({ analytics, recentOrders }: Props) {
  const { t } = useI18n()
  const { orderStats, userStats, invoiceStats, monthlyOrders, byStatus } = analytics

  const kpis = [
    {
      label: t("admin.dash.totalOrders"),
      value: orderStats.total,
      icon: ShoppingCart,
      sub: `${orderStats.completed} terminés`,
    },
    {
      label: t("admin.dash.revenue"),
      value: `${orderStats.revenue.toFixed(0)} €`,
      icon: Euro,
      sub: `${orderStats.inProgress} en cours`,
    },
    {
      label: t("admin.dash.users"),
      value: userStats.total,
      icon: Users,
      sub: "comptes enregistrés",
    },
    {
      label: t("admin.dash.pendingInvoices"),
      value: invoiceStats.pending,
      icon: FileText,
      sub: `${invoiceStats.paid} payées`,
    },
  ]

  function statusLabel(s: string) {
    const map: Record<string, string> = {
      new: t("admin.orders.new"),
      confirmed: t("admin.orders.confirmed"),
      in_progress: t("admin.orders.in_progress"),
      completed: t("admin.orders.completed"),
      canceled: t("admin.orders.canceled"),
    }
    return map[s] ?? s
  }

  function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
    if (s === "completed") return "default"
    if (s === "canceled") return "destructive"
    return "secondary"
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">
          {t("admin.nav.dashboard")}
        </h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, sub }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart: monthly orders & revenue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("admin.dash.ordersChart")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <BarChart data={monthlyOrders} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.slice(5)}
                  className="text-xs"
                />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="count" fill="var(--color-chart-1)" radius={4} />
                <Bar dataKey="revenue" fill="var(--color-chart-2)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie chart: orders by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("admin.dash.statusChart")}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {byStatus.length > 0 ? (
              <ChartContainer config={{}} className="h-56 w-full">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, percent }) =>
                      `${statusLabel(status)} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {byStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? "oklch(0.6 0.08 250)"}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="status" />}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-16">{t("admin.noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("admin.dash.recentOrders")}</CardTitle>
          <CardDescription>{recentOrders.length} dernières commandes</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">{t("admin.orders.reference")}</th>
                    <th className="pb-2 font-medium text-muted-foreground">{t("admin.orders.client")}</th>
                    <th className="pb-2 font-medium text-muted-foreground">{t("admin.total")}</th>
                    <th className="pb-2 font-medium text-muted-foreground">{t("admin.status")}</th>
                    <th className="pb-2 font-medium text-muted-foreground">{t("admin.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 font-mono text-xs">{order.reference}</td>
                      <td className="py-2.5">
                        <p className="font-medium">{order.name}</p>
                        <p className="text-xs text-muted-foreground">{order.phone}</p>
                      </td>
                      <td className="py-2.5 font-semibold">{order.total.toFixed(2)} €</td>
                      <td className="py-2.5">
                        <Badge variant={statusVariant(order.status)}>
                          {statusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
