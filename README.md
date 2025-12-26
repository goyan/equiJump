# EquiJump

An educational top-down show jumping (CSO) simulator that teaches correct riding concepts through gameplay.

## About

EquiJump is a web-based game that simulates Concours de Saut d'Obstacles (show jumping) from a bird's-eye view. Players learn real riding principles — approach, rhythm, balance, and line choice — through intuitive gameplay and immediate feedback.

### Target Audience
- Young riders and horse riding students
- CSO enthusiasts
- Casual players interested in equestrian sports

## Features

- **Realistic Controls** — No arcade shortcuts; controls mimic real riding aids
- **Gait System** — Walk, trot, canter, extended canter with realistic transitions
- **Jump Evaluation** — Hidden system evaluates approach, rhythm, and takeoff distance
- **Course Progression** — Start simple, advance to complex courses
- **Educational Feedback** — Learn by doing, reinforced by visual feedback

## Tech Stack

- **Next.js 16** — App Router, Turbopack, React 19
- **Phaser 3** — Game engine with Arcade physics
- **TypeScript** — Strict mode
- **Tailwind CSS 4** — Styling
- **Zustand** — React ↔ Phaser state bridge
- **MongoDB** — Database with Mongoose ODM
- **NextAuth.js v5** — Authentication

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Project Structure

```
equijump/
├── app/                 # Next.js pages and API routes
├── components/          # React components (UI, game, layout)
├── engine/              # Phaser game engine (pure TypeScript)
│   ├── scenes/          # Boot, Game, UI scenes
│   ├── entities/        # Horse, Obstacle
│   └── systems/         # Gait, Jump evaluation, Input
├── stores/              # Zustand state management
├── lib/                 # Database and auth utilities
├── types/               # TypeScript definitions
└── public/              # Assets (sprites, audio, courses)
```

## Gameplay

1. Ride the course at the right pace
2. Choose optimal lines between obstacles
3. Maintain straightness on approach
4. Time your jump command correctly
5. Receive feedback and improve

### Controls

| Input | Action |
|-------|--------|
| Up / W | Increase pace |
| Down / S | Decrease pace |
| Left / A | Turn left |
| Right / D | Turn right |
| Space | Jump |

## License

MIT
