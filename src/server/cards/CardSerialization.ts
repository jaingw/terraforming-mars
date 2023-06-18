import {MiningCard} from './base/MiningCard';
import {isCeoCard} from './ceos/ICeoCard';
import {IProjectCard} from './IProjectCard';
import {isICloneTagCard} from './pathfinders/ICloneTagCard';
import {SelfReplicatingRobots} from './promo/SelfReplicatingRobots';
import {SerializedCard} from '../SerializedCard';
import {CardFinder} from '../CardFinder';
import {ICard} from './ICard';
import {ICorporationCard} from './corporation/ICorporationCard';
import {AntiGravityExperiment} from './eros/AntiGravityExperiment';

export function serializePlayedCard(c: ICard): SerializedCard {
  const result: SerializedCard = {
    name: c.name,
  };
  const card: any = c;
  if (c.resourceCount !== undefined) {
    result.resourceCount = c.resourceCount;
  }
  if (c instanceof SelfReplicatingRobots) {
    (result as any).targetCards = c.targetCards.map((t) => {
      return {
        card: {name: t.card.name},
        resourceCount: t.resourceCount,
      };
    });
  }
  if (card.bonusResource !== undefined) {
    result.bonusResource = card.bonusResource;
  }

  if (isICloneTagCard(c)) {
    result.cloneTag = c.cloneTag;
  }
  if (isCeoCard(c)) {
    result.isDisabled = c.isDisabled;
    if (c.opgActionIsActive !== undefined) {
      result.opgActionIsActive = c.opgActionIsActive;
    }
  }

  if (card.allTags !== undefined) {
    result.allTags = Array.from(card.allTags);
  }
  if (card.isDisabled !== undefined) {
    result.isDisabled = card.isDisabled;
  }
  if (card.isUsed !== undefined) {
    result.isUsed = card.isUsed;
  }
  return result;
}

export function serializedCardName(c: ICard): SerializedCard {
  return {
    name: c.name,
  };
}

export function deserializeProjectCard(element: SerializedCard, cardFinder: CardFinder): IProjectCard {
  const card = cardFinder.getProjectCardByName(element.name);
  if (card === undefined) {
    throw new Error(`Card ${element.name} not found`);
  }
  if (element.resourceCount !== undefined) {
    card.resourceCount = element.resourceCount;
  }
  if (isICloneTagCard(card) && element.cloneTag !== undefined) {
    card.cloneTag = element.cloneTag;
  }
  if (card instanceof SelfReplicatingRobots && (element as SelfReplicatingRobots).targetCards !== undefined) {
    card.targetCards = [];
    (element as SelfReplicatingRobots).targetCards.forEach((targetCard) => {
      const foundTargetCard = cardFinder.getProjectCardByName(targetCard.card.name);
      if (foundTargetCard !== undefined) {
        card.targetCards.push({
          card: foundTargetCard,
          resourceCount: targetCard.resourceCount,
        });
      } else {
        console.warn('did not find card for SelfReplicatingRobots', targetCard);
      }
    });
  }
  if (card instanceof MiningCard && element.bonusResource !== undefined) {
    card.bonusResource = Array.isArray(element.bonusResource) ? element.bonusResource : [element.bonusResource];
  }
  if (card instanceof AntiGravityExperiment && element.isDisabled !== undefined) {
    card.isDisabled = element.isDisabled;
  }
  if (isCeoCard(card)) {
    card.isDisabled = element.isDisabled;
    if (element.opgActionIsActive !== undefined) {
      card.opgActionIsActive = element.opgActionIsActive;
    }
  }
  return card;
}

export function deserializeCorpCard(element: SerializedCard, cardFinder: CardFinder):ICorporationCard | undefined {
  const corpCard = cardFinder.getCorporationCardByName(element.name);
  const corpJson : any = element;
  if (corpCard !== undefined) {
    if (element.resourceCount !== undefined) {
      corpCard.resourceCount = element.resourceCount;
    }
    if (corpJson.allTags !== undefined) {
      (corpCard as any).allTags = new Set(corpJson.allTags);
    }
    if (corpJson.isDisabled !== undefined) {
      corpCard.isDisabled = Boolean(element.isDisabled);
    }
    if (corpJson.isUsed !== undefined) {
      (corpCard as any).isUsed = Boolean(corpJson.isUsed);
    }
  } else {
    console.warn('did not find card ', element);
  }
  return corpCard;
}
