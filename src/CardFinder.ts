import {ICard} from './cards/ICard';
import {ICardFactory} from './cards/ICardFactory';
import {IProjectCard} from './cards/IProjectCard';
import {BeginnerCorporation} from './cards/corporation/BeginnerCorporation';
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
import {StandardProjectCard} from './cards/standardProjects/StandardProjectCard';

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
        ];
      }
      return CardFinder.decks;
    }

    public getStandardProjectCardByName(cardName: string): StandardProjectCard | undefined {
      let found : (ICardFactory<StandardProjectCard> | undefined);
      CardFinder.getDecks().forEach((deck) => {
        // Short circuit
        if (found !== undefined) {
          return;
        }
        found = deck.standardProjects.findByCardName(cardName);
      });
      if (found !== undefined) {
        return new found.Factory();
      }
      console.warn(`standard project card not found ${cardName}`);
      return undefined;
    }

    public getCorporationCardByName(cardName: string): CorporationCard | undefined {
      if (cardName === CardName.BEGINNER_CORPORATION) {
        return new BeginnerCorporation();
      }
      if (cardName === 'Septum Tribus') {
        cardName = CardName.SEPTEM_TRIBUS;
      }
      let found : (ICardFactory<CorporationCard> | undefined);
      CardFinder.getDecks().forEach((deck) => {
        // Short circuit
        if (found !== undefined) {
          return;
        }
        found = deck.corporationCards.findByCardName(cardName);
      });
      if (found !== undefined) {
        return new found.Factory();
      }
      console.warn(`corporation card not found ${cardName}`);
      return undefined;
    }

    // Function to return a card object by its name
    // NOTE(kberg): This replaces a larger function which searched for both Prelude cards amidst project cards
    // TODO(kberg): Find the use cases where this is used to find Prelude cards and filter them out to
    //              another function, perhaps?
    public getProjectCardByName(cardName: string): IProjectCard | undefined {
      // 确保loadFromJSON调用到了这里就行，恢复历史数据
      if (cardName === 'MAxwell Base') {
        cardName = 'Maxwell Base';
      }
      if (cardName === 'Great Dam Promo') {
        cardName = 'Great Dam:promo';
      }
      if (cardName === 'Deimos Down Promo') {
        cardName = 'Deimos Down:promo';
      }
      if (cardName === 'Magnetic Field Generators Promo') {
        cardName = 'Magnetic Field Generators:promo';
      }
      let found : (ICardFactory<IProjectCard> | undefined);
      CardFinder.getDecks().forEach((deck) => {
        // Short circuit
        if (found !== undefined) {
          return;
        }
        found = deck.projectCards.findByCardName(cardName);
        if (found === undefined) {
          found = deck.preludeCards.findByCardName(cardName);
        }
      });
      if (found !== undefined) {
        return new found.Factory();
      }
      console.warn(`card not found ${cardName}`);
      return undefined;
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
        if ((element.name as string) === 'Septum Tribus') {
          element.name = CardName.SEPTEM_TRIBUS;
        }
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
