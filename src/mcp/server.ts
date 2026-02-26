import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { fetchScoreboard, fetchBoxScore, fetchStandings, fetchRankings } from '../lib/espnAPI';
import { getGameData } from '../lib/espnGameData';

const TOOLS: Tool[] = [
  {
    name: 'get_scoreboard',
    description: 'Get live college baseball scoreboard with current games, scores, and game status',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of games to return (default: 50)',
        },
      },
    },
    readOnlyHint: true,
  },
  {
    name: 'get_game_box_score',
    description: 'Get detailed box score for a specific college baseball game including batting and pitching stats',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'ESPN game ID',
        },
      },
      required: ['gameId'],
    },
    readOnlyHint: true,
  },
  {
    name: 'get_game_play_by_play',
    description: 'Get play-by-play data for a specific college baseball game',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'ESPN game ID',
        },
      },
      required: ['gameId'],
    },
    readOnlyHint: true,
  },
  {
    name: 'get_standings',
    description: 'Get college baseball conference standings',
    inputSchema: {
      type: 'object',
      properties: {
        group: {
          type: 'string',
          description: 'Conference ID (e.g., "50" for SEC, "1" for ACC)',
        },
      },
    },
    readOnlyHint: true,
  },
  {
    name: 'get_rankings',
    description: 'Get current Top 25 college baseball rankings',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    readOnlyHint: true,
  },
  {
    name: 'calculate_sabermetrics',
    description: 'Calculate advanced sabermetric statistics (wOBA, wRC+, FIP, etc.) from batting/pitching lines',
    inputSchema: {
      type: 'object',
      properties: {
        statType: {
          type: 'string',
          enum: ['batting', 'pitching'],
          description: 'Type of stats to analyze',
        },
        stats: {
          type: 'object',
          description: 'Raw stats object with appropriate fields',
        },
      },
      required: ['statType', 'stats'],
    },
    readOnlyHint: true,
  },
];

const server = new Server(
  {
    name: 'college-baseball-sabermetrics-api',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_scoreboard': {
        const limit = (args?.limit as number) || 50;
        const scoreboard = await fetchScoreboard(limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(scoreboard, null, 2),
            },
          ],
        };
      }

      case 'get_game_box_score': {
        const gameId = args?.gameId as string;
        if (!gameId) {
          throw new Error('gameId is required');
        }
        const boxScore = await fetchBoxScore(gameId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(boxScore, null, 2),
            },
          ],
        };
      }

      case 'get_game_play_by_play': {
        const gameId = args?.gameId as string;
        if (!gameId) {
          throw new Error('gameId is required');
        }
        const gameData = await getGameData(gameId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(gameData.playByPlay, null, 2),
            },
          ],
        };
      }

      case 'get_standings': {
        const group = (args?.group as string) || undefined;
        const standings = await fetchStandings(group);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(standings, null, 2),
            },
          ],
        };
      }

      case 'get_rankings': {
        const rankings = await fetchRankings();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rankings, null, 2),
            },
          ],
        };
      }

      case 'calculate_sabermetrics': {
        const statType = args?.statType as 'batting' | 'pitching';
        const stats = args?.stats as any;

        if (!statType || !stats) {
          throw new Error('statType and stats are required');
        }

        let result: any = {};

        if (statType === 'batting') {
          const { pa, ab, h, hr, bb, hbp, sf, k, _1b, _2b, _3b } = stats;
          
          const singles = _1b || (h - (_2b || 0) - (_3b || 0) - (hr || 0));
          const doubles = _2b || 0;
          const triples = _3b || 0;
          
          const wBB = 0.69;
          const wHBP = 0.72;
          const w1B = 0.89;
          const w2B = 1.27;
          const w3B = 1.62;
          const wHR = 2.10;
          const wobaScale = 1.25;

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

          result = {
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
        } else if (statType === 'pitching') {
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

          result = {
            ERA: era.toFixed(2),
            FIP: fip.toFixed(2),
            WHIP: whip.toFixed(2),
            'K/9': k9.toFixed(1),
            'BB/9': bb9.toFixed(1),
            'HR/9': hr9.toFixed(2),
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('College Baseball Sabermetrics MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
