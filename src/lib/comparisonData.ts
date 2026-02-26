export interface DivisionStats {
  division: string;
  teams: number;
  games: number;
  batting: {
    avg: number;
    obp: number;
    slg: number;
    woba: number;
    iso: number;
    babip: number;
    k_pct: number;
    bb_pct: number;
  };
  pitching: {
    era: number;
    whip: number;
    fip: number;
    k_per_9: number;
    bb_per_9: number;
    hr_per_9: number;
    k_minus_bb_pct: number;
  };
  parkFactor: number;
  avgPaPerTeam: number;
}

export interface ConferenceStats {
  id: string;
  name: string;
  fullName: string;
  division: string;
  teams: number;
  batting: {
    avg: number;
    obp: number;
    slg: number;
    woba: number;
    wrc_plus: number;
  };
  pitching: {
    era: number;
    fip: number;
    k_per_9: number;
    bb_per_9: number;
    era_minus: number;
  };
  trackingCoverage: number;
  trackingVendor?: string;
  avgRpi: number;
  strengthOfSchedule: number;
  avgParkFactor: number;
}

export const comparisonData = {
  divisions: [
    {
      division: 'D1',
      teams: 302,
      games: 5834,
      batting: {
        avg: 0.283,
        obp: 0.368,
        slg: 0.438,
        woba: 0.362,
        iso: 0.155,
        babip: 0.312,
        k_pct: 0.228,
        bb_pct: 0.102,
      },
      pitching: {
        era: 5.42,
        whip: 1.48,
        fip: 4.91,
        k_per_9: 9.2,
        bb_per_9: 3.8,
        hr_per_9: 1.2,
        k_minus_bb_pct: 0.141,
      },
      parkFactor: 1.02,
      avgPaPerTeam: 2248,
    },
    {
      division: 'D2',
      teams: 267,
      games: 4512,
      batting: {
        avg: 0.276,
        obp: 0.361,
        slg: 0.421,
        woba: 0.351,
        iso: 0.145,
        babip: 0.307,
        k_pct: 0.232,
        bb_pct: 0.098,
      },
      pitching: {
        era: 5.68,
        whip: 1.52,
        fip: 5.18,
        k_per_9: 8.6,
        bb_per_9: 4.1,
        hr_per_9: 1.15,
        k_minus_bb_pct: 0.124,
      },
      parkFactor: 0.98,
      avgPaPerTeam: 1982,
    },
    {
      division: 'D3',
      teams: 398,
      games: 5921,
      batting: {
        avg: 0.271,
        obp: 0.354,
        slg: 0.408,
        woba: 0.343,
        iso: 0.137,
        babip: 0.302,
        k_pct: 0.238,
        bb_pct: 0.094,
      },
      pitching: {
        era: 5.92,
        whip: 1.56,
        fip: 5.42,
        k_per_9: 8.1,
        bb_per_9: 4.4,
        hr_per_9: 1.08,
        k_minus_bb_pct: 0.108,
      },
      parkFactor: 0.96,
      avgPaPerTeam: 1845,
    },
  ] as DivisionStats[],
  conferences: [
    {
      id: 'sec',
      name: 'SEC',
      fullName: 'Southeastern Conference',
      division: 'D1',
      teams: 16,
      batting: {
        avg: 0.291,
        obp: 0.378,
        slg: 0.462,
        woba: 0.377,
        wrc_plus: 115,
      },
      pitching: {
        era: 4.98,
        fip: 4.52,
        k_per_9: 10.1,
        bb_per_9: 3.4,
        era_minus: 92,
      },
      trackingCoverage: 95,
      trackingVendor: 'TrackMan',
      avgRpi: 0.542,
      strengthOfSchedule: 1.18,
      avgParkFactor: 1.04,
    },
    {
      id: 'acc',
      name: 'ACC',
      fullName: 'Atlantic Coast Conference',
      division: 'D1',
      teams: 17,
      batting: {
        avg: 0.287,
        obp: 0.374,
        slg: 0.449,
        woba: 0.371,
        wrc_plus: 110,
      },
      pitching: {
        era: 5.12,
        fip: 4.68,
        k_per_9: 9.8,
        bb_per_9: 3.6,
        era_minus: 94,
      },
      trackingCoverage: 100,
      trackingVendor: 'TrackMan',
      avgRpi: 0.548,
      strengthOfSchedule: 1.15,
      avgParkFactor: 1.01,
    },
    {
      id: 'big12',
      name: 'Big 12',
      fullName: 'Big 12 Conference',
      division: 'D1',
      teams: 14,
      batting: {
        avg: 0.289,
        obp: 0.376,
        slg: 0.458,
        woba: 0.375,
        wrc_plus: 113,
      },
      pitching: {
        era: 5.24,
        fip: 4.78,
        k_per_9: 9.4,
        bb_per_9: 3.8,
        era_minus: 97,
      },
      trackingCoverage: 82,
      trackingVendor: 'TrackMan',
      avgRpi: 0.551,
      strengthOfSchedule: 1.12,
      avgParkFactor: 1.08,
    },
    {
      id: 'pac12',
      name: 'Pac-12',
      fullName: 'Pacific-12 Conference',
      division: 'D1',
      teams: 12,
      batting: {
        avg: 0.285,
        obp: 0.371,
        slg: 0.445,
        woba: 0.369,
        wrc_plus: 108,
      },
      pitching: {
        era: 5.18,
        fip: 4.72,
        k_per_9: 9.6,
        bb_per_9: 3.5,
        era_minus: 96,
      },
      trackingCoverage: 88,
      trackingVendor: 'TrackMan',
      avgRpi: 0.554,
      strengthOfSchedule: 1.10,
      avgParkFactor: 0.99,
    },
    {
      id: 'big10',
      name: 'Big Ten',
      fullName: 'Big Ten Conference',
      division: 'D1',
      teams: 14,
      batting: {
        avg: 0.279,
        obp: 0.364,
        slg: 0.428,
        woba: 0.357,
        wrc_plus: 102,
      },
      pitching: {
        era: 5.58,
        fip: 5.05,
        k_per_9: 8.9,
        bb_per_9: 4.0,
        era_minus: 103,
      },
      trackingCoverage: 64,
      avgRpi: 0.568,
      strengthOfSchedule: 1.02,
      avgParkFactor: 0.96,
    },
    {
      id: 'sunbelt',
      name: 'Sun Belt',
      fullName: 'Sun Belt Conference',
      division: 'D1',
      teams: 12,
      batting: {
        avg: 0.281,
        obp: 0.366,
        slg: 0.434,
        woba: 0.360,
        wrc_plus: 104,
      },
      pitching: {
        era: 5.48,
        fip: 4.96,
        k_per_9: 9.0,
        bb_per_9: 3.9,
        era_minus: 101,
      },
      trackingCoverage: 78,
      trackingVendor: 'TrackMan',
      avgRpi: 0.574,
      strengthOfSchedule: 1.05,
      avgParkFactor: 1.03,
    },
    {
      id: 'american',
      name: 'AAC',
      fullName: 'American Athletic Conference',
      division: 'D1',
      teams: 11,
      batting: {
        avg: 0.280,
        obp: 0.365,
        slg: 0.431,
        woba: 0.359,
        wrc_plus: 103,
      },
      pitching: {
        era: 5.52,
        fip: 5.01,
        k_per_9: 8.8,
        bb_per_9: 4.1,
        era_minus: 102,
      },
      trackingCoverage: 72,
      trackingVendor: 'TrackMan',
      avgRpi: 0.578,
      strengthOfSchedule: 1.04,
      avgParkFactor: 1.02,
    },
    {
      id: 'cusa',
      name: 'C-USA',
      fullName: 'Conference USA',
      division: 'D1',
      teams: 10,
      batting: {
        avg: 0.277,
        obp: 0.362,
        slg: 0.425,
        woba: 0.355,
        wrc_plus: 100,
      },
      pitching: {
        era: 5.64,
        fip: 5.12,
        k_per_9: 8.6,
        bb_per_9: 4.2,
        era_minus: 104,
      },
      trackingCoverage: 45,
      avgRpi: 0.595,
      strengthOfSchedule: 0.96,
      avgParkFactor: 1.01,
    },
  ] as ConferenceStats[],
};
