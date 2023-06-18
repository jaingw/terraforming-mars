import {GameModule} from '../../common/cards/GameModule';
import {CardName} from '../../common/cards/CardName';
export interface ICardFactory<T> {
  // Creates a new instance of this ard.
  Factory: new () => T;
  // Returns the required modules for this card.
  compatibility?: GameModule | Array<GameModule>;
  cardName_ori ?: CardName;
  // False when the card should not be instantiated. It's reserved for fake and proxy cards.
  instantiate?: boolean;
}
