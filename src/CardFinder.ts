import {ICard} from './cards/ICard';
import {ICardFactory} from './cards/ICardFactory';
import {IProjectCard} from './cards/IProjectCard';
import {CardManifest} from './cards/CardManifest';
import {CardName} from './common/cards/CardName';
import {ICorporationCard} from './cards/corporation/ICorporationCard';
import {PreludeCard} from './cards/prelude/PreludeCard';

/* 群友扩内容 */
import {Deck} from './Deck';
import {StarcorePlunder} from './cards/eros/StarcorePlunder';
import {WGParternship} from './cards/eros/corp/WGParternship';
import {GameOptions} from './Game';
import {CardLoader} from './CardLoader';
import {SerializedCard} from './SerializedCard';
import {ALL_CARD_MANIFESTS} from './cards/AllCards';

export class CardFinder {
  public getCardByName<T extends ICard>(cardName: CardName, decks: (manifest: CardManifest) => Array<Deck<T>>, gameOptions?: GameOptions): T | undefined {
    let found : (ICardFactory<T> | undefined);
    ALL_CARD_MANIFESTS.some((manifest) => {
      decks(manifest).some((deck) => {
        found = deck.findByCardName(cardName);
        return found;
      });
      return found;
    });
    if (found !== undefined && (gameOptions === undefined || CardLoader.include(gameOptions, found))) {
      return new found.Factory();
    }
    console.warn(`card not found ${cardName}`);
    return undefined;
  }

  public getCorporationCardByName(cardName: CardName, gameOptions?: GameOptions): ICorporationCard | undefined {
    if (cardName as string === 'Septum Tribus') {
      cardName = CardName.SEPTEM_TRIBUS;
    }
    if (cardName === CardName.WG_PARTERNSHIP) {
      return new WGParternship;
    }
    return this.getCardByName(cardName, (manifest) => [manifest.corporationCards], gameOptions);
  }

  // Function to return a card object by its name
  // NOTE(kberg): This replaces a larger function which searched for both Prelude cards amidst project cards
  // TODO(kberg): Find the use cases where this is used to find Prelude cards and filter them out to
  //              another function, perhaps?
  public getProjectCardByName(cardName: CardName): IProjectCard | undefined {
    // 确保loadFromJSON调用到了这里就行，恢复历史数据
    if (cardName as string === 'MAxwell Base') {
      cardName = CardName.MAXWELL_BASE;
    }
    if (cardName as string === 'Great Dam Promo') {
      cardName = CardName.GREAT_DAM_PROMO;
    }
    if (cardName as string === 'Deimos Down Promo') {
      cardName = CardName.DEIMOS_DOWN_PROMO;
    }
    if (cardName as string === 'Magnetic Field Generators Promo') {
      cardName = CardName.MAGNETIC_FIELD_GENERATORS_PROMO;
    }
    if (cardName === CardName.STARCORE_PLUNDER) {
      return new StarcorePlunder;
    }
    return this.getCardByName(cardName, (manifest) => [manifest.projectCards, manifest.preludeCards]);
  }

  public getPreludeByName(cardName: CardName): PreludeCard | undefined {
    return this.getCardByName(cardName, (manifest) => [manifest.preludeCards]);
  }


  public cardsFromJSONName(cards: Array<CardName>): Array<IProjectCard> {
    if (cards === undefined) {
      // console.warn('missing cards calling cardsFromJSON');
      return [];
    }
    const result: Array<IProjectCard> = [];
    cards.forEach((element: CardName) => {
      const card = this.getProjectCardByName(element);
      if (card !== undefined) {
        result.push(card);
      } else {
        console.warn(`card ${element} not found while loading game.`);
      }
    });
    return result;
  }

  public cardsFromJSON(cards: Array<SerializedCard>): Array<IProjectCard> {
    if (cards === undefined) {
      // console.warn('missing cards calling cardsFromJSON');
      return [];
    }
    const result: Array<IProjectCard> = [];
    cards.forEach((element: SerializedCard) => {
      const card = this.getProjectCardByName(element.name);
      if (card !== undefined) {
        result.push(card);
      } else {
        console.warn(`card ${element.name} not found while loading game.`);
      }
    });
    return result;
  }

  public corporationCardsFromJSON(cards: Array<SerializedCard>): Array<ICorporationCard> {
    if (cards === undefined) {
      // console.warn('missing cards calling corporationCardsFromJSON');
      return [];
    }
    const result: Array<ICorporationCard> = [];
    cards.forEach((element: SerializedCard) => {
      if (!element ) return;
      const card = this.getCorporationCardByName(element.name);
      if (card !== undefined) {
        result.push(card);
      } else {
        console.warn(`corporation ${element.name} not found while loading game.`);
      }
    });
    return result;
  }
}
