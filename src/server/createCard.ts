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

const CARD_RENAMES = new Map<string, CardName>([
  // When renaming a card, add the old name here (like the example below), and add a TODO (like the example below)
  // And remember to add a test in spec.ts.

  // TODO(yournamehere): remove after 2021-04-05
  // ['Earth Embasy', CardName.EARTH_EMBASSY],
  ['MAxwell Base', CardName.MAXWELL_BASE],
  ['Great Dam Promo', CardName.GREAT_DAM_PROMO],
  ['Deimos Down Promo', CardName.DEIMOS_DOWN_PROMO],
  ['Magnetic Field Generators Promo', CardName.MAGNETIC_FIELD_GENERATORS_PROMO],
  ['Septum Tribus', CardName.SEPTEM_TRIBUS],

  ['CEOs Favorite Project', CardName.CEOS_FAVORITE_PROJECT],
  ['Rad-Chem Factory', CardName.RAD_CHEM_FACTORY],
  ['Titan Floater Launch-pad', CardName.TITAN_FLOATING_LAUNCHPAD],
  ['Earth Embasy', CardName.EARTH_EMBASSY],
  ['Nitrogenrich Comet', CardName.FALL_OF_SUNRISE],

  ['Designed Micro-organisms', CardName.DESIGNED_MICROORGANISMS],
  ['Refugee Camp', CardName.REFUGEE_CAMPS],
  ['Allied Banks', CardName.ALLIED_BANK],
  ['Inventors Guild', CardName.INVENTORS_GUILD],
  ['Cryo Sleep', CardName.CRYO_SLEEP],


  ['New Colony Planning Initiaitives', CardName.NEW_COLONY_PLANNING_INITIAITIVES],
  ['Sinus Irdium Road Network', CardName.SINUS_IRDIUM_ROAD_NETWORK],
  ['Venus First:Pathfinders', CardName.VENUS_FIRST],

  ['Space Corridors', CardName.SPACE_LANES],

]);

function _createCard<T extends ICard>(cardName: CardName, cardManifestNames: Array<keyof ModuleManifest>): T | undefined {
  const standardizedCardName = CARD_RENAMES.get(cardName) || cardName;

  for (const moduleManifest of ALL_MODULE_MANIFESTS) {
    for (const manifestName of cardManifestNames) {
      const cardManifest = <CardManifest<T>> moduleManifest[manifestName];
      const factory = cardManifest[standardizedCardName];
      if (factory !== undefined) {
        return new factory.Factory();
      }
    }
  }
  console.warn(`card not found ${cardName}`);
  return undefined;
}

export function newCard(cardName: CardName): ICard | undefined {
  return _createCard(cardName, ['corporationCards', 'projectCards', 'preludeCards', 'ceoCards']);
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

function cfj<T extends ICard>(cards: Array<CardName>, resolver: (c: CardName) => T | undefined): Array<T> {
  if (cards === undefined) {
    // console.warn('parameter of array of cards is undefined when calling cardsFromJSON');
    return [];
  }
  const result: Array<T> = [];
  cards.forEach((element: CardName) => {
    const card = resolver(element);
    if (card !== undefined) {
      result.push(card);
    } else {
      console.warn(`ceo card ${element} not found while loading game.`);
      throw new Error(`ceo card ${element} not found while loading game.`);
    }
  });
  return result;
}

export function cardsFromJSON(cards: Array<CardName>): Array<IProjectCard> {
  return cfj(cards, newProjectCard);
}

export function corporationCardsFromJSON(cards: Array<CardName>): Array<ICorporationCard> {
  return cfj(cards, newCorporationCard);
}

export function ceosFromJSON(cards: Array<CardName>): Array<ICeoCard> {
  return cfj(cards, newCeo);
}

export function preludesFromJSON(cards: Array<CardName>): Array<IPreludeCard> {
  return cfj(cards, newPrelude);
}

