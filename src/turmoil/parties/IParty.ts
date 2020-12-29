import {PartyName} from './PartyName';
import {Player} from '../../Player';
import {Game} from '../../Game';
import {NeutralPlayer} from '../Turmoil';
import {MarsFirst} from './MarsFirst';
import {Scientists} from './Scientists';
import {Unity} from './Unity';
import {Kelvinists} from './Kelvinists';
import {Reds} from './Reds';
import {Greens} from './Greens';

export interface IParty {
    name: PartyName;
    description: string;
    delegates: Array<Player | NeutralPlayer>;
    partyLeader: undefined | Player | NeutralPlayer;
    sendDelegate: (player: Player | NeutralPlayer, game: Game) => void;
    removeDelegate: (player: Player | NeutralPlayer, game: Game) => void;
    rulingBonus: (game: Game) => void;
    // rulingPolicy: (player: Player, game: Game) => void;
    getPresentPlayers(): Array<Player | NeutralPlayer>;
    getDelegates:(player: Player | NeutralPlayer) => number;
}

interface IPartyFactory<T> {
    partyName: PartyName;
    Factory: new () => T
}

export const ALL_PARTIES: Array<IPartyFactory<IParty>> = [
  {partyName: PartyName.MARS, Factory: MarsFirst},
  {partyName: PartyName.SCIENTISTS, Factory: Scientists},
  {partyName: PartyName.UNITY, Factory: Unity},
  {partyName: PartyName.GREENS, Factory: Greens},
  {partyName: PartyName.REDS, Factory: Reds},
  {partyName: PartyName.KELVINISTS, Factory: Kelvinists},
];
