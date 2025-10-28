"use client"

import { useState, useEffect, useRef } from "react"
import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricsPanel } from "@/components/metrics-panel"
import { QueueChart } from "@/components/queue-chart"
import { QueueAnimation } from "@/components/queue-animation"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { AnalysisCharts } from "@/components/analysis-charts"
import { AlertTriangle, Play, Pause, RotateCcw } from "lucide-react"

interface Customer {
  id: number
  arrivalTime: number
  serviceStartTime?: number
  departureTime?: number
}

interface SimulationEvent {
  time: number
  type: "arrival" | "departure"
  customerId: number
}

interface SimulationState {
  time: number
  customersInSystem: number
  customersInQueue: number
  serverBusy: boolean
}

interface SimulationStats {
  totalCustomers: number
  totalServed: number
  totalWaitTime: number
  totalSystemTime: number
  maxQueueLength: number
  serverBusyTime: number
}

export default function MM1Simulator() {
  const [unit, setUnit] = useState<"hours" | "minutes">("minutes")
  const [lambda, setLambda] = useState(3)
  const [mu, setMu] = useState(4)
  const [simulationTime, setSimulationTime] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [queueData, setQueueData] = useState<Array<{ time: number; customers: number }>>([])

  const [currentState, setCurrentState] = useState<SimulationState>({
    time: 0,
    customersInSystem: 0,
    customersInQueue: 0,
    serverBusy: false,
  })
  const [simulationStats, setSimulationStats] = useState<SimulationStats>({
    totalCustomers: 0,
    totalServed: 0,
    totalWaitTime: 0,
    totalSystemTime: 0,
    maxQueueLength: 0,
    serverBusyTime: 0,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [queueCustomers, setQueueCustomers] = useState<Customer[]>([])

  const eventsRef = useRef<SimulationEvent[]>([])
  const customersRef = useRef<Map<number, Customer>>(new Map())
  const queueRef = useRef<Customer[]>([])
  const nextCustomerIdRef = useRef(1)
  const serverCustomerRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const currentTimeRef = useRef(0)
  const simulationTimeRef = useRef(60)
  const lambdaPerMinuteRef = useRef(3)
  const muPerMinuteRef = useRef(4)

  const statsRef = useRef<SimulationStats>({
    totalCustomers: 0,
    totalServed: 0,
    totalWaitTime: 0,
    totalSystemTime: 0,
    maxQueueLength: 0,
    serverBusyTime: 0,
  })
  const chartDataRef = useRef<Array<{ time: number; customers: number }>>([{ time: 0, customers: 0 }])

  const lambdaPerMinute = unit === "hours" ? lambda / 60 : lambda
  const muPerMinute = unit === "hours" ? mu / 60 : mu

  useEffect(() => {
    lambdaPerMinuteRef.current = lambdaPerMinute
    muPerMinuteRef.current = muPerMinute
    simulationTimeRef.current = simulationTime
  }, [lambdaPerMinute, muPerMinute, simulationTime])

  // Calculate theoretical metrics using normalized rates
  const rho = lambdaPerMinute / muPerMinute
  const isStable = rho < 1
  const showWarning = rho >= 0.9
  const Lq = isStable ? (rho * rho) / (1 - rho) : Number.POSITIVE_INFINITY
  const Wq = isStable ? Lq / lambdaPerMinute : Number.POSITIVE_INFINITY
  const W = isStable ? Wq + 1 / muPerMinute : Number.POSITIVE_INFINITY
  const L = isStable ? lambdaPerMinute * W : Number.POSITIVE_INFINITY

  const formatTime = (minutes: number) => {
    if (minutes < 0.1) {
      return `${(minutes * 60).toFixed(2)} segundos`
    }
    if (minutes < 1) {
      return `${(minutes * 60).toFixed(2)} segundos (${minutes.toFixed(4)} min)`
    }
    return `${minutes.toFixed(4)} minutos`
  }

  const getInterpretation = () => {
    if (!isStable) {
      return "El sistema está saturado y la cola crecerá indefinidamente."
    }
    const utilizationPercent = (rho * 100).toFixed(1)
    const avgWaiting = Math.round(Lq * 10) / 10
    return `El sistema trabaja al ${utilizationPercent}% de su capacidad. En promedio hay ${avgWaiting} ${
      avgWaiting === 1 ? "persona esperando" : "personas esperando"
    } en la cola.`
  }

  const exponentialRandom = (rate: number): number => {
    return -Math.log(1 - Math.random()) / rate
  }

  const initializeSimulation = () => {
    console.log("[v0] Initializing simulation")
    eventsRef.current = []
    customersRef.current = new Map()
    queueRef.current = []
    nextCustomerIdRef.current = 1
    serverCustomerRef.current = null
    chartDataRef.current = [{ time: 0, customers: 0 }]
    currentTimeRef.current = 0

    statsRef.current = {
      totalCustomers: 0,
      totalServed: 0,
      totalWaitTime: 0,
      totalSystemTime: 0,
      maxQueueLength: 0,
      serverBusyTime: 0,
    }

    // Generate initial arrival event
    const firstArrivalTime = exponentialRandom(lambdaPerMinuteRef.current)
    if (firstArrivalTime < simulationTimeRef.current) {
      eventsRef.current.push({
        time: firstArrivalTime,
        type: "arrival",
        customerId: nextCustomerIdRef.current,
      })
      customersRef.current.set(nextCustomerIdRef.current, {
        id: nextCustomerIdRef.current,
        arrivalTime: firstArrivalTime,
      })
      nextCustomerIdRef.current++
    }

    setQueueData([{ time: 0, customers: 0 }])
    setCurrentState({
      time: 0,
      customersInSystem: 0,
      customersInQueue: 0,
      serverBusy: false,
    })
    setSimulationStats({
      totalCustomers: 0,
      totalServed: 0,
      totalWaitTime: 0,
      totalSystemTime: 0,
      maxQueueLength: 0,
      serverBusyTime: 0,
    })
    setQueueCustomers([])
    setIsComplete(false)
    setCurrentTime(0)
  }

  const processNextEvent = (targetTime: number): boolean => {
    eventsRef.current.sort((a, b) => a.time - b.time)

    if (eventsRef.current.length === 0 || eventsRef.current[0].time > targetTime) {
      return false
    }

    const event = eventsRef.current.shift()!
    const eventTime = event.time

    if (event.type === "arrival") {
      const customer = customersRef.current.get(event.customerId)!
      statsRef.current.totalCustomers++

      if (serverCustomerRef.current === null) {
        serverCustomerRef.current = customer.id
        customer.serviceStartTime = eventTime

        const serviceTime = exponentialRandom(muPerMinuteRef.current)
        const departureTime = eventTime + serviceTime

        if (departureTime < simulationTimeRef.current) {
          eventsRef.current.push({
            time: departureTime,
            type: "departure",
            customerId: customer.id,
          })
          customer.departureTime = departureTime
        }
      } else {
        queueRef.current.push(customer)
        statsRef.current.maxQueueLength = Math.max(statsRef.current.maxQueueLength, queueRef.current.length)
      }

      const nextArrivalTime = eventTime + exponentialRandom(lambdaPerMinuteRef.current)
      if (nextArrivalTime < simulationTimeRef.current) {
        const nextCustomerId = nextCustomerIdRef.current++
        eventsRef.current.push({
          time: nextArrivalTime,
          type: "arrival",
          customerId: nextCustomerId,
        })
        customersRef.current.set(nextCustomerId, {
          id: nextCustomerId,
          arrivalTime: nextArrivalTime,
        })
      }

      const currentCustomers = chartDataRef.current[chartDataRef.current.length - 1].customers
      chartDataRef.current.push({ time: eventTime, customers: currentCustomers + 1 })
    } else if (event.type === "departure") {
      const customer = customersRef.current.get(event.customerId)!

      const waitTime = (customer.serviceStartTime || eventTime) - customer.arrivalTime
      const systemTime = eventTime - customer.arrivalTime
      const serviceTime = eventTime - (customer.serviceStartTime || eventTime)

      statsRef.current.totalServed++
      statsRef.current.totalWaitTime += waitTime
      statsRef.current.totalSystemTime += systemTime
      statsRef.current.serverBusyTime += serviceTime

      serverCustomerRef.current = null

      if (queueRef.current.length > 0) {
        const nextCustomer = queueRef.current.shift()!
        serverCustomerRef.current = nextCustomer.id
        nextCustomer.serviceStartTime = eventTime

        const serviceTime = exponentialRandom(muPerMinuteRef.current)
        const departureTime = eventTime + serviceTime

        if (departureTime < simulationTimeRef.current) {
          eventsRef.current.push({
            time: departureTime,
            type: "departure",
            customerId: nextCustomer.id,
          })
          nextCustomer.departureTime = departureTime
        }
      }

      const currentCustomers = chartDataRef.current[chartDataRef.current.length - 1].customers
      chartDataRef.current.push({ time: eventTime, customers: Math.max(0, currentCustomers - 1) })
    }

    return true
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isRunning && !isPaused) {
      intervalId = setInterval(() => {
        const simulationDelta = 0.1; // 0.1 minutos por tick
        const newTime = Math.min(currentTimeRef.current + simulationDelta, simulationTimeRef.current);
        currentTimeRef.current = newTime;

        let processed = true;
        while (processed) {
          processed = processNextEvent(newTime);
        }

        const customersInSystem = (serverCustomerRef.current !== null ? 1 : 0) + queueRef.current.length;

        setCurrentTime(newTime);
        setCurrentState({
          time: newTime,
          customersInSystem,
          customersInQueue: queueRef.current.length,
          serverBusy: serverCustomerRef.current !== null,
        });
        setSimulationStats({ ...statsRef.current });
        setQueueCustomers([...queueRef.current]);

        if (newTime >= simulationTimeRef.current) {
          setIsRunning(false);
          setIsComplete(true);
          if (intervalId) clearInterval(intervalId);
        }
      }, 50); // Actualiza cada 50ms
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    if (currentTime === 0) {
      initializeSimulation()
    }
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    initializeSimulation()
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-sans text-4xl font-bold tracking-tight text-balance">Simulador M/M/1</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Análisis y visualización del modelo de teoría de colas con un servidor
          </p>
        </div>

        {showWarning && (
          <Alert
            variant={rho >= 1 ? "destructive" : "default"}
            className={rho >= 1 ? "border-destructive/50 bg-destructive/10" : "border-accent/50 bg-accent/10"}
          >
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-base font-medium">
              {rho >= 1
                ? "⚠️ Sistema Saturado: ρ ≥ 1 - La tasa de llegada excede la capacidad de servicio"
                : "⚠️ Sistema Cerca de Saturación: ρ ≥ 0.9 - El sistema está operando cerca de su límite"}
            </AlertDescription>
          </Alert>
        )}

        {/* Input Controls */}
        <Card className="border-border/50 bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <Label htmlFor="unit" className="text-base font-medium whitespace-nowrap">
              Unidad de tasas:
            </Label>
            <Select value={unit} onValueChange={(value) => setUnit(value as "hours" | "minutes")} disabled={isRunning}>
              <SelectTrigger id="unit" className="w-[180px] bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Clientes por Minuto</SelectItem>
                <SelectItem value="hours">Clientes por Hora</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">(Internamente se normaliza a clientes/min)</span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="lambda" className="text-base font-medium">
                λ (Lambda) - Tasa de llegada
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="lambda"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={lambda}
                  onChange={(e) => setLambda(Number.parseFloat(e.target.value) || 0)}
                  className="bg-secondary"
                  disabled={isRunning}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {unit === "hours" ? "clientes/hora" : "clientes/min"}
                </span>
              </div>
              {unit === "hours" && (
                <p className="text-xs text-muted-foreground">≈ {lambdaPerMinute.toFixed(4)} clientes/min</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mu" className="text-base font-medium">
                μ (Mu) - Tasa de servicio
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="mu"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={mu}
                  onChange={(e) => setMu(Number.parseFloat(e.target.value) || 0)}
                  className="bg-secondary"
                  disabled={isRunning}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {unit === "hours" ? "clientes/hora" : "clientes/min"}
                </span>
              </div>
              {unit === "hours" && (
                <p className="text-xs text-muted-foreground">≈ {muPerMinute.toFixed(4)} clientes/min</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-base font-medium">
                Tiempo de simulación
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="time"
                  type="number"
                  min="1"
                  step="1"
                  value={simulationTime}
                  onChange={(e) => setSimulationTime(Number.parseInt(e.target.value) || 1)}
                  className="bg-secondary"
                  disabled={isRunning}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">minutos</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            {!isRunning || isPaused ? (
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                {currentTime === 0 ? "Iniciar Simulación" : "Continuar"}
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2">
                <Pause className="h-4 w-4" />
                Pausar
              </Button>
            )}
            <Button onClick={handleReset} size="lg" variant="outline" className="gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              Tiempo: {currentTime.toFixed(1)} / {simulationTime} min
            </div>
          </div>
        </Card>

        {/* Interpretation */}
        <Card className="border-primary/20 bg-primary/5 p-4">
          <p className="text-base leading-relaxed text-pretty">{getInterpretation()}</p>
        </Card>

        {/* Metrics Panel */}
        <MetricsPanel rho={rho} Lq={Lq} Wq={Wq} W={W} L={L} formatTime={formatTime} isStable={isStable} />

        {isRunning && (
          <Card className="border-border/50 bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Estado Actual de la Simulación</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Clientes en sistema</p>
                <p className="text-2xl font-bold text-primary">{currentState.customersInSystem}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Clientes en cola</p>
                <p className="text-2xl font-bold text-accent">{currentState.customersInQueue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total llegadas</p>
                <p className="text-2xl font-bold">{simulationStats.totalCustomers}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total atendidos</p>
                <p className="text-2xl font-bold">{simulationStats.totalServed}</p>
              </div>
            </div>
          </Card>
        )}


        {/* Queue Animation */}
        <QueueAnimation
          queueCustomers={queueCustomers}
          serverBusy={currentState.serverBusy}
          isRunning={isRunning && !isPaused}
        />

        {/* Nueva sección de análisis visual */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Análisis Visual</h2>
          <AnalysisCharts stats={simulationStats} simulationTime={simulationTime} />
        </div>

        {isComplete && (
          <StatisticsDashboard
            stats={simulationStats}
            theoreticalMetrics={{ rho, Lq, Wq, W, L }}
            simulationTime={simulationTime}
            formatTime={formatTime}
          />
        )}
      </div>
    </div>
  )
}
