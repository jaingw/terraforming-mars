import {IPlayer} from '../IPlayer';
import {PlayerInput} from '../PlayerInput';
import {IGame} from '../IGame';
import {SerializedColony} from '../SerializedColony';
import {IColonyMetadata} from '../../common/colonies/IColonyMetadata';
import {ColonyName} from '../../common/colonies/ColonyName';

export type TradeOptions = {
  usesTradeFleet?: boolean;
  decreaseTrackAfterTrade?: boolean;
  giveColonyBonuses?: boolean;
  selfishTrade?: boolean;
};

export interface IColony {
  readonly name: ColonyName;
  readonly metadata: IColonyMetadata;

  isActive: boolean;
  colonies: Array<IPlayer>;
  trackPosition: number;
  visitor: undefined | IPlayer;

  endGeneration(game: IGame): void;
  increaseTrack(steps?: number): void;
  decreaseTrack(steps?: number): void;
  isFull(): boolean;
  addColony(player: IPlayer, options?: {giveBonusTwice: boolean}): void;
  removeColony(player: IPlayer): void;
  trade(player: IPlayer, tradeOptions?: TradeOptions, bonusTradeOffset?: number): void;
  giveColonyBonus(player: IPlayer, isGiveColonyBonus?: boolean): undefined | PlayerInput;
  serialize(): SerializedColony;
}
