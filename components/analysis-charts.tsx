"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Users, Clock, Activity } from "lucide-react"

interface AnalysisChartsProps {
  stats: {
    totalCustomers: number
    totalServed: number
    maxQueueLength: number
    serverBusyTime: number
    totalWaitTime: number
    totalSystemTime: number
  }
  simulationTime: number
}

export function AnalysisCharts({ stats, simulationTime }: AnalysisChartsProps) {
  const barData = [
    { name: "Atendidos", value: stats.totalServed },
    { name: "Cola máxima", value: stats.maxQueueLength },
    { name: "Total clientes", value: stats.totalCustomers },
  ];

  const utilization = simulationTime > 0 ? (stats.serverBusyTime / simulationTime) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6 border border-border/50 bg-background shadow-sm">
        <h3 className="mb-4 text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Análisis de Resultados Simulados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border bg-card p-4 flex flex-col items-center shadow">
            <Users className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-lg font-bold text-primary">{stats.totalServed}</p>
            <p className="text-xs text-muted-foreground">Clientes atendidos</p>
          </div>
          <div className="rounded-lg border bg-card p-4 flex flex-col items-center shadow">
            <Clock className="h-6 w-6 text-blue-400 mb-2" />
            <p className="text-lg font-bold text-primary">{stats.maxQueueLength}</p>
            <p className="text-xs text-muted-foreground">Cola máxima</p>
          </div>
          <div className="rounded-lg border bg-card p-4 flex flex-col items-center shadow">
            <Activity className="h-6 w-6 text-teal-500 mb-2" />
            <p className="text-lg font-bold text-primary">{utilization.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Utilización servidor</p>
          </div>
        </div>
        <div className="mb-2 text-sm text-muted-foreground">Las métricas mostradas corresponden únicamente a los resultados simulados.</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={barData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            style={{ border: "2px solid #e5e7eb", borderRadius: "12px", background: "hsl(var(--card))" }}
          >
            <XAxis
              dataKey="name"
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
            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
