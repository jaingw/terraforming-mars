import {PartyName} from '../../../common/turmoil/PartyName';
import {Game} from '../../Game';
import {Bonus} from '../Bonus';
import {Policy} from '../Policy';
import {NeutralPlayer} from '../Turmoil';
import {MultiSet} from 'mnemonist';
import {MarsFirst} from './MarsFirst';
import {Scientists} from './Scientists';
import {Unity} from './Unity';
import {Kelvinists} from './Kelvinists';
import {Reds} from './Reds';
import {Greens} from './Greens';
import {PlayerId} from '../../../common/Types';
export interface IParty {
    name: PartyName;
    description: string; // TODO(kberg): fetch description from agenda.
    delegates: MultiSet<PlayerId | NeutralPlayer>;
    partyLeader: undefined | PlayerId | NeutralPlayer;
    sendDelegate: (playerId: PlayerId | NeutralPlayer, game: Game) => void;
    removeDelegate: (playerId: PlayerId | NeutralPlayer, game: Game) => void;
    bonuses: Array<Bonus>;
    policies: Array<Policy>;
}

interface IPartyFactory {
    partyName: PartyName;
    Factory: new () => IParty
}

export const ALL_PARTIES: Array<IPartyFactory> = [
  {partyName: PartyName.MARS, Factory: MarsFirst},
  {partyName: PartyName.SCIENTISTS, Factory: Scientists},
  {partyName: PartyName.UNITY, Factory: Unity},
  {partyName: PartyName.GREENS, Factory: Greens},
  {partyName: PartyName.REDS, Factory: Reds},
  {partyName: PartyName.KELVINISTS, Factory: Kelvinists},
];
