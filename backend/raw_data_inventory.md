# Raw Data Inventory

**Source:** `D:\datas\bhumi-data\raw\`
**Total:** 17 files, ~99.78 MB across 5 source directories.

---

## 1. `lgd/` — Local Government Directory (LGD)

Official identifiers for India's administrative units. 8 files, ~69.57 MB.

| File | Size | Rows | Description |
|---|---|---|---|
| `states.csv` | 0.53 KB | 36 | `state_code, state_name` — all states & UTs |
| `districts.csv` | 21.11 KB | 784 | `state_code, state_name, district_code, district_name` |
| `subdistricts.csv` | 196.28 KB | 7,090 | `district_code, district_name, subdistrict_code, subdistrict_name` |
| `villages.csv` | 22.57 MB | 676,891 | `subdistrict_code, subdistrict_name, village_code, village_name` |
| `original_exports/states.xlsx` | 5.52 KB | — | Original LGD export (XLSX) |
| `original_exports/districts.xlsx` | 34.01 KB | — | Original LGD export (XLSX) |
| `original_exports/subdistricts.xlsx` | 400.77 KB | — | Original LGD export (XLSX) |
| `original_exports/villages.xlsx` | 46.36 MB | — | Original LGD export (XLSX) |

**Purpose:** Populates `districts` table in Postgres, and supplies state/district/subdistrict/village codes for cross-referencing all other datasets.

---

## 2. `shc_nutrients/` — Soil Health Card Nutrients

State-wise soil nutrient counts by RKVY cycle + a sample-level granular dataset. 5 files, ~82.30 KB.

| File | Size | Rows | Description |
|---|---|---|---|
| `Nutrient.csv` | 3.29 KB | 21 | Cycle **2026-27** — state-level counts of samples per category (N/P/K/OC/pH/EC/S/Fe/Zn/Cu/B/Mn) |
| `Nutrient__1_.csv` | 6.78 KB | 33 | Cycle **2025-26**, same schema |
| `Nutrient__2_.csv` | 6.81 KB | 33 | Cycle **2024-25**, same schema |
| `Nutrient__3_.csv` | 5.92 KB | 30 | Cycle **2023-24**, same schema |
| `Soil_Nutrient_Analysis_Sample_Data.csv` | 59.46 KB | 500 | Sample-level: `year, state_name, state_code, district_name, district_code, block_name, block_code, village_name, village_code, nutrient_type, nutrient_name, nutrient_level, value` |

Each `Nutrient*.csv` has a 1-line preamble (`Cycle: ...  Scheme: Soil Health Card RKVY`) then the header row, then aggregated counts.

**Purpose:** Feeds nutrient lookup for crop recommendation & soil health alerts. The sample-level file can be mapped to ward/village via LGD codes.

---

## 3. `cgwb_groundwater/` — Central Ground Water Board

Groundwater level measurements. 2 files, ~27.27 MB.

| File | Size | Rows | Description |
|---|---|---|---|
| `groundwater_levels.csv` | 23.65 MB | 189,917 | Manual quarterly readings: `Station, Agency, State/District LGD Code, Tehsil, Block, Village, River, Basin, Tributary, Latitude, Longitude, Groundwater Level Quarterly Manual (meter)` |
| `telemetry/west_bengal_6_hourly_2026_2030.csv` | 3.62 MB | 30,346 | 6-hourly telemetry for West Bengal (2026–2030): same location schema, `Groundwater Level Telemetry 6 Hourly (meter)` |

**Purpose:** Supplies `groundwater_depth_m` in ward reference data. Fuels irrigation advice and drought/over-extraction alerts.

---

## 4. `icar_soil_zones/` — ICAR Soil Zones

Broad soil-zone mapping. 1 file, 0.93 KB.

| File | Size | Rows | Description |
|---|---|---|---|
| `soil_zones.csv` | 0.93 KB | 32 | `state_name, dominant_soil_type` — one dominant soil type per state/UT |

**Purpose:** Baseline `soil_type` for wards without SHC-level soil data. Used as fallback in `sync_ward_defaults_to_firestore`.

---

## 5. `imd_rainfall/` — IMD Rainfall

District-wise rainfall report. 1 file, 2.86 MB.

| File | Size | Pages | Description |
|---|---|---|---|
| `district_rainfall_2026-07-08.pdf` | 2.86 MB | 33 | jsPDF-generated table: S.No, MET.SUBDIVISION/UT/STATE/DISTRICT, ACTUAL(mm), NORMAL(mm), %DEP., CAT. Covers **daily** (08-Jul-2026) and **seasonal** (01-Jun to 08-Jul-2026) periods. |

**Purpose:** Supplies `avg_rainfall_mm` in ward reference data. Used for weather advisory & irrigation timing recommendations.

---

## Cross-Source Mapping

| Field in Postgres | Source | Join Key |
|---|---|---|
| `district_name`, `state_name` | LGD `districts.csv` | `district_code` |
| `soil_type` | ICAR `soil_zones.csv` (fallback) | `state_name` |
| `avg_rainfall_mm` | IMD PDF (extracted) | `district_name` |
| `groundwater_depth_m` | CGWB `groundwater_levels.csv` | `district_code` / Village |
| Nutrient profiles | SHC `Soil_Nutrient_Analysis_Sample_Data.csv` | `district_code` |

---

## Project-Level Documentation

`D:\datas\bhumi-data\README.md` — describes the *BHUMI Reference Data Fetcher* CLI (Python 3.11+) that inventories raw files, records SHA-256/rows/schema in `manifest.json`, and writes normalized CSV copies to `staging/`.
