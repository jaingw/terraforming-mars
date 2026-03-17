# Card Modification Patterns

Common modification scenarios for TFM cards.

## Cost Modifications

### Direct Cost
```typescript
export class MyCard extends Card implements IProjectCard {
  constructor() {
    super({
      cost: 15,  // MODIFY: Change this value
    });
  }
}
```

### Dynamic Cost (via method)
```typescript
export class MyCard extends Card implements IProjectCard {
  constructor() {
    super({cost: 10});
  }

  public override getCost(player: IPlayer, _card: ICard): number {
    // Modify base cost based on conditions
    const baseCost = super.getCost(player, _card);
    if (player.tags.includes(Tag.BUILDING)) {
      return baseCost - 2;  // MODIFY: Change discount amount
    }
    return baseCost;
  }
}
```

## Tag Modifications

### Add/Remove Tags
```typescript
super({
  tags: [Tag.BUILDING, Tag.SCIENCE],  // MODIFY: Add/remove tags here
})
```

### Dynamic Tags (via property)
```typescript
export class MyCard extends Card implements IProjectCard {
  public tags: Array<Tag> = [Tag.BUILDING];

  public updateTags(player: IPlayer) {
    // MODIFY: Add tags dynamically
    if (player.production.plants > 0) {
      this.tags.push(Tag.PLANT);
    }
  }
}
```

## Victory Point Modifications

### Static VP
```typescript
super({
  victoryPoints: 2,  // MODIFY: Change VP value
})
```

### Dynamic VP (Production-based)
```typescript
public override getVictoryPoints(player: IPlayer): number {
  return player.production.steel;  // MODIFY: Change formula
}
```

### Dynamic VP (Resource count-based)
```typescript
public override getVictoryPoints(player: IPlayer): number {
  const card = player.playedCards.find((c) => c.name === CardName.MY_CARD);
  return card !== undefined ? card.resourceCount : 0;
}
```

### Dynamic VP (Card count-based)
```typescript
public override getVictoryPoints(player: IPlayer): number {
  const count = player.playedCards.filter((c) =>
    c.tags.includes(Tag.BUILDING)
  ).length;
  return Math.floor(count / 2);  // MODIFY: Change formula
}
```

## Behavior Modifications

### Production Changes
```typescript
behavior: {
  production: {
    energy: 2,      // MODIFY: Change values
    steel: 1,
    plants: -1,
  },
}
```

### Stock Changes
```typescript
behavior: {
  stock: {
    megacredits: 5,
    steel: 2,
    titanium: 1,
  },
}
```

### Global Parameter Changes
```typescript
behavior: {
  global: {
    temperature: 1,   // MODIFY: Change step count
    oxygen: 2,
    oceans: 1,
  },
}
```

### Card Draw
```typescript
behavior: {
  drawCard: 2,  // MODIFY: Number of cards to draw
}
```

### Resource Placement
```typescript
behavior: {
  ocean: {},          // Place ocean tile
  city: {},          // Place city tile
  greenery: {},      // Place greenery tile
}
```

## Callback Method Modifications

### Action Method
```typescript
public canAct(player: IPlayer): boolean {
  return player.energy >= 3;  // MODIFY: Change cost
}

public action(player: IPlayer) {
  player.stock.deduct(Resource.ENERGY, 3);  // MODIFY: Change cost
  player.stock.add(Resource.MEGACREDITS, 10);  // MODIFY: Change benefit
}
```

### onCardPlayed Callback
```typescript
public onCardPlayed(player: IPlayer, card: IProjectCard) {
  if (card.tags.includes(Tag.BUILDING)) {
    player.stock.add(Resource.MEGACREDITS, 2);  // MODIFY: Change amount
  }
}
```

### onTilePlaced Callback
```typescript
public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
  if (cardOwner.id === activePlayer.id && Board.isCitySpace(space)) {
    cardOwner.production.add(Resource.ENERGY, 1);  // MODIFY: Change amount
  }
}
```

### getCardDiscount Callback
```typescript
public override getCardDiscount(_player: IPlayer, card: ICard): number {
  if (card.tags.includes(Tag.BUILDING)) {
    return 3;  // MODIFY: Change discount amount
  }
  return 0;
}
```

## Requirement Modifications

### Tag Requirement
```typescript
requirements: {
  tag: Tag.SCIENCE,
  count: 3,  // MODIFY: Change count
}
```

### Global Parameter Requirement
```typescript
requirements: {
  temperature: -14,  // MODIFY: Minimum temperature
  oxygen: 5,        // MODIFY: Minimum oxygen level
  oceans: 3,         // MODIFY: Minimum oceans
}
```

### Max Requirement
```typescript
requirements: {
  temperature: -14,
  max: true,  // MODIFY: "at most" instead of "at least"
}
```

### Multiple Requirements (Array)
```typescript
requirements: [
  {tag: Tag.SCIENCE, count: 2},
  {oxygen: 5},  // MODIFY: Add/remove requirements
]
```
