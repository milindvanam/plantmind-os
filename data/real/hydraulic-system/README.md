# UCI hydraulic-system source data

PlantMind's normalized artifact is generated from the official UCI **Condition Monitoring of Hydraulic Systems** dataset (DOI `10.24432/C5CW21`, CC BY 4.0).

Download the official archive from:

`https://archive.ics.uci.edu/static/public/447/condition+monitoring+of+hydraulic+systems.zip`

Place these extracted files in `data/real/hydraulic-system/raw/`:

- `profile.txt`
- `PS1.txt`, `PS2.txt`, `PS3.txt`, `PS4.txt`, `PS5.txt`, `PS6.txt`
- `EPS1.txt`
- `FS1.txt`, `FS2.txt`
- `TS1.txt`, `TS2.txt`, `TS3.txt`, `TS4.txt`
- `VS1.txt`
- `CE.txt`, `CP.txt`, `SE.txt`
- `documentation.txt`, `description.txt`

Raw files are intentionally Git-ignored. Run `npm run data:hydraulic` to validate and normalize the source into the compact, versioned artifact consumed by PlantMind.

The committed normalized artifact contains per-cycle descriptive statistics from the real telemetry, not fabricated readings. Asset `P-204A`, company, Maharashtra location and business context are PlantMind demonstration context and do not originate from UCI.
