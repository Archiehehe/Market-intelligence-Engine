# Market Intelligence Engine

**Explain the market. Don’t predict it.**

Market Intelligence Engine is a narrative-centric market intelligence system that helps you understand **what the market believes**, **why it believes it**, and **how exposed your portfolio is to those beliefs** — without turning into a signal factory or a data dump.

Live Demo: https://marketintelligenceengine.vercel.app/  
Repository: https://github.com/Archiehehe/Market-Intelligence-Engine

> This is a sensemaking tool — not a trading platform and not financial advice.

* * *

## Core Philosophy

Most market tools do one of two things:

- **Predict prices**
- **Display raw data**

This project does something different:

> It explains market behavior using narrative + assumption attribution rather than prediction.

Key principles:

- Markets move on **stories** and **positioning**, not just numbers  
- There is no single “truth” — only **dominant explanations**  
- Clarity > certainty  
- Portfolios are bundles of **implicit beliefs**, whether you intended that or not

* * *

## The Core Question

This engine is built to answer one focused question:

> “What beliefs are driving this market (or this asset), how fragile are they, and what am I implicitly betting on?”

It does **not** attempt to answer:

- Should I buy or sell?
- What will the price do next?
- What is the optimal trade?

* * *

## What the Engine Produces

### 1) Narratives (First-Class Objects)

A **narrative** is a structured market belief, e.g.:

- “AI Capex Supercycle”
- “Soft Landing”
- “Higher for Longer”

Each narrative can carry:

- A confidence score
- Supporting vs contradictory evidence
- Explicit assumptions
- Decay (beliefs weaken without reinforcement)
- A history of how it evolved over time

### 2) Assumptions (The Load-Bearers)

Assumptions are the quiet claims inside narratives:

- “Earnings will re-accelerate”
- “Inflation will keep falling”
- “Liquidity stays available”

Making assumptions explicit lets you see:

- What must be true for the narrative to hold
- Which assumptions are doing the heavy lifting
- Where your portfolio is unknowingly concentrated

### 3) Belief Graph (Narratives Interact)

Narratives reinforce, overlap, or conflict.

The engine can represent this as a belief graph:

- Nodes = narratives  
- Edges = reinforcement / conflict  
- Weights = belief strength  

This surfaces hidden dependencies and fragile belief chains.

### 4) Portfolios as Belief Structures

Portfolios are not just sector weights.

They’re **belief structures**.

The goal is to surface:

- Narrative exposure
- Assumption concentration
- Narrative drift (risk changes without trading)

* * *

## Portfolio Intelligence (X, Y, Z)

### X — Narrative Exposure Mapping  
Decomposes a portfolio into narrative weights (optionally confidence-adjusted).  
This replaces sector-based thinking with belief-based thinking.

### Y — Belief Concentration & Fragility  
Detects narrative monocultures, overlapping assumptions, and single-point-of-failure beliefs.

Example insight:

> “41% of your portfolio depends on one fragile narrative.”

### Z — Narrative Drift Tracking  
Tracks how your risk shifts as beliefs change over time — even if prices stay flat.

Example insight:

> “Your portfolio risk increased because the ‘Soft Landing’ narrative weakened.”

* * *

## Included Tools (Bundled)

This project brings multiple tools from my account into one place (each also has its own repo):

- **Narrative Terminal** — https://marketnarrative.vercel.app/  
- **SnapJudgement** — https://snapjudgement.vercel.app/  
- **DipSnipe** — https://archiehehe.shinyapps.io/DipSnipe/  
- **Sector Momentum Tracker** — https://archiehehe.shinyapps.io/SectorMomentumTracker/

* * *

## Architecture Overview

### Core Principles

- Narratives are **event-sourced**
- The UI is a **projection**, not a calculator
- No silent mutation of belief state

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind + shadcn/ui
- Vercel deployment

* * *

## Local Development

> The repo uses a `pnpm-lock.yaml`, so **pnpm** is recommended.

```bash
# install deps
pnpm install

# run dev server
pnpm dev
