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
  photo?: string;
  bio?: {
    hometown?: string;
    highSchool?: string;
    height?: string;
    weight?: number;
    birthdate?: string;
    major?: string;
  };
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

export const mockPlayers: Player[] = [
  {
    id: 'p_001',
    name: 'Jake Morrison',
    team: 'LSU',
    conference: 'SEC',
    division: 'D1',
    position: 'OF',
    bats: 'R',
    throws: 'R',
    classYear: 'Junior',
    photo: 'https://i.pravatar.cc/150?img=12',
    bio: {
      hometown: 'Houston, TX',
      highSchool: 'Kingwood High School',
      height: '6\'2"',
      weight: 195,
      major: 'Sports Management',
    },
    stats: {
      batting: {
        pa: 245,
        ab: 212,
        h: 72,
        '1b': 38,
        '2b': 18,
        '3b': 4,
        hr: 12,
        r: 48,
        rbi: 52,
        bb: 28,
        ibb: 3,
        hbp: 4,
        so: 45,
        sb: 8,
        cs: 2,
        sf: 3,
        sh: 1,
        avg: 0.340,
        obp: 0.420,
        slg: 0.585,
        ops: 1.005,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.418,
        wrc_plus: 168,
        ops_plus: 175,
        iso: 0.245,
        babip: 0.342,
        k_pct: 0.184,
        bb_pct: 0.114,
        k_minus_bb_pct: -0.070,
        war: 3.8,
        re24: 28.4,
        wpa: 2.1,
        clutch: 0.8,
        avg_li: 1.12,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 93.2,
        launch_angle_avg: 12.4,
        hard_hit_pct: 48.2,
        barrel_rate: 14.8,
        xwoba: 0.395,
        xba: 0.318,
        xslg: 0.556,
        sweet_spot_pct: 38.6,
      },
    },
  },
  {
    id: 'p_002',
    name: 'Tommy Chen',
    team: 'Vanderbilt',
    conference: 'SEC',
    division: 'D1',
    position: 'SS',
    bats: 'L',
    throws: 'R',
    classYear: 'Sophomore',
    photo: 'https://i.pravatar.cc/150?img=33',
    bio: {
      hometown: 'San Francisco, CA',
      highSchool: 'Archbishop Mitty High School',
      height: '5\'11"',
      weight: 175,
      major: 'Economics',
    },
    stats: {
      batting: {
        pa: 238,
        ab: 205,
        h: 68,
        '1b': 45,
        '2b': 14,
        '3b': 2,
        hr: 7,
        r: 42,
        rbi: 38,
        bb: 30,
        ibb: 2,
        hbp: 2,
        so: 38,
        sb: 18,
        cs: 4,
        sf: 2,
        sh: 3,
        avg: 0.332,
        obp: 0.408,
        slg: 0.478,
        ops: 0.886,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.389,
        wrc_plus: 152,
        ops_plus: 156,
        iso: 0.146,
        babip: 0.358,
        k_pct: 0.160,
        bb_pct: 0.126,
        k_minus_bb_pct: -0.034,
        war: 4.2,
        re24: 24.8,
        wpa: 1.8,
        clutch: 0.4,
        avg_li: 1.08,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 89.4,
        launch_angle_avg: 8.2,
        hard_hit_pct: 41.2,
        barrel_rate: 9.8,
        xwoba: 0.368,
        xba: 0.310,
        xslg: 0.452,
        sweet_spot_pct: 34.2,
      },
    },
  },
  {
    id: 'p_003',
    name: 'Marcus Williams',
    team: 'Clemson',
    conference: 'ACC',
    division: 'D1',
    position: 'C',
    bats: 'R',
    throws: 'R',
    classYear: 'Senior',
    photo: 'https://i.pravatar.cc/150?img=15',
    bio: {
      hometown: 'Atlanta, GA',
      highSchool: 'Parkview High School',
      height: '6\'0"',
      weight: 210,
      major: 'Business Administration',
    },
    stats: {
      batting: {
        pa: 228,
        ab: 198,
        h: 62,
        '1b': 35,
        '2b': 12,
        '3b': 1,
        hr: 14,
        r: 38,
        rbi: 48,
        bb: 24,
        ibb: 4,
        hbp: 5,
        so: 52,
        sb: 2,
        cs: 1,
        sf: 4,
        sh: 0,
        avg: 0.313,
        obp: 0.395,
        slg: 0.545,
        ops: 0.940,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.398,
        wrc_plus: 158,
        ops_plus: 164,
        iso: 0.232,
        babip: 0.298,
        k_pct: 0.228,
        bb_pct: 0.105,
        k_minus_bb_pct: -0.123,
        war: 3.4,
        re24: 22.6,
        wpa: 1.6,
        clutch: 0.2,
        avg_li: 1.04,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 94.8,
        launch_angle_avg: 14.2,
        hard_hit_pct: 52.4,
        barrel_rate: 16.2,
        xwoba: 0.412,
        xba: 0.295,
        xslg: 0.568,
        sweet_spot_pct: 36.8,
      },
    },
  },
  {
    id: 'p_004',
    name: 'Dylan Rodriguez',
    team: 'Texas',
    conference: 'Big 12',
    division: 'D1',
    position: 'SP',
    bats: 'R',
    throws: 'R',
    classYear: 'Junior',
    stats: {
      pitching: {
        w: 9,
        l: 2,
        era: 2.84,
        g: 15,
        gs: 15,
        cg: 2,
        sho: 1,
        sv: 0,
        ip: 95.1,
        h: 72,
        r: 34,
        er: 30,
        hr: 6,
        bb: 24,
        ibb: 1,
        hbp: 5,
        so: 118,
        wp: 4,
        bk: 0,
        bf: 378,
        whip: 1.01,
      },
    },
    advancedStats: {
      pitching: {
        fip: 2.52,
        xfip: 2.68,
        era_minus: 58,
        fip_minus: 52,
        k_per_9: 11.14,
        bb_per_9: 2.27,
        hr_per_9: 0.57,
        k_minus_bb_pct: 0.249,
        war: 4.2,
        re24: -32.4,
        wpa: 3.4,
        avg_li: 1.18,
      },
    },
    trackingStats: {
      pitching: {
        fastball_velo_avg: 95.4,
        spin_rate_avg: 2380,
        extension_avg: 6.4,
        release_height_avg: 5.8,
        xera: 2.92,
        xfip_plus: 145,
        stuff_plus: 128,
        location_plus: 115,
      },
    },
  },
  {
    id: 'p_005',
    name: 'Ethan Parker',
    team: 'Arkansas',
    conference: 'SEC',
    division: 'D1',
    position: 'SP',
    bats: 'L',
    throws: 'L',
    classYear: 'Sophomore',
    stats: {
      pitching: {
        w: 8,
        l: 3,
        era: 3.12,
        g: 14,
        gs: 14,
        cg: 1,
        sho: 0,
        sv: 0,
        ip: 89.2,
        h: 68,
        r: 36,
        er: 31,
        hr: 8,
        bb: 28,
        ibb: 0,
        hbp: 6,
        so: 106,
        wp: 6,
        bk: 1,
        bf: 362,
        whip: 1.07,
      },
    },
    advancedStats: {
      pitching: {
        fip: 3.01,
        xfip: 3.18,
        era_minus: 64,
        fip_minus: 62,
        k_per_9: 10.64,
        bb_per_9: 2.81,
        hr_per_9: 0.80,
        k_minus_bb_pct: 0.215,
        war: 3.6,
        re24: -28.2,
        wpa: 2.8,
        avg_li: 1.14,
      },
    },
    trackingStats: {
      pitching: {
        fastball_velo_avg: 92.8,
        spin_rate_avg: 2420,
        extension_avg: 6.2,
        release_height_avg: 5.6,
        xera: 3.24,
        xfip_plus: 138,
        stuff_plus: 118,
        location_plus: 122,
      },
    },
  },
  {
    id: 'p_006',
    name: 'Connor Blake',
    team: 'Stanford',
    conference: 'Pac-12',
    division: 'D1',
    position: '1B',
    bats: 'L',
    throws: 'L',
    classYear: 'Junior',
    stats: {
      batting: {
        pa: 252,
        ab: 218,
        h: 74,
        '1b': 42,
        '2b': 16,
        '3b': 2,
        hr: 14,
        r: 51,
        rbi: 58,
        bb: 31,
        ibb: 5,
        hbp: 2,
        so: 48,
        sb: 4,
        cs: 2,
        sf: 3,
        sh: 0,
        avg: 0.339,
        obp: 0.417,
        slg: 0.578,
        ops: 0.995,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.412,
        wrc_plus: 164,
        ops_plus: 170,
        iso: 0.239,
        babip: 0.335,
        k_pct: 0.190,
        bb_pct: 0.123,
        k_minus_bb_pct: -0.067,
        war: 3.6,
        re24: 26.8,
        wpa: 1.9,
        clutch: 0.6,
        avg_li: 1.06,
      },
    },
    trackingStats: {
      batting: {
        exit_velo_avg: 92.6,
        launch_angle_avg: 13.8,
        hard_hit_pct: 47.8,
        barrel_rate: 13.4,
        xwoba: 0.402,
        xba: 0.322,
        xslg: 0.562,
        sweet_spot_pct: 37.2,
      },
    },
  },
  {
    id: 'p_007',
    name: 'Brandon Lee',
    team: 'UC Irvine',
    conference: 'Big West',
    division: 'D1',
    position: '3B',
    bats: 'R',
    throws: 'R',
    classYear: 'Senior',
    stats: {
      batting: {
        pa: 218,
        ab: 192,
        h: 58,
        '1b': 36,
        '2b': 13,
        '3b': 1,
        hr: 8,
        r: 34,
        rbi: 42,
        bb: 22,
        ibb: 1,
        hbp: 3,
        so: 42,
        sb: 6,
        cs: 3,
        sf: 2,
        sh: 1,
        avg: 0.302,
        obp: 0.376,
        slg: 0.469,
        ops: 0.845,
      },
    },
    advancedStats: {
      batting: {
        woba: 0.368,
        wrc_plus: 142,
        ops_plus: 148,
        iso: 0.167,
        babip: 0.318,
        k_pct: 0.193,
        bb_pct: 0.101,
        k_minus_bb_pct: -0.092,
        war: 2.8,
        re24: 18.6,
        wpa: 1.2,
        clutch: 0.3,
        avg_li: 1.02,
      },
    },
  },
  {
    id: 'p_008',
    name: 'Michael Santos',
    team: 'Coastal Carolina',
    conference: 'Sun Belt',
    division: 'D1',
    position: 'CL',
    bats: 'R',
    throws: 'R',
    classYear: 'Junior',
    stats: {
      pitching: {
        w: 4,
        l: 2,
        era: 1.92,
        g: 28,
        gs: 0,
        cg: 0,
        sho: 0,
        sv: 14,
        ip: 42.1,
        h: 28,
        r: 11,
        er: 9,
        hr: 2,
        bb: 12,
        ibb: 1,
        hbp: 2,
        so: 58,
        wp: 3,
        bk: 0,
        bf: 166,
        whip: 0.95,
      },
    },
    advancedStats: {
      pitching: {
        fip: 2.14,
        xfip: 2.42,
        era_minus: 39,
        fip_minus: 44,
        k_per_9: 12.33,
        bb_per_9: 2.55,
        hr_per_9: 0.43,
        k_minus_bb_pct: 0.277,
        war: 2.2,
        re24: -18.4,
        wpa: 2.8,
        avg_li: 1.68,
      },
    },
    trackingStats: {
      pitching: {
        fastball_velo_avg: 97.2,
        spin_rate_avg: 2450,
        extension_avg: 6.6,
        release_height_avg: 5.9,
        xera: 2.28,
        xfip_plus: 152,
        stuff_plus: 142,
        location_plus: 108,
      },
    },
  },
];
