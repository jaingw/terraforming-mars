import {newCard, newCorporationCard, newProjectCard} from '../createCard';
import {IProjectCard, isIProjectCard} from './IProjectCard';
import {isICloneTagCard} from './pathfinders/ICloneTagCard';
import {SerializedCard} from '../SerializedCard';
import {CardType} from '../../common/cards/CardType';
import {ICard} from './ICard';
import {asArray} from '../../common/utils/utils';
import {ICorporationCard, isICorporationCard} from './corporation/ICorporationCard';
import {isPreludeCard} from './prelude/IPreludeCard';
import {isCeoCard} from './ceos/ICeoCard';
import {ProxyCard} from './ProxyCard';

export function serializeCard(card: ICard): SerializedCard {
  if (isICorporationCard(card)) {
    return serializeCorporationCard(card);
  } else if (isIProjectCard(card) || isPreludeCard(card) || isCeoCard(card) || card instanceof ProxyCard) {
    return serializeProjectCard(card);
  }
  throw new Error('Unknown card type ' + card.type + ' for ' + card.name);
}

export function deserializeCard(element: SerializedCard): IProjectCard | ICorporationCard {
  const card = newCard(element.name);
  if (card.type === CardType.CORPORATION) {
    return deserializeCorporationCard(element);
  } else {
    return deserializeProjectCard(element);
  }
}

export function serializeProjectCard(card: ICard): SerializedCard {
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

  if (isICloneTagCard(card)) {
    serialized.cloneTag = card.cloneTag;
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
  card.serialize?.(serialized);
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
  if (card.hasOwnProperty('data') && element.data !== undefined) {
    card.data = element.data;
  }
  if (element.generationUsed !== undefined) {
    card.generationUsed = element.generationUsed;
  }
  if (isICloneTagCard(card) && element.cloneTag !== undefined) {
    card.cloneTag = element.cloneTag;
  }
  if (element.bonusResource !== undefined) {
    card.bonusResource = asArray(element.bonusResource);
  }
  card.deserialize?.(element);
  return card;
}

export function serializeCorporationCard(card: ICorporationCard): SerializedCard {
  const serialized = {
    name: card.name,
    resourceCount: card.resourceCount,
    isDisabled: false,
    data: card.data,
  };
  card.serialize?.(serialized);
  return serialized;
}


export function deserializeCorporationCard(element: SerializedCard):ICorporationCard {
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
    if (corpJson.data !== undefined) {
      corpCard.data = corpJson.data;
    }
  } else {
    console.warn('did not find card ', element);
    throw new Error(`Card ${element.name} not found`);
  }
  corpCard.deserialize?.(element);
  return corpCard;
}
