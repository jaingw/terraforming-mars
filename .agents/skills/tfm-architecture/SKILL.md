---
name: tfm-architecture
description: "TFM (Terraforming Mars) project architecture reference. Use when needing to understand the project structure, locate files, understand how server/client/common layers interact, or when navigating the codebase for any development task. Triggers on questions like 'where is X defined', 'how does the game work', 'what is the project structure', or any orientation/exploration task."
---

# TFM Project Architecture

## Directory Structure

```
src/
├── server/          # Backend game logic (Node.js)
├── client/          # Frontend (Vue.js)
├── common/          # Shared types/enums/models between server & client
├── cards/           # Breakthrough card overrides (thin layer)
├── locales/         # i18n translation files (.json)
├── styles/          # CSS/Less styles
└── tools/           # Utility scripts
```

## Project Request Conventions

### Frontend HTTP Requests

- **Must use wrapped request utility**: `src/client/utils/request.ts`
- Avoid adding new raw `fetch` / `XMLHttpRequest` calls in frontend features.

Use:

```typescript
import {request} from '@/client/utils/request';

// GET with optional query params
const seasonInfo = await request.get('/api/v2/season/info');
const leaderboard = await request.get('/api/v2/season/leaderboard', {seasonId: '2026-S1', limit: 100});

// POST with JSON body
const resetResult = await request.post('/api/v2/season/admin/reset?serverId=xxx', {
  dryRun: true,
  expectedFromSeasonId: '2026-S1',
});
```

### Backend API Implementation

- **All newly added backend APIs must be implemented with Hono**, mounted under `/api/v2/*`.
- Do not add new legacy routes in `UserManager` / `ApiUserManager` for new features.
- Add route module in `src/server/hono/` and mount it in `src/server/hono/app.ts`.

## Three-Layer Architecture

### 1. Common Layer (`src/common/`)

Shared TypeScript types, enums, and models. **No game logic** — only data definitions consumed by both server and client.

Key files:

| File/Dir | Purpose |
|---|---|
| `cards/CardName.ts` | Enum of ALL card names (identifiers) |
| `cards/CardType.ts` | Enum: `EVENT`, `ACTIVE`, `AUTOMATED`, `PRELUDE`, `CORPORATION`, `CEO`, etc. |
| `cards/Tag.ts` | Enum: `BUILDING`, `SPACE`, `SCIENCE`, `POWER`, `EARTH`, etc. |
| `cards/render/` | Render type definitions (`CardRenderItemType`, `Size`, `Types`) |
| `Resource.ts` | Enum: `MEGACREDITS`, `STEEL`, `TITANIUM`, `PLANTS`, `ENERGY`, `HEAT` |
| `CardResource.ts` | Card-specific resources (microbe, animal, floater, etc.) |
| `models/` | Serialized models sent to client (`GameModel`, `PlayerModel`, `CardModel`) |
| `Phase.ts` | Game phases |
| `constants.ts` | Global game constants |
| `Types.ts` | Core ID types (`PlayerId`, `GameId`, etc.) |

### 2. Server Layer (`src/server/`)

All game logic runs here. The server is authoritative.

#### Core Files

| File | Purpose |
|---|---|
| `Game.ts` | Main game class (~2500 lines). Manages game state, phases, turns, global parameters, tile placement, draft, generation flow. |
| `Player.ts` | Player class (~2100 lines). Manages player resources, production, card playing, action handling, payments. |
| `IGame.ts` | Game interface definition. |
| `IPlayer.ts` | Player interface definition. |
| `GameSetup.ts` | Game initialization logic. |
| `server.ts` | HTTP server entry point. |

#### Cards (`src/server/cards/`)

The largest subsystem. Each card is a separate `.ts` file organized by expansion module:

```
cards/
├── base/           # Base game cards
├── corporation/    # Corporation base classes (CorporationCard, ICorporationCard)
├── commission/     # Custom/commissioned cards (prefix 🌸)
├── promo/          # Promo cards
├── colonies/       # Colonies expansion
├── venusNext/      # Venus Next expansion
├── moon/           # Moon expansion
├── pathfinders/    # Pathfinders expansion
├── turmoil/        # Turmoil expansion
├── underworld/     # Underworld expansion
├── prelude/        # Prelude expansion
├── prelude2/       # Prelude 2
├── eros/           # Eros expansion
├── community/      # Community cards
├── breakthrough/   # Breakthrough card variants
├── ceos/           # CEO cards
├── starwars/       # Star Wars cards
├── render/         # Card rendering system (CardRenderer, CardRenderItem, etc.)
├── requirements/   # Card requirement logic
├── AllManifests.ts # Aggregates all module manifests
├── Card.ts         # Abstract base Card class
├── ICard.ts        # Card interface with all callbacks
├── IProjectCard.ts # Project card interface
├── ActionCard.ts   # Base class for cards with data-driven `action`
├── Deck.ts         # Deck management (draw, discard, shuffle)
└── ModuleManifest.ts # Module manifest type definition
```

#### Card Type Hierarchy

```
ICard (interface)
  ├── Card (abstract class) — most cards extend this
  │     ├── implements IProjectCard — for project cards (ACTIVE/AUTOMATED/EVENT)
  │     └── CorporationCard (abstract) — for corp cards
  │           └── ActiveCorporationCard — corp cards with action()
  └── ActionCard — project cards with data-driven action behavior
```

#### Other Server Subsystems

| Directory | Purpose |
|---|---|
| `boards/` | Board logic (Mars board, spaces, tile placement) |
| `behavior/` | Behavior system — declarative card effects via JSON-like `Behavior` type |
| `deferredActions/` | Action queue system (DrawCards, PlaceOceanTile, GainResources, etc.) |
| `turmoil/` | Turmoil political system (parties, delegates, global events) |
| `colonies/` | Colony system |
| `moon/` | Moon expansion logic |
| `awards/` & `milestones/` | End-game scoring |
| `routes/` | HTTP API handlers |
| `database/` | Game persistence |
| `inputs/` | Player input types (SelectCard, SelectSpace, OrOptions, etc.) |
| `models/` | Server → client model serialization |

### 3. Client Layer (`src/client/`)

Vue.js frontend. Receives `GameModel`/`PlayerModel` from server and renders the UI.

```
client/
├── components/     # Vue components (.vue files)
├── cards/          # Client-side card rendering helpers
├── utils/          # Client utilities
├── directives/     # Vue directives
├── mixins/         # Vue mixins
├── plugins/        # Vue plugins
└── turmoil/        # Turmoil-specific client code
```

## Card Renderer System

Cards define their visual appearance using `CardRenderer.builder()` — a builder-pattern DSL in `src/server/cards/render/CardRenderer.ts`.

### Builder API Reference

The builder (`Builder<T>`) provides chainable methods:

**Resources:**
- `megacredits(n)`, `steel(n)`, `titanium(n)`, `plants(n)`, `energy(n)`, `heat(n)`
- `cards(n, options?)` — draw cards icon
- `tr(n)` — terraform rating

**Global Parameters:**
- `temperature(n)`, `oxygen(n)`, `oceans(n)`, `venus(n)`

**Tiles:**
- `city(options?)`, `greenery(options?)`, `emptyTile(type?)`, `specialTile(options?)`

**Tags:**
- `tag(Tag, options?)`, `wild(n)`, `noTags()`, `emptyTag()`, `diverseTag()`

**Card Resources:**
- `resource(CardResource, options?)` — e.g. microbe, animal, floater

**Production Box:**
- `production((pb) => { pb.energy(1); pb.steel(2); })` — wraps items in production border

**Layout:**
- `.br` — line break
- `.nbsp` — non-breaking space
- `vSpace(size?)` — vertical space
- `text(str, size?, uppercase?, bold?)`, `plainText(str)`, `vpText(str)`
- `plate(str)` — plate text

**Effect/Action (for ACTIVE/CORP cards):**
- `effect(description, (eb) => { eb.cause.startEffect.result })` — triggered effect
- `action(description, (eb) => { eb.cost.startAction.result })` — player action
- `corpBox('effect'|'action', (ce) => { ... })` — corporation box

**Symbols:**
- `startEffect` — colon separator (`:`) for effects, starts new row
- `startAction` — arrow separator (`->`) for actions, starts new row
- `or()`, `plus()`, `minus()`, `slash()`, `asterix()`

### Effect/Action Structure

Each `effect()` or `action()` callback must produce exactly 3 rows:
1. **Cause/Cost** — what triggers or what you pay
2. **Delimiter** — `startEffect` (`:`) or `startAction` (`->`)
3. **Result** — what you get

If no cause, start with `empty()`.

### Examples

Simple automated card:
```typescript
CardRenderer.builder((b) => {
  b.production((pb) => pb.energy(1).steel(2));
});
```

Active card with effect:
```typescript
CardRenderer.builder((b) => {
  b.effect('When you play a building tag, gain 2 M€ discount.', (eb) => {
    eb.tag(Tag.BUILDING).startEffect.megacredits(-2);
  });
});
```

Corporation card:
```typescript
CardRenderer.builder((b) => {
  b.megacredits(55).cards(1, {secondaryTag: Tag.SCIENCE});
  b.corpBox('effect', (ce) => {
    ce.vSpace(Size.LARGE);
    ce.effect('description', (eb) => {
      eb.cards(1).startEffect.megacredits(1);
    });
  });
});
```

## Behavior System

The `Behavior` type (`src/server/behavior/Behavior.ts`) allows declarative card effects. Instead of writing imperative `play()` code, define a `behavior` object on the card:

```typescript
behavior: {
  production: {energy: 1, steel: 2},  // gain production
  stock: {megacredits: 5},            // gain resources
  global: {temperature: 1},           // raise global param
  drawCard: 2,                        // draw cards
  tr: 1,                              // gain TR
  city: {},                           // place a city
  greenery: {},                       // place a greenery
  ocean: {},                          // place an ocean
}
```

The `BehaviorExecutor` automatically handles `canPlay` and `play` for behavior-defined effects. For custom logic, override `bespokeCanPlay()` and `bespokePlay()`.

## Key Callbacks on ICard

Cards interact with the game via callback methods defined in `ICard`:

| Callback | When Called |
|---|---|
| `play(player)` | When card is played |
| `onCardPlayed(player, card)` | When this card's owner plays another card |
| `onCardPlayedByAnyPlayer(owner, card, activePlayer)` | When any player plays a card (for corp cards: `onCardPlayedForCorps`) |
| `onTilePlaced(cardOwner, activePlayer, space)` | When any tile is placed |
| `onResourceAdded(player, card, count)` | When resources added to a card |
| `onProductionGain(player, resource, amount)` | When production changes |
| `onGlobalParameterIncrease(player, param, steps)` | When a global param increases |
| `onColonyAddedByAnyPlayer(cardOwner, colonyOwner)` | When a colony is built |
| `canAct(player)` / `action(player)` | For ACTIVE cards with actions |
| `getCardDiscount(player, card)` | Calculate M€ discount for playing a card |
| `getVictoryPoints(player)` | End-game VP calculation |

## Module Manifest System

Each expansion module defines a `ModuleManifest` mapping `CardName` → card factory:

```typescript
export const COMMISSION_CARD_MANIFEST = new ModuleManifest({
  module: 'commission',
  corporationCards: { [CardName.XXX]: {Factory: XxxClass} },
  projectCards: { [CardName.YYY]: {Factory: YyyClass} },
  preludeCards: {},
  globalEvents: {},
});
```

All manifests are aggregated in `src/server/cards/AllManifests.ts`.
