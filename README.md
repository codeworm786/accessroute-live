# AccessRoute Live (real-data version)

Run:  node server.js   then open http://localhost:3000   (internet required)

## Where the data comes from
| Feature | Source |
|---|---|
| Routes, time, distance, turn-by-turn | OSRM public routing (routing.openstreetmap.de) on OpenStreetMap |
| Ramps, dropped kerbs, lifts, escalators, stairs, tactile paving | OpenStreetMap via Overpass API (volunteer-mapped; no live working status exists) |
| Slope (wheelchair) | Open-Meteo elevation API (coarse terrain data) |
| Live traffic, incidents, closures | TomTom Traffic API: click "Add traffic key" (free key from developer.tomtom.com) |
| Place search | Nominatim (OpenStreetMap): type a place in Start/Destination and press Enter |
| Potholes, barricades, rallies, broken lifts | Community reports (stored in this browser; add a backend to share across users) |

## Known limits (be honest with judges)
- Transit and Emergency times are estimates (no free live transit feed).
- Lift/escalator *operational status* is not available from any open source.
- Reports are per-browser until a shared database is added.
- Public OSRM/Overpass servers are for demos, not heavy traffic.
