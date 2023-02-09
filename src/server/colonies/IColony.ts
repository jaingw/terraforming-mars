import {Player} from '../Player';
import {PlayerInput} from '../PlayerInput';
import {Game} from '../Game';
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
  colonies: Array<Player>;
  trackPosition: number;
  visitor: undefined | Player;

  endGeneration(game: Game): void;
  increaseTrack(steps?: number): void;
  decreaseTrack(steps?: number): void;
  isColonyFull(): boolean;
  addColony(player: Player, options?: {giveBonusTwice: boolean}): void;
  removeColony(player: Player): void;
  trade(player: Player, tradeOptions?: TradeOptions, bonusTradeOffset?: number): void;
  giveColonyBonus(player: Player, isGiveColonyBonus?: boolean): undefined | PlayerInput;
  serialize(): SerializedColony;
}
