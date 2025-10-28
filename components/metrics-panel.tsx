import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, Users, Clock, Timer, Activity, Info } from "lucide-react"

interface MetricsPanelProps {
  rho: number
  Lq: number
  Wq: number
  W: number
  L: number
  formatTime: (minutes: number) => string
  isStable: boolean
}

export function MetricsPanel({ rho, Lq, Wq, W, L, formatTime, isStable }: MetricsPanelProps) {
  const metrics = [
    {
      label: "ρ (Rho) - Utilización",
      value: isStable ? rho.toFixed(4) : "≥ 1.0000",
      percentage: isStable ? `${(rho * 100).toFixed(2)}%` : "≥ 100%",
      description: "Porcentaje de tiempo que el servidor está ocupado",
      tooltip:
        "ρ = λ/μ. Representa la fracción de tiempo que el servidor está trabajando. Valores cercanos a 1 indican alta utilización.",
      icon: Activity,
      color: rho >= 0.9 ? "text-destructive" : rho >= 0.7 ? "text-accent" : "text-primary",
    },
    {
      label: "Lq - Clientes en cola",
      value: isStable ? Lq.toFixed(4) : "∞",
      percentage: isStable ? `≈ ${Math.round(Lq)} clientes` : "Infinito",
      description: "Número promedio de clientes esperando en la cola",
      tooltip:
        "Lq = ρ²/(1-ρ). Cantidad esperada de clientes esperando ser atendidos (sin contar el que está siendo servido).",
      icon: Users,
      color: "text-chart-2",
    },
    {
      label: "Wq - Tiempo en cola",
      value: isStable ? formatTime(Wq) : "∞",
      percentage: isStable && Wq < 1 && Wq >= 0.1 ? `${(Wq * 60).toFixed(2)} seg` : "",
      description: "Tiempo promedio que un cliente espera en la cola",
      tooltip:
        "Wq = Lq/λ. Tiempo promedio de espera antes de ser atendido. Los resultados se muestran en minutos, o en segundos si son muy pequeños.",
      icon: Clock,
      color: "text-chart-3",
    },
    {
      label: "W - Tiempo total",
      value: isStable ? formatTime(W) : "∞",
      percentage: isStable && W < 1 && W >= 0.1 ? `${(W * 60).toFixed(2)} seg` : "",
      description: "Tiempo promedio total en el sistema (espera + servicio)",
      tooltip: "W = Wq + 1/μ. Tiempo total desde que el cliente llega hasta que termina de ser atendido.",
      icon: Timer,
      color: "text-chart-4",
    },
    {
      label: "L - Clientes en sistema",
      value: isStable ? L.toFixed(4) : "∞",
      percentage: isStable ? `≈ ${Math.round(L)} clientes` : "Infinito",
      description: "Número promedio de clientes en el sistema completo",
      tooltip: "L = λ·W. Cantidad total de clientes en el sistema (esperando + siendo atendidos).",
      icon: TrendingUp,
      color: "text-chart-5",
    },
  ]

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="border-border/50 bg-card p-6 transition-all hover:border-primary/30">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground/60 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">{metric.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className={`font-mono text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                  {metric.percentage && <p className="text-sm font-medium text-foreground/80">{metric.percentage}</p>}
                </div>
                <Icon className={`h-8 w-8 ${metric.color} opacity-60`} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{metric.description}</p>
            </Card>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
