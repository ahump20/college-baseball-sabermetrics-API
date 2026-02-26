interface Env {
  BSI_API_KEY?: string;
  RATE_LIMIT_KV?: KVNamespace;
  TEAM_STATS_KV?: KVNamespace;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX_REQUESTS = 60;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Content-Type': 'application/json',
    };

    if (url.pathname === '/api/proxy' && request.method === 'POST') {
      return handleProxyRequest(request, corsHeaders);
    }

    if (url.pathname === '/api/sec-teams' && request.method === 'GET') {
      return handleSECTeamsRequest(env, corsHeaders);
    }

    if (url.pathname.startsWith('/api/team/') && request.method === 'GET') {
      const teamId = url.pathname.split('/').pop();
      return handleTeamRequest(teamId || '', env, corsHeaders);
    }

    if (url.pathname === '/health' || url.pathname === '/' || url.pathname === '/favicon.svg' || url.pathname === '/favicon.ico') {
      if (url.pathname === '/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            service: 'college-baseball-sabermetrics-mcp',
            version: '1.0.0',
          }),
          { headers: corsHeaders }
        );
      }
      return new Response('OK', { headers: corsHeaders });
    }

    if ((url.pathname.startsWith('/api/') || url.pathname === '/mcp') && request.method === 'POST') {
      const authResult = await checkAuth(request, env);
      if (!authResult.authorized) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Valid API key required. Set header: Authorization: Bearer YOUR_KEY'
          }),
          { status: 401, headers: corsHeaders }
        );
      }

      const rateLimitResult = await checkRateLimit(request, env);
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: '60 requests/minute limit. Retry after 60 seconds.'
          }),
          { 
            status: 429, 
            headers: {
              ...corsHeaders,
              'Retry-After': '60',
              'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
              'X-RateLimit-Remaining': String(rateLimitResult.remaining || 0),
              'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            }
          }
        );
      }

      if (url.pathname === '/mcp') {
        try {
          const mcpRequest = await request.json() as any;
          const { jsonrpc, id, method, params } = mcpRequest;

          if (jsonrpc !== '2.0') {
            return new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                id,
                error: { code: -32600, message: 'Invalid Request' },
              }),
              { headers: corsHeaders }
            );
          }

          let result: any;

          switch (method) {
            case 'initialize':
              result = {
                protocolVersion: '2024-11-05',
                capabilities: { tools: {} },
                serverInfo: {
                name: 'college-baseball-sabermetrics-api',
                version: '1.0.0',
              },
            };
            break;

          case 'tools/list':
            result = {
              tools: [
                {
                  name: 'get_scoreboard',
                  description: 'Get live college baseball scoreboard',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      limit: { type: 'number', description: 'Max games (default: 50)' },
                    },
                  },
                  readOnlyHint: true,
                },
                {
                  name: 'get_game_details',
                  description: 'Get box score for a specific game',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      gameId: { type: 'string', description: 'ESPN game ID' },
                    },
                    required: ['gameId'],
                  },
                  readOnlyHint: true,
                },
                {
                  name: 'get_game_play_by_play',
                  description: 'Get play-by-play for a game',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      gameId: { type: 'string', description: 'ESPN game ID' },
                    },
                    required: ['gameId'],
                  },
                  readOnlyHint: true,
                },
                {
                  name: 'get_standings',
                  description: 'Get conference standings',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      season: { type: 'number', description: 'Season year (optional)' },
                    },
                  },
                  readOnlyHint: true,
                },
                {
                  name: 'get_rankings',
                  description: 'Get Top 25 rankings',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      week: { type: 'number', description: 'Week number (optional)' },
                    },
                  },
                  readOnlyHint: true,
                },
                {
                  name: 'calculate_batting_metrics',
                  description: 'Calculate wOBA, OPS, ISO, etc.',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      stats: {
                        type: 'object',
                        description: 'Batting stats (pa, ab, h, hr, bb, k, etc.)',
                      },
                    },
                    required: ['stats'],
                  },
                  readOnlyHint: true,
                },
                {
                  name: 'calculate_pitching_metrics',
                  description: 'Calculate FIP, ERA, WHIP, K/9, etc.',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      stats: {
                        type: 'object',
                        description: 'Pitching stats (ip, h, er, hr, bb, k, etc.)',
                      },
                    },
                    required: ['stats'],
                  },
                  readOnlyHint: true,
                },
              ],
            };
            break;

          case 'tools/call': {
            const { name, arguments: args } = params;
            result = await handleToolCall(name, args || {});
            break;
          }

          default:
            return new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                id,
                error: { code: -32601, message: `Method not found: ${method}` },
              }),
              { headers: corsHeaders, status: 404 }
            );
        }

        return new Response(
          JSON.stringify({ jsonrpc: '2.0', id, result }),
          { 
            headers: {
              ...corsHeaders,
              'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
              'X-RateLimit-Remaining': String(rateLimitResult.remaining || 0),
              'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            }
          }
        );
      } catch (error: any) {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 0,
            error: { code: -32603, message: error.message || 'Internal error' },
          }),
          { headers: corsHeaders, status: 500 }
        );
      }
    }
  }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

async function checkAuth(request: Request, env: Env): Promise<{ authorized: boolean; error?: string }> {
  if (!env.BSI_API_KEY) {
    return { authorized: true };
  }

  const authHeader = request.headers.get('Authorization');
  const apiKeyHeader = request.headers.get('X-API-Key');

  const providedKey = authHeader?.replace('Bearer ', '') || apiKeyHeader;

  if (!providedKey) {
    return { authorized: false, error: 'Missing API key. Provide via Authorization: Bearer <key> or X-API-Key header.' };
  }

  if (providedKey !== env.BSI_API_KEY) {
    return { authorized: false, error: 'Invalid API key' };
  }

  return { authorized: true };
}

async function checkRateLimit(request: Request, env: Env): Promise<{ allowed: boolean; remaining?: number; resetTime?: number }> {
  if (!env.RATE_LIMIT_KV) {
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, resetTime: Date.now() + RATE_LIMIT_WINDOW };
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `ratelimit:${ip}`;

  const now = Date.now();
  const dataStr = await env.RATE_LIMIT_KV.get(key);
  
  let data: RateLimitData;
  
  if (!dataStr) {
    data = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
  } else {
    data = JSON.parse(dataStr);
    
    if (now > data.resetTime) {
      data = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    } else {
      data.count += 1;
    }
  }

  await env.RATE_LIMIT_KV.put(key, JSON.stringify(data), {
    expirationTtl: Math.ceil(RATE_LIMIT_WINDOW / 1000),
  });

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - data.count);
  const allowed = data.count <= RATE_LIMIT_MAX_REQUESTS;

  return {
    allowed,
    remaining,
    resetTime: data.resetTime,
  };
}

async function handleToolCall(name: string, args: any): Promise<any> {
  const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball';

  switch (name) {
    case 'get_scoreboard': {
      const limit = args.limit || 50;
      const response = await fetch(`${ESPN_BASE}/scoreboard?limit=${limit}`);
      const data = await response.json();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(data, null, 2),
        }],
      };
    }

    case 'get_game_details': {
      const { gameId } = args;
      if (!gameId) throw new Error('gameId required');
      const response = await fetch(`${ESPN_BASE}/summary?event=${gameId}`);
      const data = await response.json();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(data, null, 2),
        }],
      };
    }

    case 'get_game_play_by_play': {
      const { gameId } = args;
      if (!gameId) throw new Error('gameId required');
      const response = await fetch(`${ESPN_BASE}/summary?event=${gameId}`);
      const data = await response.json();
      const plays = data.plays || [];
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(plays, null, 2),
        }],
      };
    }

    case 'get_standings': {
      const season = args.season || new Date().getFullYear();
      const response = await fetch(`${ESPN_BASE}/standings?season=${season}`);
      const data = await response.json();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(data, null, 2),
        }],
      };
    }

    case 'get_rankings': {
      const week = args.week || '';
      const url = week ? `${ESPN_BASE}/rankings?week=${week}` : `${ESPN_BASE}/rankings`;
      const response = await fetch(url);
      const data = await response.json();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(data, null, 2),
        }],
      };
    }

    case 'calculate_batting_metrics': {
      const { stats } = args;
      if (!stats) throw new Error('stats required');

      const { pa, ab, h, hr, bb, hbp, sf, k, _1b, _2b, _3b } = stats;
      
      const singles = _1b || (h - (_2b || 0) - (_3b || 0) - (hr || 0));
      const doubles = _2b || 0;
      const triples = _3b || 0;
      
      const wBB = 0.69, wHBP = 0.72, w1B = 0.89, w2B = 1.27, w3B = 1.62, wHR = 2.10;

      const numerator = (bb || 0) * wBB + (hbp || 0) * wHBP + singles * w1B + doubles * w2B + triples * w3B + (hr || 0) * wHR;
      const wOBA = pa > 0 ? numerator / pa : 0;
      
      const avg = ab > 0 ? h / ab : 0;
      const obp = pa > 0 ? (h + bb + hbp) / pa : 0;
      const slg = ab > 0 ? (singles + 2 * doubles + 3 * triples + 4 * hr) / ab : 0;
      const ops = obp + slg;
      const iso = slg - avg;
      const babip = (ab - k - hr + sf) > 0 ? (h - hr) / (ab - k - hr + sf) : 0;
      const bbPct = pa > 0 ? (bb / pa) * 100 : 0;
      const kPct = pa > 0 ? (k / pa) * 100 : 0;

      const metrics = {
        wOBA: wOBA.toFixed(3),
        AVG: avg.toFixed(3),
        OBP: obp.toFixed(3),
        SLG: slg.toFixed(3),
        OPS: ops.toFixed(3),
        ISO: iso.toFixed(3),
        BABIP: babip.toFixed(3),
        'BB%': bbPct.toFixed(1),
        'K%': kPct.toFixed(1),
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(metrics, null, 2),
        }],
      };
    }

    case 'calculate_pitching_metrics': {
      const { stats } = args;
      if (!stats) throw new Error('stats required');

      const { ip, h, r, er, hr, bb, hbp, k, ibb } = stats;
      
      const ipOuts = typeof ip === 'string' ? parseFloat(ip) * 3 : ip * 3;
      const innings = ipOuts / 3;

      const whip = innings > 0 ? (bb + h) / innings : 0;
      const k9 = innings > 0 ? (k / innings) * 9 : 0;
      const bb9 = innings > 0 ? (bb / innings) * 9 : 0;
      const hr9 = innings > 0 ? (hr / innings) * 9 : 0;
      const era = innings > 0 ? (er / innings) * 9 : 0;

      const fipConstant = 3.10;
      const fip = innings > 0 ? (((13 * hr) + (3 * (bb + hbp - (ibb || 0))) - (2 * k)) / innings) + fipConstant : 0;

      const metrics = {
        ERA: era.toFixed(2),
        FIP: fip.toFixed(2),
        WHIP: whip.toFixed(2),
        'K/9': k9.toFixed(1),
        'BB/9': bb9.toFixed(1),
        'HR/9': hr9.toFixed(2),
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(metrics, null, 2),
        }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleProxyRequest(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body = await request.json();
    const { url, method = 'GET', headers = {}, body: requestBody } = body;

    if (!url) {
      return new Response(
        JSON.stringify({ ok: false, error: 'URL is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BSI-Scraper/1.0)',
        ...headers,
      },
    };

    if (requestBody && method !== 'GET') {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    }

    const response = await fetch(url, fetchOptions);
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const contentType = response.headers.get('content-type') || '';
    let data: any;
    let text: string | undefined;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('application/pdf')) {
      const arrayBuffer = await response.arrayBuffer();
      data = Array.from(new Uint8Array(arrayBuffer));
    } else {
      text = await response.text();
      data = text;
    }

    return new Response(
      JSON.stringify({
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        text,
      }),
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: null,
        error: error.message,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleSECTeamsRequest(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const teams = [
    'texas', 'alabama', 'arkansas', 'auburn', 'florida', 'georgia',
    'kentucky', 'lsu', 'mississippi-state', 'missouri', 'ole-miss',
    'south-carolina', 'tennessee', 'texas-am', 'vanderbilt', 'oklahoma'
  ];

  return new Response(
    JSON.stringify({ teams }),
    { headers: corsHeaders }
  );
}

async function handleTeamRequest(teamId: string, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  if (!env.TEAM_STATS_KV) {
    return new Response(
      JSON.stringify({ error: 'Team stats storage not configured' }),
      { status: 503, headers: corsHeaders }
    );
  }

  const cachedData = await env.TEAM_STATS_KV.get(`team:${teamId}`);
  
  if (cachedData) {
    return new Response(cachedData, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({ error: 'Team data not found', teamId }),
    { status: 404, headers: corsHeaders }
  );
}
