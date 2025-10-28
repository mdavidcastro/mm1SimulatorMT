"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, Users, Clock, Activity } from "lucide-react"

interface SimulationStats {
  totalCustomers: number
  totalServed: number
  totalWaitTime: number
  totalSystemTime: number
  maxQueueLength: number
  serverBusyTime: number
}

interface TheoreticalMetrics {
  rho: number
  Lq: number
  Wq: number
  W: number
  L: number
}

interface StatisticsDashboardProps {
  stats: SimulationStats
  theoreticalMetrics: TheoreticalMetrics
  simulationTime: number
  formatTime: (minutes: number) => string
}

export function StatisticsDashboard({
  stats,
  theoreticalMetrics,
  simulationTime,
  formatTime,
}: StatisticsDashboardProps) {
  const avgWaitTime = stats.totalServed > 0 ? stats.totalWaitTime / stats.totalServed : 0
  const avgSystemTime = stats.totalServed > 0 ? stats.totalSystemTime / stats.totalServed : 0
  const simulatedRho = stats.serverBusyTime / simulationTime
  const simulatedLq = stats.totalServed > 0 ? stats.totalWaitTime / simulationTime : 0

  const comparisonData = [
    {
      metric: "ρ (Utilización)",
      Teórico: theoreticalMetrics.rho,
      Simulado: simulatedRho,
    },
    {
      metric: "Wq (Espera)",
      Teórico: isFinite(theoreticalMetrics.Wq) ? theoreticalMetrics.Wq : 0,
      Simulado: avgWaitTime,
    },
    {
      metric: "W (Sistema)",
      Teórico: isFinite(theoreticalMetrics.W) ? theoreticalMetrics.W : 0,
      Simulado: avgSystemTime,
    },
  ]

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold">Resumen Final de la Simulación</h3>
      </div>

      {/* Key Metrics Grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
          </div>
          <p className="text-3xl font-bold">{stats.totalCustomers}</p>
          <p className="text-xs text-muted-foreground mt-1">Atendidos: {stats.totalServed}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-accent" />
            <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio de Espera</p>
          </div>
          <p className="text-3xl font-bold">{avgWaitTime.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatTime(avgWaitTime)}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-chart-2" />
            <p className="text-sm font-medium text-muted-foreground">Tiempo en Sistema</p>
          </div>
          <p className="text-3xl font-bold">{avgSystemTime.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatTime(avgSystemTime)}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-chart-3" />
            <p className="text-sm font-medium text-muted-foreground">Cola Máxima</p>
          </div>
          <p className="text-3xl font-bold">{stats.maxQueueLength}</p>
          <p className="text-xs text-muted-foreground mt-1">Clientes simultáneos</p>
        </div>
      </div>

      {/* Utilization Details */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h4 className="mb-3 text-lg font-semibold">Utilización del Servidor</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tiempo ocupado:</span>
            <span className="font-mono font-medium">{stats.serverBusyTime.toFixed(2)} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tiempo total:</span>
            <span className="font-mono font-medium">{simulationTime.toFixed(2)} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Utilización (ρ simulado):</span>
            <span className="font-mono text-lg font-bold text-primary">
              {simulatedRho.toFixed(4)} ({(simulatedRho * 100).toFixed(2)}%)
            </span>
          </div>
          <div className="mt-2 h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${Math.min(simulatedRho * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-4 text-lg font-semibold text-blue-700">Comparación: Teórico vs Simulado</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={comparisonData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            style={{ border: "2px solid #e5e7eb", borderRadius: "12px", background: "hsl(var(--card))" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis
              dataKey="metric"
              stroke="#2563eb"
              tick={{ fill: "#2563eb", fontWeight: 700, fontSize: 15 }}
              axisLine={{ stroke: "#2563eb", strokeWidth: 2 }}
              tickLine={{ stroke: "#2563eb", strokeWidth: 2 }}
            />
            <YAxis stroke="#2563eb" axisLine={{ stroke: "#2563eb", strokeWidth: 2 }} tickLine={{ stroke: "#2563eb", strokeWidth: 2 }} tick={{ fill: "#2563eb", fontWeight: 700, fontSize: 13 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid #2563eb",
                borderRadius: "8px",
                color: "#2563eb",
              }}
              labelStyle={{ color: "#2563eb", fontWeight: 700 }}
              itemStyle={{ color: "#059669", fontWeight: 500 }}
            />
            <Legend wrapperStyle={{ color: "#2563eb", fontWeight: 700 }} />
            <Bar dataKey="Teórico" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={30} />
            <Bar dataKey="Simulado" fill="#059669" radius={[8, 8, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          Los valores simulados deberían aproximarse a los teóricos con simulaciones más largas
        </p>
      </div>
    </Card>
  )
}
