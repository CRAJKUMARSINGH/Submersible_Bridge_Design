# Directive: Submersible Bridge Design App — Output Reconciliation & Readability Closure

**Issued to:** Team 5 (Engineering)
**Objective:** Take the app from "computes correctly, reads poorly" to output that matches the reference sample in layout, sketches, and narrative meaningfulness — verified across 15 new variable sets, with zero regressions.

---

## 1. Situation

- **Root folder** holds the original build. Core computation logic is presumed sound (not in question here).
- **CODE-Junction/** holds three parallel patch folders from four prior engineers, each attempting to fix output formatting/readability independently. These have **not been reconciled** — they may conflict, duplicate work, or diverge from the reference sample in different directions.
- **The failure mode is singular and specific:** output format and readability. Numbers are right; presentation is not "storytelling" — data variables, formulas, and computation aren't woven into the technical-narrative style of the sample PDF, and layout/sketch fidelity is missing.
- **This directive's job:** stop the parallel-patch pattern, converge on one canonical output pipeline, and prove it against unseen inputs before calling it done.

---

## 2. Phase 1 — Audit & Reconciliation (Day 1–2)

1. Diff each of the 3 CODE-Junction folders against root. Catalog every change as one of:
   - **Computation change** (touches formulas/values) — flag for engineering review; do not merge silently.
   - **Output/formatting change** (touches layout, text generation, templating) — this is the in-scope work.
2. Build a single reconciliation matrix: `change → folder(s) that made it → keep / discard / merge-modified → rationale`.
3. Where two folders solved the same formatting problem differently, **do not average them** — pick the one closer to the sample, or write a third version. Document why.
4. Output of this phase: **one canonical branch** that supersedes all three patch folders. No cherry-picking from multiple folders in production going forward — one source of truth.

**Gate:** No Phase 2 work starts until the reconciliation matrix is reviewed and the canonical branch is agreed.

---

## 3. Phase 2 — Output Format Specification

Before touching code, extract a written spec from the sample PDF/text so "matches the sample" stops being subjective. For the reference bridge document, catalog:

| Element | What to extract from the sample |
|---|---|
| **Narrative structure** | The order in which story beats, context, and computation appear — is it problem → assumptions → formula → computation → result → implication, or something else? |
| **Variable presentation** | How a variable is first introduced (named, defined, unit) vs. referenced later in prose |
| **Formula presentation** | Notation style, whether formulas are inline, block, or paired with a plain-language restatement |
| **Computation walkthrough** | Whether substituted values are shown step-by-step or only the result, and how intermediate results are narrated |
| **Sketches/diagrams** | What's illustrated, at what fidelity, and where they're anchored relative to the text they support |
| **Tone/voice** | Formal technical, conversational technical, first-person design-log, etc. |
| **Layout/typography** | Section breaks, headers, callouts, captions, whitespace rhythm |

This becomes `output-spec.md` — the single reference Team 5 builds against and QA scores against. **Do not proceed on memory of "what the sample felt like."**

---

## 4. Phase 3 — Test Protocol: 15 New Variable Sets

1. Generate **15 distinct variable sets** covering the realistic range of the tool (vary span, depth, load class, material, submersion condition, etc. — not 15 trivial permutations of one case). Include at least 2 edge cases (extreme values) to stress the narrative generator, not just the math.
2. Run each set through the canonical pipeline. Produce 15 full output documents.
3. Store inputs + outputs together so any result is reproducible: `test-runs/set-01/input.json`, `set-01/output.pdf` (or equivalent), etc.

**No cherry-picking:** all 15 outputs get scored in Phase 4, not just the best-looking ones.

---

## 5. Phase 4 — Readability & Elegance QA Rubric

Score each of the 15 outputs against the sample on a fixed rubric (not vibes):

| Criterion | What "pass" looks like | Weight |
|---|---|---|
| Structural fidelity | Section order/presence matches `output-spec.md` | High |
| Variable introduction | Every variable named, defined, unit-labeled on first use | High |
| Formula clarity | Formulas presented per spec, substitutions shown, not just final numbers | High |
| Narrative cohesion | Reads as continuous technical storytelling, not a data dump with prose stitched between fields | High |
| Sketch/diagram presence & placement | Present where the sample has them, anchored to the relevant passage | Medium |
| Typography/layout consistency | Consistent headers, spacing, captions across all 15 outputs (not just one) | Medium |
| Numerical correctness (regression check) | Computed values match the pre-patch known-good values for the same inputs | Critical — any failure here blocks release regardless of formatting score |

Any output scoring below threshold on a High/Critical criterion goes back to Phase 5, not straight to sign-off.

---

## 6. Phase 5 — Correction & Re-iteration Loop

1. Fixes apply to the **canonical branch only** — no new parallel patch folders. This is the rule that failed last time; it does not get repeated.
2. After each correction pass, **re-run all 15 sets**, not just the ones that failed — formatting fixes can regress cases that previously passed.
3. Log each iteration: `iteration-N: what changed, which sets improved, which sets regressed, rubric scores before/after`.
4. Repeat until every one of the 15 outputs clears every High/Critical criterion and the numerical regression check is clean.

---

## 7. Definition of Done

- [ ] Reconciliation matrix complete; single canonical branch in place; CODE-Junction patch folders retired (archived, not deleted).
- [ ] `output-spec.md` written and approved as the readability reference.
- [ ] All 15 new variable sets produce output that passes every High/Critical rubric criterion.
- [ ] Numerical results for all 15 sets match known-good computation (zero silent formula drift introduced during formatting work).
- [ ] Iteration log shows convergence (scores trending up, no unresolved regressions in the final pass).
- [ ] Final sign-off comparison: sample document vs. one full generated output, side by side, reviewed by you directly before closing this out.

---

## 8. Ground Rules (why this attempt is different from the last four)

- **One branch, not parallel forks.** The last round's failure was four engineers solving the same problem in isolation with no reconciliation step — that's fixed by Phase 1 being mandatory and first.
- **Spec before code.** "Match the sample" isn't gradeable until `output-spec.md` exists. Skipping this is why prior attempts drifted.
- **Regression testing is non-negotiable.** Formatting work must never be allowed to silently touch computation. The rubric makes that a blocking, not advisory, check.
- **You review the final side-by-side yourself** before this is called complete — not a status report claiming success.

>>>>>lastly creat one input variable file *.xls or csv
>>>seed the excel file with seed variables>>
link to repo

test with 25 sets of variables
store outputs in date-time stamped subfolder
eNSURE THAT FINAL DESIGN APP IS IN ROOT FOLDER>>>>>draft infographic based beautiful cover page >>> ensure all drawings and sketches are part of design as per sample>>>> EMDURE 169 PAGES DESIGN
OUTPUT SHUD MATCH LINE NY LINE WITH SAMPLE EXCEPT COMPUTED FIGURES