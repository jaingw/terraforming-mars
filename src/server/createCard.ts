import {ICard} from './cards/ICard';
import {IProjectCard} from './cards/IProjectCard';
import {CardManifest, ModuleManifest} from './cards/ModuleManifest';
import {CardName} from '../common/cards/CardName';
import {ICorporationCard} from './cards/corporation/ICorporationCard';

/* 群友扩内容 */
import {StarcorePlunder} from './cards/eros/StarcorePlunder';
import {WGParternship} from './cards/eros/corp/WGParternship';
import {IPreludeCard} from './cards/prelude/IPreludeCard';
import {ICeoCard} from './cards/ceos/ICeoCard';
import {ALL_MODULE_MANIFESTS} from './cards/AllManifests';
import {resolveCardName} from '../common/cards/CardRenames';
import {toName} from '../common/utils/utils';

function _createCard<T extends ICard>(cardName: CardName, cardManifestNames: Array<keyof ModuleManifest>): T | undefined {
  const standardizedCardName = resolveCardName(cardName);

  for (const moduleManifest of ALL_MODULE_MANIFESTS) {
    for (const manifestName of cardManifestNames) {
      const cardManifest = <CardManifest<T>> moduleManifest[manifestName];
      const factory = cardManifest[standardizedCardName];
      if (factory !== undefined) {
        return new factory.Factory();
      }
    }
  }
  return undefined;
}

export function newCard(cardName: CardName): ICard {
  const card = _createCard(cardName, ['corporationCards', 'projectCards', 'preludeCards', 'ceoCards']);
  if (card === undefined) {
    throw new Error(`Card [${cardName}] not found`);
  }
  return card;
}

export function newCorporationCard(cardName: CardName): ICorporationCard | undefined {
  if (cardName === CardName.WG_PARTERNSHIP) {
    return new WGParternship;
  }
  return _createCard(cardName, ['corporationCards']);
}

// Function to return a card object by its name
// NOTE(kberg): This replaces a larger function which searched for both Prelude cards amidst project cards
// TODO(kberg+dl): Find the use cases where this is used to find Prelude+CEO cards and filter them out to
//              another function, perhaps?
export function newProjectCard(cardName: CardName): IProjectCard | undefined {
  if (cardName === CardName.STARCORE_PLUNDER) {
    return new StarcorePlunder;
  }
  return _createCard(cardName, ['projectCards', 'preludeCards', 'ceoCards']);
}

export function newPrelude(cardName: CardName): IPreludeCard | undefined {
  return _createCard(cardName, ['preludeCards']);
}

export function newCeo(cardName: CardName): ICeoCard | undefined {
  return _createCard(cardName, ['ceoCards']);
}

function cfj<T extends ICard>(cards: ReadonlyArray<CardName>, resolver: (c: CardName) => T | undefined, cardType : string = ''): Array<T> {
  if (cards === undefined) {
    // console.warn('parameter of array of cards is undefined when calling cardsFromJSON');
    return [];
  }
  const result: Array<T> = [];
  cards.forEach((element: CardName) => {
    const name = toName(element);
    const card = resolver(name);
    if (card !== undefined) {
      result.push(card);
    } else {
      console.warn(`${cardType} card ${name} not found while loading game.`);
      throw new Error(`${cardType} card ${name} not found while loading game.`);
    }
  });
  return result;
}

export function cardsFromJSON(cards: ReadonlyArray<CardName>): Array<IProjectCard> {
  return cfj(cards, newProjectCard, 'newProjectCard');
}

export function corporationCardsFromJSON(cards: ReadonlyArray<CardName>): Array<ICorporationCard> {
  return cfj(cards, newCorporationCard, 'newCorporationCard');
}

export function ceosFromJSON(cards: ReadonlyArray<CardName>): Array<ICeoCard> {
  return cfj(cards, newCeo, 'newCeo');
}

export function preludesFromJSON(cards: ReadonlyArray<CardName>): Array<IPreludeCard> {
  return cfj(cards, newPrelude, 'newPrelude');
}
