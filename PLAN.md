# EquiJump - Implementation Plan

## Tech Stack

### Core
- **Next.js 16.1** (App Router, Turbopack, React Compiler)
- **React 19.2** (View Transitions)
- **TypeScript 5.x** (strict mode)
- **Phaser 3.80+** (game engine with Arcade physics)

### UI & Styling
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Menu animations
- **Radix UI** - Accessible components

### State Management
- **Zustand** - React ↔ Phaser state bridge

### Backend
- **NextAuth.js v5** - Auth (magic link + Google)
- **MongoDB** - Database
- **Mongoose** - ODM

### Testing
- **Vitest** - Unit tests
- **Playwright** - E2E tests

---

## Project Structure

```
equijump/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing page
│   ├── play/[courseId]/page.tsx    # Game page
│   ├── courses/page.tsx            # Course selection
│   ├── leaderboard/[courseId]/page.tsx
│   ├── auth/
│   │   └── signin/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── scores/route.ts
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── GlassPanel.tsx
│   │   └── Modal.tsx
│   ├── game/
│   │   ├── GameContainer.tsx       # Phaser mount
│   │   ├── HUDOverlay.tsx          # React HUD on top of canvas
│   │   └── TouchControls.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
│
├── engine/                          # Phaser (pure TypeScript)
│   ├── config.ts                    # Phaser.GameConfig
│   ├── scenes/
│   │   ├── BootScene.ts             # Asset loading
│   │   ├── GameScene.ts             # Main gameplay
│   │   └── UIScene.ts               # In-game UI (timer, faults)
│   ├── entities/
│   │   ├── Horse.ts
│   │   └── Obstacle.ts
│   ├── systems/
│   │   ├── GaitSystem.ts
│   │   ├── JumpEvaluator.ts
│   │   └── InputHandler.ts
│   └── constants.ts
│
├── stores/
│   └── gameStore.ts
│
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   └── models/
│       ├── User.ts
│       └── Score.ts
│
├── types/
│   ├── game.ts
│   └── course.ts
│
├── public/
│   ├── sprites/
│   ├── audio/
│   └── courses/                     # JSON course files
│
├── e2e/
│   └── game.spec.ts
│
└── docker-compose.yml
```

---

## Implementation Phases

### Phase 1: Project Setup
- Next.js 16.1 + Phaser 3
- Basic GameContainer component
- BootScene with placeholder assets

### Phase 2: Horse Movement
- Horse entity with Arcade physics
- Keyboard input (arrows + WASD)
- Basic rotation and velocity

### Phase 3: Gait System
- Walk → Trot → Canter → Extended
- Transition timing
- Speed/turn rate per gait

### Phase 4: Obstacles & Jumping
- Obstacle entity
- Zone detection (too close/ideal/too long)
- Jump evaluation algorithm
- Fault/clean outcomes

### Phase 5: Course System
- JSON course format
- Course loader
- Timer and scoring
- Finish detection

### Phase 6: UI & Polish
- Futuristic landing page
- Course selection
- HUD (speed gauge, timer, faults)
- Jump feedback animations

### Phase 7: Auth & Leaderboard
- NextAuth magic link + Google
- MongoDB score storage
- Leaderboard display

### Phase 8: Mobile & Testing
- Touch controls
- PWA config
- Playwright E2E
- Docker deployment

---

## Commands

```bash
pnpm dev          # Development
pnpm build        # Production build
pnpm test         # Unit tests
pnpm e2e          # Playwright E2E
pnpm docker:up    # Start with Docker
```
