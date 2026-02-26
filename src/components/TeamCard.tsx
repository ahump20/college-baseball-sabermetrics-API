import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTeamBranding } from '@/lib/team-branding';
import { Trophy, TrendUp, Users, ChartBar } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface TeamCardProps {
  teamId: string;
  stats?: {
    wins?: number;
    losses?: number;
    conferenceWins?: number;
    conferenceLosses?: number;
    rank?: number;
  };
  logoUrl?: string;
  onClick?: () => void;
}

export function TeamCard({ teamId, stats, logoUrl, onClick }: TeamCardProps) {
  const branding = getTeamBranding(teamId);
  const winPercentage = stats?.wins && stats?.losses 
    ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
    : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card 
        className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-2xl"
        onClick={onClick}
        style={{
          borderColor: branding.primaryColor,
          borderWidth: '2px',
        }}
      >
        <div 
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})`
          }}
        />
        
        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <img 
                    src={logoUrl} 
                    alt={branding.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Trophy size={32} weight="fill" className="text-white" />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">
                  {branding.shortName}
                </h3>
                <Badge 
                  variant="outline" 
                  className="mt-1 text-xs"
                  style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
                >
                  {branding.conference}
                </Badge>
              </div>
            </div>

            {stats?.rank && (
              <Badge 
                className="text-sm font-bold px-3 py-1"
                style={{ 
                  backgroundColor: branding.primaryColor, 
                  color: 'white'
                }}
              >
                #{stats.rank}
              </Badge>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-center p-3 rounded-lg bg-surface-elevated">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                  <Trophy size={14} weight="bold" />
                  <span>Record</span>
                </div>
                <div className="text-xl font-bold font-mono" style={{ color: branding.primaryColor }}>
                  {stats.wins || 0}-{stats.losses || 0}
                </div>
              </div>

              {winPercentage && (
                <div className="text-center p-3 rounded-lg bg-surface-elevated">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <TrendUp size={14} weight="bold" />
                    <span>Win %</span>
                  </div>
                  <div className="text-xl font-bold font-mono" style={{ color: branding.accentColor }}>
                    {winPercentage}%
                  </div>
                </div>
              )}

              {stats.conferenceWins !== undefined && (
                <div className="text-center p-3 rounded-lg bg-surface-elevated col-span-2">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <ChartBar size={14} weight="bold" />
                    <span>Conference</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats.conferenceWins}-{stats.conferenceLosses}
                  </div>
                </div>
              )}
            </div>
          )}

          <div 
            className="absolute bottom-0 right-0 w-32 h-32 opacity-5"
            style={{
              background: `radial-gradient(circle, ${branding.accentColor}, transparent)`
            }}
          />
        </div>
      </Card>
    </motion.div>
  );
}
