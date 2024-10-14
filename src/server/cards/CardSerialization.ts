import {newCorporationCard, newProjectCard} from '../createCard';
import {isCeoCard} from './ceos/ICeoCard';
import {IProjectCard} from './IProjectCard';
import {isICloneTagCard} from './pathfinders/ICloneTagCard';
import {SelfReplicatingRobots} from './promo/SelfReplicatingRobots';
import {SerializedCard} from '../SerializedCard';
import {CardType} from '../../common/cards/CardType';
import {ICard} from './ICard';
import {ICorporationCard} from './corporation/ICorporationCard';

export function serializePlayedCard(card: ICard): SerializedCard {
  const serialized: SerializedCard = {
    name: card.name,
  };
  const anyc: any = card;
  if (card.type === CardType.PROXY) {
    return serialized;
  }
  if (anyc.bonusResource !== undefined) {
    serialized.bonusResource = anyc.bonusResource;
  }
  if (card.resourceCount !== undefined) {
    serialized.resourceCount = card.resourceCount;
  }
  if (card.generationUsed !== undefined) {
    serialized.generationUsed = card.generationUsed;
  }
  if (card instanceof SelfReplicatingRobots) {
    serialized.targetCards = card.targetCards.map((t) => {
      return {
        card: {name: t.name},
        resourceCount: t.resourceCount,
      };
    });
  }

  if (isICloneTagCard(card)) {
    serialized.cloneTag = card.cloneTag;
  }
  if (isCeoCard(card)) {
    serialized.isDisabled = card.isDisabled;
    if (card.opgActionIsActive !== undefined) {
      serialized.opgActionIsActive = card.opgActionIsActive;
    }
  }

  if (anyc.allTags !== undefined) {
    serialized.allTags = Array.from(anyc.allTags);
  }
  if (card.isDisabled !== undefined) {
    serialized.isDisabled = card.isDisabled;
  }
  if (card.isUsed !== undefined) {
    serialized.isUsed = card.isUsed;
  }
  if (card.lastPay !== undefined) {
    serialized.lastPay = card.lastPay;
  }
  if (card.triggerCount !== undefined) {
    serialized.triggerCount = card.triggerCount;
  }
  if (card.data !== undefined) {
    serialized.data = card.data;
  }
  return serialized;
}

export function serializedCardName(c: ICard): SerializedCard {
  return {
    name: c.name,
  };
}

export function deserializeProjectCard(element: SerializedCard): IProjectCard {
  const card = newProjectCard(element.name);
  if (card === undefined) {
    throw new Error(`Card ${element.name} not found`);
  }
  if (element.resourceCount !== undefined) {
    card.resourceCount = element.resourceCount;
  }
  if (card.hasOwnProperty('data')) {
    card.data = element.data;
  }
  if (element.generationUsed !== undefined) {
    card.generationUsed = element.generationUsed;
  }
  if (isICloneTagCard(card) && element.cloneTag !== undefined) {
    card.cloneTag = element.cloneTag;
  }
  if (card instanceof SelfReplicatingRobots && element.targetCards !== undefined) {
    card.targetCards = [];
    element.targetCards.forEach((targetCard) => {
      const foundTargetCard = newProjectCard(targetCard.card.name);
      if (foundTargetCard !== undefined) {
        foundTargetCard.resourceCount = targetCard.resourceCount;
        card.targetCards.push(foundTargetCard);
      } else {
        console.warn('did not find card for SelfReplicatingRobots', targetCard);
      }
    });
  }
  if (!(card instanceof SelfReplicatingRobots)) {
    if (element.bonusResource !== undefined) {
      card.bonusResource = Array.isArray(element.bonusResource) ? element.bonusResource : [element.bonusResource];
    }
  }
  if (isCeoCard(card)) {
    card.isDisabled = element.isDisabled;
    if (element.opgActionIsActive !== undefined) {
      card.opgActionIsActive = element.opgActionIsActive;
    }
  }
  return card;
}

export function deserializeCorpCard(element: SerializedCard):ICorporationCard | undefined {
  const corpCard = newCorporationCard(element.name);
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
