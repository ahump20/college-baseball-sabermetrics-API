import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, ChartBar, Info } from '@phosphor-icons/react';
import { metrics } from '@/lib/data';
import type { Metric } from '@/lib/types';

export function MetricsCalculator() {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);

  const calculateMetric = () => {
    if (!selectedMetric) return;

    let calculated = 0;

    switch (selectedMetric.id) {
      case 'woba': {
        const pa = inputs.pa || 0;
        const bb = inputs.bb || 0;
        const hbp = inputs.hbp || 0;
        const singles = inputs['1b'] || 0;
        const doubles = inputs['2b'] || 0;
        const triples = inputs['3b'] || 0;
        const hr = inputs.hr || 0;

        const wBB = 0.69;
        const wHBP = 0.72;
        const w1B = 0.88;
        const w2B = 1.24;
        const w3B = 1.56;
        const wHR = 2.08;

        calculated =
          (wBB * bb + wHBP * hbp + w1B * singles + w2B * doubles + w3B * triples + wHR * hr) /
          (pa || 1);
        break;
      }

      case 'fip': {
        const ip = inputs.ip || 0;
        const hr = inputs.hr || 0;
        const bb = inputs.bb || 0;
        const hbp = inputs.hbp || 0;
        const ibb = inputs.ibb || 0;
        const so = inputs.so || 0;

        const fipConstant = 3.20;
        calculated = (13 * hr + 3 * (bb + hbp - ibb) - 2 * so) / (ip || 1) + fipConstant;
        break;
      }

      case 'wrc_plus': {
        const woba = inputs.woba || 0;
        const lgWoba = inputs.lg_woba || 0.34;
        const wobaScale = inputs.woba_scale || 1.24;
        const lgRPA = inputs.lg_r_pa || 0.122;
        const parkFactor = inputs.park_factor || 1.0;

        const wRC = ((woba - lgWoba) / wobaScale + lgRPA) / parkFactor;
        calculated = (wRC / lgRPA) * 100;
        break;
      }

      case 're24': {
        const reAdded = inputs.re_added || 0;
        calculated = reAdded;
        break;
      }

      case 'xwoba': {
        calculated = inputs.xwoba_value || 0;
        break;
      }
    }

    setResult(calculated);
  };

  const handleMetricChange = (metricId: string) => {
    const metric = metrics.find((m) => m.id === metricId);
    setSelectedMetric(metric || null);
    setInputs({});
    setResult(null);
  };

  const categoryColors = {
    'box-only': 'bg-success/10 text-success border-success/20',
    'pbp-required': 'bg-warning/10 text-warning border-warning/20',
    'tracking-required': 'bg-accent/10 text-accent border-accent/20',
  };

  const categoryLabels = {
    'box-only': 'Box Score Only',
    'pbp-required': 'Play-by-Play Required',
    'tracking-required': 'Tracking Required',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Metrics Calculator</h2>
        <p className="text-muted-foreground">
          Interactive calculator demonstrating advanced sabermetric formulas, linear weights, and
          context adjustments for NCAA baseball analytics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Metric</CardTitle>
          <CardDescription>Choose a metric to calculate and view its formula</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleMetricChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a metric..." />
            </SelectTrigger>
            <SelectContent>
              {metrics.map((metric) => (
                <SelectItem key={metric.id} value={metric.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{metric.name}</span>
                    <Badge
                      className={`${categoryColors[metric.category]} text-xs border`}
                      variant="outline"
                    >
                      {categoryLabels[metric.category]}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedMetric && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{selectedMetric.name}</CardTitle>
                  <CardDescription className="mt-2">{selectedMetric.description}</CardDescription>
                </div>
                <Badge className={`${categoryColors[selectedMetric.category]} border`}>
                  {categoryLabels[selectedMetric.category]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBar size={16} />
                  <span className="text-sm font-semibold">Formula</span>
                </div>
                <code className="text-sm font-mono">{selectedMetric.formula}</code>
              </div>

              {selectedMetric.contextAdjustments && selectedMetric.contextAdjustments.length > 0 && (
                <div className="p-4 rounded-lg border bg-accent/5 border-accent/20">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold">Context Adjustments</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedMetric.contextAdjustments.map((adj) => (
                          <Badge key={adj} variant="outline" className="text-xs">
                            {adj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input Values</CardTitle>
              <CardDescription>
                Enter player statistics to calculate {selectedMetric.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedMetric.inputs.map((input) => (
                  <div key={input.name} className="space-y-2">
                    <Label htmlFor={input.name} className="text-sm font-medium">
                      {input.label}
                    </Label>
                    <Input
                      id={input.name}
                      type="number"
                      placeholder={input.placeholder}
                      value={inputs[input.name] || ''}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          [input.name]: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={input.min}
                      max={input.max}
                      step="any"
                      className="font-mono"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button onClick={calculateMetric} className="gap-2">
                  <Calculator size={16} />
                  Calculate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setInputs({});
                    setResult(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {result !== null && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold font-mono">{result.toFixed(3)}</span>
                  <span className="text-lg text-muted-foreground">{selectedMetric.name}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
