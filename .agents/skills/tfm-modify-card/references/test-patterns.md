# Card Testing Patterns for Modifications

Test patterns for verifying card modifications.

## Test Setup

```typescript
import {expect} from 'chai';
import {CardName} from '../../../src/common/cards/CardName';
import {CardClass} from '../../../src/server/cards/expansion/CardName';
import {TestPlayer, testGame} from '../../TestGame';

describe('CardName', () => {
  let card: CardClass;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new CardClass();
    [game, player] = testGame(2);
  });
});
```

## Cost Modification Tests

### Static Cost
```typescript
it('Should have correct cost', () => {
  expect(card.cost).to.eq(newCost);  // UPDATE: New expected value
});
```

### Dynamic Cost
```typescript
it('Should have discounted cost with building tag', () => {
  player.playedCards.push(new BuildingCard());
  expect(card.getCost(player, card)).to.eq(discountedCost);
});

it('Should have full cost without building tag', () => {
  expect(card.getCost(player, card)).to.eq(fullCost);
});
```

## Tag Modification Tests

### Verify Tags
```typescript
it('Should have correct tags', () => {
  expect(card.tags).deep.eq([Tag.BUILDING, Tag.SCIENCE]);  // UPDATE: New tags
});
```

### Dynamic Tags
```typescript
it('Should gain plant tag with plant production', () => {
  player.production.plants = 1;
  card.updateTags(player);
  expect(card.tags).includes(Tag.PLANT);
});
```

## Victory Point Modification Tests

### Static VP
```typescript
it('Should give correct victory points', () => {
  expect(card.victoryPoints).to.eq(newValue);  // UPDATE: New VP value
});
```

### Dynamic VP (Production)
```typescript
it('Should give VP based on steel production', () => {
  player.production.steel = 3;
  expect(card.getVictoryPoints(player)).to.eq(3);
});

it('Should give 0 VP with 0 steel production', () => {
  expect(card.getVictoryPoints(player)).to.eq(0);
});
```

### Dynamic VP (Resource Count)
```typescript
it('Should give VP based on resource count', () => {
  player.playedCards.push(card);
  card.resourceCount = 4;
  expect(card.getVictoryPoints(player)).to.eq(4);
});
```

## Behavior Modification Tests

### Production Changes
```typescript
it('Should modify production correctly', () => {
  card.play(player);

  expect(player.production.steel).to.eq(newProductionValue);  // UPDATE: New value
  expect(player.production.plants).to.eq(newProductionValue);
});
```

### Stock Changes
```typescript
it('Should give resources', () => {
  card.play(player);

  expect(player.stock.megacredits).to.eq(newValue);  // UPDATE: New amount
  expect(player.stock.steel).to.eq(newValue);
});
```

### Global Parameter Changes
```typescript
it('Should raise temperature', () => {
  card.play(player);

  expect(game.getTemperature()).to.eq(newTemperatureValue);  // UPDATE: New value
});
```

### Card Draw
```typescript
it('Should draw cards', () => {
  const initialHand = player.cardsInHand.length;
  card.play(player);

  expect(player.cardsInHand.length).to.eq(initialHand + cardCount);  // UPDATE: New count
});
```

### Resource Placement
```typescript
it('Should place ocean tile', () => {
  const action = cast(card.play(player), SelectSpace);
  action.cb(action.spaces[0]);

  expect(game.board.getOceanCount()).to.eq(initialOceans + 1);  // UPDATE: Verify placement
});
```

## Action Modification Tests

### Can Act
```typescript
it('Should be able to act with enough energy', () => {
  player.energy = 3;
  expect(card.canAct(player)).is.true;
});

it('Should not be able to act without enough energy', () => {
  player.energy = 2;
  expect(card.canAct(player)).is.false;  // UPDATE: New threshold
});
```

### Execute Action
```typescript
it('Should spend energy and gain MC', () => {
  player.energy = 5;
  card.action(player);

  expect(player.energy).to.eq(5 - energyCost);  // UPDATE: New cost
  expect(player.stock.megacredits).to.eq(megacreditGain);  // UPDATE: New gain
});
```

## Discount Modification Tests

### Card Discount
```typescript
it('Should give discount for building cards', () => {
  const buildingCard = new BuildingCard();
  const originalCost = buildingCard.cost;

  expect(card.getCardDiscount(player, buildingCard)).to.eq(newDiscountAmount);  // UPDATE: New discount
});

it('Should not give discount for non-building cards', () => {
  const scienceCard = new ScienceCard();

  expect(card.getCardDiscount(player, scienceCard)).to.eq(0);
});
```

## Trigger Modification Tests

### onCardPlayed
```typescript
it('Should trigger when player plays building tag', () => {
  player.playedCards.push(card);
  const buildingCard = new BuildingCard();
  buildingCard.tags = [Tag.BUILDING];

  card.onCardPlayed(player, buildingCard);

  expect(player.stock.megacredits).to.eq(newGain);  // UPDATE: New gain amount
});
```

### onTilePlaced
```typescript
it('Should gain energy when owner places city', () => {
  player.playedCards.push(card);
  const space = game.board.getAvailableSpacesOnLand(player)[0];

  card.onTilePlaced(player, player, space);

  expect(player.production.energy).to.eq(initialEnergy + energyGain);  // UPDATE: New gain
});
```

## Requirement Modification Tests

### Tag Requirement
```typescript
it('Should not play without enough science tags', () => {
  player.tags = [Tag.SCIENCE, Tag.SCIENCE];
  expect(card.canPlay(player)).is.false;  // UPDATE: New threshold
});

it('Should play with enough science tags', () => {
  player.tags = [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE];
  expect(card.canPlay(player)).is.true;
});
```

### Global Parameter Requirement
```typescript
it('Should not play below required temperature', () => {
  setTemperature(game, -20);  // Below requirement
  expect(card.canPlay(player)).is.false;
});

it('Should play above required temperature', () => {
  setTemperature(game, -14);  // At requirement
  expect(card.canPlay(player)).is.true;
});
```

## Helper Functions Reference

From `tests/TestingUtils.ts`:

```typescript
// Game setup
testGame(2)  // 2-player game
testGame(2, {turmoilExtension: true})  // With options

// Resource setup
player.addResourceTo(card, 3);
player.production.steel = 2;

// Environment setup
setTemperature(game, -10);
setOxygenLevel(game, 5);
maxOutOceans(player, 3);

// Action processing
churn(card.action(player), player);
runAllActions(game);
cast(result, ExpectedType);

// Deferred actions
runNextAction(game);
```

## Common Test Scenarios

1. **Verify modified value**: Always test the exact value you changed
2. **Test edge cases**: 0 production, minimum requirements, etc.
3. **Test multiple conditions**: When the card has different behaviors based on game state
4. **Test interactions**: If the card affects other cards or game systems
5. **Test negative cases**: What happens when requirements aren't met

## Test Update Checklist

After modifying a card, verify tests are updated:

- [ ] Cost tests use new expected value
- [ ] VP tests use new expected value
- [ ] Production/stock tests use new amounts
- [ ] Behavior tests verify new logic
- [ ] Requirements tests use new thresholds
- [ ] Edge cases are covered (0 values, max values, etc.)
- [ ] Test names still describe what they test
- [ ] Test still passes after modification
