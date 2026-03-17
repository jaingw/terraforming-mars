---
name: tfm-add-card
description: "Guide for adding a new card to the TFM (Terraforming Mars) project. Use when the user wants to create, add, or implement a new card — including project cards (IProjectCard), corporation cards (CorporationCard), or any card type. Covers CardName registration, card implementation, manifest registration, and the CardRenderer DSL."
---

# Add a New Card to TFM

## Workflow

Adding a card requires exactly 4 steps:

1. **Register the card name** in `src/common/cards/CardName.ts`
2. **Implement the card** in `src/server/cards/commission/<CardName>.ts`
3. **Register in manifest** in `src/server/cards/commission/CommissionCardManifest.ts`
4. **Write unit tests** in `tests/cards/commission/<CardName>.spec.ts`

Before implementing, confirm with the user:
- Card name and display name
- Card type: `CorporationCard` or `IProjectCard` (and sub-type: `ACTIVE`, `AUTOMATED`, `EVENT`. Somethings User may ask for "蓝卡", "绿卡", which means: Blue -> Active, Green -> Automated, Red -> Event)
- Tags, cost, requirements, victory points
- Card effect/ability (exact mechanics and numerical values)
- Card number (XB series)

If any detail is unclear or ambiguous, **ask the user to clarify before proceeding**.

## Step 1: Register Card Name

Add an entry to the `CardName` enum in `src/common/cards/CardName.ts`.

Commission cards use `🌸` prefix/suffix in the display string. Find the commission card section (near line 626+) and append:

```typescript
// In the commission cards section of CardName enum:
MY_NEW_CARD = '🌸My New Card🌸',
```

Naming conventions:
- Enum key: `UPPER_SNAKE_CASE`
- Value: `'🌸Display Name🌸'` (Chinese names are also acceptable, e.g. `'🌸城电转能🌸'`)

## Step 2: Implement the Card

Create a new file in `src/server/cards/commission/`. File name uses **UpperCamelCase** (e.g. `MyNewCard.ts`).

### Determine Card Type

Read the card details to determine which base class to use:

| Type | Base Class | Implements | When to Use |
|---|---|---|---|
| Corporation | `CorporationCard` | `ICorporationCard` | Cards with `startingMegaCredits`, corp-level effects |
| Active Corp | `ActiveCorporationCard` | `ICorporationCard` + `IActionCard` | Corp cards with per-turn `action()` |
| Project (Active) | `Card` | `IProjectCard` | Blue cards with ongoing effects or actions |
| Project (Automated) | `Card` | `IProjectCard` | Green cards with one-time effects |
| Project (Event) | `Card` | `IProjectCard` | Red cards with one-time effects |
| Project w/ Action | `ActionCard` | `IProjectCard` + has `action` behavior | Blue cards with data-driven action |

### Template: Corporation Card

```typescript
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';

export class MyCorpCard extends CorporationCard {
  constructor() {
    super({
      name: CardName.MY_CORP_CARD,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 50,
      // Optional: initialActionText for first action description
      // initialActionText: 'Draw 1 card with a science tag',

      metadata: {
        cardNumber: 'XB??',
        description: 'You start with 50 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(50);
          b.corpBox('effect', (ce) => {
            ce.effect('description of effect', (eb) => {
              eb.cards(1).startEffect.megacredits(1);
            });
          });
        }),
      },
    });
  }

  // Override for first-action corps
  // public override initialAction(player: IPlayer) { ... }

  // For effects triggered when any player plays a card:
  // public onCardPlayedByAnyPlayer(owner: IPlayer, card: ICard, currentPlayer: IPlayer) { ... }

  // For effects triggered when this corp's owner plays a card:
  // public onCardPlayedForCorps(player: IPlayer, card: ICard) { ... }
}
```

### Template: Project Card (IProjectCard)

```typescript
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class MyProjectCard extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MY_PROJECT_CARD,
      type: CardType.ACTIVE,       // or AUTOMATED, EVENT
      tags: [Tag.BUILDING],
      cost: 15,
      // victoryPoints: 1,          // static VP
      // requirements: {tag: Tag.SCIENCE, count: 2},  // requirements

      // For simple effects, use behavior instead of bespokePlay:
      // behavior: {
      //   production: {energy: 1},
      //   stock: {megacredits: 3},
      //   global: {temperature: 1},
      //   drawCard: 1,
      // },

      metadata: {
        cardNumber: 'XB??',
        // description: 'Requires 2 science tags. ...',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a building tag, gain 2 M€.', (eb) => {
            eb.tag(Tag.BUILDING).startEffect.megacredits(2);
          });
        }),
      },
    });
  }

  // --- Callback methods (choose what applies) ---

  // For ACTIVE cards with a player action:
  // public canAct(player: IPlayer): boolean { return true; }
  // public action(player: IPlayer) { return undefined; }

  // For triggered effects when this card's owner plays a card:
  // public onCardPlayed(player: IPlayer, card: IProjectCard) { ... }

  // For triggered effects when any tile is placed:
  // public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) { ... }

  // For card cost discounts:
  // public override getCardDiscount(player: IPlayer, card: ICard): number { return 0; }

  // For custom VP calculation:
  // public override getVictoryPoints(player: IPlayer): number { return 0; }
}
```

### Common Patterns Reference

See `references/card-patterns.md` for detailed examples of common card patterns including:
- Cards with `behavior` (declarative effects)
- Cards with `onCardPlayed` / `onCardPlayedByAnyPlayer` callbacks
- Cards with `onTilePlaced` callbacks
- Cards with `canAct()` / `action()` (blue card actions)
- Cards with `getCardDiscount()`
- Cards with requirements
- Corporation cards with `initialAction` and `corpBox`

## Step 3: Register in Manifest

Edit `src/server/cards/commission/CommissionCardManifest.ts`:

1. Add import at top:
```typescript
import {MyNewCard} from './MyNewCard';
```

2. Add entry in the appropriate section of `COMMISSION_CARD_MANIFEST`:

For corporation cards:
```typescript
corporationCards: {
  // ... existing entries
  [CardName.MY_NEW_CARD]: {Factory: MyNewCard}, // XB??
},
```

For project cards:
```typescript
projectCards: {
  // ... existing entries
  [CardName.MY_NEW_CARD]: {Factory: MyNewCard}, // XB??
},
```

Optional: add `compatibility` for expansion-dependent cards:
```typescript
[CardName.MY_NEW_CARD]: {Factory: MyNewCard, compatibility: 'turmoil'},
```

## Step 4: Write Unit Tests

Create a test file at `tests/cards/commission/<CardName>.spec.ts`.

### Test Command

Run tests for a single card:
```bash
npx ts-mocha -p tests/tsconfig.json --reporter-option maxDiffSize=256 -r tests/testing/setup.ts tests/cards/commission/<CardName>.spec.ts
```

Run all commission card tests:
```bash
npx ts-mocha -p tests/tsconfig.json --reporter-option maxDiffSize=256 -r tests/testing/setup.ts 'tests/cards/commission/**/*.spec.ts'
```

### Test Template

```typescript
import {expect} from 'chai';
import {MyCard} from '../../../src/server/cards/commission/MyCard';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions, cast} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Resource} from '../../../src/common/Resource';

describe('MyCard', () => {
  let card: MyCard;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new MyCard();
    [game, player] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
  });

  it('basic properties', () => {
    expect(card.cost).to.eq(15);
    expect(card.type).to.eq(CardType.ACTIVE);
    expect(card.tags).to.deep.eq([Tag.BUILDING]);
  });

  it('should apply initial behavior on play', () => {
    player.playCard(card);
    runAllActions(game);
    // Assert production, stock, or other changes
  });

  // Add more tests for each card effect/ability
});
```

### Testing Tips

- Use `testGame(n, {skipInitialShuffling: true})` for deterministic setup
- Use `runAllActions(game)` after play/actions to resolve deferred actions
- Use `cast(input, OrOptions)` to type-check player input responses
- Use `player.popWaitingFor()` to get pending player input
- When setting `card.resourceCount` manually, do so **after** `runAllActions(game)` to avoid other card triggers (e.g. Decomposers) interfering
- **Known engine limitation**: `play()` fires **before** the card is added to `playedCards`, so `onProductionGain` / other tableau callbacks won't self-trigger during initial play (the "including this" pattern)
- For corporation card tests, use `player.playCorporationCard(card)` instead of `player.playCard(card)`
- For testing `canAct()` / `action()`, manually set up the required state (resources, cards, etc.) then call the methods directly

## Key Imports Quick Reference

```typescript
// Common imports for card implementation
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {CorporationCard} from '../corporation/CorporationCard';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
```

## CardRenderer DSL Quick Reference

**Resources:** `megacredits(n)`, `steel(n)`, `titanium(n)`, `plants(n)`, `energy(n)`, `heat(n)`, `cards(n)`, `tr(n)`

**Global params:** `temperature(n)`, `oxygen(n)`, `oceans(n)`, `venus(n)`

**Tiles:** `city()`, `greenery()`, `emptyTile()`, `specialTile()`

**Tags:** `tag(Tag.XXX)`, `wild(n)`, `noTags()`

**Production:** `production((pb) => { pb.energy(1); })`

**Layout:** `.br` (line break), `.nbsp`, `vSpace(size?)`, `text(str)`, `vpText(str)`

**Effect box:** `effect(desc, (eb) => { eb.cause.startEffect.result })`

**Action box:** `action(desc, (eb) => { eb.cost.startAction.result })`

**Corp box:** `corpBox('effect'|'action', (ce) => { ce.effect(...) })`

**Options:** `{all: true}` any player, `{secondaryTag: Tag.XXX}`, `{size: Size.SMALL}`
