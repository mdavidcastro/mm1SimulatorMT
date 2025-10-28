"use client"

import { Card } from "@/components/ui/card"
import { User, Server } from "lucide-react"

interface Customer {
  id: number
  arrivalTime: number
  serviceStartTime?: number
  departureTime?: number
}

interface QueueAnimationProps {
  queueCustomers: Customer[]
  serverBusy: boolean
  isRunning: boolean
}
// </CHANGE>

export function QueueAnimation({ queueCustomers, serverBusy, isRunning }: QueueAnimationProps) {
  const maxDisplay = 12
  const displayCustomers = Math.min(queueCustomers.length, maxDisplay)
  const overflow = Math.max(0, queueCustomers.length - maxDisplay)

  return (
    <Card className="border-border/50 bg-card p-6">
      <h3 className="mb-4 text-xl font-semibold">Visualización de la Cola (FIFO)</h3>

      <div className="space-y-6">
        {/* Server */}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
              serverBusy ? "border-primary bg-primary/20 shadow-lg shadow-primary/20" : "border-muted bg-muted/10"
            }`}
          >
            <div className="text-center">
              <Server className={`mx-auto h-10 w-10 ${serverBusy ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`mt-1 text-xs font-medium ${serverBusy ? "text-primary" : "text-muted-foreground"}`}>
                {serverBusy ? "Ocupado" : "Libre"}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              {serverBusy && (
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent animate-pulse"
                  style={{ width: "100%" }}
                />
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              {serverBusy ? "Atendiendo cliente..." : "Esperando cliente"}
            </p>
          </div>
          {/* </CHANGE> */}
        </div>

        {/* Queue */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Cola de espera: {queueCustomers.length} {queueCustomers.length === 1 ? "cliente" : "clientes"}
            </p>
            {overflow > 0 && <p className="text-sm font-medium text-accent animate-pulse">+{overflow} más</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            {queueCustomers.slice(0, maxDisplay).map((customer, i) => (
              <div
                key={customer.id}
                className="relative flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-secondary/50 transition-all hover:scale-105 hover:border-primary"
                style={
                  isRunning
                    ? {
                        animationName: "slideIn",
                        animationDuration: "0.3s",
                        animationTimingFunction: "ease-out",
                        animationDelay: `${i * 0.05}s`,
                      }
                    : { animationName: "none" }
                }
              >
                <User className="h-6 w-6 text-muted-foreground" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {customer.id}
                </span>
              </div>
            ))}
            {displayCustomers === 0 && (
              <div className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                No hay clientes en la cola
              </div>
            )}
          </div>
          {/* </CHANGE> */}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-secondary/30 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Estado del servidor</p>
            <p className="mt-1 font-medium">
              {serverBusy ? (
                <span className="text-primary">● Ocupado</span>
              ) : (
                <span className="text-muted-foreground">○ Libre</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">En cola</p>
            <p className="mt-1 font-mono text-lg font-bold">{queueCustomers.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">En sistema</p>
            <p className="mt-1 font-mono text-lg font-bold">{queueCustomers.length + (serverBusy ? 1 : 0)}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </Card>
  )
}
