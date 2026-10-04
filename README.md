# ♿ AccessRoute Live

Accessible, real-time navigation for everyone: wheelchair users, pedestrians, cyclists, drivers, transit riders and emergency responders.

**Live demo:** https://codeworm786.github.io/accessroute-live/


## What it does
- 6 travel modes, each with its own time and distance on real streets
- Wheelchair mode: ramps, dropped kerbs, lifts, escalators and stairs along the route, plus slope
- Live traffic, incidents and road closures
- Community reports for potholes, barricades, broken ramps or lifts, rallies and waterlogging
- Turn-by-turn voice guidance that follows your real GPS position
- High-contrast mode for low-vision users

## Where the data comes from
| Feature | Source |
|---|---|
| Routes, time, distance, turn-by-turn | OSRM public routing on OpenStreetMap |
| Ramps, kerbs, lifts, escalators, stairs, tactile paving | OpenStreetMap via Overpass API |
| Slope (wheelchair) | Open-Meteo elevation API |
| Live traffic, incidents, closures | TomTom Traffic API (click "Add traffic key" in the app) |
| Place search | Nominatim (OpenStreetMap) |
| Potholes, barricades, rallies, broken lifts | Community reports |

## How to run locally
`node server.js`, then open http://localhost:3000 (internet required)

## Known limits
- Transit and Emergency times are estimates (no free live transit feed)
- Lift and escalator working status is not available from any open source
- Reports are stored per browser until a shared database is added
- Public routing and map-data servers are for demos, not heavy traffic

## Use "Demo walk"
A laptop doesn't move, so turn on "Demo walk" (bottom right of the map) before pressing Start Trip to see guidance without walking.

