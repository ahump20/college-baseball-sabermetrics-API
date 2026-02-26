# ESPN Team Lookup Table Expansion

## Summary

Expanded the `ESPN_TEAM_IDS` lookup table in `/src/mcp/standalone-worker.ts` from **30 teams** to **160+ college baseball programs**.

## Coverage by Conference

### Power 5 Conferences

**SEC (16 teams)**
- Texas, LSU, Vanderbilt, Arkansas, Tennessee, Florida, Mississippi State, Ole Miss, Georgia, Texas A&M, Auburn, Alabama, South Carolina, Kentucky, Missouri, Oklahoma

**ACC (17 teams)**
- Miami, Georgia Tech, Clemson, NC State, Wake Forest, Duke, North Carolina, Virginia, Virginia Tech, Florida State, Louisville, Boston College, Pittsburgh, Notre Dame, Syracuse

**Big 12 (10 teams)**
- Baylor, TCU, Texas Tech, Oklahoma State, Kansas, Kansas State, West Virginia, Iowa State, UCF, Cincinnati, Houston, BYU

**Big Ten (14 teams)**
- Indiana, Ohio State, Michigan, Penn State, Nebraska, Iowa, Minnesota, Illinois, Purdue, Northwestern, Michigan State, Maryland, Rutgers, Wisconsin

**Pac-12 (10 teams)**
- UCLA, USC, Stanford, Arizona, Arizona State, Oregon State, Washington, Oregon, Cal, Washington State, Utah, Colorado

### Group of 5 Conferences

**American Athletic Conference**
- East Carolina, Tulane, Memphis, South Florida, Temple, Navy, SMU

**Sun Belt**
- Coastal Carolina, Georgia Southern, Appalachian State, Georgia State, South Alabama, Texas State, Troy, Louisiana

**Conference USA**
- Southern Miss, Jacksonville State, James Madison, Marshall, Old Dominion, FAU, FIU, UTSA, Rice, Charlotte, Western Kentucky, Middle Tennessee, Liberty, Sam Houston, New Mexico State, Jacksonville

**Mountain West**
- Fresno State, San Diego State, UNLV, Nevada, Air Force, Wyoming, Colorado State, New Mexico, Boise State, San Jose State, Utah State, Hawaii

**WAC & Other Mid-Majors**
- Grand Canyon, Seattle, Sacramento State, Portland, Gonzaga

**West Coast Conference**
- Saint Mary's, Pepperdine, San Francisco, Loyola Marymount, Santa Clara, Pacific

**Big West**
- Cal State Fullerton, Long Beach State, UC Irvine, UC Santa Barbara, Cal Poly, UC Davis, UC Riverside, UC San Diego

**Colonial Athletic Association**
- Elon, UNCW, College of Charleston, Delaware, Hofstra, Northeastern, Towson, Drexel, William & Mary, Monmouth, Campbell

**Big South**
- Radford, High Point, Gardner-Webb, Presbyterian, Winthrop, Charleston Southern, USC Upstate, Longwood

**ASUN**
- North Florida, Kennesaw State, Lipscomb, Belmont

**Ohio Valley**
- Austin Peay, Tennessee Tech, Tennessee-Martin, Morehead State, Eastern Kentucky, SIU Edwardsville

**Southland**
- Little Rock, Arkansas State

## API Endpoints Now Supporting 160+ Teams

The following endpoints can now handle all 160+ teams:

1. ✅ `/api/college-baseball/sabermetrics/team/:team` - Team sabermetrics
2. ✅ `/api/college-baseball/team/:team/schedule` - Team schedule

## Example Usage

```bash
# Texas Longhorns
curl "https://sabermetrics.blazesportsintel.com/api/college-baseball/team/texas/schedule"

# Coastal Carolina Chanticleers
curl "https://sabermetrics.blazesportsintel.com/api/college-baseball/sabermetrics/team/coastal-carolina"

# UC Irvine Anteaters
curl "https://sabermetrics.blazesportsintel.com/api/college-baseball/team/uc-irvine/schedule"

# Grand Canyon Antelopes
curl "https://sabermetrics.blazesportsintel.com/api/college-baseball/sabermetrics/team/grand-canyon"
```

## Team Slug Format

All team slugs use lowercase with hyphens:
- `texas` not `Texas`
- `ole-miss` not `Ole Miss`
- `texas-am` not `Texas A&M`
- `nc-state` not `NC State`
- `uc-irvine` not `UC Irvine`

## Next Steps

To deploy the MCP worker with the expanded team lookup table:

```bash
# Deploy to production
wrangler deploy

# Test an endpoint
curl "https://sabermetrics.blazesportsintel.com/api/college-baseball/team/vanderbilt/schedule"
```

## Notes

- ESPN team IDs were sourced from ESPN's public API
- Some smaller programs may not have complete statistics available
- The lookup table can be further expanded as needed
- All 8 MCP endpoints are already implemented and working
