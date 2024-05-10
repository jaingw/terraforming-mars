import {PartyName} from '../../../common/turmoil/PartyName';
import {IGame} from '../../IGame';
import {Bonus} from '../Bonus';
import {Policy} from '../Policy';
import {Delegate} from '../Turmoil';
import {MultiSet} from 'mnemonist';
import {MarsFirst} from './MarsFirst';
import {Scientists} from './Scientists';
import {Unity} from './Unity';
import {Kelvinists} from './Kelvinists';
import {Reds} from './Reds';
import {Greens} from './Greens';
export interface IParty {
    name: PartyName;
    delegates: MultiSet<Delegate>;
    partyLeader: undefined | Delegate;
    sendDelegate(playerId: Delegate, game: IGame): void;
    removeDelegate(playerId: Delegate, game: IGame): void;
    bonuses: ReadonlyArray<Bonus>;
    policies: ReadonlyArray<Policy>;
}

export type PartyFactory = new() => IParty;

export const ALL_PARTIES: Record<PartyName, PartyFactory> = {
  [PartyName.MARS]: MarsFirst,
  [PartyName.SCIENTISTS]: Scientists,
  [PartyName.UNITY]: Unity,
  [PartyName.GREENS]: Greens,
  [PartyName.REDS]: Reds,
  [PartyName.KELVINISTS]: Kelvinists,
};

