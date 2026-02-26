import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, ArrowClockwise, Pulse, Clock } from '@phosphor-icons/react';

interface APILog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  latency: number;
  size: number;
}

interface LiveData {
  games: number;
  requests: number;
  avgLatency: number;
  errors: number;
}

const mockEndpoints = [
  { path: '/v1/games', method: 'GET', avgLatency: 45 },
  { path: '/v1/games/{id}/boxscore', method: 'GET', avgLatency: 62 },
  { path: '/v1/games/{id}/pbp', method: 'GET', avgLatency: 118 },
  { path: '/v1/players', method: 'GET', avgLatency: 52 },
  { path: '/v1/metrics/players', method: 'GET', avgLatency: 89 },
  { path: '/v1/teams', method: 'GET', avgLatency: 38 },
  { path: '/v1/provenance/{resource}', method: 'GET', avgLatency: 71 },
];

export function LiveAPISimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<APILog[]>([]);
  const [liveData, setLiveData] = useState<LiveData>({
    games: 1248,
    requests: 0,
    avgLatency: 0,
    errors: 0,
  });
  const [updateInterval, setUpdateInterval] = useState(1000);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const endpoint = mockEndpoints[Math.floor(Math.random() * mockEndpoints.length)];
      const hasError = Math.random() < 0.05;
      const latency = hasError
        ? endpoint.avgLatency * 3
        : endpoint.avgLatency + (Math.random() - 0.5) * 20;

      const newLog: APILog = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        endpoint: endpoint.path,
        method: endpoint.method,
        status: hasError ? (Math.random() < 0.5 ? 429 : 500) : 200,
        latency: Math.round(latency),
        size: Math.round(Math.random() * 15000 + 500),
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 50));

      setLiveData((prev) => {
        const newRequests = prev.requests + 1;
        const newAvgLatency =
          (prev.avgLatency * prev.requests + latency) / newRequests;
        const newErrors = hasError ? prev.errors + 1 : prev.errors;

        return {
          ...prev,
          requests: newRequests,
          avgLatency: Math.round(newAvgLatency),
          errors: newErrors,
        };
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isRunning, updateInterval]);

  const handleReset = () => {
    setLogs([]);
    setLiveData({
      games: 1248,
      requests: 0,
      avgLatency: 0,
      errors: 0,
    });
  };

  const getStatusColor = (status: number) => {
    if (status === 200) return 'text-success';
    if (status === 429) return 'text-warning';
    return 'text-destructive';
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-success';
    if (latency < 200) return 'text-warning';
    return 'text-destructive';
  };

  const errorRate = liveData.requests > 0 ? (liveData.errors / liveData.requests) * 100 : 0;
  const uptime = 99.8 - errorRate * 0.1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Live API Simulation</h2>
        <p className="text-muted-foreground">
          Real-time simulation of API requests showing endpoint usage, latency metrics, rate
          limiting, and error handling patterns.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          className={`gap-2 ${isRunning ? 'bg-warning hover:bg-warning/90' : ''}`}
        >
          {isRunning ? (
            <>
              <Pause size={16} />
              Pause
            </>
          ) : (
            <>
              <Play size={16} />
              Start
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <ArrowClockwise size={16} />
          Reset
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Update Frequency:</span>
          <Select
            value={updateInterval.toString()}
            onValueChange={(value) => setUpdateInterval(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500">500ms</SelectItem>
              <SelectItem value="1000">1s</SelectItem>
              <SelectItem value="2000">2s</SelectItem>
              <SelectItem value="5000">5s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Pulse size={20} className="text-primary" />
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{liveData.requests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {mockEndpoints.length} endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-success" />
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{liveData.avgLatency}ms</div>
            <p className="text-xs text-muted-foreground mt-1">Target: &lt;100ms (p95)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Pulse size={20} className="text-accent" />
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {liveData.errors} errors / {liveData.requests} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Pulse size={20} className="text-warning" />
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{uptime.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">SLA: 99.5%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Request Log</CardTitle>
              <CardDescription>Live stream of API requests (last 50)</CardDescription>
            </div>
            {isRunning && (
              <Badge variant="outline" className="gap-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-success" />
                Live
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Pulse size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No requests yet. Click "Start" to begin simulation.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors font-mono text-xs"
                  >
                    <Badge
                      variant="outline"
                      className={`font-mono ${
                        log.method === 'GET' ? 'bg-success/10 text-success border-success/20' : ''
                      }`}
                    >
                      {log.method}
                    </Badge>
                    <code className="flex-1">{log.endpoint}</code>
                    <span className={`font-semibold ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                    <span className={getLatencyColor(log.latency)}>{log.latency}ms</span>
                    <span className="text-muted-foreground">{(log.size / 1000).toFixed(1)}KB</span>
                    <span className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endpoint Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEndpoints.map((endpoint) => {
                const endpointLogs = logs.filter((log) => log.endpoint === endpoint.path);
                const avgLatency =
                  endpointLogs.length > 0
                    ? endpointLogs.reduce((acc, log) => acc + log.latency, 0) / endpointLogs.length
                    : endpoint.avgLatency;

                return (
                  <div key={endpoint.path} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <code className="font-mono text-xs">{endpoint.path}</code>
                      <span className="font-mono font-semibold">{Math.round(avgLatency)}ms</span>
                    </div>
                    <Progress value={(avgLatency / 200) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {endpointLogs.length} requests this session
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Simulation Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Mock Backend:</span> Simulates 7 core API endpoints
              with realistic latency patterns
            </div>
            <div>
              <span className="font-semibold">Rate Limiting:</span> 5% chance of 429 errors to
              demonstrate rate limit handling
            </div>
            <div>
              <span className="font-semibold">Real-Time Updates:</span> Configurable update
              frequency from 500ms to 5s intervals
            </div>
            <div>
              <span className="font-semibold">Metrics Tracking:</span> Live calculation of average
              latency, error rates, and uptime SLA
            </div>
            <div className="pt-2 border-t">
              <span className="font-semibold text-primary">Production Pattern:</span> This
              architecture mirrors actual Workers + D1 + R2 deployment with CDN caching
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
