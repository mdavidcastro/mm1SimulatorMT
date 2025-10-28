"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface QueueChartProps {
  data: Array<{ time: number; customers: number }>
  theoreticalL: number
}

export function QueueChart({ data, theoreticalL }: QueueChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50 bg-card p-6">
        <h3 className="mb-4 text-xl font-semibold">Evolución del Sistema</h3>
        <div className="flex h-80 items-center justify-center text-muted-foreground">
          Inicia la simulación para ver la evolución del sistema
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Evolución del Sistema</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Clientes simulados</span>
          </div>
          {isFinite(theoreticalL) && (
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-accent" />
              <span className="text-muted-foreground">L teórico ({theoreticalL.toFixed(2)})</span>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            label={{ value: "Tiempo (minutos)", position: "insideBottom", offset: -5 }}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            label={{ value: "Clientes", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelFormatter={(value) => `Tiempo: ${Number(value).toFixed(2)} min`}
            formatter={(value: number) => [value, "Clientes"]}
          />
          {isFinite(theoreticalL) && (
            <ReferenceLine y={theoreticalL} stroke="hsl(var(--accent))" strokeDasharray="5 5" strokeWidth={2} />
          )}
          <Line
            type="monotone"
            dataKey="customers"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
