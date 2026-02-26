import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTeamDetails } from '@/hooks/use-team-details';
import { ArrowLeft, TrendUp, Trophy, User } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface TeamDetailViewProps {
  teamId: string;
  onBack: () => void;
}

export function TeamDetailView({ teamId, onBack }: TeamDetailViewProps) {
  const { teamDetails, isLoading, error } = useTeamDetails(teamId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft size={18} />
          Back to Teams
        </Button>
        <Card className="p-8">
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !teamDetails) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft size={18} />
          Back to Teams
        </Button>
        <Card className="p-8">
          <p className="text-muted-foreground text-center">
            {error || 'Failed to load team details'}
          </p>
        </Card>
      </div>
    );
  }

  const { team, athletes, statistics } = teamDetails;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
        <ArrowLeft size={18} />
        Back to Teams
      </Button>

      <Card 
        className="p-6 border-2 relative overflow-hidden"
        style={{ 
          borderColor: team.color ? `#${team.color}` : undefined,
          background: team.color 
            ? `linear-gradient(135deg, oklch(from #${team.color} calc(l * 0.3) c h / 0.15) 0%, transparent 50%)`
            : undefined 
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {team.logos?.[0] && (
            <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-white rounded-lg p-3 shadow-sm">
              <img 
                src={team.logos[0].href} 
                alt={team.displayName}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {team.displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono">{team.abbreviation}</span>
              {team.standingSummary && (
                <Badge variant="outline" className="gap-1.5">
                  <Trophy size={14} weight="bold" />
                  {team.standingSummary}
                </Badge>
              )}
              {team.record?.items?.[0]?.summary && (
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: team.color ? `oklch(from #${team.color} l c h / 0.2)` : undefined,
                    color: team.color ? `#${team.color}` : undefined 
                  }}
                >
                  {team.record.items[0].summary}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {team.nextEvent?.[0] && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Next Game</p>
            <div className="flex items-center justify-between">
              <p className="font-medium">{team.nextEvent[0].shortName}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(team.nextEvent[0].date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roster" className="gap-2">
            <User size={16} />
            Roster
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <TrendUp size={16} />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-6">
          {athletes && athletes.length > 0 ? (
            <div className="grid gap-3">
              {athletes.map((athlete) => (
                <Card key={athlete.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={athlete.headshot?.href} alt={athlete.fullName} />
                      <AvatarFallback style={{ backgroundColor: team.color ? `#${team.color}20` : undefined }}>
                        {athlete.firstName[0]}{athlete.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {athlete.fullName}
                        </span>
                        <Badge variant="outline" className="font-mono text-xs">
                          #{athlete.jersey}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">
                          {athlete.position.abbreviation}
                        </span>
                        <span>{athlete.displayHeight}</span>
                        <span>{athlete.displayWeight}</span>
                        {athlete.experience && (
                          <span>{athlete.experience.years}yr</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <p className="text-center text-muted-foreground">
                Roster information not available
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          {statistics && statistics.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.map((stat, index) => (
                <Card key={index} className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">
                    {stat.displayName}
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {stat.displayValue}
                  </p>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <p className="text-center text-muted-foreground">
                Team statistics not available
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
