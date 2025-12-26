# REQS.md — Educational Top-Down CSO Simulator

## 1. Project Overview

**Project Name:** Educational CSO Simulator  
**Type:** Web-based game  
**Genre:** Sports Simulation / Educational  
**Perspective:** Top-down (bird’s-eye view)  
**Target Audience:**  
- Young riders
- Horse riding students
- CSO enthusiasts
- Casual players interested in equestrian sports

**Core Vision:**  
A realistic, educational CSO (Concours de Saut d’Obstacles) simulator that teaches correct riding concepts (approach, rhythm, balance, line choice) through gameplay, with realistic controls and feedback — without exposing mathematical formulas.

---

## 2. Educational Objectives

The game must teach:
- Correct approach to an obstacle
- Importance of rhythm and pace
- Straightness before the jump
- Choosing the right takeoff point
- Course memorization and line strategy
- CSO rules and penalties

Learning happens implicitly, reinforced by feedback and progression.

---

## 3. Core Gameplay Loop

1. Player rides the course
2. Chooses lines and pace
3. Approaches obstacles correctly
4. Times the jump
5. Receives immediate riding feedback
6. Progresses to harder courses

---

## 4. Controls Philosophy

Controls must:
- Be simple to learn
- Reward precision and anticipation
- Penalize late or rushed decisions
- Mimic real riding aids conceptually

No arcade shortcuts (no jump boost, no mid-air steering).

---

## 5. Control Scheme (Realistic)

### 5.1 Movement & Pace

**Forward / Backward**
- Increase or decrease pace
- Discrete gaits:
  - Walk
  - Trot
  - Canter
  - Extended canter

Changing gait takes time (no instant speed change).

**Left / Right**
- Gradual turning radius
- Tight turns slow the horse
- Sharp turns before fences reduce jump quality

---

### 5.2 Balance & Straightness

- Slight lateral drift simulated
- Player must maintain straight approach
- Poor straightness increases rail knock probability

Optional visual assist:
- Centerline indicator (can be disabled)

---

### 5.3 Jump Control

**Single Jump Input**
- Player decides *when* to ask for the jump
- Takeoff distance automatically evaluated

Jump success depends on:
- Pace consistency
- Straightness
- Takeoff distance
- Obstacle type

No control once airborne.

---

## 6. Jump Evaluation (Hidden System)

Each jump is evaluated internally on:

- Approach rhythm
- Takeoff distance zone:
  - Too close
  - Ideal
  - Too long
- Horse balance
- Obstacle height & width

### Possible Outcomes:
- Clean jump
- Rail

