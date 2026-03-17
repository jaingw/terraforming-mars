# Card Implementation Patterns

## Table of Contents

1. [Corporation Card with Effect](#1-corporation-card-with-effect)
2. [Corporation Card with Initial Action](#2-corporation-card-with-initial-action)
3. [Project Card with Behavior (Automated)](#3-project-card-with-behavior-automated)
4. [Project Card with onCardPlayed Trigger](#4-project-card-with-oncardplayed-trigger)
5. [Project Card with onTilePlaced Trigger](#5-project-card-with-ontileplaced-trigger)
6. [Project Card with canAct/action (Blue Card)](#6-project-card-with-canactaction-blue-card)
7. [Project Card with getCardDiscount](#7-project-card-with-getcarddiscount)
8. [Project Card with Requirements](#8-project-card-with-requirements)
9. [Automated Card (No Ongoing Effect)](#9-automated-card-no-ongoing-effect)
10. [Corporation Card with onResourceAdded](#10-corporation-card-with-onresourceadded)

---

## 1. Corporation Card with Effect

From `EliteTech.ts` — Corp that gains 1 M€ when playing cards without requirements:

```typescript
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';

export class EliteTech extends CorporationCard {
  constructor() {
    super({
      name: CardName.ELITETECH,
      tags: [],
      startingMegaCredits: 55,
      initialActionText: 'Draw 1 card with a science tag',
      metadata: {
        cardNumber: 'XB13',
        description: 'You start with 55 M€. As your first action, draw 1 card with a science tag.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(55).cards(1, {secondaryTag: Tag.SCIENCE});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('when you playing a card without a requirement, you gain 1 M€.', (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.REQNOT}).startEffect.megacredits(1);
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    player.drawCard(1, {tag: Tag.SCIENCE});
    return undefined;
  }

  public onCardPlayedForCorps(player: IPlayer, card: ICard) {
    if (player.playedCards.has(CardName.ELITETECH) && (card.requirements === undefined || card.requirements.length === 0)) {
      player.stock.add(Resource.MEGACREDITS, 1, {log: true});
    }
  }
}
```

Key points:
- `CorporationCard` base class — no need to set `type`
- `startingMegaCredits` is required
- `initialAction` for first-turn action
- `onCardPlayedForCorps` for corp-specific card-play triggers (only fires for the corp owner)
- `corpBox('effect', ...)` for the corporation effect box in the renderer

## 2. Corporation Card with Initial Action

From `DualOrbitLeap.ts` — Corp that adds a colony tile as initial action:

```typescript
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tag} from '../../../common/cards/Tag';
import {CorporationCard} from '../corporation/CorporationCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';

export class DualOrbitLeap extends CorporationCard {
  constructor() {
    super({
      name: CardName.DUAL_ORBIT_LEAP,
      tags: [Tag.SPACE],
      startingMegaCredits: 52,
      initialActionText: 'Add a colony tile',
      behavior: {
        colonies: { tradeOffset: 2 },
      },
      metadata: {
        cardNumber: 'XB24',
        description: 'You start with 52 M€. As your first action, put an additional Colony Tile of your choice into play',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(52).nbsp.colonyTile();
          b.corpBox('effect', (ce) => {
            ce.effect('When you trade, you may first increase that Colony Tile track 2 step.', (eb) => {
              eb.trade().startEffect.text('+2', Size.LARGE);
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    ColoniesHandler.addColonyTile(player, {title: 'Select colony tile to add'});
    return undefined;
  }
}
```

Key points:
- Corp `behavior` field applies passive effects (e.g. trade offset)
- `initialAction` can trigger complex game actions

## 3. Project Card with Behavior (Automated)

From `ResearchAccelerator.ts` — Simple automated card with wild tags:

```typescript
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class ResearchAccelerator extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.RESEARCH_ACCELERATOR,
      type: CardType.AUTOMATED,
      tags: [Tag.WILD, Tag.WILD],
      cost: 11,
      requirements: {tag: Tag.SCIENCE, count: 3},
      metadata: {
        cardNumber: 'XB58',
        description: 'Requires 3 science tags. Gain 2 wild tags.',
      },
    });
  }
}
```

Key points:
- `CardType.AUTOMATED` — green card, one-time effect
- `requirements` can be a single object or array
- Tags on the card itself provide the "effect" (wild tags here)
- No `renderData` needed if the description suffices
- For more complex behavior, use the `behavior` field:

```typescript
behavior: {
  production: {energy: 2, steel: 1},
  stock: {megacredits: 5},
  drawCard: 1,
  global: {temperature: 1},
},
```

## 4. Project Card with onCardPlayed Trigger

From `FloralBloomSurge.ts` — Gains plant production when playing plant tags:

```typescript
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class FloralBloomSurge extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FLORAL_BLOOM_SURGE,
      tags: [Tag.PLANT],
      requirements: {tag: Tag.PLANT, count: 2},
      cost: 10,
      metadata: {
        cardNumber: 'XB54',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a plant tag card, gain 1 plant production.', (eb) => {
            eb.tag(Tag.PLANT).startEffect.production((pb) => {
              pb.plants(1);
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    for (const tag of card.tags) {
      if (tag === Tag.PLANT) {
        player.production.add(Resource.PLANTS, 1);
      }
    }
  }
}
```

Key points:
- `CardType.ACTIVE` — blue card with ongoing effect
- `onCardPlayed` is called when the **card owner** plays another card
- Loop through `card.tags` if effect triggers per-tag

## 5. Project Card with onTilePlaced Trigger

From `CityPowerShift.ts` — Gains energy production when placing cities:

```typescript
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {CardType} from '../../../common/cards/CardType';

export class CityPowerShift extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.CITY_POWER_SHIFT,
      tags: [Tag.POWER, Tag.CITY, Tag.BUILDING],
      cost: 25,
      behavior: { city: {} },
      metadata: {
        cardNumber: 'XB55',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place a city tile, increase your Power production 1 step.', (eb) => {
            eb.city().startEffect.production((pb) => pb.energy(1));
          }).br;
          b.city().vpText('place a city tile.');
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (Board.isCitySpace(space)) {
      if (cardOwner.id === activePlayer.id) {
        cardOwner.production.add(Resource.ENERGY, 1);
      }
    }
    return;
  }
}
```

Key points:
- `behavior: { city: {} }` — plays a city tile when the card is played
- `onTilePlaced` is called for ANY tile placement by ANY player
- Always check `cardOwner.id === activePlayer.id` if effect is owner-only
- Use `Board.isCitySpace(space)` / `Board.isGreenerySpace(space)` for tile type checks

## 6. Project Card with canAct/action (Blue Card)

From `StrategicRetrieval.ts` — Spend 2 energy to draw from discard pile:

```typescript
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {ChooseCards} from '../../deferredActions/ChooseCards';
import {Resource} from '../../../common/Resource';

export class StrategicRetrieval extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.STRATEGIC_RETRIEVAL,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      cost: 10,
      metadata: {
        cardNumber: 'XB51',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 energy to draw the top 3 cards from the discard pile.', (eb) => {
            eb.energy(2).startAction.cards(3).asterix();
          });
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.energy >= 2 && player.game.projectDeck.discardPile.length > 0;
  }

  public action(player: IPlayer) {
    player.stock.deduct(Resource.ENERGY, 2);
    const cards = [];
    for (let idx = 0; idx < 3; idx++) {
      const card = player.game.projectDeck.discardPile.pop();
      if (card === undefined) break;
      cards.push(card);
    }
    player.game.cardDrew = true;
    const cardsToKeep = Math.min(1, cards.length);
    player.game.defer(new ChooseCards(player, cards, {keepMax: cardsToKeep}));
    return undefined;
  }
}
```

Key points:
- `canAct()` — determines if the action button appears
- `action()` — performs the action, can return `PlayerInput` or `undefined`
- Use `player.stock.deduct(Resource, amount)` to spend resources
- Use `player.game.defer(...)` for complex multi-step actions

## 7. Project Card with getCardDiscount

From `ConstructionAid.ts` — Discount for building tag cards:

```typescript
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

export class ConstructionAid extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.CONSTRUCTION_AID,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING],
      cost: 12,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'XB59',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a building tag card, get 2 M€ discount.', (eb) => {
            eb.tag(Tag.BUILDING).startEffect.megacredits(-2);
          });
        }),
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: ICard): number {
    if (card.tags.includes(Tag.BUILDING)) {
      return 2;
    }
    return 0;
  }
}
```

## 8. Project Card with Requirements

Requirements are defined in the `requirements` field:

```typescript
// Single requirement
requirements: {tag: Tag.SCIENCE, count: 3},

// Global parameter requirement
requirements: {temperature: -14},           // min temperature
requirements: {oxygen: 5},                  // min oxygen
requirements: {oceans: 3},                  // min oceans

// Max requirement (negative means "at most")
requirements: {temperature: -14, max: true}, // max temperature

// Multiple requirements (array)
requirements: [{tag: Tag.SCIENCE, count: 2}, {oxygen: 5}],
```

## 9. Automated Card (No Ongoing Effect)

Simple green card that just applies `behavior` when played:

```typescript
export class SimpleAutomated extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SIMPLE_AUTOMATED,
      type: CardType.AUTOMATED,
      tags: [Tag.SPACE],
      cost: 20,
      victoryPoints: 2,

      behavior: {
        production: {energy: 2},
        stock: {titanium: 2},
        global: {temperature: 1},
      },

      metadata: {
        cardNumber: 'XB??',
        description: 'Increase your energy production 2 steps. Gain 2 titanium. Raise temperature 1 step.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2)).titanium(2).temperature(1);
        }),
      },
    });
  }
}
```

## 10. Corporation Card with onResourceAdded

From `Protogen.ts` — Gains heat when microbes are added:

```typescript
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {ICard} from '../../cards/ICard';
import {CorporationCard} from '../corporation/CorporationCard';

export class Protogen extends CorporationCard {
  constructor() {
    super({
      name: CardName.PROTOGEN,
      tags: [Tag.MICROBE],
      startingMegaCredits: 52,
      metadata: {
        cardNumber: 'XB06',
        description: 'You start with 52 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(52);
          b.corpBox('effect', (ce) => {
            ce.effect('When you gain microbes in one action, also gain 2 heat.', (eb) => {
              eb.resource(CardResource.MICROBE).asterix().startEffect.heat(2);
            });
          });
        }),
      },
    });
  }

  public onResourceAdded(player: IPlayer, card: ICard) {
    if (card.resourceType === CardResource.MICROBE) {
      player.heat += 2;
    }
  }
}
```

## Resource/Production API Reference

```typescript
// Add to stock (immediate resources)
player.stock.add(Resource.MEGACREDITS, 5, {log: true});
player.stock.deduct(Resource.ENERGY, 2);

// Modify production
player.production.add(Resource.PLANTS, 1);
player.production.add(Resource.ENERGY, -1); // decrease

// Direct resource access
player.megaCredits  // current M€
player.energy       // current energy
player.heat         // current heat
player.steel
player.titanium
player.plants

// Draw cards
player.drawCard(n);
player.drawCard(n, {tag: Tag.SCIENCE}); // filtered draw

// Card resources
card.resourceCount += 1;
```
