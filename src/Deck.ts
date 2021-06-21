import {CardName} from './CardName';
import {ICard} from './cards/ICard';
import {ICardFactory} from './cards/ICardFactory';

const CARD_RENAMES = new Map<string, CardName>([
  // When renaming a card, add the rename here (like the example below), and add a TODO (like the example below)
  // And remember to add a test in Deck.spec.ts.

  // TODO(yournamehere): remove after 2021-04-05
  ['CEOs Favorite Project', CardName.CEOS_FAVORITE_PROJECT],
  // TODO(bafolts): remove after 02/15/2021 before 03/01/2021
  ['Rad-Chem Factory', CardName.RAD_CHEM_FACTORY],
  // TODO(bafolts): remove after 02/15/2021 before 03/01/2021
  ['Titan Floater Launch-pad', CardName.TITAN_FLOATING_LAUNCHPAD],
  ['Earth Embasy', CardName.EARTH_EMBASSY],
  ['Nitrogenrich Comet', CardName.FALL_OF_SUNRISE],
]);

export class Deck<T extends ICard> {
  public readonly factories: Map<CardName, ICardFactory<T>>;
  public cards: Array<ICardFactory<T>>;
  constructor(cards: Array<ICardFactory<T>>) {
    this.factories = new Map(cards.map((cf) => [cf.cardName, cf]));
    this.cards = cards;
  }

  public findByCardName(name: CardName): ICardFactory<T> | undefined {
    const updatedName = CARD_RENAMES.get(name);
    if (updatedName !== undefined) {
      name = updatedName;
    }
    return this.factories.get(name);
  }
}
