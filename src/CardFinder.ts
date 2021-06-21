import {ICard} from './cards/ICard';
import {ICardFactory} from './cards/ICardFactory';
import {IProjectCard} from './cards/IProjectCard';
import {CardManifest} from './cards/CardManifest';
import {BREAKTHROUGH_CARD_MANIFEST} from './cards/breakthrough/BreakthroughCardManifest';
import {CardName} from './CardName';
import {CorporationCard} from './cards/corporation/CorporationCard';
import {COLONIES_CARD_MANIFEST} from './cards/colonies/ColoniesCardManifest';
import {PRELUDE_CARD_MANIFEST} from './cards/prelude/PreludeCardManifest';
import {PROMO_CARD_MANIFEST} from './cards/promo/PromoCardManifest';
import {BASE_CARD_MANIFEST, CORP_ERA_CARD_MANIFEST} from './cards/StandardCardManifests';
import {TURMOIL_CARD_MANIFEST} from './cards/turmoil/TurmoilCardManifest';
import {VENUS_CARD_MANIFEST} from './cards/venusNext/VenusCardManifest';
import {COMMUNITY_CARD_MANIFEST} from './cards/community/CommunityCardManifest';
import {ARES_CARD_MANIFEST} from './cards/ares/AresCardManifest';
/* 群友扩内容 */
import {EROS_CARD_MANIFEST} from './cards/eros/ErosCardManifest';
import {MOON_CARD_MANIFEST} from './cards/moon/MoonCardManifest';
import {Deck} from './Deck';
import {StarcorePlunder} from './cards/eros/StarcorePlunder';
import {WGParternship} from './cards/eros/corp/WGParternship';

export class CardFinder {
    private static decks: undefined | Array<CardManifest>;
    private static getDecks(): Array<CardManifest> {
      if (CardFinder.decks === undefined) {
        CardFinder.decks = [
          BASE_CARD_MANIFEST,
          CORP_ERA_CARD_MANIFEST,
          PROMO_CARD_MANIFEST,
          VENUS_CARD_MANIFEST,
          COLONIES_CARD_MANIFEST,
          PRELUDE_CARD_MANIFEST,
          TURMOIL_CARD_MANIFEST,
          BREAKTHROUGH_CARD_MANIFEST,
          ARES_CARD_MANIFEST,
          COMMUNITY_CARD_MANIFEST,
          EROS_CARD_MANIFEST,
          MOON_CARD_MANIFEST,
        ];
      }
      return CardFinder.decks;
    }

    public getCardByName<T extends ICard>(cardName: CardName, decks: (manifest: CardManifest) => Array<Deck<T>>): T | undefined {
      let found : (ICardFactory<T> | undefined);
      CardFinder.getDecks().some((manifest) => {
        decks(manifest).some((deck) => {
          found = deck.findByCardName(cardName);
          return found;
        });
        return found;
      });
      if (found !== undefined) {
        return new found.Factory();
      }
      console.warn(`card not found ${cardName}`);
      return undefined;
    }

    public getCorporationCardByName(cardName: CardName): CorporationCard | undefined {
      if (cardName as string === 'Septum Tribus') {
        cardName = CardName.SEPTEM_TRIBUS;
      }
      if (cardName === CardName.WG_PARTERNSHIP) {
        return new WGParternship;
      }
      return this.getCardByName(cardName, (manifest) => [manifest.corporationCards]);
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

    public cardsFromJSON(cards: Array<ICard>): Array<IProjectCard> {
      if (cards === undefined) {
        // console.warn('missing cards calling cardsFromJSON');
        return [];
      }
      const result: Array<IProjectCard> = [];
      cards.forEach((element: ICard) => {
        const card = this.getProjectCardByName(element.name);
        if (card !== undefined) {
          result.push(card);
        } else {
          console.warn(`card ${element} not found while loading game.`);
        }
      });
      return result;
    }

    public corporationCardsFromJSON(cards: Array<ICard>): Array<CorporationCard> {
      if (cards === undefined) {
        // console.warn('missing cards calling corporationCardsFromJSON');
        return [];
      }
      const result: Array<CorporationCard> = [];
      cards.forEach((element: ICard) => {
        if (!element ) return;
        const card = this.getCorporationCardByName(element.name);
        if (card !== undefined) {
          result.push(card);
        } else {
          console.warn(`corporation ${element} not found while loading game.`);
        }
      });
      return result;
    }
}
