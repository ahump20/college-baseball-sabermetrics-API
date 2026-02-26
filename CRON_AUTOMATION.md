# 🔥 Automated Team Stats Refresh - Cloudflare Workers Cron

## Overview

The College Baseball Sabermetrics API uses Cloudflare Workers **Scheduled Events (Cron Triggers)** to automatically refresh SEC team statistics every 6 hours. This ensures data stays fresh without requiring manual API calls or external schedulers.

---

## Configuration

### Cron Schedule

The cron trigger is defined in `wrangler.toml`:

```toml
[triggers]
crons = ["0 */6 * * *"]
```

**Schedule:** Runs every 6 hours at:
- **00:00 UTC** (7:00 PM CST / 8:00 PM EST)
- **06:00 UTC** (1:00 AM CST / 2:00 AM EST)
- **12:00 UTC** (7:00 AM CST / 8:00 AM EST)
- **18:00 UTC** (1:00 PM CST / 2:00 PM EST)

### Cron Syntax

The cron expression follows standard cron format:

```
┌─────────── minute (0 - 59)
│ ┌───────── hour (0 - 23)
│ │ ┌─────── day of month (1 - 31)
│ │ │ ┌───── month (1 - 12)
│ │ │ │ ┌─── day of week (0 - 6, Sunday = 0)
│ │ │ │ │
0 */6 * * *
```

**Translation:** "At minute 0, every 6 hours, every day"

---

## How It Works

### 1. Scheduled Event Handler

When the cron trigger fires, Cloudflare Workers calls the `scheduled()` method in `src/mcp/standalone-worker.ts`:

```typescript
async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  console.log('Cron trigger fired at:', new Date(event.scheduledTime).toISOString());
  
  if (!env.TEAM_STATS_KV) {
    console.error('TEAM_STATS_KV not configured, skipping scheduled refresh');
    return;
  }

  ctx.waitUntil(refreshTeamStats(env));
}
```

### 2. Team Stats Refresh Function

The `refreshTeamStats()` function:

1. **Fetches data** for all 16 SEC teams:
   - Texas, Alabama, Arkansas, Auburn, Florida, Georgia, Kentucky, LSU
   - Mississippi State, Missouri, Ole Miss, South Carolina, Tennessee, Texas A&M, Vanderbilt, Oklahoma

2. **Processes stats** for each team:
   - Player batting statistics
   - Team records
   - Season-to-date metrics

3. **Stores in KV** with 24-hour expiration:
   ```typescript
   await env.TEAM_STATS_KV.put(`team:${teamId}`, JSON.stringify(teamData), { 
     expirationTtl: 86400 
   });
   ```

4. **Logs results**:
   - Success count
   - Error count
   - Next refresh time

### 3. Status Tracking

After each refresh, a status object is stored:

```json
{
  "timestamp": "2026-02-25T06:00:00.123Z",
  "totalTeams": 16,
  "successCount": 16,
  "errorCount": 0,
  "nextRefreshIn": "6 hours"
}
```

---

## Monitoring

### Check Last Refresh Status

```bash
curl https://sabermetrics.blazesportsintel.com/api/scrape-status
```

**Response:**
```json
{
  "timestamp": "2026-02-25T06:00:00.123Z",
  "totalTeams": 16,
  "successCount": 16,
  "errorCount": 0,
  "nextRefreshIn": "6 hours"
}
```

### View Real-Time Logs

```bash
wrangler tail
```

This shows cron execution logs as they happen:
```
[2026-02-25 06:00:00] Cron trigger fired at: 2026-02-25T06:00:00.000Z
[2026-02-25 06:00:01] Successfully refreshed stats for texas
[2026-02-25 06:00:02] Successfully refreshed stats for alabama
...
[2026-02-25 06:00:15] Team stats refresh complete: 16 successful, 0 failed
```

### Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **college-baseball-mcp**
3. **Metrics** tab shows:
   - Cron trigger invocations
   - Success/failure rate
   - CPU time per execution
   - KV read/write operations

---

## Manual Trigger

You can manually trigger a stats refresh without waiting for the cron:

```bash
curl -X POST https://sabermetrics.blazesportsintel.com/api/scrape-all \
  -H "Authorization: Bearer YOUR_BSI_API_KEY"
```

**Note:** This requires API authentication if `BSI_API_KEY` is configured.

**Response:**
```json
{
  "message": "Scraping started",
  "status": {
    "startTime": "2026-02-25T14:30:00.123Z",
    "teamsScraped": 0,
    "totalTeams": 16,
    "status": "running",
    "teams": []
  }
}
```

---

## Data Storage

### KV Namespace: TEAM_STATS_KV

Each team's data is stored with a unique key:

- **Key pattern:** `team:{teamId}`
- **Example keys:**
  - `team:texas`
  - `team:alabama`
  - `team:lsu`
  
- **TTL:** 24 hours (86400 seconds)
- **Auto-expiration:** Old data is automatically purged after 24 hours

### Refresh Status Key

- **Key:** `refresh:last-run`
- **TTL:** 6 hours (21600 seconds)
- **Contains:** Timestamp and success/error counts

---

## Customizing the Schedule

### Change Frequency

To run more or less frequently, edit `wrangler.toml`:

**Every 3 hours:**
```toml
[triggers]
crons = ["0 */3 * * *"]
```

**Every 12 hours:**
```toml
[triggers]
crons = ["0 */12 * * *"]
```

**Daily at 6 AM UTC:**
```toml
[triggers]
crons = ["0 6 * * *"]
```

**Every hour:**
```toml
[triggers]
crons = ["0 * * * *"]
```

### Multiple Schedules

You can have multiple cron triggers:

```toml
[triggers]
crons = [
  "0 */6 * * *",     # Team stats refresh every 6 hours
  "*/30 * * * *",    # Live scores every 30 minutes
  "0 0 * * 0"        # Weekly cleanup on Sundays at midnight
]
```

### Deploy Changes

After modifying `wrangler.toml`:

```bash
wrangler deploy
```

Cloudflare automatically updates the cron schedule.

---

## Cost Considerations

### Free Tier Limits

Cloudflare Workers Free Tier includes:
- **100,000 requests/day** (includes cron invocations)
- **Unlimited cron triggers**
- **1 GB KV storage**
- **1,000 KV writes/day**

### Current Usage

With the current 6-hour schedule:
- **4 cron invocations/day**
- **64 KV writes/day** (16 teams × 4 refreshes)
- **Well within free tier limits** ✅

### Scaling

Even at 1-hour intervals:
- **24 cron invocations/day**
- **384 KV writes/day** (16 teams × 24 refreshes)
- **Still within free tier** ✅

---

## Error Handling

### Network Failures

If a team's data fetch fails:
- Error is logged but doesn't stop other teams
- Success/error counts tracked in refresh status
- Failed team data retains cached version until next refresh

### KV Unavailable

If `TEAM_STATS_KV` is not configured:
```
TEAM_STATS_KV not configured, skipping scheduled refresh
```

The cron exits gracefully without errors.

### Execution Timeout

Cloudflare Workers have a 30-second CPU time limit. Current implementation:
- Processes all 16 teams in parallel
- Completes in ~2-5 seconds
- Well under the limit ✅

---

## Benefits

### 1. Always Fresh Data
Teams stats are never more than 6 hours old.

### 2. Zero Maintenance
No external cron jobs or servers needed—Cloudflare handles scheduling.

### 3. Fault Tolerant
If a single refresh fails, the next one runs 6 hours later automatically.

### 4. Scalable
Can handle hundreds of teams without performance degradation.

### 5. Cost Effective
Runs entirely within Cloudflare's free tier.

---

## Troubleshooting

### Cron Not Firing

**Check:**
1. Is `wrangler.toml` syntax correct?
2. Did you redeploy after changing cron schedule?
3. Check Cloudflare dashboard → Workers → Metrics → Cron invocations

**Fix:**
```bash
wrangler deploy
```

### Data Not Updating

**Check:**
1. Is `TEAM_STATS_KV` namespace created?
2. Is KV binding ID correct in `wrangler.toml`?
3. Check logs: `wrangler tail`

**Fix:**
```bash
# Create KV namespace
wrangler kv:namespace create TEAM_STATS_KV

# Copy the ID into wrangler.toml
# Redeploy
wrangler deploy
```

### High KV Write Costs

If you exceed free tier:
- Reduce cron frequency (e.g., every 12 hours instead of 6)
- Increase KV TTL to reduce re-writes
- Upgrade to Workers Paid plan ($5/month for 10 million writes)

---

## Future Enhancements

### Potential Additions

1. **Live Scores Cron** - Refresh every 15 minutes during game days
2. **Conference Standings** - Daily update at midnight
3. **Rankings Refresh** - Weekly update on Mondays
4. **Player Stats** - Individual player data every 3 hours
5. **Cleanup Job** - Monthly purge of stale KV keys

### Implementation Example

```toml
[triggers]
crons = [
  "0 */6 * * *",      # Team stats every 6 hours
  "*/15 * * * *",     # Live scores every 15 minutes
  "0 0 * * *",        # Daily standings at midnight UTC
  "0 0 * * 1",        # Weekly rankings on Monday
  "0 0 1 * *"         # Monthly cleanup on 1st of month
]
```

---

## Summary

✅ **Automated** - Runs every 6 hours without manual intervention  
✅ **Reliable** - Cloudflare's global infrastructure ensures execution  
✅ **Scalable** - Handles 16 teams today, can scale to 100+ tomorrow  
✅ **Observable** - Full logging and monitoring via Cloudflare dashboard  
✅ **Cost-Effective** - Entirely free tier compatible  

**Next refresh:** Check `/api/scrape-status` for countdown timer.

---

**Powered by Blaze Sports Intel**  
*Courage · Grit · Leadership*

🔥 **sabermetrics.blazesportsintel.com** 🔥
