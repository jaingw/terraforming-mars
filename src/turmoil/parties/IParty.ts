import {PartyName} from './PartyName';
import {Player} from '../../Player';
import {Game} from '../../Game';
import {Bonus} from '../Bonus';
import {Policy} from '../Policy';
import {NeutralPlayer} from '../Turmoil';
import {MarsFirst} from './MarsFirst';
import {Scientists} from './Scientists';
import {Unity} from './Unity';
import {Kelvinists} from './Kelvinists';
import {Reds} from './Reds';
import {Greens} from './Greens';
export interface IParty {
    name: PartyName;
    description: string; // TODO(kberg): fetch description from agenda.
    delegates: Array<Player | NeutralPlayer>;
    partyLeader: undefined | Player | NeutralPlayer;
    sendDelegate: (player: Player | NeutralPlayer, game: Game) => void;
    removeDelegate: (player: Player | NeutralPlayer, game: Game) => void;
    bonuses: Array<Bonus>;
    policies: Array<Policy>;
    getPresentPlayers(): Array<Player | NeutralPlayer>;
    getDelegates:(player: Player | NeutralPlayer) => number;
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
