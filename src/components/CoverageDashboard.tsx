import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartBar, Target, Video } from '@phosphor-icons/react';
import { coverageData } from '@/lib/data';

export function CoverageDashboard() {
  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const getTrackingBadgeColor = (vendor?: string) => {
    if (!vendor) return 'bg-muted text-muted-foreground';
    if (vendor === 'TrackMan') return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-accent/10 text-accent border-accent/20';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Data Coverage Dashboard</h2>
        <p className="text-muted-foreground">
          Visualization of data availability across divisions and conferences, showing the uneven
          tracking landscape and how analytics adapt to partial coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ChartBar size={20} className="text-success" />
              <CardTitle className="text-sm font-medium">Box Score Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Universal coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Video size={20} className="text-warning" />
              <CardTitle className="text-sm font-medium">Play-by-Play</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">76.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Varies by division</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-accent" />
              <CardTitle className="text-sm font-medium">Tracking Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42.8%</div>
            <p className="text-xs text-muted-foreground mt-1">Premium conferences</p>
          </CardContent>
        </Card>
      </div>

      {coverageData.map((division) => (
        <Card key={division.division}>
          <CardHeader>
            <CardTitle>{division.division}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {division.conferences.map((conf) => (
                <div key={conf.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{conf.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {conf.games.toLocaleString()} games
                      </p>
                    </div>
                    {conf.trackingVendor && (
                      <Badge
                        className={`${getTrackingBadgeColor(conf.trackingVendor)} border text-xs`}
                        variant="outline"
                      >
                        {conf.trackingVendor}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Box Score</span>
                        <span className="font-mono font-semibold">{conf.boxScore}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${getCoverageColor(conf.boxScore)}`}
                          style={{ width: `${conf.boxScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Play-by-Play</span>
                        <span className="font-mono font-semibold">{conf.playByPlay}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${getCoverageColor(conf.playByPlay)}`}
                          style={{ width: `${conf.playByPlay}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tracking</span>
                        <span className="font-mono font-semibold">{conf.tracking}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${getCoverageColor(conf.tracking)}`}
                          style={{ width: `${conf.tracking}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-base">Coverage-Aware Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">Box-Only Metrics:</span> Available for all games -
            wOBA, FIP, ISO, BABIP, plate discipline rates
          </div>
          <div>
            <span className="font-semibold">PBP-Required Metrics:</span> 76% coverage - RE24, WPA,
            leverage index, situational splits
          </div>
          <div>
            <span className="font-semibold">Tracking-Required Metrics:</span> 43% coverage - xwOBA,
            exit velocity, launch angle, pitch characteristics
          </div>
          <div className="pt-2 border-t">
            <span className="font-semibold text-primary">Graceful Degradation:</span> API responses
            include coverage flags; metrics compute using available data with clear labeling
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
