# Market Intelligence Engine
Live - **https://v0-marketintelligence.vercel.app**

A **narrative-centric market intelligence system** that helps you understand *what the market believes*, *why it believes it*, and *how exposed your portfolio is to those beliefs*.

This project treats **market narratives and assumptions as first-class objects**, rather than focusing solely on prices, indicators, or trading signals.

> This is a sensemaking tool — not a trading platform and not financial advice.

---

## Core Idea

Markets move through **stories and beliefs**, not just numbers.

Prices are outputs.  
Narratives are drivers.

Most tools answer:
> *“What happened?”*

This system asks:
> *“What does the market believe, how fragile is that belief, and how does my portfolio depend on it?”*

---

## What This System Does

- Extracts and tracks **market narratives**
- Scores narrative **confidence and decay**
- Maps **assets and portfolios** to underlying narratives
- Detects **belief concentration and fragility**
- Explains portfolio risk through **narrative drift**, not just volatility

---

## What This Is *Not*

❌ Not a stock picker  
❌ Not a buy/sell recommendation engine  
❌ Not a real-time trading dashboard  
❌ Not optimized for speed or alerts  

This system is optimized for **clarity, reflection, and understanding**.

---

## Key Concepts

### 1. Narratives (First-Class Objects)

A narrative is a structured market belief, for example:
- “AI Capex Supercycle”
- “US Soft Landing”
- “Rates Stay Higher for Longer”

Each narrative has:
- A confidence score
- Supporting and contradictory evidence
- Explicit assumptions
- A decay function (beliefs weaken without reinforcement)
- A history of how it evolved over time

Narratives are **stateful and alive**, not static notes.

---

### 2. Belief Graph

Narratives reinforce, overlap, or conflict with each other.

The system builds a **belief graph** where:
- Nodes = narratives
- Edges = reinforcement or conflict
- Weights = belief strength

This surfaces hidden dependencies and fragile belief chains.

---

### 3. Assets as Narrative Outputs

Assets do not “mean” anything on their own.

Each asset:
- Is influenced by multiple narratives
- Has weighted exposure to those narratives
- Can benefit from conflicting beliefs simultaneously

Price action becomes interpretable through narrative context.

---

### 4. Portfolios as Belief Structures

A portfolio is a **bundle of implicit narrative bets**, whether the investor realizes it or not.

The system analyzes portfolios as:
- Aggregated narrative exposure
- Concentrated assumption sets
- Time-evolving belief structures

This reframes risk entirely.

---

## Portfolio Intelligence (X, Y, Z)

### X — Narrative Exposure Mapping

Every portfolio is decomposed into:
- Narrative weights
- Confidence-adjusted exposure

This replaces sector-based thinking.

---

### Y — Belief Concentration & Fragility

The system detects:
- Narrative monocultures
- Overlapping assumptions
- Single-point-of-failure beliefs

Example insight:
> “41% of your portfolio depends on one fragile narrative.”

---

### Z — Narrative Drift Tracking

Risk can change **without trading**.

The system tracks:
- Narrative confidence over time
- Exposure changes driven by belief shifts

Example insight:
> “Your portfolio risk increased because the ‘Soft Landing’ narrative weakened.”

---

## Architecture Overview

This project is designed as an **LLM-native, state-first system**.

### Core Principles

- Narratives are **event-sourced**
- LLMs are **stateless transformers**
- UI is a **projection**, not a calculator
- No silent mutation of belief state

### High-Level Stack

- **Frontend:** Next.js (App Router), v0 components
- **UI Philosophy:** Calm, reflective, analytical
- **Intelligence Layer:** Modular logic for narratives, beliefs, portfolios
- **LLMs:** Used for extraction, synthesis, and critique — never as authorities
- **Data Model:** Event-sourced narratives + rebuildable projections

---

## Live Demo

👉 **https://v0-marketintelligence.vercel.app**

The demo focuses on:
- Narrative dashboards
- Asset narrative lenses
- Early portfolio intelligence concepts

This is an evolving prototype, not a finished product.

Designed first as a **personal market intelligence system**, with correctness and interpretability prioritized over features.

---

## Who This Is For

- Investors who think in **themes and narratives**
- People who want to understand *why* their portfolio behaves the way it does
- Builders exploring **LLMs as cognitive tools**, not automation gimmicks


## Disclaimer

This project is for **research and educational purposes only**.  
It does not provide financial advice or investment recommendations.
Not for commercial use.
---

## Next Directions

Planned and possible extensions include:
- Deeper belief graph visualization
- Narrative confidence decay modeling
- Portfolio scenario stress via belief breaks
- Shared narrative comparison across users

---

