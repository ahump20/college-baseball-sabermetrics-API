export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  category: string;
  params?: APIParam[];
  response: Record<string, unknown>;
}

export interface APIParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface SchemaTable {
  name: string;
  purpose: string;
  primaryKey: string;
  fields: SchemaField[];
  relationships: SchemaRelationship[];
  notes?: string;
}

export interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
}

export interface SchemaRelationship {
  type: 'one-to-many' | 'many-to-one' | 'many-to-many';
  target: string;
  description: string;
}

export interface Metric {
  id: string;
  name: string;
  category: 'box-only' | 'pbp-required' | 'tracking-required';
  formula: string;
  description: string;
  inputs: MetricInput[];
  contextAdjustments?: string[];
}

export interface MetricInput {
  name: string;
  label: string;
  type: 'number';
  placeholder: string;
  min?: number;
  max?: number;
}

export interface GameProvenance {
  gameId: string;
  status: 'provisional' | 'official' | 'corrected';
  events: ProvenanceEvent[];
  sources: SourceSystem[];
}

export interface ProvenanceEvent {
  timestamp: string;
  type: 'initial' | 'correction' | 'validation';
  description: string;
  source: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

export interface SourceSystem {
  id: string;
  name: string;
  type: 'licensed' | 'public' | 'internal';
  lastUpdated: string;
}

export interface CoverageData {
  division: string;
  conferences: ConferenceCoverage[];
}

export interface ConferenceCoverage {
  name: string;
  games: number;
  boxScore: number;
  playByPlay: number;
  tracking: number;
  trackingVendor?: string;
}
