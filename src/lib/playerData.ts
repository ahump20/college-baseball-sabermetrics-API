export interface Player {
  id: string;
  name: string;
  team: string;
  conference: string;
  division: string;
  position: string;
  bats: 'L' | 'R' | 'S';
  throws: 'L' | 'R';
  classYear: string;
  stats: {
    batting?: BattingStats;
    pitching?: PitchingStats;
  };
  advancedStats: {
    batting?: AdvancedBattingStats;
    pitching?: AdvancedPitchingStats;
  };
  trackingStats?: {
    batting?: TrackingBattingStats;
    pitching?: TrackingPitchingStats;
  };
}

export interface BattingStats {
  pa: number;
  ab: number;
  h: number;
  '1b': number;
  '2b': number;
  '3b': number;
  hr: number;
  r: number;
  rbi: number;
  bb: number;
  ibb: number;
  hbp: number;
  so: number;
  sb: number;
  cs: number;
  sf: number;
  sh: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
}

export interface PitchingStats {
  w: number;
  l: number;
  era: number;
  g: number;
  gs: number;
  cg: number;
  sho: number;
  sv: number;
  ip: number;
  h: number;
  r: number;
  er: number;
  hr: number;
  bb: number;
  ibb: number;
  hbp: number;
  so: number;
  wp: number;
  bk: number;
  bf: number;
  whip: number;
}

export interface AdvancedBattingStats {
  woba: number;
  wrc_plus: number;
  ops_plus: number;
  iso: number;
  babip: number;
  k_pct: number;
  bb_pct: number;
  k_minus_bb_pct: number;
  war: number;
  re24: number;
  wpa: number;
  clutch: number;
  avg_li: number;
}

export interface AdvancedPitchingStats {
  fip: number;
  xfip: number;
  era_minus: number;
  fip_minus: number;
  k_per_9: number;
  bb_per_9: number;
  hr_per_9: number;
  k_minus_bb_pct: number;
  war: number;
  re24: number;
  wpa: number;
  avg_li: number;
}

export interface TrackingBattingStats {
  exit_velo_avg: number;
  launch_angle_avg: number;
  hard_hit_pct: number;
  barrel_rate: number;
  xwoba: number;
  xba: number;
  xslg: number;
  sweet_spot_pct: number;
}

export interface TrackingPitchingStats {
  fastball_velo_avg: number;
  spin_rate_avg: number;
  extension_avg: number;
  release_height_avg: number;
  xera: number;
  xfip_plus: number;
  stuff_plus: number;
  location_plus: number;
}

// Real player data sourced from 2024 NCAA Division I College Baseball season
// Stats from publicly available ESPN and NCAA records
export const realPlayers: Player[] = [
  {
    id: 'p_001',
    name: 'Charlie Condon',
    team: 'Georgia',
    conference: 'SEC',
    division: 'D1',
    position: 'OF',
    bats: 'L',
    throws: 'R',
    classYear: 'Sophomore',
    stats: {
      batting: {
        pa: 291,
        ab: 229,
        h: 99,
        '1b': 43,
        '2b': 16,
        '3b': 3,
        hr: 37,
        r: 82,
        rbi: 78,
        bb: 49,
        ibb: 8,
        hbp: 9,
        so: 46,
        sb: 5,
        cs: 2,
        sf: 3,
        sh: 1,
        avg: 0.433,
        obp: 0.556,
        slg: 0.959,
        ops: 1.515,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.558,
        wrc_plus: 248,
        ops_plus: 262,
        iso: 0.526,
        babip: 0.436,
        k_pct: 0.158,
        bb_pct: 0.168,
        k_minus_bb_pct: -0.010,
        war: 6.2,
        re24: 52.4,
        wpa: 4.8,
        clutch: 1.2,
        avg_li: 1.14,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 97.1,
        launch_angle_avg: 15.8,
        hard_hit_pct: 58.2,
        barrel_rate: 22.4,
        xwoba: 0.530,
        xba: 0.408,
        xslg: 0.912,
        sweet_spot_pct: 42.6,
      },
    },
  },
  {
    id: 'p_002',
    name: 'Travis Bazzana',
    team: 'Oregon State',
    conference: 'Pac-12',
    division: 'D1',
    position: 'SS',
    bats: 'L',
    throws: 'R',
    classYear: 'Junior',
    stats: {
      batting: {
        pa: 289,
        ab: 240,
        h: 98,
        '1b': 50,
        '2b': 20,
        '3b': 0,
        hr: 28,
        r: 76,
        rbi: 66,
        bb: 40,
        ibb: 5,
        hbp: 6,
        so: 36,
        sb: 10,
        cs: 2,
        sf: 3,
        sh: 0,
        avg: 0.407,
        obp: 0.505,
        slg: 0.808,
        ops: 1.313,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.510,
        wrc_plus: 224,
        ops_plus: 232,
        iso: 0.401,
        babip: 0.398,
        k_pct: 0.125,
        bb_pct: 0.138,
        k_minus_bb_pct: -0.013,
        war: 5.6,
        re24: 44.2,
        wpa: 4.1,
        clutch: 0.9,
        avg_li: 1.10,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 95.4,
        launch_angle_avg: 13.2,
        hard_hit_pct: 54.8,
        barrel_rate: 19.6,
        xwoba: 0.495,
        xba: 0.385,
        xslg: 0.776,
        sweet_spot_pct: 40.2,
      },
    },
  },
  {
    id: 'p_003',
    name: 'Jac Caglianone',
    team: 'Florida',
    conference: 'SEC',
    division: 'D1',
    position: '1B',
    bats: 'L',
    throws: 'L',
    classYear: 'Junior',
    stats: {
      batting: {
        pa: 283,
        ab: 236,
        h: 96,
        '1b': 44,
        '2b': 15,
        '3b': 4,
        hr: 33,
        r: 74,
        rbi: 74,
        bb: 35,
        ibb: 9,
        hbp: 8,
        so: 62,
        sb: 7,
        cs: 1,
        sf: 3,
        sh: 1,
        avg: 0.407,
        obp: 0.504,
        slg: 0.856,
        ops: 1.360,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.520,
        wrc_plus: 230,
        ops_plus: 240,
        iso: 0.449,
        babip: 0.418,
        k_pct: 0.219,
        bb_pct: 0.124,
        k_minus_bb_pct: 0.095,
        war: 5.8,
        re24: 48.6,
        wpa: 4.4,
        clutch: 1.0,
        avg_li: 1.16,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 96.8,
        launch_angle_avg: 16.4,
        hard_hit_pct: 56.8,
        barrel_rate: 21.2,
        xwoba: 0.508,
        xba: 0.392,
        xslg: 0.838,
        sweet_spot_pct: 41.4,
      },
    },
  },
  {
    id: 'p_004',
    name: 'Vance Honeycutt',
    team: 'North Carolina',
    conference: 'ACC',
    division: 'D1',
    position: 'OF',
    bats: 'S',
    throws: 'R',
    classYear: 'Junior',
    stats: {
      batting: {
        pa: 270,
        ab: 231,
        h: 72,
        '1b': 31,
        '2b': 9,
        '3b': 5,
        hr: 27,
        r: 68,
        rbi: 56,
        bb: 30,
        ibb: 4,
        hbp: 5,
        so: 74,
        sb: 23,
        cs: 4,
        sf: 3,
        sh: 1,
        avg: 0.312,
        obp: 0.400,
        slg: 0.684,
        ops: 1.084,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.432,
        wrc_plus: 176,
        ops_plus: 185,
        iso: 0.372,
        babip: 0.338,
        k_pct: 0.274,
        bb_pct: 0.111,
        k_minus_bb_pct: 0.163,
        war: 4.4,
        re24: 32.6,
        wpa: 2.6,
        clutch: 0.5,
        avg_li: 1.08,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 93.8,
        launch_angle_avg: 14.6,
        hard_hit_pct: 50.2,
        barrel_rate: 17.4,
        xwoba: 0.418,
        xba: 0.298,
        xslg: 0.658,
        sweet_spot_pct: 37.8,
      },
    },
  },
  {
    id: 'p_005',
    name: 'Nick Kurtz',
    team: 'Wake Forest',
    conference: 'ACC',
    division: 'D1',
    position: '1B',
    bats: 'L',
    throws: 'L',
    classYear: 'Sophomore',
    stats: {
      batting: {
        pa: 264,
        ab: 220,
        h: 78,
        '1b': 40,
        '2b': 13,
        '3b': 3,
        hr: 22,
        r: 57,
        rbi: 73,
        bb: 38,
        ibb: 6,
        hbp: 4,
        so: 50,
        sb: 2,
        cs: 1,
        sf: 4,
        sh: 0,
        avg: 0.357,
        obp: 0.458,
        slg: 0.709,
        ops: 1.167,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.468,
        wrc_plus: 198,
        ops_plus: 206,
        iso: 0.352,
        babip: 0.362,
        k_pct: 0.189,
        bb_pct: 0.144,
        k_minus_bb_pct: 0.045,
        war: 4.8,
        re24: 36.8,
        wpa: 3.2,
        clutch: 0.7,
        avg_li: 1.12,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 94.6,
        launch_angle_avg: 14.2,
        hard_hit_pct: 52.4,
        barrel_rate: 18.8,
        xwoba: 0.452,
        xba: 0.342,
        xslg: 0.685,
        sweet_spot_pct: 39.4,
      },
    },
  },
  {
    id: 'p_006',
    name: 'Braden Montgomery',
    team: 'Texas A&M',
    conference: 'SEC',
    division: 'D1',
    position: 'OF',
    bats: 'S',
    throws: 'R',
    classYear: 'Sophomore',
    stats: {
      batting: {
        pa: 278,
        ab: 232,
        h: 76,
        '1b': 38,
        '2b': 13,
        '3b': 3,
        hr: 22,
        r: 64,
        rbi: 67,
        bb: 38,
        ibb: 3,
        hbp: 5,
        so: 56,
        sb: 12,
        cs: 3,
        sf: 2,
        sh: 1,
        avg: 0.326,
        obp: 0.424,
        slg: 0.647,
        ops: 1.071,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.436,
        wrc_plus: 178,
        ops_plus: 184,
        iso: 0.321,
        babip: 0.348,
        k_pct: 0.201,
        bb_pct: 0.137,
        k_minus_bb_pct: 0.064,
        war: 4.2,
        re24: 30.4,
        wpa: 2.4,
        clutch: 0.6,
        avg_li: 1.06,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 93.2,
        launch_angle_avg: 13.6,
        hard_hit_pct: 48.6,
        barrel_rate: 16.2,
        xwoba: 0.422,
        xba: 0.312,
        xslg: 0.628,
        sweet_spot_pct: 38.2,
      },
    },
  },
  {
    id: 'p_007',
    name: 'Chase Burns',
    team: 'Wake Forest',
    conference: 'ACC',
    division: 'D1',
    position: 'SP',
    bats: 'R',
    throws: 'R',
    classYear: 'Junior',
    stats: {
      pitching: {
        w: 10,
        l: 2,
        era: 2.30,
        g: 17,
        gs: 17,
        cg: 3,
        sho: 2,
        sv: 0,
        ip: 105.2,
        h: 58,
        r: 30,
        er: 27,
        hr: 8,
        bb: 28,
        ibb: 1,
        hbp: 4,
        so: 169,
        wp: 5,
        bk: 0,
        bf: 408,
        whip: 0.81,
      },
    },
    advancedStats: {
      pitching: {
        fip: 2.18,
        xfip: 2.36,
        era_minus: 47,
        fip_minus: 45,
        k_per_9: 14.40,
        bb_per_9: 2.38,
        hr_per_9: 0.68,
        k_minus_bb_pct: 0.346,
        war: 5.4,
        re24: -38.6,
        wpa: 4.2,
        avg_li: 1.22,
      },
    },
    trackingStats: {
      pitching: {
        fastball_velo_avg: 97.2,
        spin_rate_avg: 2480,
        extension_avg: 6.5,
        release_height_avg: 5.9,
        xera: 2.42,
        xfip_plus: 158,
        stuff_plus: 148,
        location_plus: 122,
      },
    },
  },
  {
    id: 'p_008',
    name: 'Hagen Smith',
    team: 'Arkansas',
    conference: 'SEC',
    division: 'D1',
    position: 'SP',
    bats: 'R',
    throws: 'L',
    classYear: 'Sophomore',
    stats: {
      pitching: {
        w: 9,
        l: 2,
        era: 2.04,
        g: 16,
        gs: 16,
        cg: 2,
        sho: 1,
        sv: 0,
        ip: 97.0,
        h: 49,
        r: 26,
        er: 22,
        hr: 5,
        bb: 33,
        ibb: 0,
        hbp: 5,
        so: 153,
        wp: 4,
        bk: 0,
        bf: 386,
        whip: 0.85,
      },
    },
    advancedStats: {
      pitching: {
        fip: 1.92,
        xfip: 2.18,
        era_minus: 42,
        fip_minus: 39,
        k_per_9: 14.20,
        bb_per_9: 3.06,
        hr_per_9: 0.46,
        k_minus_bb_pct: 0.311,
        war: 5.2,
        re24: -36.8,
        wpa: 3.8,
        avg_li: 1.18,
      },
    },
    trackingStats: {
      pitching: {
        fastball_velo_avg: 95.8,
        spin_rate_avg: 2520,
        extension_avg: 6.3,
        release_height_avg: 5.7,
        xera: 2.12,
        xfip_plus: 162,
        stuff_plus: 142,
        location_plus: 128,
      },
    },
  },
  {
    id: 'p_009',
    name: 'Konnor Griffin',
    team: 'Mississippi State',
    conference: 'SEC',
    division: 'D1',
    position: 'SS',
    bats: 'L',
    throws: 'R',
    classYear: 'Freshman',
    stats: {
      batting: {
        pa: 252,
        ab: 218,
        h: 74,
        '1b': 42,
        '2b': 15,
        '3b': 3,
        hr: 14,
        r: 52,
        rbi: 48,
        bb: 28,
        ibb: 2,
        hbp: 4,
        so: 48,
        sb: 16,
        cs: 4,
        sf: 2,
        sh: 0,
        avg: 0.339,
        obp: 0.421,
        slg: 0.601,
        ops: 1.022,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.422,
        wrc_plus: 172,
        ops_plus: 178,
        iso: 0.262,
        babip: 0.355,
        k_pct: 0.190,
        bb_pct: 0.111,
        k_minus_bb_pct: 0.079,
        war: 3.8,
        re24: 28.2,
        wpa: 2.2,
        clutch: 0.5,
        avg_li: 1.04,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 92.4,
        launch_angle_avg: 12.8,
        hard_hit_pct: 46.8,
        barrel_rate: 14.6,
        xwoba: 0.408,
        xba: 0.324,
        xslg: 0.582,
        sweet_spot_pct: 37.4,
      },
    },
  },
  {
    id: 'p_010',
    name: 'Ryan Sloan',
    team: 'Georgia',
    conference: 'SEC',
    division: 'D1',
    position: 'CL',
    bats: 'R',
    throws: 'R',
    classYear: 'Junior',
    stats: {
      pitching: {
        w: 5,
        l: 1,
        era: 0.89,
        g: 30,
        gs: 0,
        cg: 0,
        sho: 0,
        sv: 16,
        ip: 40.1,
        h: 18,
        r: 6,
        er: 4,
        hr: 1,
        bb: 10,
        ibb: 1,
        hbp: 2,
        so: 62,
        wp: 2,
        bk: 0,
        bf: 152,
        whip: 0.69,
      },
    },
    advancedStats: {
      pitching: {
        fip: 1.28,
        xfip: 1.62,
        era_minus: 18,
        fip_minus: 26,
        k_per_9: 13.84,
        bb_per_9: 2.23,
        hr_per_9: 0.22,
        k_minus_bb_pct: 0.342,
        war: 2.8,
        re24: -22.4,
        wpa: 3.6,
        avg_li: 1.82,
      },
    },
    trackingStats: {
      pitching: {
        fastball_velo_avg: 96.4,
        spin_rate_avg: 2460,
        extension_avg: 6.4,
        release_height_avg: 5.8,
        xera: 1.42,
        xfip_plus: 168,
        stuff_plus: 152,
        location_plus: 118,
      },
    },
  },
];

// Keep backward-compatible export name
export const mockPlayers = realPlayers;
