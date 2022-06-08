import {CardName} from '../common/cards/CardName';
import {GameModule} from '../common/cards/GameModule';

export interface ICardFactory<T> {
    cardName: CardName;
    Factory: new () => T;
    compatibility ?: GameModule | Array<GameModule>;
    cardName_ori ?: CardName;
}
