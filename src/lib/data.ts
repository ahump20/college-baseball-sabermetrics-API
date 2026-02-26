import type {
  APIEndpoint,
  SchemaTable,
  Metric,
  GameProvenance,
  CoverageData,
} from './types';

export const apiEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/v1/health',
    description: 'Service health check',
    category: 'System',
    response: {
      status: 'ok',
      uptime_s: 123456,
      version: '1.0.0',
    },
  },
  {
    method: 'GET',
    path: '/v1/seasons',
    description: 'List available seasons and divisions',
    category: 'Core',
    params: [
      {
        name: 'division',
        type: 'string',
        required: false,
        description: 'Filter by division (D1, D2, D3)',
      },
      {
        name: 'year',
        type: 'number',
        required: false,
        description: 'Filter by year',
      },
    ],
    response: {
      data: [
        {
          season_id: '2026-d1',
          year: 2026,
          division: 'D1',
          ruleset_version: '2026.1',
          start_date: '2026-02-14',
          end_date: '2026-06-30',
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/v1/teams',
    description: 'Team directory with filtering',
    category: 'Core',
    params: [
      {
        name: 'season_id',
        type: 'string',
        required: false,
        description: 'Filter by season',
      },
      {
        name: 'conference_id',
        type: 'string',
        required: false,
        description: 'Filter by conference',
      },
      {
        name: 'q',
        type: 'string',
        required: false,
        description: 'Search query',
      },
    ],
    response: {
      data: [
        {
          team_id: 't_123',
          name: 'Texas Longhorns',
          division: 'D1',
          conference_id: 'sec',
          ncaa_org_code: 'TEX',
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/v1/games/{game_id}/boxscore',
    description: 'Official box score with provenance metadata',
    category: 'Games',
    params: [
      {
        name: 'source',
        type: 'string',
        required: false,
        description: 'Preferred source system',
      },
    ],
    response: {
      game_id: 'g_9001',
      status: 'official',
      provenance: {
        policy: 'host_official_stats',
        last_corrected_at: '2026-03-04T18:22:10Z',
        source_systems: ['host_xml', 'licensed_feed_a'],
      },
      teams: {
        home: {
          team_id: 't_123',
          runs: 6,
          hits: 9,
          errors: 1,
          lob: 7,
        },
        away: {
          team_id: 't_456',
          runs: 4,
          hits: 8,
          errors: 0,
          lob: 6,
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/v1/games/{game_id}/pbp',
    description: 'Play-by-play event stream',
    category: 'Games',
    params: [
      {
        name: 'cursor',
        type: 'string',
        required: false,
        description: 'Pagination cursor',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Events per page (max 100)',
      },
    ],
    response: {
      game_id: 'g_9001',
      next_cursor: 'e_1200',
      events: [
        {
          event_id: 'e_1188',
          inning: 7,
          half: 'bottom',
          outs_before: 1,
          outs_after: 2,
          result: 'strikeout_swinging',
          batter_id: 'p_77',
          pitcher_id: 'p_92',
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/v1/metrics/players',
    description: 'Player metrics leaderboards',
    category: 'Analytics',
    params: [
      {
        name: 'season_id',
        type: 'string',
        required: true,
        description: 'Season identifier',
      },
      {
        name: 'metric',
        type: 'string',
        required: true,
        description: 'Metric name (wOBA, wRC+, FIP, etc.)',
      },
      {
        name: 'min_pa',
        type: 'number',
        required: false,
        description: 'Minimum plate appearances',
      },
    ],
    response: {
      metric: 'wRC+',
      season_id: '2026-d1',
      model_version: 'woba_weights_2026_d1_v1',
      data: [
        {
          player_id: 'p_77',
          name: 'John Smith',
          team_id: 't_123',
          pa: 185,
          wRC_plus: 148,
          rank: 1,
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/v1/provenance/{resource}',
    description: 'Explain data lineage for any resource',
    category: 'System',
    params: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Resource identifier',
      },
    ],
    response: {
      resource: 'boxscore',
      id: 'g_9001',
      sources: [
        {
          source: 'host_xml',
          fields: ['runs', 'hits', 'errors'],
          updated_at: '2026-03-01T22:45:00Z',
          confidence: 1.0,
        },
        {
          source: 'licensed_feed_a',
          fields: ['lob', 'detailed_stats'],
          updated_at: '2026-03-01T22:48:00Z',
          confidence: 0.95,
        },
      ],
    },
  },
];

export const schemaTables: SchemaTable[] = [
  {
    name: 'source_system',
    purpose: 'Identify each upstream source and its licensing domain',
    primaryKey: 'source_system_id',
    fields: [
      {
        name: 'source_system_id',
        type: 'string',
        nullable: false,
        description: 'Unique identifier',
      },
      {
        name: 'name',
        type: 'string',
        nullable: false,
        description: 'Human-readable name',
      },
      {
        name: 'type',
        type: 'enum',
        nullable: false,
        description: 'licensed | public | internal',
      },
      {
        name: 'allowed_redistribution',
        type: 'boolean',
        nullable: false,
        description: 'Can data be resold/redistributed',
      },
      {
        name: 'contract_ref',
        type: 'string',
        nullable: true,
        description: 'Reference to licensing agreement',
      },
    ],
    relationships: [
      {
        type: 'one-to-many',
        target: 'entity_mapping',
        description: 'Provides mappings',
      },
    ],
    notes: 'This is how you keep rights/provenance enforceable in code.',
  },
  {
    name: 'canonical_team',
    purpose: 'One row per program/team identity',
    primaryKey: 'team_id',
    fields: [
      {
        name: 'team_id',
        type: 'string',
        nullable: false,
        description: 'Canonical team identifier',
      },
      {
        name: 'ncaa_org_code',
        type: 'string',
        nullable: true,
        description: 'Official NCAA school code',
      },
      {
        name: 'name',
        type: 'string',
        nullable: false,
        description: 'Full team name',
      },
      {
        name: 'division',
        type: 'enum',
        nullable: false,
        description: 'D1 | D2 | D3',
      },
      {
        name: 'conference_id',
        type: 'string',
        nullable: true,
        description: 'Current conference',
      },
    ],
    relationships: [
      {
        type: 'one-to-many',
        target: 'roster_snapshot',
        description: 'Has rosters',
      },
      {
        type: 'one-to-many',
        target: 'canonical_game',
        description: 'Participates in games',
      },
    ],
    notes: 'NCAA school codes matter for loading XML files correctly.',
  },
  {
    name: 'canonical_player',
    purpose: 'One row per athlete identity',
    primaryKey: 'player_id',
    fields: [
      {
        name: 'player_id',
        type: 'string',
        nullable: false,
        description: 'Canonical player identifier',
      },
      {
        name: 'full_name',
        type: 'string',
        nullable: false,
        description: 'Player full name',
      },
      {
        name: 'bats',
        type: 'enum',
        nullable: true,
        description: 'L | R | S (switch)',
      },
      {
        name: 'throws',
        type: 'enum',
        nullable: true,
        description: 'L | R',
      },
      {
        name: 'dob',
        type: 'date',
        nullable: true,
        description: 'Date of birth (PII, access-controlled)',
      },
    ],
    relationships: [
      {
        type: 'one-to-many',
        target: 'entity_mapping',
        description: 'Maps to external IDs',
      },
      {
        type: 'one-to-many',
        target: 'box_player_batting_game',
        description: 'Has batting lines',
      },
    ],
    notes: 'Keep PII minimal; treat DOB as optional and access-controlled.',
  },
  {
    name: 'canonical_game',
    purpose: 'Game header and status tracking',
    primaryKey: 'game_id',
    fields: [
      {
        name: 'game_id',
        type: 'string',
        nullable: false,
        description: 'Canonical game identifier',
      },
      {
        name: 'season_id',
        type: 'string',
        nullable: false,
        description: 'Season reference',
      },
      {
        name: 'date_start',
        type: 'timestamp',
        nullable: false,
        description: 'Game start time',
      },
      {
        name: 'team_id_home',
        type: 'string',
        nullable: false,
        description: 'Home team (official stat controller)',
      },
      {
        name: 'team_id_away',
        type: 'string',
        nullable: false,
        description: 'Away team',
      },
      {
        name: 'status',
        type: 'enum',
        nullable: false,
        description: 'scheduled | live | final | suspended | forfeit',
      },
    ],
    relationships: [
      {
        type: 'one-to-many',
        target: 'box_team_game',
        description: 'Has team box scores',
      },
      {
        type: 'one-to-many',
        target: 'pbp_event',
        description: 'Contains play-by-play events',
      },
    ],
    notes: 'Suspended contests require special handling for "official date of site."',
  },
  {
    name: 'entity_mapping',
    purpose: 'Cross-source ID mapping with confidence tracking',
    primaryKey: 'mapping_id',
    fields: [
      {
        name: 'mapping_id',
        type: 'string',
        nullable: false,
        description: 'Unique mapping identifier',
      },
      {
        name: 'source_system_id',
        type: 'string',
        nullable: false,
        description: 'Source system reference',
      },
      {
        name: 'entity_type',
        type: 'enum',
        nullable: false,
        description: 'player | team | game',
      },
      {
        name: 'source_id',
        type: 'string',
        nullable: false,
        description: 'ID in source system',
      },
      {
        name: 'canonical_id',
        type: 'string',
        nullable: false,
        description: 'Canonical entity ID',
      },
      {
        name: 'confidence',
        type: 'float',
        nullable: false,
        description: '0.0 - 1.0 confidence score',
      },
      {
        name: 'method',
        type: 'enum',
        nullable: false,
        description: 'direct | feed | heuristic | manual',
      },
    ],
    relationships: [
      {
        type: 'many-to-one',
        target: 'source_system',
        description: 'Belongs to source',
      },
      {
        type: 'many-to-one',
        target: 'canonical_player',
        description: 'Maps to player',
      },
    ],
    notes: 'Mirrors provider "mapping feeds" concept for cross-system reconciliation.',
  },
  {
    name: 'box_player_batting_game',
    purpose: 'Player batting line per game',
    primaryKey: '(game_id, player_id)',
    fields: [
      {
        name: 'game_id',
        type: 'string',
        nullable: false,
        description: 'Game reference',
      },
      {
        name: 'player_id',
        type: 'string',
        nullable: false,
        description: 'Player reference',
      },
      {
        name: 'pa',
        type: 'integer',
        nullable: false,
        description: 'Plate appearances',
      },
      {
        name: 'ab',
        type: 'integer',
        nullable: false,
        description: 'At bats',
      },
      {
        name: 'h',
        type: 'integer',
        nullable: false,
        description: 'Hits',
      },
      {
        name: 'hr',
        type: 'integer',
        nullable: false,
        description: 'Home runs',
      },
      {
        name: 'bb',
        type: 'integer',
        nullable: false,
        description: 'Walks (BB + IBB)',
      },
      {
        name: 'so',
        type: 'integer',
        nullable: false,
        description: 'Strikeouts',
      },
    ],
    relationships: [
      {
        type: 'many-to-one',
        target: 'canonical_game',
        description: 'Belongs to game',
      },
      {
        type: 'many-to-one',
        target: 'canonical_player',
        description: 'Belongs to player',
      },
    ],
    notes: 'Align definitions to NCAA official scoring rules.',
  },
  {
    name: 'pbp_event',
    purpose: 'Play-by-play event stream',
    primaryKey: 'event_id',
    fields: [
      {
        name: 'event_id',
        type: 'string',
        nullable: false,
        description: 'Unique event identifier',
      },
      {
        name: 'game_id',
        type: 'string',
        nullable: false,
        description: 'Game reference',
      },
      {
        name: 'inning',
        type: 'integer',
        nullable: false,
        description: 'Inning number',
      },
      {
        name: 'half',
        type: 'enum',
        nullable: false,
        description: 'top | bottom',
      },
      {
        name: 'outs_before',
        type: 'integer',
        nullable: false,
        description: 'Outs before event (0-2)',
      },
      {
        name: 'outs_after',
        type: 'integer',
        nullable: false,
        description: 'Outs after event (0-3)',
      },
      {
        name: 'event_type',
        type: 'string',
        nullable: false,
        description: 'Event classification',
      },
      {
        name: 'runs_scored',
        type: 'integer',
        nullable: false,
        description: 'Runs scored on this event',
      },
    ],
    relationships: [
      {
        type: 'many-to-one',
        target: 'canonical_game',
        description: 'Belongs to game',
      },
    ],
    notes: 'Drives leverage, WPA, RE24, and situational splits.',
  },
  {
    name: 'provenance_field',
    purpose: 'Field-level lineage tracking',
    primaryKey: 'prov_id',
    fields: [
      {
        name: 'prov_id',
        type: 'string',
        nullable: false,
        description: 'Provenance record ID',
      },
      {
        name: 'table',
        type: 'string',
        nullable: false,
        description: 'Source table name',
      },
      {
        name: 'field',
        type: 'string',
        nullable: false,
        description: 'Field name',
      },
      {
        name: 'source_system_id',
        type: 'string',
        nullable: false,
        description: 'Data source',
      },
      {
        name: 'method',
        type: 'enum',
        nullable: false,
        description: 'raw | derived | model',
      },
      {
        name: 'last_updated',
        type: 'timestamp',
        nullable: false,
        description: 'Last update timestamp',
      },
    ],
    relationships: [
      {
        type: 'many-to-one',
        target: 'source_system',
        description: 'References source',
      },
    ],
    notes: 'Lets you answer "where did this number come from?" in the API.',
  },
];

export const metrics: Metric[] = [
  {
    id: 'woba',
    name: 'wOBA (Weighted On-Base Average)',
    category: 'box-only',
    formula: '(wBB×BB + wHBP×HBP + w1B×1B + w2B×2B + w3B×3B + wHR×HR) / PA',
    description:
      'Linear weights-based offensive metric that weights each outcome by its run value. Scales to OBP.',
    inputs: [
      { name: 'pa', label: 'Plate Appearances', type: 'number', placeholder: '185' },
      { name: 'bb', label: 'Walks', type: 'number', placeholder: '28' },
      { name: 'hbp', label: 'Hit by Pitch', type: 'number', placeholder: '3' },
      { name: '1b', label: 'Singles', type: 'number', placeholder: '42' },
      { name: '2b', label: 'Doubles', type: 'number', placeholder: '18' },
      { name: '3b', label: 'Triples', type: 'number', placeholder: '2' },
      { name: 'hr', label: 'Home Runs', type: 'number', placeholder: '12' },
    ],
    contextAdjustments: ['Park factor', 'League average', 'Strength of schedule'],
  },
  {
    id: 'fip',
    name: 'FIP (Fielding Independent Pitching)',
    category: 'box-only',
    formula: '((13×HR) + (3×(BB + HBP − IBB)) − (2×K)) / IP + FIP_constant',
    description:
      'Estimates ERA using only outcomes the pitcher controls: strikeouts, walks, hit batters, and home runs.',
    inputs: [
      { name: 'ip', label: 'Innings Pitched', type: 'number', placeholder: '89.1' },
      { name: 'hr', label: 'Home Runs', type: 'number', placeholder: '8' },
      { name: 'bb', label: 'Walks', type: 'number', placeholder: '22' },
      { name: 'hbp', label: 'Hit by Pitch', type: 'number', placeholder: '4' },
      { name: 'ibb', label: 'Intentional Walks', type: 'number', placeholder: '1' },
      { name: 'so', label: 'Strikeouts', type: 'number', placeholder: '98' },
    ],
    contextAdjustments: [
      'Division/season constant',
      'Park home run factor',
      'League run environment',
    ],
  },
  {
    id: 'wrc_plus',
    name: 'wRC+ (Weighted Runs Created Plus)',
    category: 'box-only',
    formula: '(((wOBA − lgwOBA) / wOBA_scale) + lgR/PA) / (lgR/PA) × 100',
    description:
      'Context-adjusted offensive metric comparing wRC to league average while controlling for park. 100 = average.',
    inputs: [
      { name: 'woba', label: 'wOBA', type: 'number', placeholder: '0.412' },
      { name: 'pa', label: 'Plate Appearances', type: 'number', placeholder: '185' },
      { name: 'lg_woba', label: 'League wOBA', type: 'number', placeholder: '0.340' },
      { name: 'woba_scale', label: 'wOBA Scale', type: 'number', placeholder: '1.24' },
      { name: 'lg_r_pa', label: 'League R/PA', type: 'number', placeholder: '0.122' },
      { name: 'park_factor', label: 'Park Factor', type: 'number', placeholder: '1.03' },
    ],
    contextAdjustments: ['Park factor', 'League environment', 'Division normalization'],
  },
  {
    id: 'iso',
    name: 'ISO (Isolated Power)',
    category: 'box-only',
    formula: 'SLG − AVG = (2B + 2×3B + 3×HR) / AB',
    description:
      'Measures raw power by isolating extra bases per at-bat. Separates power from batting average.',
    inputs: [
      { name: 'ab', label: 'At Bats', type: 'number', placeholder: '154' },
      { name: '2b', label: 'Doubles', type: 'number', placeholder: '18' },
      { name: '3b', label: 'Triples', type: 'number', placeholder: '2' },
      { name: 'hr', label: 'Home Runs', type: 'number', placeholder: '12' },
    ],
    contextAdjustments: ['Park factor', 'Division power environment'],
  },
  {
    id: 'babip',
    name: 'BABIP (Batting Average on Balls in Play)',
    category: 'box-only',
    formula: '(H − HR) / (AB − K − HR + SF)',
    description:
      'Measures batting average on balls put in play, excluding home runs and strikeouts. Used for luck/skill analysis.',
    inputs: [
      { name: 'h', label: 'Hits', type: 'number', placeholder: '74' },
      { name: 'hr', label: 'Home Runs', type: 'number', placeholder: '12' },
      { name: 'ab', label: 'At Bats', type: 'number', placeholder: '154' },
      { name: 'so', label: 'Strikeouts', type: 'number', placeholder: '38' },
      { name: 'sf', label: 'Sacrifice Flies', type: 'number', placeholder: '4' },
    ],
    contextAdjustments: ['Batted ball profile', 'Defense quality'],
  },
  {
    id: 'k_pct',
    name: 'K% (Strikeout Rate)',
    category: 'box-only',
    formula: 'K / PA × 100',
    description:
      'Percentage of plate appearances resulting in strikeouts. Key plate discipline indicator.',
    inputs: [
      { name: 'so', label: 'Strikeouts', type: 'number', placeholder: '38' },
      { name: 'pa', label: 'Plate Appearances', type: 'number', placeholder: '185' },
    ],
    contextAdjustments: ['League average', 'Batter handedness'],
  },
  {
    id: 'bb_pct',
    name: 'BB% (Walk Rate)',
    category: 'box-only',
    formula: 'BB / PA × 100',
    description:
      'Percentage of plate appearances resulting in walks. Measures plate discipline and patience.',
    inputs: [
      { name: 'bb', label: 'Walks', type: 'number', placeholder: '28' },
      { name: 'pa', label: 'Plate Appearances', type: 'number', placeholder: '185' },
    ],
    contextAdjustments: ['League average', 'Umpire tendencies'],
  },
  {
    id: 'ops_plus',
    name: 'OPS+ (Adjusted OPS)',
    category: 'box-only',
    formula: '(OBP / lgOBP + SLG / lgSLG − 1) × 100',
    description:
      'Park and league-adjusted OPS scaled to 100. Values above 100 are above average.',
    inputs: [
      { name: 'obp', label: 'On-Base %', type: 'number', placeholder: '0.412' },
      { name: 'slg', label: 'Slugging %', type: 'number', placeholder: '0.558' },
      { name: 'lg_obp', label: 'League OBP', type: 'number', placeholder: '0.365' },
      { name: 'lg_slg', label: 'League SLG', type: 'number', placeholder: '0.445' },
      { name: 'park_factor', label: 'Park Factor', type: 'number', placeholder: '1.03' },
    ],
    contextAdjustments: ['Park factor', 'League environment'],
  },
  {
    id: 'xfip',
    name: 'xFIP (Expected FIP)',
    category: 'box-only',
    formula: '((13×(FB×lgHR/FB)) + (3×(BB + HBP − IBB)) − (2×K)) / IP + FIP_constant',
    description:
      'FIP variant using league-average HR/FB rate instead of actual home runs. Normalizes for HR luck.',
    inputs: [
      { name: 'ip', label: 'Innings Pitched', type: 'number', placeholder: '89.1' },
      { name: 'fb', label: 'Fly Balls', type: 'number', placeholder: '156' },
      { name: 'bb', label: 'Walks', type: 'number', placeholder: '22' },
      { name: 'hbp', label: 'Hit by Pitch', type: 'number', placeholder: '4' },
      { name: 'ibb', label: 'Intentional Walks', type: 'number', placeholder: '1' },
      { name: 'so', label: 'Strikeouts', type: 'number', placeholder: '98' },
      { name: 'lg_hr_fb', label: 'League HR/FB', type: 'number', placeholder: '0.115' },
    ],
    contextAdjustments: ['Division constant', 'Fly ball park factors'],
  },
  {
    id: 'whip',
    name: 'WHIP (Walks + Hits per Inning)',
    category: 'box-only',
    formula: '(BB + H) / IP',
    description:
      'Traditional pitching metric measuring baserunners allowed per inning pitched.',
    inputs: [
      { name: 'bb', label: 'Walks', type: 'number', placeholder: '22' },
      { name: 'h', label: 'Hits Allowed', type: 'number', placeholder: '78' },
      { name: 'ip', label: 'Innings Pitched', type: 'number', placeholder: '89.1' },
    ],
    contextAdjustments: ['League BABIP', 'Defense quality'],
  },
  {
    id: 'k_bb_ratio',
    name: 'K/BB (Strikeout-to-Walk Ratio)',
    category: 'box-only',
    formula: 'K / BB',
    description:
      'Ratio of strikeouts to walks. Measures pitcher command and control.',
    inputs: [
      { name: 'so', label: 'Strikeouts', type: 'number', placeholder: '98' },
      { name: 'bb', label: 'Walks', type: 'number', placeholder: '22' },
    ],
    contextAdjustments: ['League average', 'Pitcher type'],
  },
  {
    id: 're24',
    name: 'RE24 (Run Expectancy 24 Base-Out States)',
    category: 'pbp-required',
    formula: 'Σ(RE_after − RE_before + runs_scored)',
    description:
      'Measures runs added above average based on 24 base-out state transitions. Requires play-by-play data.',
    inputs: [
      { name: 'events', label: 'Number of Events', type: 'number', placeholder: '245' },
      {
        name: 're_added',
        label: 'Total RE Added',
        type: 'number',
        placeholder: '12.4',
        min: -50,
        max: 50,
      },
    ],
    contextAdjustments: ['League run environment', 'Leverage index weighting'],
  },
  {
    id: 'wpa',
    name: 'WPA (Win Probability Added)',
    category: 'pbp-required',
    formula: 'Σ(WP_after − WP_before)',
    description:
      'Cumulative change in win probability attributed to a player. Context-aware situational metric.',
    inputs: [
      { name: 'events', label: 'Number of Events', type: 'number', placeholder: '245' },
      {
        name: 'wpa_total',
        label: 'Total WPA',
        type: 'number',
        placeholder: '2.8',
        min: -10,
        max: 10,
      },
    ],
    contextAdjustments: ['Game state', 'Leverage situations'],
  },
  {
    id: 'leverage_index',
    name: 'LI (Leverage Index)',
    category: 'pbp-required',
    formula: 'Swing in WP / Average Swing',
    description:
      'Measures the importance of a game situation. 1.0 = average leverage, higher = more critical.',
    inputs: [
      {
        name: 'avg_li',
        label: 'Average LI',
        type: 'number',
        placeholder: '1.24',
        min: 0,
        max: 10,
      },
    ],
    contextAdjustments: ['Inning', 'Score differential', 'Base-out state'],
  },
  {
    id: 'clutch',
    name: 'Clutch (Context-Neutral Performance)',
    category: 'pbp-required',
    formula: 'WPA / LI − pWPA',
    description:
      'Measures performance in high-leverage situations above expected. Positive = clutch performer.',
    inputs: [
      { name: 'wpa', label: 'WPA', type: 'number', placeholder: '2.8' },
      { name: 'avg_li', label: 'Avg Leverage', type: 'number', placeholder: '1.24' },
      { name: 'pwpa', label: 'Predicted WPA', type: 'number', placeholder: '2.2' },
    ],
    contextAdjustments: ['Sample size', 'Context weighting'],
  },
  {
    id: 'xwoba',
    name: 'xwOBA (Expected wOBA)',
    category: 'tracking-required',
    formula: 'ML model: f(exit_velocity, launch_angle, [sprint_speed])',
    description:
      'Statcast-style expected wOBA using exit velocity and launch angle. Requires TrackMan/HawkEye tracking data.',
    inputs: [
      { name: 'bip_count', label: 'Balls in Play', type: 'number', placeholder: '128' },
      { name: 'avg_ev', label: 'Avg Exit Velo', type: 'number', placeholder: '88.4' },
      { name: 'avg_la', label: 'Avg Launch Angle', type: 'number', placeholder: '14.2' },
      {
        name: 'xwoba_value',
        label: 'Model xwOBA',
        type: 'number',
        placeholder: '0.398',
        min: 0,
        max: 1,
      },
    ],
    contextAdjustments: [
      'Park dimensions',
      'Altitude effects',
      'Weather conditions',
      'Tracking coverage',
    ],
  },
  {
    id: 'hard_hit_pct',
    name: 'Hard Hit% (Exit Velocity > 95mph)',
    category: 'tracking-required',
    formula: 'BIP with EV ≥ 95mph / Total BIP × 100',
    description:
      'Percentage of balls in play with exit velocity of 95+ mph. Indicates quality of contact.',
    inputs: [
      { name: 'hard_hit', label: 'Hard Hit Balls', type: 'number', placeholder: '42' },
      { name: 'bip_total', label: 'Total Balls in Play', type: 'number', placeholder: '128' },
    ],
    contextAdjustments: ['Park dimensions', 'Weather', 'Ball type'],
  },
  {
    id: 'barrel_rate',
    name: 'Barrel% (Optimal Launch Angle + EV)',
    category: 'tracking-required',
    formula: 'Barrels / Batted Ball Events × 100',
    description:
      'Percentage of batted balls meeting optimal EV/LA combination (high hit probability). Elite power indicator.',
    inputs: [
      { name: 'barrels', label: 'Barrels', type: 'number', placeholder: '18' },
      { name: 'bbe', label: 'Batted Ball Events', type: 'number', placeholder: '128' },
    ],
    contextAdjustments: ['Park factors', 'Sample size threshold'],
  },
  {
    id: 'avg_ev',
    name: 'Avg Exit Velocity',
    category: 'tracking-required',
    formula: 'Σ(exit_velocity) / BIP_count',
    description:
      'Average exit velocity on batted balls. Strong predictor of power and overall offensive production.',
    inputs: [
      { name: 'total_ev', label: 'Total EV (sum)', type: 'number', placeholder: '11315.2' },
      { name: 'bip_count', label: 'Balls in Play', type: 'number', placeholder: '128' },
    ],
    contextAdjustments: ['Weather', 'Ball compression', 'Tracking calibration'],
  },
  {
    id: 'spin_rate',
    name: 'Avg Spin Rate (Fastball)',
    category: 'tracking-required',
    formula: 'Σ(spin_rpm) / pitch_count',
    description:
      'Average fastball spin rate in RPM. Higher spin typically correlates with swing-and-miss ability.',
    inputs: [
      { name: 'total_spin', label: 'Total Spin (sum)', type: 'number', placeholder: '689400' },
      { name: 'fb_count', label: 'Fastball Count', type: 'number', placeholder: '312' },
    ],
    contextAdjustments: ['Pitch type', 'Release point', 'Velocity'],
  },
];

export const gameProvenance: GameProvenance = {
  gameId: 'g_9001',
  status: 'official',
  events: [
    {
      timestamp: '2026-03-01T22:30:15Z',
      type: 'initial',
      description: 'Initial box score received from NCAA LiveStats',
      source: 'ncaa_livestats',
    },
    {
      timestamp: '2026-03-01T22:45:00Z',
      type: 'initial',
      description: 'Host SID XML uploaded',
      source: 'host_xml',
      changes: {
        home_errors: { old: 0, new: 1 },
      },
    },
    {
      timestamp: '2026-03-02T10:22:00Z',
      type: 'validation',
      description: 'Box score proofing checks passed',
      source: 'internal_validation',
    },
    {
      timestamp: '2026-03-04T18:22:10Z',
      type: 'correction',
      description: 'Home SID correction: RBI adjustment for player #23',
      source: 'host_xml',
      changes: {
        'p_77.rbi': { old: 2, new: 3 },
      },
    },
  ],
  sources: [
    {
      id: 'ncaa_livestats',
      name: 'NCAA LiveStats (Genius Sports)',
      type: 'licensed',
      lastUpdated: '2026-03-01T22:30:15Z',
    },
    {
      id: 'host_xml',
      name: 'Texas Longhorns SID (Host)',
      type: 'public',
      lastUpdated: '2026-03-04T18:22:10Z',
    },
    {
      id: 'internal_validation',
      name: 'Internal Proofing Engine',
      type: 'internal',
      lastUpdated: '2026-03-02T10:22:00Z',
    },
  ],
};

export const coverageData: CoverageData[] = [
  {
    division: 'Division I',
    conferences: [
      {
        name: 'SEC',
        games: 1248,
        boxScore: 100,
        playByPlay: 95,
        tracking: 88,
        trackingVendor: 'TrackMan',
      },
      {
        name: 'ACC',
        games: 1156,
        boxScore: 100,
        playByPlay: 93,
        tracking: 85,
        trackingVendor: 'TrackMan',
      },
      {
        name: 'Big 12',
        games: 892,
        boxScore: 100,
        playByPlay: 89,
        tracking: 72,
        trackingVendor: 'TrackMan',
      },
      {
        name: 'Pac-12',
        games: 856,
        boxScore: 100,
        playByPlay: 91,
        tracking: 78,
        trackingVendor: 'TrackMan',
      },
      {
        name: 'Big Ten',
        games: 724,
        boxScore: 100,
        playByPlay: 84,
        tracking: 58,
        trackingVendor: 'Mixed',
      },
      {
        name: 'Sun Belt',
        games: 1024,
        boxScore: 100,
        playByPlay: 87,
        tracking: 81,
        trackingVendor: 'TrackMan',
      },
      {
        name: 'American',
        games: 668,
        boxScore: 100,
        playByPlay: 82,
        tracking: 74,
        trackingVendor: 'TrackMan',
      },
      {
        name: 'Conference USA',
        games: 592,
        boxScore: 100,
        playByPlay: 76,
        tracking: 42,
        trackingVendor: 'Mixed',
      },
    ],
  },
  {
    division: 'Division II',
    conferences: [
      {
        name: 'GLVC',
        games: 324,
        boxScore: 100,
        playByPlay: 68,
        tracking: 12,
      },
      {
        name: 'GLIAC',
        games: 298,
        boxScore: 100,
        playByPlay: 64,
        tracking: 8,
      },
      {
        name: 'SSC',
        games: 412,
        boxScore: 100,
        playByPlay: 72,
        tracking: 18,
        trackingVendor: 'Yakkertech',
      },
    ],
  },
  {
    division: 'Division III',
    conferences: [
      {
        name: 'SCIAC',
        games: 286,
        boxScore: 98,
        playByPlay: 45,
        tracking: 4,
      },
      {
        name: 'NESCAC',
        games: 312,
        boxScore: 99,
        playByPlay: 52,
        tracking: 6,
      },
      {
        name: 'OAC',
        games: 268,
        boxScore: 97,
        playByPlay: 41,
        tracking: 2,
      },
    ],
  },
];
