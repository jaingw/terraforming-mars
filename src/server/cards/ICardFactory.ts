import {GameModule} from '../../common/cards/GameModule';
import {CardName} from '../../common/cards/CardName';
export interface ICardFactory<T> {
    Factory: new () => T;
    compatibility ?: GameModule | Array<GameModule>;
    cardName_ori ?: CardName;
}
