# Phase 3: Test Protocol — 25 Variable Sets

Each set exercises a different design scenario through the canonical narrative pipeline (root pdf-export.ts).

## Methodology

For each set, the canonical pipeline computes:
1. **Step 1**: Q_rational (C×I×A/3.6), Q_weir (1.705×Lw×Hw^1.5), Q_velocity (A_stream×V_mean), Q_design = MAX
2. **Step 2**: Ventway area (A_vent = N×b×h), A_RTL, A_HFL, % obstruction at RTL/HFL, HFL velocity, afflux (h = (V²/17.88+0.015)×(A_HFL/A_vent)²−1)
3. **Step 3**: Lacey's scour (R = 0.473×(Q/f)^⅓), Dm = 1.27×R, FBL = HFL - Dm, D_fdn, BFL
4. **Step 4**: DeadLoad, SiltLoad, LiveLoad → total vertical load
5. **Step 5**: F_drag, F_uplift, F_anchor, stability checks
6. **Step 6**: Face wall checks (overturning, sliding)

## Test Variable Sets

### SET 01 — Tropical Small Catchment (governing: Rational Method)
| Variable | Value |
|----------|-------|
| projectName | Bridge-01: Tropical Creek |
| catchmentArea | 0.8 km² |
| runoffCoefficient | 0.55 |
| rainfallIntensity | 120 mm/hr |
| surplusWeirLength | 8.0 m |
| heightOfFallWeir | 0.30 m |
| streamAreaHFL | 8.5 m² |
| meanVelocityHFL | 1.1 m/s |
| hfl | 5.800 | ofl | 5.100 | lbl | 4.200 |
| rtl | 5.850 | bottomDeck | 5.500 | carriageW | 7.5 |
| numVents | 3 | ventWidth | 2.0 | ventHeight | 1.5 |
| approachVelocity | 1.0 | siltFactor | 0.8 | cdVent | 0.9 |
| deckWidth | 7.5 | deckSpan | 5.0 | deckThickness | 0.35 | numSpans | 3 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.0 | siltLoadDeck | 1.5 |
| SBC | 10.0 t/m² | d_LBL | 2.0 |

**Expected**: Q_design ≈ 60.0 cumecs (Rational governs). Afflux ≈ 0.15m. Scour depth ≈ 1.2m. %ObsRTL < 70%, %ObsHFL < 30%.

---

### SET 02 — Temperate Large Catchment (governing: Weir Formula)
| Variable | Value |
|----------|-------|
| projectName | Bridge-02: Temperate River |
| catchmentArea | 45.0 km² |
| runoffCoefficient | 0.40 |
| rainfallIntensity | 60 mm/hr |
| surplusWeirLength | 18.0 m |
| heightOfFallWeir | 0.80 m |
| streamAreaHFL | 35.0 m² |
| meanVelocityHFL | 1.5 m/s |
| hfl | 12.500 | ofl | 11.200 | lbl | 10.500 |
| rtl | 11.800 | bottomDeck | 11.300 | carriageW | 10.0 |
| numVents | 4 | ventWidth | 3.0 | ventHeight | 2.0 |
| approachVelocity | 1.2 | siltFactor | 1.2 | cdVent | 4.1 |
| deckWidth | 10.0 | deckSpan | 8.0 | deckThickness | 0.50 | numSpans | 4 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.8 | siltLoadDeck | 1.0 |
| SBC | 20.0 t/m² | d_LBL | 3.0 |

**Expected**: Q_design ≈ 85.0 cumecs (Weir governs). Afflux ≈ 0.20m. Scour depth ≈ 2.1m.

---

### SET 03 — Wide Floodplain, Flat Slope (governing: Area-Velocity)
| Variable | Value |
|----------|-------|
| projectName | Bridge-03: Flat Floodplain |
| catchmentArea | 120.0 km² |
| runoffCoefficient | 0.35 |
| rainfallIntensity | 50 mm/hr |
| surplusWeirLength | 25.0 m |
| heightOfFallWeir | 1.20 m |
| streamAreaHFL | 120.0 m² |
| meanVelocityHFL | 2.5 m/s |
| hfl | 8.500 | ofl | 7.800 | lbl | 7.200 |
| rtl | 8.100 | bottomDeck | 7.800 | carriageW | 12.0 |
| numVents | 5 | ventWidth | 3.5 | ventHeight | 2.5 |
| approachVelocity | 1.5 | siltFactor | 1.5 | cdVent | 4.1 |
| deckWidth | 12.0 | deckSpan | 10.0 | deckThickness | 0.60 | numSpans | 5 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.5 | siltLoadDeck | 0.8 |
| SBC | 15.0 t/m² | d_LBL | 2.5 |

**Expected**: Q_design ≈ 300 cumecs (Area-Velocity governs). Afflux ≈ 0.35m. Scour depth ≈ 3.5m.

---

### SET 04 — Rocky Strata, High SBC (foundation safe at shallow depth)
| Variable | Value |
|----------|-------|
| projectName | Bridge-04: Rocky Stream |
| catchmentArea | 3.5 km² |
| runoffCoefficient | 0.60 |
| rainfallIntensity | 150 mm/hr |
| surplusWeirLength | 5.0 m |
| heightOfFallWeir | 0.20 m |
| streamAreaHFL | 5.0 m² |
| meanVelocityHFL | 2.0 m/s |
| hfl | 15.000 | ofl | 14.200 | lbl | 13.800 |
| rtl | 14.500 | bottomDeck | 14.200 | carriageW | 6.0 |
| numVents | 2 | ventWidth | 2.5 | ventHeight | 1.5 |
| approachVelocity | 1.8 | siltFactor | 0.6 | cdVent | 0.9 |
| deckWidth | 6.0 | deckSpan | 4.5 | deckThickness | 0.30 | numSpans | 2 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.2 | siltLoadDeck | 2.0 |
| SBC | 50.0 t/m² | d_LBL | 4.5 |

**Expected**: Q_design ≈ 50 cumecs. Shallow scour ≈ 0.5m. FBL well above rock. Foundation depth safe.

---

### SET 05 — Soft Soil, Low SBC (deep foundation required)
| Variable | Value |
|----------|-------|
| projectName | Bridge-05: Soft Soil Crossing |
| catchmentArea | 8.0 km² |
| runoffCoefficient | 0.50 |
| rainfallIntensity | 100 mm/hr |
| surplusWeirLength | 12.0 m |
| heightOfFallWeir | 0.50 m |
| streamAreaHFL | 15.0 m² |
| meanVelocityHFL | 1.3 m/s |
| hfl | 6.500 | ofl | 5.800 | lbl | 5.200 |
| rtl | 6.100 | bottomDeck | 5.850 | carriageW | 8.0 |
| numVents | 3 | ventWidth | 2.0 | ventHeight | 1.2 |
| approachVelocity | 0.9 | siltFactor | 2.0 | cdVent | 0.9 |
| deckWidth | 8.0 | deckSpan | 6.0 | deckThickness | 0.40 | numSpans | 3 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.0 | siltLoadDeck | 1.2 |
| SBC | 5.0 t/m² | d_LBL | 3.0 |

**Expected**: Q_design ≈ 111 cumecs. Moderate scour ≈ 2.0m. Deep foundation needed.

---

### SET 06 — Minimal Vent Area (tight constraint)
| Variable | Value |
|----------|-------|
| projectName | Bridge-06: Constrained Vent |
| catchmentArea | 5.0 km² |
| runoffCoefficient | 0.45 |
| rainfallIntensity | 90 mm/hr |
| surplusWeirLength | 10.0 m |
| heightOfFallWeir | 0.40 m |
| streamAreaHFL | 12.0 m² |
| meanVelocityHFL | 1.8 m/s |
| hfl | 9.000 | ofl | 8.300 | lbl | 7.800 |
| rtl | 8.800 | bottomDeck | 8.500 | carriageW | 9.0 |
| numVents | 2 | ventWidth | 1.5 | ventHeight | 1.0 |
| approachVelocity | 1.4 | siltFactor | 1.0 | cdVent | 0.9 |
| deckWidth | 9.0 | deckSpan | 7.0 | deckThickness | 0.45 | numSpans | 3 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.0 | siltLoadDeck | 1.0 |
| SBC | 10.0 t/m² | d_LBL | 2.5 |

**Expected**: Q_design ≈ 67.5 cumecs. Small A_vent → high % obstruction at HFL (> 30%). DESIGN FAIL — need more vents.

---

### SET 07 — Generous Vent Area (all checks pass easily)
| Variable | Value |
|----------|-------|
| projectName | Bridge-07: Wide Vent |
| catchmentArea | 15.0 km² |
| runoffCoefficient | 0.42 |
| rainfallIntensity | 70 mm/hr |
| surplusWeirLength | 15.0 m |
| heightOfFallWeir | 0.60 m |
| streamAreaHFL | 25.0 m² |
| meanVelocityHFL | 1.6 m/s |
| hfl | 7.500 | ofl | 6.800 | lbl | 6.200 |
| rtl | 7.000 | bottomDeck | 6.700 | carriageW | 11.0 |
| numVents | 5 | ventWidth | 3.0 | ventHeight | 2.5 |
| approachVelocity | 1.1 | siltFactor | 1.0 | cdVent | 0.9 |
| deckWidth | 11.0 | deckSpan | 8.0 | deckThickness | 0.50 | numSpans | 4 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.8 | siltLoadDeck | 0.8 |
| SBC | 20.0 t/m² | d_LBL | 2.0 |

**Expected**: Q_design ≈ 128 cumecs. A_vent ample. %ObsRTL < 70%, %ObsHFL < 30%. All checks PASS.

---

### SET 08 — High Afflux Scenario (approach velocity critical)
| Variable | Value |
|----------|-------|
| projectName | Bridge-08: High Velocity Approach |
| catchmentArea | 25.0 km² |
| runoffCoefficient | 0.48 |
| rainfallIntensity | 110 mm/hr |
| surplusWeirLength | 14.0 m |
| heightOfFallWeir | 0.70 m |
| streamAreaHFL | 40.0 m² |
| meanVelocityHFL | 3.0 m/s |
| hfl | 10.000 | ofl | 9.200 | lbl | 8.600 |
| rtl | 9.500 | bottomDeck | 9.150 | carriageW | 10.0 |
| numVents | 3 | ventWidth | 2.5 | ventHeight | 1.8 |
| approachVelocity | 2.5 | siltFactor | 0.9 | cdVent | 4.1 |
| deckWidth | 10.0 | deckSpan | 7.5 | deckThickness | 0.45 | numSpans | 3 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.8 | siltLoadDeck | 1.0 |
| SBC | 15.0 t/m² | d_LBL | 2.5 |

**Expected**: Q_design ≈ 120 cumecs. High V_HFL → larger afflux. Orifice method applies (h < 1.4×Dd).

---

### SET 09 — IRC Class AA Heavy Load (high live load, large deck)
| Variable | Value |
|----------|-------|
| projectName | Bridge-09: Highway Grade |
| catchmentArea | 20.0 km² |
| runoffCoefficient | 0.44 |
| rainfallIntensity | 85 mm/hr |
| surplusWeirLength | 12.0 m |
| heightOfFallWeir | 0.50 m |
| streamAreaHFL | 18.0 m² |
| meanVelocityHFL | 1.7 m/s |
| hfl | 8.000 | ofl | 7.300 | lbl | 6.800 |
| rtl | 7.800 | bottomDeck | 7.400 | carriageW | 12.0 |
| numVents | 4 | ventWidth | 3.0 | ventHeight | 2.0 |
| approachVelocity | 1.3 | siltFactor | 1.1 | cdVent | 0.9 |
| deckWidth | 12.0 | deckSpan | 9.0 | deckThickness | 0.55 | numSpans | 4 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.0 | siltLoadDeck | 1.5 |
| SBC | 15.0 t/m² | d_LBL | 3.0 |

**Expected**: Q_design ≈ 75 cumecs. Heavy dead + live loads. Uplift check critical. W_LL > W_self.

---

### SET 10 — Low Manning's n (smooth concrete channel)
| Variable | Value |
|----------|-------|
| projectName | Bridge-10: Concrete Channel |
| catchmentArea | 6.0 km² |
| runoffCoefficient | 0.50 |
| rainfallIntensity | 95 mm/hr |
| surplusWeirLength | 9.0 m |
| heightOfFallWeir | 0.35 m |
| streamAreaHFL | 10.0 m² |
| meanVelocityHFL | 2.8 m/s |
| hfl | 6.000 | ofl | 5.400 | lbl | 5.000 |
| rtl | 5.700 | bottomDeck | 5.400 | carriageW | 7.0 |
| numVents | 3 | ventWidth | 2.0 | ventHeight | 1.2 |
| approachVelocity | 2.0 | siltFactor | 0.7 | cdVent | 0.9 |
| deckWidth | 7.0 | deckSpan | 5.5 | deckThickness | 0.35 | numSpans | 3 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.6 | siltLoadDeck | 1.0 |
| SBC | 25.0 t/m² | d_LBL | 2.0 |

**Expected**: Q_design ≈ 83 cumecs. High V due to low n. Lower scour depth. n=0.05 for smooth section, but siltFactor=0.7 for Lacey.

---

### SET 11 — High Manning's n (vegetated, rough channel)
| Variable | Value |
|----------|-------|
| projectName | Bridge-11: Vegetated Floodplain |
| catchmentArea | 30.0 km² |
| runoffCoefficient | 0.38 |
| rainfallIntensity | 55 mm/hr |
| surplusWeirLength | 20.0 m |
| heightOfFallWeir | 1.00 m |
| streamAreaHFL | 80.0 m² |
| meanVelocityHFL | 1.0 m/s |
| hfl | 11.000 | ofl | 10.200 | lbl | 9.800 |
| rtl | 10.500 | bottomDeck | 10.100 | carriageW | 14.0 |
| numVents | 5 | ventWidth | 3.5 | ventHeight | 2.5 |
| approachVelocity | 0.8 | siltFactor | 2.5 | cdVent | 4.1 |
| deckWidth | 14.0 | deckSpan | 12.0 | deckThickness | 0.60 | numSpans | 5 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.4 | siltLoadDeck | 0.6 |
| SBC | 10.0 t/m² | d_LBL | 3.5 |

**Expected**: Q_design ≈ 168 cumecs (Weir may govern). Lower velocity → lower afflux but wider waterway needed. Higher silt factor → deeper scour.

---

### SET 12 — Coastal Region (high wave/uplift loads)
| Variable | Value |
|----------|-------|
| projectName | Bridge-12: Coastal Crossing |
| catchmentArea | 10.0 km² |
| runoffCoefficient | 0.42 |
| rainfallIntensity | 130 mm/hr |
| surplusWeirLength | 11.0 m |
| heightOfFallWeir | 0.45 m |
| streamAreaHFL | 14.0 m² |
| meanVelocityHFL | 2.2 m/s |
| hfl | 7.000 | ofl | 6.500 | lbl | 6.000 |
| rtl | 6.800 | bottomDeck | 6.500 | carriageW | 8.0 |
| numVents | 3 | ventWidth | 2.5 | ventHeight | 1.5 |
| approachVelocity | 1.6 | siltFactor | 1.3 | cdVent | 0.9 |
| deckWidth | 8.0 | deckSpan | 6.0 | deckThickness | 0.40 | numSpans | 3 |
| liveLoadType | IRC Class AA | waterDensity | 1025 | concreteDensity | 2500 | dragCoefficient | 2.5 | siltLoadDeck | 1.3 |
| SBC | 12.0 t/m² | d_LBL | 3.0 |

**Expected**: Q_design ≈ 120 cumecs. Higher water density → greater uplift. Higher drag coefficient due to coastal exposure.

---

### SET 13 — Steep Slope, High Gravity Flow
| Variable | Value |
|----------|-------|
| projectName | Bridge-13: Mountain Stream |
| catchmentArea | 2.0 km² |
| runoffCoefficient | 0.70 |
| rainfallIntensity | 160 mm/hr |
| surplusWeirLength | 6.0 m |
| heightOfFallWeir | 0.25 m |
| streamAreaHFL | 4.0 m² |
| meanVelocityHFL | 3.5 m/s |
| hfl | 20.000 | ofl | 18.500 | lbl | 18.000 |
| rtl | 19.200 | bottomDeck | 18.900 | carriageW | 5.0 |
| numVents | 2 | ventWidth | 1.8 | ventHeight | 1.2 |
| approachVelocity | 2.8 | siltFactor | 0.5 | cdVent | 0.9 |
| deckWidth | 5.0 | deckSpan | 4.0 | deckThickness | 0.25 | numSpans | 2 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.5 | siltLoadDeck | 2.5 |
| SBC | 30.0 t/m² | d_LBL | 5.0 |

**Expected**: Q_design ≈ 78 cumecs. Very high velocity → low afflux (self-cleansing). Steep slope means short foundation.

---

### SET 14 — Very Wide Multi-Span Commercial Crossing
| Variable | Value |
|----------|-------|
| projectName | Bridge-14: Commercial Highway |
| catchmentArea | 80.0 km² |
| runoffCoefficient | 0.36 |
| rainfallIntensity | 65 mm/hr |
| surplusWeirLength | 22.0 m |
| heightOfFallWeir | 0.90 m |
| streamAreaHFL | 60.0 m² |
| meanVelocityHFL | 2.0 m/s |
| hfl | 9.500 | ofl | 8.700 | lbl | 8.100 |
| rtl | 9.000 | bottomDeck | 8.600 | carriageW | 15.0 |
| numVents | 6 | ventWidth | 4.0 | ventHeight | 3.0 |
| approachVelocity | 1.4 | siltFactor | 1.0 | cdVent | 4.1 |
| deckWidth | 15.0 | deckSpan | 12.0 | deckThickness | 0.65 | numSpans | 6 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.6 | siltLoadDeck | 0.7 |
| SBC | 20.0 t/m² | d_LBL | 2.8 |

**Expected**: Q_design ≈ 180 cumecs. Maximum vent area provided. Very low % obstruction. All checks PASS easily.

---

### SET 15 — Edge Case: HFL Above RTL (submerged design critical)
| Variable | Value |
|----------|-------|
| projectName | Bridge-15: High Flood Critical |
| catchmentArea | 4.0 km² |
| runoffCoefficient | 0.52 |
| rainfallIntensity | 140 mm/hr |
| surplusWeirLength | 7.0 m |
| heightOfFallWeir | 0.35 m |
| streamAreaHFL | 7.5 m² |
| meanVelocityHFL | 2.3 m/s |
| hfl | 6.500 | ofl | 6.000 | lbl | 5.900 |
| rtl | 6.050 | bottomDeck | 5.800 | carriageW | 6.5 |
| numVents | 2 | ventWidth | 1.5 | ventHeight | 1.0 |
| approachVelocity | 1.1 | siltFactor | 1.5 | cdVent | 0.9 |
| deckWidth | 6.5 | deckSpan | 5.0 | deckThickness | 0.30 | numSpans | 2 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.0 | siltLoadDeck | 1.8 |
| SBC | 8.0 t/m² | d_LBL | 1.5 |

**Expected**: Q_design ≈ 45 cumecs. HFL very close to RTL. Small vent area → %ObsHFL may approach 30% limit. Critical design case.

---

### SET 16 — Extreme Flood Scenario (500-year return period)
| Variable | Value |
|----------|-------|
| projectName | Bridge-16: Extreme Flood |
| catchmentArea | 35.0 km² |
| runoffCoefficient | 0.65 |
| rainfallIntensity | 200 mm/hr |
| surplusWeirLength | 20.0 m |
| heightOfFallWeir | 1.50 m |
| streamAreaHFL | 85.0 m² |
| meanVelocityHFL | 4.0 m/s |
| hfl | 18.000 | ofl | 16.500 | lbl | 15.800 |
| rtl | 17.200 | bottomDeck | 16.800 | carriageW | 12.0 |
| numVents | 6 | ventWidth | 4.0 | ventHeight | 3.5 |
| approachVelocity | 3.5 | siltFactor | 1.8 | cdVent | 4.1 |
| deckWidth | 12.0 | deckSpan | 10.0 | deckThickness | 0.70 | numSpans | 6 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.0 | siltLoadDeck | 2.0 |
| SBC | 18.0 t/m² | d_LBL | 4.0 |

**Expected**: Q_design ≈ 400+ cumecs. Extreme velocity → very high afflux. Requires massive vent area. Critical stability checks.

---

### SET 17 — Minimum Viable Crossing (single vent, minimal span)
| Variable | Value |
|----------|-------|
| projectName | Bridge-17: Minimal Crossing |
| catchmentArea | 0.5 km² |
| runoffCoefficient | 0.40 |
| rainfallIntensity | 80 mm/hr |
| surplusWeirLength | 5.0 m |
| heightOfFallWeir | 0.25 m |
| streamAreaHFL | 3.5 m² |
| meanVelocityHFL | 0.8 m/s |
| hfl | 3.200 | ofl | 2.800 | lbl | 2.500 |
| rtl | 3.000 | bottomDeck | 2.800 | carriageW | 4.5 |
| numVents | 1 | ventWidth | 3.0 | ventHeight | 1.0 |
| approachVelocity | 0.6 | siltFactor | 0.9 | cdVent | 0.9 |
| deckWidth | 4.5 | deckSpan | 3.0 | deckThickness | 0.25 | numSpans | 1 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.8 | siltLoadDeck | 0.5 |
| SBC | 8.0 t/m² | d_LBL | 1.5 |

**Expected**: Q_design ≈ 15 cumecs. Single vent → high obstruction risk. Minimal cost design.

---

### SET 18 — Urban Drainage Channel (high runoff, confined space)
| Variable | Value |
|----------|-------|
| projectName | Bridge-18: Urban Drainage |
| catchmentArea | 2.5 km² |
| runoffCoefficient | 0.75 |
| rainfallIntensity | 140 mm/hr |
| surplusWeirLength | 8.0 m |
| heightOfFallWeir | 0.45 m |
| streamAreaHFL | 12.0 m² |
| meanVelocityHFL | 2.5 m/s |
| hfl | 7.500 | ofl | 6.800 | lbl | 6.300 |
| rtl | 7.100 | bottomDeck | 6.800 | carriageW | 9.0 |
| numVents | 3 | ventWidth | 2.2 | ventHeight | 1.8 |
| approachVelocity | 2.0 | siltFactor | 1.4 | cdVent | 0.9 |
| deckWidth | 9.0 | deckSpan | 6.5 | deckThickness | 0.40 | numSpans | 3 |
| liveLoadType | IRC Class 70R | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.9 | siltLoadDeck | 1.2 |
| SBC | 12.0 t/m² | d_LBL | 2.2 |

**Expected**: Q_design ≈ 73 cumecs. High C due to urbanization. Confined vent space. Moderate afflux.

---

### SET 19 — Agricultural Area (low runoff, wide channel)
| Variable | Value |
|----------|-------|
| projectName | Bridge-19: Agricultural Crossing |
| catchmentArea | 18.0 km² |
| runoffCoefficient | 0.25 |
| rainfallIntensity | 70 mm/hr |
| surplusWeirLength | 30.0 m |
| heightOfFallWeir | 0.80 m |
| streamAreaHFL | 150.0 m² |
| meanVelocityHFL | 0.9 m/s |
| hfl | 5.000 | ofl | 4.500 | lbl | 4.100 |
| rtl | 4.700 | bottomDeck | 4.400 | carriageW | 10.0 |
| numVents | 4 | ventWidth | 4.0 | ventHeight | 2.0 |
| approachVelocity | 0.7 | siltFactor | 1.6 | cdVent | 4.1 |
| deckWidth | 10.0 | deckSpan | 8.0 | deckThickness | 0.45 | numSpans | 4 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.5 | siltLoadDeck | 0.6 |
| SBC | 10.0 t/m² | d_LBL | 2.0 |

**Expected**: Q_design ≈ 88 cumecs (Weir governs due to wide channel). Low velocity → low afflux. Wide vents provided.

---

### SET 20 — Desert Flash Flood (high intensity, short duration)
| Variable | Value |
|----------|-------|
| projectName | Bridge-20: Desert Flash Flood |
| catchmentArea | 15.0 km² |
| runoffCoefficient | 0.35 |
| rainfallIntensity | 180 mm/hr |
| surplusWeirLength | 12.0 m |
| heightOfFallWeir | 0.60 m |
| streamAreaHFL | 25.0 m² |
| meanVelocityHFL | 3.2 m/s |
| hfl | 9.000 | ofl | 8.200 | lbl | 7.600 |
| rtl | 8.600 | bottomDeck | 8.200 | carriageW | 8.0 |
| numVents | 4 | ventWidth | 2.8 | ventHeight | 2.2 |
| approachVelocity | 2.8 | siltFactor | 0.8 | cdVent | 0.9 |
| deckWidth | 8.0 | deckSpan | 6.0 | deckThickness | 0.50 | numSpans | 4 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.2 | siltLoadDeck | 1.5 |
| SBC | 15.0 t/m² | d_LBL | 2.5 |

**Expected**: Q_design ≈ 262 cumecs. High intensity → Rational governs. High velocity → significant afflux.

---

### SET 21 — Tidal Estuary (variable water level, salinity)
| Variable | Value |
|----------|-------|
| projectName | Bridge-21: Tidal Estuary |
| catchmentArea | 12.0 km² |
| runoffCoefficient | 0.45 |
| rainfallIntensity | 100 mm/hr |
| surplusWeirLength | 15.0 m |
| heightOfFallWeir | 0.70 m |
| streamAreaHFL | 45.0 m² |
| meanVelocityHFL | 1.4 m/s |
| hfl | 8.500 | ofl | 7.800 | lbl | 7.200 |
| rtl | 8.100 | bottomDeck | 7.700 | carriageW | 11.0 |
| numVents | 4 | ventWidth | 3.5 | ventHeight | 2.5 |
| approachVelocity | 1.2 | siltFactor | 1.9 | cdVent | 4.1 |
| deckWidth | 11.0 | deckSpan | 8.5 | deckThickness | 0.55 | numSpans | 4 |
| liveLoadType | IRC Class AA | waterDensity | 1025 | concreteDensity | 2500 | dragCoefficient | 2.3 | siltLoadDeck | 1.4 |
| SBC | 14.0 t/m² | d_LBL | 3.0 |

**Expected**: Q_design ≈ 150 cumecs. Higher water density → greater uplift. Tidal effects on HFL. Corrosion considerations.

---

### SET 22 — Glacier Melt Stream (cold water, high sediment)
| Variable | Value |
|----------|-------|
| projectName | Bridge-22: Glacier Melt |
| catchmentArea | 8.0 km² |
| runoffCoefficient | 0.55 |
| rainfallIntensity | 90 mm/hr |
| surplusWeirLength | 10.0 m |
| heightOfFallWeir | 0.50 m |
| streamAreaHFL | 18.0 m² |
| meanVelocityHFL | 2.8 m/s |
| hfl | 11.000 | ofl | 10.200 | lbl | 9.600 |
| rtl | 10.600 | bottomDeck | 10.200 | carriageW | 7.0 |
| numVents | 3 | ventWidth | 2.5 | ventHeight | 2.0 |
| approachVelocity | 2.4 | siltFactor | 2.2 | cdVent | 0.9 |
| deckWidth | 7.0 | deckSpan | 5.5 | deckThickness | 0.45 | numSpans | 3 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 2.0 | siltLoadDeck | 2.2 |
| SBC | 16.0 t/m² | d_LBL | 2.8 |

**Expected**: Q_design ≈ 110 cumecs. High sediment load → deeper scour. Cold water effects on concrete.

---

### SET 23 — Railway Bridge (heavy static load, different code)
| Variable | Value |
|----------|-------|
| projectName | Bridge-23: Railway Crossing |
| catchmentArea | 6.0 km² |
| runoffCoefficient | 0.48 |
| rainfallIntensity | 95 mm/hr |
| surplusWeirLength | 9.0 m |
| heightOfFallWeir | 0.40 m |
| streamAreaHFL | 14.0 m² |
| meanVelocityHFL | 1.9 m/s |
| hfl | 7.200 | ofl | 6.500 | lbl | 6.000 |
| rtl | 6.800 | bottomDeck | 6.400 | carriageW | 8.0 |
| numVents | 3 | ventWidth | 2.2 | ventHeight | 1.8 |
| approachVelocity | 1.5 | siltFactor | 1.1 | cdVent | 0.9 |
| deckWidth | 8.0 | deckSpan | 6.0 | deckThickness | 0.60 | numSpans | 3 |
| liveLoadType | IRC Class AA | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.9 | siltLoadDeck | 1.8 |
| SBC | 20.0 t/m² | d_LBL | 2.5 |

**Expected**: Q_design ≈ 76 cumecs. Railway loading → very high dead load. Thick deck required. Stability critical.

---

### SET 24 — Emergency Access (minimal design, rapid deployment)
| Variable | Value |
|----------|-------|
| projectName | Bridge-24: Emergency Access |
| catchmentArea | 1.2 km² |
| runoffCoefficient | 0.42 |
| rainfallIntensity | 85 mm/hr |
| surplusWeirLength | 6.0 m |
| heightOfFallWeir | 0.30 m |
| streamAreaHFL | 5.0 m² |
| meanVelocityHFL | 1.0 m/s |
| hfl | 4.500 | ofl | 4.000 | lbl | 3.600 |
| rtl | 4.200 | bottomDeck | 3.900 | carriageW | 5.0 |
| numVents | 2 | ventWidth | 2.0 | ventHeight | 1.2 |
| approachVelocity | 0.8 | siltFactor | 1.0 | cdVent | 0.9 |
| deckWidth | 5.0 | deckSpan | 3.5 | deckThickness | 0.30 | numSpans | 2 |
| liveLoadType | IRC Class 70R | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.7 | siltLoadDeck | 0.8 |
| SBC | 8.0 t/m² | d_LBL | 1.8 |

**Expected**: Q_design ≈ 24 cumecs. Minimal design for emergency access. Lower safety factors acceptable for temporary use.

---

### SET 25 — Heritage Site (aesthetic constraints, limited modification)
| Variable | Value |
|----------|-------|
| projectName | Bridge-25: Heritage Site |
| catchmentArea | 4.5 km² |
| runoffCoefficient | 0.50 |
| rainfallIntensity | 110 mm/hr |
| surplusWeirLength | 8.0 m |
| heightOfFallWeir | 0.45 m |
| streamAreaHFL | 11.0 m² |
| meanVelocityHFL | 1.6 m/s |
| hfl | 6.800 | ofl | 6.100 | lbl | 5.600 |
| rtl | 6.400 | bottomDeck | 6.000 | carriageW | 7.5 |
| numVents | 3 | ventWidth | 2.0 | ventHeight | 1.5 |
| approachVelocity | 1.3 | siltFactor | 1.2 | cdVent | 0.9 |
| deckWidth | 7.5 | deckSpan | 5.5 | deckThickness | 0.35 | numSpans | 3 |
| liveLoadType | IRC Class A | waterDensity | 1000 | concreteDensity | 2500 | dragCoefficient | 1.8 | siltLoadDeck | 1.0 |
| SBC | 12.0 t/m² | d_LBL | 2.2 |

**Expected**: Q_design ≈ 68 cumecs. Aesthetic constraints limit vent size. Careful balance of form and function.

---

## Output Verification Checklist (per set)

For each of the 25 sets, the generated PDF must contain:

- [ ] Cover page with correct project name and design philosophy
- [ ] Section 1: Design Philosophy & Scope (all 14 sections present)
- [ ] Section 2–3: Hydraulic data with narrative prose before each formula
- [ ] All formula blocks use `fml()` format (Formula → Values → Result → Reference)
- [ ] All checks use `chk()` format (computed value, limit, PASS/FAIL badge)
- [ ] All tables have a "Remarks" or interpretive column
- [ ] Notes (`note()`) interpreting key results
- [ ] Code compliance references (IRC SP:82, IRC SP:13, IRC:5-1985, Lacey, etc.)
- [ ] PASS/FAIL indicators for ventilation, scour, and stability checks
- [ ] A4 portrait orientation
- [ ] Narrative paragraphs (`para()`) explaining design rationale, not just raw numbers