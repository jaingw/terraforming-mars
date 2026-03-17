---
name: tfm-modify-card
description: "Guide for modifying existing cards in TFM (Terraforming Mars) project. Use when user wants to modify, update, or change an existing card's properties, values, or behavior. Covers finding card files, modifying numerical values (with constant extraction for frequently-used values), and synchronizing unit tests."
---

# Modify an Existing Card in TFM

## Workflow

Modifying a card requires up to 3 types of file changes:

1. **Modify card implementation** in `src/server/cards/[expansion]/CardName.ts`
2. **Extract constants** (optional) for frequently repeated values
3. **Update unit tests** in `tests/cards/[expansion]/CardName.spec.ts`

Before making changes, confirm with the user:
- **Card name**: Exact card to modify (use CardName enum value if known)
- **Modification scope**: What exactly needs to change (cost, tags, behavior, victory points, etc.)
- **New values**: Target numerical values or new behavior
- **Scope of changes**: Single card, or multiple related cards

If the request is ambiguous or the modification might have unintended side effects, **ask the user to clarify**.

## Step 1: Find Card Files

Use search strategies to locate card files:

### Primary Search: Card Implementation File
```bash
# Search by card class name
grep -r "class [CardClass]" ./src/server/cards/

# Search by CardName enum value
grep -r "CardName.CARD_NAME" ./src/server/cards/

# Search by display name (in CardName.ts)
grep "Card Display Name" ./src/common/cards/CardName.ts
```

### Expansion-Specific Locations
Cards are organized by expansion/module:
- Base game: `src/server/cards/base/`
- Corporations: `src/server/cards/corporation/`
- Promo: `src/server/cards/promo/`
- Colonies: `src/server/cards/colonies/`
- Turmoil: `src/server/cards/turmoil/`
- Venus: `src/server/cards/venusNext/`
- Moon: `src/server/cards/moon/`
- Pathfinders: `src/server/cards/pathfinders/`
- Underworld: `src/server/cards/underworld/`
- Prelude 2: `src/server/cards/prelude2/`
- Commission: `src/server/cards/commission/`

### CardName Reference
The CardName enum in `src/common/cards/CardName.ts` contains all card names. Search for the display name to find the enum key.

**Note:** Commission cards use 🌸 prefix/suffix (e.g., `'🌸城电转能🌸'`).

## Step 2: Modify Card Values

### Common Modification Points

#### Cost
```typescript
// In constructor's super({...})
cost: 15,  // Change from 15 to new value
```

#### Tags
```typescript
// Add or modify tags
tags: [Tag.BUILDING, Tag.SCIENCE],
```

#### Victory Points
```typescript
// Static VP
victoryPoints: 2,  // In super({...})

// Dynamic VP (override method)
public override getVictoryPoints(player: IPlayer): number {
  return player.production.steel;
}
```

#### Behavior Object
```typescript
// Modify declarative effects
behavior: {
  production: {energy: 2},  // Change from 1 to 2
  stock: {megacredits: 5},
  global: {temperature: 1},
},
```

#### Requirements
```typescript
// Single requirement
requirements: {tag: Tag.SCIENCE, count: 3},

// Multiple requirements
requirements: [{tag: Tag.SCIENCE, count: 2}, {oxygen: 5}],
```

#### Callback Methods
For cards with `action()`, `onCardPlayed()`, `onTilePlaced()`, etc.:

```typescript
public action(player: IPlayer) {
  // Modify logic here
  player.stock.add(Resource.MEGACREDITS, 10);  // Change from 5 to 10
}

public onCardPlayed(player: IPlayer, card: IProjectCard) {
  if (card.tags.includes(Tag.BUILDING)) {
    player.production.add(Resource.STEEL, 1);  // Modify value
  }
}
```

### Constant Extraction (For Repeated Values)

If the same numerical value appears **3+ times** across a file or module, extract to a constant.

#### When to Extract
- Value is repeated 3+ times in the same file
- Value is a "magic number" without clear meaning
- Value represents a game balance parameter that might need tuning

#### Constant Placement
```typescript
// Option 1: Module-specific constants (preferred)
// src/common/cards/[module]Constants.ts
export const DEFAULT_STEEL_BONUS = 2;
export const DISCOUNT_AMOUNT = 2;

// Option 2: File-level constants (single card)
// At top of card file
const STEEL_BONUS = 2;
const DISCOUNT_AMOUNT = 2;
```

#### Usage Pattern
```typescript
import {DISCOUNT_AMOUNT} from '../../../common/cards/[module]Constants';

// In behavior
behavior: {
  stock: {megacredits: DISCOUNT_AMOUNT},
},

// In method
player.stock.add(Resource.MEGACREDITS, DISCOUNT_AMOUNT);
```

### Logic Verification

**CRITICAL:** Before applying changes, verify the logic is correct:

1. **Check for side effects**: Does this value affect other cards or systems?
2. **Check for dependencies**: Do other cards reference this value?
3. **Check for balance implications**: Is the new value reasonable?
4. **Check the context**: Is the value used in multiple places that need updating?

**If logic is unclear or the change scope is uncertain, ask the user:**
- "I found value X used in 3 places. Should I update all occurrences, or just specific locations?"
- "This card has a dynamic VP calculation. Should I modify the formula or the base values?"
- "The cost is defined both in the card and in a behavior object. Which one controls the effective cost?"

## Step 3: Find and Update Unit Tests

### Locate Test File
Unit tests follow this pattern:
```
tests/cards/[expansion]/CardName.spec.ts
```

Search strategies:
```bash
# Find test by card name
find ./tests -name "*CardName*"

# Find test by directory (expansion-specific)
ls ./tests/cards/base/ | grep -i "cardname"
```

### Test Structure Reference
```typescript
import {expect} from 'chai';
import {CardName} from '../../../src/common/cards/CardName';
import {CardClass} from '../../../src/server/cards/expansion/CardName';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('CardName', () => {
  let card: CardClass;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new CardClass();
    [game, player] = testGame(2);
  });

  it('Should play', () => {
    // Test basic functionality
  });

  it('Should give correct victory points', () => {
    expect(card.getVictoryPoints(player)).to.eq(newValue);
  });

  it('Should have correct cost', () => {
    expect(card.cost).to.eq(newCost);
  });
});
```

### Synchronization Requirements

**Always update tests to match the modified values:**

1. **Cost changes**: Update `expect(card.cost).to.eq(...)`
2. **VP changes**: Update `expect(card.getVictoryPoints(player)).to.eq(...)`
3. **Production changes**: Update `expect(player.production.steel).to.eq(newValue)`
4. **Resource changes**: Update `expect(card.resourceCount).to.eq(newValue)`
5. **Behavior changes**: Update test expectations for the new behavior
6. **Constant extraction**: Import and use the new constant in tests

### Testing Updated Values

After modifying the test file, run it to verify:
```bash
npm test -- tests/cards/[expansion]/CardName.spec.ts
```

## Key File Paths Quick Reference

| Purpose | Path |
|---------|-------|
| Card names | `src/common/cards/CardName.ts` |
| Base cards | `src/server/cards/base/` |
| Commission cards | `src/server/cards/commission/` |
| Corporation cards | `src/server/cards/corporation/` |
| Base tests | `tests/cards/base/` |
| Commission tests | `tests/cards/commission/` |
| Constants | `src/common/constants.ts` |

## Verification Checklist

Before completing a card modification, verify:

- [ ] Card implementation file found and read
- [ ] All occurrences of modified values updated (use grep to check)
- [ ] If value is repeated, constant created and used consistently
- [ ] Test file located and read
- [ ] Test expectations updated to match new values
- [ ] Linting passes on modified files (run diagnostics)
- [ ] Test suite passes for the modified card

## Common Pitfalls

1. **Missing test file updates**: Modifying the card but not the test creates test failures
2. **Incomplete value updates**: Changing a value in one place but missing another occurrence
3. **Over-extraction**: Creating constants for values that appear only once
4. **Breaking card behavior**: Changing values without understanding callback logic dependencies
5. **Manifest issues**: Not needed for simple value changes, but some modifications might require manifest updates
